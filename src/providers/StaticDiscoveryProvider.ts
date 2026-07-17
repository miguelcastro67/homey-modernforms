import IDeviceDiscoveryProvider from '../abstractions/IDeviceDiscoveryProvider';
import FanConnection from '../models/FanConnection';

export default class StaticDiscoveryProvider implements IDeviceDiscoveryProvider {
  public async discover(): Promise<FanConnection[]> {
    return [
      new FanConnection('Lanai Fan 1', '192.168.1.41'),
      new FanConnection('Lanai Fan 2', '192.168.1.42'),
    ];
  }
}

