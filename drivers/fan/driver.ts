import Homey from 'homey';
import type { ModernFormsAppType  } from '../../app';
import FanConnection from '../../src/models/FanConnection';

class ModernFormsFanDriver extends Homey.Driver {
  async onInit(): Promise<void> {
    this.log('Modern Forms Fan Driver initialized');
  }

  async onPairListDevices() {
    const app = this.homey.app as ModernFormsAppType;
    const fans = await app.discoveryService.discover();

    return fans.map((fan: FanConnection) => ({
      name: fan.displayName,
      data: {
        id: fan.clientId ?? fan.ipAddress,
      },
      store: {
        connection: fan,
      },
    }));
  }
}

module.exports = ModernFormsFanDriver;

