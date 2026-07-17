import IFanClient from '../abstractions/IFanClient';
import Logger from '../core/Logger';
import FanConnection from '../models/FanConnection';
import DiscoveryService from '../services/DiscoveryService';
import StateSynchronizationService from '../services/StateSynchronizationService';

export default class TestHarness {
    constructor(
        private readonly fanClient: IFanClient,
        private readonly logger: Logger,
        private readonly discoveryService: DiscoveryService,
        private readonly stateSynchronizationService: StateSynchronizationService
    ) {}

    public async fanTest(): Promise<void> {

      const fans = await this.discoveryService.discover();
      const fan = fans[0];

      if (!fan) {
        this.logger.warn('No fan candidates found.');
        return;
      }

      await this.fanClient.setFanPower(fan, true);
      await this.fanClient.setFanSpeed(fan, 3);
      await this.fanClient.setFanPower(fan, false);

      /*
      const connection = new FanConnection('Lanai Fan 1','192.168.1.41');

      const state1 = await this.client.getState(connection);
      this.logger.info(`Fan=${state1.fanOn}, Speed=${state1.fanSpeed}, Light=${state1.lightOn}`);

      const state2 = await this.client.setFanPower(connection, true);
      this.logger.info(`Fan=${state2.fanOn}, Speed=${state2.fanSpeed}, Light=${state2.lightOn}`);

      const state3 = await this.client.setFanSpeed(connection, 3);
      this.logger.info(`Fan=${state3.fanOn}, Speed=${state3.fanSpeed}, Light=${state3.lightOn}`);
        
      const state4 = await this.client.setFanPower(connection, false);
      this.logger.info(`Fan=${state4.fanOn}, Speed=${state4.fanSpeed}, Light=${state4.lightOn}`);
      */
    }

    public async poll() : Promise<void> {
      const connection = new FanConnection('Lanai Fan 1','192.168.1.41');
      const state = await this.stateSynchronizationService.synchronize(connection);

      this.logger.info(`Fan=${state.fanOn}, Speed=${state.fanSpeed}, Light=${state.lightOn}`);
    }

    public async discover(): Promise<void> {
      const fans = await this.discoveryService.discover();

      for (const fan of fans) {
        this.logger.info(`Candidate fan: ${fan.displayName} at ${fan.ipAddress}`);
      }
    }
  }
