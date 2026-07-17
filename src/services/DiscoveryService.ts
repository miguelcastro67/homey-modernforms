import IDeviceDiscoveryProvider from '../abstractions/IDeviceDiscoveryProvider';
import IFanClient from '../abstractions/IFanClient';
import IFanRepository from '../abstractions/IFanRepository';
import Logger from '../core/Logger';
import FanConnection from '../models/FanConnection';

export default class DiscoveryService {
  constructor(
      private readonly discoveryProvider: IDeviceDiscoveryProvider,
      private readonly repository: IFanRepository,
      private readonly fanClient: IFanClient,
      private readonly logger: Logger
  ) {}

  public async discover(): Promise<FanConnection[]> {
    const candidates = await this.discoveryProvider.discover();
    const discovered: FanConnection[] = [];

    for (const connection of candidates) {
      try {

          this.logger.info(
              `Validating ${connection.displayName} (${connection.ipAddress})`
          );

          const staticData = await this.fanClient.getStaticData(connection);

          // this.logger.debug(`Static shadow data for ${connection.ipAddress}:\n${JSON.stringify(staticData, null, 2)}`);

          const displayName = staticData.deviceName?.trim() || connection.displayName;

          const validatedConnection = new FanConnection(displayName, connection.ipAddress, connection.clientId);

          discovered.push(validatedConnection);

          const state = await this.fanClient.getState(validatedConnection);

          this.logger.info(
              `Validation succeeded for ${connection.displayName}: Fan=${state.fanOn}, Speed=${state.fanSpeed}, Light=${state.lightOn}`
          );

          // this.logger.debug(`FanConnection:\n${JSON.stringify(validatedConnection, null, 2)}`);

      }
      catch (error) {

          this.logger.warn(
              `Validation FAILED for ${connection.displayName} (${connection.ipAddress})`
          );

          this.logger.debug(error instanceof Error ? error.message : String(error));
      }
    }

    await this.repository.save(discovered);
    
    return discovered;
  }
}
