import HttpClient from '../core/HttpClient';
import Logger from '../core/Logger';
import type FanConnection from '../models/FanConnection';
import type FanDirection from '../models/FanDirection';
import type FanState from '../models/FanState';
import type IFanClient from '../abstractions/IFanClient';
import type FanStaticData from '../models/FanStaticData';

class ModernFormsClient implements IFanClient {
  constructor(
    private readonly logger: Logger,
    private readonly httpClient: HttpClient
  ) {}

  public async initialize(): Promise<void> {
    this.logger.info('ModernFormsClient initialized');
  }

  private execute<TResponse>(connection: FanConnection, body: object): Promise<TResponse> {
    return this.httpClient.postJson<TResponse>(
      `http://${connection.ipAddress}/mf`,
      body
    );
  }

  public getStaticData(connection: FanConnection): Promise<FanStaticData> {
    return this.execute<FanStaticData>(connection, {
      queryStaticShadowData: 1,
    });
  }

  public getState(connection: FanConnection): Promise<FanState> {
    return this.execute(connection, {
      queryDynamicShadowData: 1
    });
  }

  public setFanPower(connection: FanConnection, on: boolean): Promise<FanState> {
    return this.execute<FanState>(connection, {
        fanOn: on
    });
  }

  public setFanSpeed(connection: FanConnection, speed: number): Promise<FanState> {
    return this.execute<FanState>(connection, {
        fanSpeed: speed
    });
  }

  public setLightPower(connection: FanConnection, on: boolean): Promise<FanState> {
    return this.execute<FanState>(connection, {
      lightOn: on,
    });
  }

  public setLightBrightness(connection: FanConnection, brightness: number): Promise<FanState> {
    return this.execute<FanState>(connection, {
      lightBrightness: brightness,
    });
  }

  public setFanDirection(connection: FanConnection, direction: FanDirection): Promise<FanState> {
    return this.execute<FanState>(connection, {
      fanDirection: direction,
    });
  }

  public setWindMode(connection: FanConnection, enabled: boolean): Promise<FanState> {
    return this.execute<FanState>(connection, {
      wind: enabled,
    });
  }
}

export default ModernFormsClient;
