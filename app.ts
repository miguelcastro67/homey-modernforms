'use strict';

import Homey from 'homey';
import IFanClient from './src/abstractions/IFanClient';
import ModernFormsClient from './src/clients/ModernFormsClient';
import HttpClient from './src/core/HttpClient';
import Logger from './src/core/Logger';
import FlowManager from './src/flow/FlowManager';
import BonjourDiscoveryProvider from './src/providers/BonjourDiscoveryProvider';
import CompositeDiscoveryProvider from './src/providers/CompositeDiscoveryProvider';
import RememberedDiscoveryProvider from './src/providers/RememberedDiscoveryProvider';
import HomeyFanRepository from './src/repositories/HomeyFanRepository';
import DiscoveryService from './src/services/DiscoveryService';
import StateSynchronizationService from './src/services/StateSynchronizationService';
import TestHarness from './src/testing/TestHarness';

class ModernFormsApp extends Homey.App {

  private _fanClient!: IFanClient;

  public logger!: Logger;
  public httpClient!: HttpClient;
  public discoveryService!: DiscoveryService;
  public stateSynchronizationService!: StateSynchronizationService;
  public flowManager!: FlowManager;

    
  public get fanClient(): IFanClient {
    return this._fanClient;
  }

  async onInit(): Promise<void> {

    this.logger = new Logger(this);
    this.httpClient = new HttpClient(this.logger);
    this._fanClient = new ModernFormsClient(this.logger, this.httpClient);
    this.flowManager = new FlowManager(this, this.logger);

    this.flowManager.register();

    const repository = new HomeyFanRepository(this);

    const discoveryProvider = new CompositeDiscoveryProvider([
        new BonjourDiscoveryProvider(this.logger),
        new RememberedDiscoveryProvider(repository)
    ]);

    this.discoveryService = new DiscoveryService(
        discoveryProvider,
        repository,
        this.fanClient,
        this.logger
    );

    this.stateSynchronizationService = new StateSynchronizationService(this._fanClient, this.logger);

    const testHarness = new TestHarness(
      this._fanClient,
      this.logger,
      this.discoveryService,
      this.stateSynchronizationService
    );

    testHarness.discover().catch((error) => {
      this.logger.error('TestHarness failed', error);
    });

    this.log('Modern Forms Fan app has been initialized');
  }
}

export type ModernFormsAppType = ModernFormsApp;
module.exports = ModernFormsApp;
