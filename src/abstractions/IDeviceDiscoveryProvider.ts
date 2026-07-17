import FanConnection from '../models/FanConnection';

export default interface IDeviceDiscoveryProvider {
  discover(): Promise<FanConnection[]>;
}

