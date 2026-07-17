import Homey from 'homey';
import type { ModernFormsAppType } from '../../app';
import AssetsConstants from '../../src/constants/AssetsConstants';
import FanConnection from '../../src/models/FanConnection';
import type FanDirection from '../../src/models/FanDirection';
import type FanState from '../../src/models/FanState';

class ModernFormsFanDevice extends Homey.Device {

  private pollInterval?: NodeJS.Timeout;
  private lastState?: FanState;

  private fanOnSince?: number;
  private fanOffSince?: number;
  private lightOnSince?: number;
  private lightOffSince?: number;

  private get app(): ModernFormsAppType {
    return this.homey.app as ModernFormsAppType;
  }

  private get connection(): FanConnection {
    return this.getConnection();
  }

  private lightOnDurationTimers = new Map<number, NodeJS.Timeout>();
  private lightOffDurationTimers = new Map<number, NodeJS.Timeout>();

  /**
   * onInit is called when the device is initialized.
  */
  async onInit(): Promise<void> {

    this.log(`Capabilities: ${JSON.stringify(this.getCapabilities())}`);

    // Remove legacy capabilities
    if (this.hasCapability('fan_speed')) {
      this.log('Removing legacy fan_speed capability...');
      await this.removeCapability('fan_speed');
    }

    // Add new capabilities
    if (!this.hasCapability('onoff')) {
      await this.addCapability('onoff');
    }

    if (!this.hasCapability('discrete_fan_speed')) {
      await this.addCapability('discrete_fan_speed');
    }

    if (!this.hasCapability('fan_direction')) {
      await this.addCapability('fan_direction');
    }

    if (!this.hasCapability('breeze_mode')) {
      await this.addCapability('breeze_mode');
    }

    if (!this.hasCapability('onoff.light')) {
      await this.addCapability('onoff.light');
    }

    if (!this.hasCapability('dim.light')) {
      await this.addCapability('dim.light');
    }

    this.log(`Capabilities after migration: ${JSON.stringify(this.getCapabilities())}`);

    this.registerCapabilityListener('onoff', async (value: boolean) => {
      await this.setFanPower(value);
    });

    this.registerCapabilityListener('discrete_fan_speed', async (value: string) => {
      await this.setFanSpeed(Number(value));
    });

    this.registerCapabilityListener('fan_direction', async (value: FanDirection) => {
      await this.setFanDirection(value);
    });

    this.registerCapabilityListener('breeze_mode', async (value: string) => {
      await this.setBreezeMode(value === 'enabled');
    });

    this.registerCapabilityListener('onoff.light', async (value: boolean) => {
      await this.setLightPower(value);
    });

    this.registerCapabilityListener('dim.light', async (value: number) => {
      await this.setLightBrightness(value);
    });

    await this.synchronize();

    this.pollInterval = this.homey.setInterval(() => {
      this.synchronize().catch((error) => {

        if (this.isDeleting) {
          return;
        }

        this.error('Failed to synchronize fan', error);

      });
    }, AssetsConstants.SynchronizationInternalMilliseconds);
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ModernFormsDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log("ModernFormsDevice settings where changed");
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('ModernFormsDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  private isDeleting = false;

  async onDeleted(): Promise<void> {
    this.isDeleting = true;

    if (this.pollInterval) {
      this.homey.clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }

    this.clearTimers(this.lightOnDurationTimers);
    this.clearTimers(this.lightOffDurationTimers);
  }

  public async turnOn(): Promise<void> {
    await this.setFanPower(true);
  }

  public async turnOff(): Promise<void> {
    await this.setFanPower(false);
  }

  public async setFanPower(on: boolean): Promise<void> {
    const state = await this.app.fanClient.setFanPower(this.connection, on);
    if (this.isDeleting) {
        return;
    }
    await this.applyState(state);
  }
 
  public async setFanSpeed(speed: number): Promise<void> {
    const state = await this.app.fanClient.setFanSpeed(this.connection, speed);
    if (this.isDeleting) {
        return;
    }
    await this.applyState(state);
  }

  public async setFanDirection(direction: FanDirection): Promise<void> {
    const state = await this.app.fanClient.setFanDirection(this.connection, direction);
    if (this.isDeleting) {
        return;
    }
    await this.applyState(state);
  }

  public async increaseFanSpeed(): Promise<void> {
      await this.adjustFanSpeed(1);
  }

  public async decreaseFanSpeed(): Promise<void> {
      await this.adjustFanSpeed(-1);
  }

  private async adjustFanSpeed(delta: number): Promise<void> {
    const state = await this.app.fanClient.getState(this.connection);

    const newSpeed = Math.min(6, Math.max(1, state.fanSpeed + delta));

    if (newSpeed === state.fanSpeed) {
        return;
    }

    await this.setFanSpeed(newSpeed);
  }

  public async setBreezeMode(enabled: boolean): Promise<void> {
    const state = await this.app.fanClient.setWindMode(this.connection, enabled);
    if (this.isDeleting) {
        return;
    }
    await this.applyState(state);
  }

  public async setLightPower(on: boolean): Promise<void> {
    const state = await this.app.fanClient.setLightPower(this.connection, on);
    if (this.isDeleting) {
        return;
    }
    await this.applyState(state);
  }

  public async setLightBrightness(value: number): Promise<void> {
    const brightness = Math.round(value * 100);
    const state = await this.app.fanClient.setLightBrightness(this.connection, brightness);
    if (this.isDeleting) {
        return;
    }
    await this.applyState(state);
  }

  public async adjustLightBrightness(amount: number): Promise<void> {
    const state = await this.app.fanClient.getState(this.connection);
    const brightness = Math.max(0, Math.min(100, state.lightBrightness + amount));

    if (brightness === state.lightBrightness) {
      return;
    }

    await this.setLightBrightness(brightness / 100);
  }

  public isFanSpeed(speed: number): boolean {
    const currentSpeed = this.getCapabilityValue('discrete_fan_speed') as string | null;

    return Number(currentSpeed) === speed;
  }

  public isFanDirection(direction: FanDirection): boolean {
    return this.getCapabilityValue('fan_direction') === direction;
  }

  public isBreezeMode(enabled: boolean): boolean {
    const currentMode = this.getCapabilityValue('breeze_mode') as string | null;

    return currentMode === (enabled ? 'enabled' : 'disabled');
  }

  public isLightOn(): boolean {
    return this.getCapabilityValue('onoff.light') === true;
  }

  public isFanSpeedLessThan(speed: number): boolean {
    const currentSpeed = Number(
      this.getCapabilityValue('discrete_fan_speed')
    );

    return currentSpeed < speed;
  }

  public isFanSpeedGreaterThan(speed: number): boolean {
    const currentSpeed = Number(
      this.getCapabilityValue('discrete_fan_speed')
    );

    return currentSpeed > speed;
  }

  /*
  public hasLightBeenOnFor(value: number, unit: 'seconds' | 'minutes'): boolean {
    if (this.getCapabilityValue('onoff.light') !== true) {
      return false;
    }

    return this.hasElapsed(this.lightOnSince, value, unit);
  }

  public hasLightBeenOffFor(value: number, unit: 'seconds' | 'minutes'): boolean {
    if (this.getCapabilityValue('onoff.light') !== false) {
      return false;
    }

    return this.hasElapsed(this.lightOffSince, value, unit);
  }
    */

  private getConnection(): FanConnection {
    const connection = this.getStoreValue('connection') as FanConnection | undefined;

    if (!connection) {
      throw new Error('Fan connection was not found in device store.');
    }

    return new FanConnection(
      connection.displayName,
      connection.ipAddress,
      connection.clientId
    );
  }
  
  public async synchronize(): Promise<void> {
    if (this.isDeleting) {
      return;
    }

    const state =
      await this.app.stateSynchronizationService.synchronize(this.connection);

    if (this.isDeleting) {
      return;
    }

    await this.applyState(state);
  }

  private async detectStateChanges(previousState: FanState | undefined, currentState: FanState): Promise<void> {
    // On startup, establish a baseline only.
    // We do not know how long the fan or light has already been
    // in its current state, so leave the duration timestamps undefined.
    if (!previousState) {
      return;
    }

    if (previousState.fanOn !== currentState.fanOn) {
      this.log(`Fan power changed: ${previousState.fanOn} -> ${currentState.fanOn}`);

      if (currentState.fanOn) {
        this.fanOnSince = Date.now();
        this.fanOffSince = undefined;
      } 
      else {
        this.fanOffSince = Date.now();
        this.fanOnSince = undefined;
      }
    }

    if (previousState.lightOn !== currentState.lightOn) {
      this.log(`Light power changed: ${previousState.lightOn} -> ${currentState.lightOn}`);

      if (currentState.lightOn) {
        this.lightOnSince = Date.now();
        this.lightOffSince = undefined;

        this.clearTimers(this.lightOffDurationTimers);
        await this.scheduleLightOnDurationTimers();

        await this.app.flowManager.triggerLightTurnedOn(this);
      } 
      else {
        this.lightOffSince = Date.now();
        this.lightOnSince = undefined;

        this.clearTimers(this.lightOnDurationTimers);
        await this.scheduleLightOffDurationTimers();

        await this.app.flowManager.triggerLightTurnedOff(this);
      }
    }

    if (previousState.fanSpeed !== currentState.fanSpeed) {
      this.log(`Fan speed changed: ${previousState.fanSpeed} -> ${currentState.fanSpeed}`);

      await this.app.flowManager.triggerFanSpeedChanged(this, currentState.fanSpeed);
    }

    if (previousState.fanDirection !== currentState.fanDirection) {
      this.log(`Fan direction changed: ${previousState.fanDirection} -> ${currentState.fanDirection}`);

      await this.app.flowManager.triggerFanDirectionChanged(this, currentState.fanDirection);
    }

    if (previousState.wind !== currentState.wind) {
      this.log(`Breeze mode changed: ${previousState.wind} -> ${currentState.wind}`);

      await this.app.flowManager.triggerBreezeModeChanged(this, currentState.wind);
    }

    if (previousState.lightBrightness !== currentState.lightBrightness) {
      this.log(`Light brightness changed: ${previousState.lightBrightness} -> ${currentState.lightBrightness}`);

      await this.app.flowManager.triggerLightBrightnessChanged(this, currentState.lightBrightness);
    }
  }

  private async applyState(state: FanState): Promise<void> {
    if (this.isDeleting) {
      return;
    }

    const previousState = this.lastState;

    // Prevent concurrent state applications from detecting
    // the same transition more than once.
    this.lastState = state;

    await this.setCapabilityIfPresent('onoff', state.fanOn);
    await this.setCapabilityIfPresent('discrete_fan_speed', String(state.fanSpeed));
    await this.setCapabilityIfPresent('fan_direction', state.fanDirection);
    await this.setCapabilityIfPresent('breeze_mode', state.wind ? 'enabled' : 'disabled');
    await this.setCapabilityIfPresent('onoff.light', state.lightOn);
    await this.setCapabilityIfPresent('dim.light', state.lightBrightness / 100);

    if (this.isDeleting) {
      return;
    }

    await this.detectStateChanges(previousState, state);
  }

  private async setCapabilityIfPresent(capability: string, value: unknown): Promise<void> {
    if (this.isDeleting || !this.hasCapability(capability)) {
      return;
    }

    // Avoid unnecessary Homey capability and Insights updates.
    const currentValue = this.getCapabilityValue(capability);

    if (currentValue === value) {
      return;
    }

    await this.setCapabilityValue(capability, value);

    /*
    try {
      await this.setCapabilityValue(capability, value);
    }
    catch (error) {
      if (capability === 'onoff.light' && this.isDeviceTeardownError(error)) {
        return;
      }

      throw error;
    }
      */
  }

  private isDeviceTeardownError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);

    return (
      message.includes('Not Found: LogLocal') &&
      message.includes(':onoff.light')
    );
  }

  private hasElapsed(since: number | undefined, value: number, unit: 'seconds' | 'minutes'): boolean {
    if (since === undefined) {
      return false;
    }

    const requiredMilliseconds = unit === 'seconds'
        ? value * 1000
        : value * 60 * 1000;

    return Date.now() - since >= requiredMilliseconds;
  }

  private clearTimers(timers: Map<number, NodeJS.Timeout>): void {
    for (const timer of timers.values()) {
      this.homey.clearTimeout(timer);
    }

    timers.clear();
  }

  private async scheduleLightOnDurationTimers(): Promise<void> {
    this.clearTimers(this.lightOnDurationTimers);

    const configuredDurations = await this.app.flowManager.getLightTurnedOnForArguments(this);

    for (const { duration, unit } of configuredDurations) {
      const durationMilliseconds = this.toMilliseconds(Number(duration), unit);

      // Multiple Flows may use the same duration. One timer is enough;
      // the trigger run listener will match every configured Flow.
      if (this.lightOnDurationTimers.has(durationMilliseconds)) {
        continue;
      }

      const timer = this.homey.setTimeout(async () => {
        if (this.isDeleting) {
          return;
        }

        this.lightOnDurationTimers.delete(durationMilliseconds);

        if (this.getCapabilityValue('onoff.light') !== true) {
          return;
        }

        try {
          await this.app.flowManager.triggerLightTurnedOnFor(this, durationMilliseconds);
        } 
        catch (error) {
          this.error(`Failed to trigger light turned on for ${durationMilliseconds}ms`, error);
        }
      }, durationMilliseconds);

      this.lightOnDurationTimers.set(durationMilliseconds, timer);
    }
  }

  private async scheduleLightOffDurationTimers(): Promise<void> {
    this.clearTimers(this.lightOffDurationTimers);

    const configuredDurations = await this.app.flowManager.getLightTurnedOffForArguments(this);

    for (const { duration, unit } of configuredDurations) {
      const durationMilliseconds = this.toMilliseconds(Number(duration), unit);

      if (this.lightOffDurationTimers.has(durationMilliseconds)) {
        continue;
      }

      const timer = this.homey.setTimeout(async () => {
        if (this.isDeleting) {
          return;
        }

        this.lightOffDurationTimers.delete(durationMilliseconds);

        if (this.getCapabilityValue('onoff.light') !== false) {
          return;
        }

        try {
          await this.app.flowManager.triggerLightTurnedOffFor(this, durationMilliseconds);
        } 
        catch (error) {
          this.error(`Failed to trigger light turned off for ${durationMilliseconds}ms`, error);
        }
      }, durationMilliseconds);

      this.lightOffDurationTimers.set(durationMilliseconds, timer);
    }
  }

  private toMilliseconds(duration: number, unit: 'seconds' | 'minutes'): number {
    return unit === 'seconds' ? duration * 1000 : duration * 60 * 1000;
  }
};

module.exports = ModernFormsFanDevice;
