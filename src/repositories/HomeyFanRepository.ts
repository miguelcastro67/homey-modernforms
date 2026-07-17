import IFanRepository from '../abstractions/IFanRepository';
import FanConnection from '../models/FanConnection';
import type { ModernFormsAppType } from '../../app';
import RepositoryConstants from '../constants/RepositoryConstants';

export default class HomeyFanRepository implements IFanRepository {

  constructor(private readonly app: ModernFormsAppType) {}

  public async load(): Promise<FanConnection[]> {
    const stored = this.app.homey.settings.get(RepositoryConstants.StorageKey) as FanConnection[] | null;
    if (!stored) {
      return [];
    }

    return stored.map(
      (fan) => new FanConnection(fan.displayName, fan.ipAddress, fan.clientId)
    );
  }

  public async save(fans: FanConnection[]): Promise<void> {
    this.app.homey.settings.set(RepositoryConstants.StorageKey, fans);
  }
}

