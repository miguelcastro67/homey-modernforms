import { Bonjour, type Browser, type Service } from 'bonjour-service';
import Logger from '../core/Logger';
import FanConnection from '../models/FanConnection';
import DiscoveryConstants from '../constants/DiscoveryConstants';

export default class DiscoverySession {

  private readonly bonjour = new Bonjour();
  private readonly browser: Browser;
  private readonly results = new Map<string, FanConnection>();

  private maximumTimer?: NodeJS.Timeout;
  private isFinished = false;

  constructor(private readonly logger: Logger) {
    this.browser = this.bonjour.find({ type: 'easylink', protocol: 'tcp' });
  }

  // TODO: Investigate active mDNS queries if bonjour-service adds support.
  // Current passive discovery is reliable but averages 10–13 seconds.

  public run(): Promise<FanConnection[]> {
    this.logger.info('Starting mDNS discovery session');

    return new Promise((resolve) => {
      const finish = (): void => {
        if (this.isFinished) {
          return;
        }

        this.isFinished = true;

        this.cleanup();

        resolve([...this.results.values()]);
      };

      this.browser.on('up', (service: Service) => {

        /*
        try {
            this.logger.debug(`Raw Bonjour service:\n${JSON.stringify(service, null, 2)}`);
        } catch (error) {
            this.logger.debug(`Could not serialize raw Bonjour service: ${String(error)}`);
        }
        */

        const connection = this.createConnection(service);

        if (!connection) {
          return;
        }

        this.logger.debug(`FanConnection:\n${JSON.stringify(connection, null, 2)}`);

        const key = connection.clientId ?? connection.ipAddress;

        if (this.results.has(key)) {
          return;
        }

        this.logger.info(
          `mDNS candidate found: ${connection.displayName} at ${connection.ipAddress}`
        );

        this.results.set(key, connection);
      });

      this.maximumTimer = this.startTimer(
        finish,
        DiscoveryConstants.DiscoveryMilliseconds
      );
    });
  }

  private cleanup(): void {

    if (this.maximumTimer) {
      clearTimeout(this.maximumTimer);
      this.maximumTimer = undefined;
    }

    this.browser.stop();
    this.bonjour.destroy();
  }

  private startTimer(callback: () => void, milliseconds: number): NodeJS.Timeout {
    return global.setTimeout(callback, milliseconds);
  }

  private createConnection(service: Service): FanConnection | undefined {
    if (service.txt?.Protocol !== 'com.modernforms.fan') {
      return undefined;
    }

    const ipAddress = service.addresses?.find((address) =>
      /^\d+\.\d+\.\d+\.\d+$/.test(address)
    );

    if (!ipAddress) {
      return undefined;
    }

    return new FanConnection(service.name, ipAddress,  service.txt?.MAC);
  }
}

