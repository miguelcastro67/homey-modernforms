import IDeviceDiscoveryProvider from '../abstractions/IDeviceDiscoveryProvider';
import FanConnection from '../models/FanConnection';

export default class CompositeDiscoveryProvider implements IDeviceDiscoveryProvider {
  constructor(private readonly providers: IDeviceDiscoveryProvider[]) {}

  public async discover(): Promise<FanConnection[]> {
    const results = new Map<string, FanConnection>();

    for (const provider of this.providers) {
      const candidates = await provider.discover();

      for (const candidate of candidates) {
        const key = candidate.clientId ?? candidate.ipAddress;

        results.set(key, candidate);
      }
    }

    return [...results.values()];
  }
}

