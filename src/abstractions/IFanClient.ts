import FanConnection from '../models/FanConnection';
import type FanState from '../models/FanState';
import type FanDirection from '../models/FanDirection';
import type FanStaticData from '../models/FanStaticData';

export default interface IFanClient {
  initialize(): Promise<void>;

  getStaticData(connection: FanConnection): Promise<FanStaticData>;

  getState(connection: FanConnection): Promise<FanState>;

  setFanPower(connection: FanConnection, on: boolean): Promise<FanState>;

  setFanSpeed(connection: FanConnection, speed: number): Promise<FanState>;

  setLightPower(connection: FanConnection, on: boolean): Promise<FanState>;

  setLightBrightness(connection: FanConnection, brightness: number): Promise<FanState>;

  setFanDirection(connection: FanConnection, direction: FanDirection): Promise<FanState>;

  setWindMode(connection: FanConnection, enabled: boolean): Promise<FanState>;
}
