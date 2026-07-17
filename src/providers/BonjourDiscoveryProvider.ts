import IDeviceDiscoveryProvider from '../abstractions/IDeviceDiscoveryProvider';
import Logger from '../core/Logger';
import FanConnection from '../models/FanConnection';
import DiscoverySession from '../discovery/DiscoverySession';

export default class BonjourDiscoveryProvider implements IDeviceDiscoveryProvider {
  constructor(private readonly logger: Logger) {}

  public discover(): Promise<FanConnection[]> {
    const session = new DiscoverySession(this.logger);

    return session.run();
  }
}

