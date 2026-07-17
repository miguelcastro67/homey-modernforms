import IFanClient from '../abstractions/IFanClient';
import Logger from '../core/Logger';
import FanConnection from '../models/FanConnection';
import type FanState from '../models/FanState';

export default class StateSynchronizationService {
  constructor(private readonly fanClient: IFanClient, private readonly logger: Logger) {}

  public async synchronize(connection: FanConnection): Promise<FanState> {
    this.logger.debug(`Synchronizing '${connection.displayName}'`);
    return this.fanClient.getState(connection);
  }
}
