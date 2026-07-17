import IDeviceDiscoveryProvider from '../abstractions/IDeviceDiscoveryProvider';
import IFanRepository from '../abstractions/IFanRepository';
import FanConnection from '../models/FanConnection';

export default class RememberedDiscoveryProvider implements IDeviceDiscoveryProvider {
  constructor(private readonly repository: IFanRepository) {}

  public discover(): Promise<FanConnection[]> {
    return this.repository.load();
  }

  public remember(fans: FanConnection[]): Promise<void> {
    return this.repository.save(fans);
  }
}

