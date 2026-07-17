import FanConnection from '../models/FanConnection';

export default interface IFanRepository {
  load(): Promise<FanConnection[]>;
  save(fans: FanConnection[]): Promise<void>;
}

