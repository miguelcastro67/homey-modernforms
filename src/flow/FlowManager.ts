import Homey,{ FlowCardAction, FlowCardCondition, FlowCardTriggerDevice } from 'homey';
import type { ModernFormsAppType } from '../../app';
import type Logger from '../core/Logger';
import FanDirection from '../models/FanDirection';

export default class FlowManager {
  constructor(
    private readonly app: ModernFormsAppType,
    private readonly logger: Logger
  ) {}

  private breezeModeChangedTrigger!: FlowCardTriggerDevice;
  private fanDirectionChangedTrigger!: FlowCardTriggerDevice;
  private fanSpeedChangedTrigger!: FlowCardTriggerDevice;
  private lightBrightnessChangedTrigger!: FlowCardTriggerDevice;
  private lightTurnedOffTrigger!: FlowCardTriggerDevice;
  private lightTurnedOffForTrigger!: FlowCardTriggerDevice;
  private lightTurnedOnTrigger!: FlowCardTriggerDevice;
  private lightTurnedOnForTrigger!: FlowCardTriggerDevice;

  private breezeModeIsCard!: FlowCardCondition;
  private fanDirectionIsCard!: FlowCardCondition;
  private fanSpeedGreaterThanCard!: FlowCardCondition;
  private fanSpeedIsCard!: FlowCardCondition;
  private fanSpeedLessThanCard!: FlowCardCondition;
  private lightIsOnCard!: FlowCardCondition;

  private decreaseFanSpeedCard!: FlowCardAction;
  private increaseFanSpeedCard!: FlowCardAction;
  private relativeDimLevelCard!: FlowCardAction;
  private setBreezeModeCard!: FlowCardAction;
  private setDimLevelCard!: FlowCardAction;
  private setFanDirectionCard!: FlowCardAction;
  private setFanSpeedCard!: FlowCardAction;
  private turnLightOnCard!: FlowCardAction;
  private turnLightOffCard!: FlowCardAction;
 
  public async triggerLightTurnedOn(device: Homey.Device): Promise<void> {
    await this.lightTurnedOnTrigger.trigger(device);
  }

  public async triggerLightTurnedOff(device: Homey.Device): Promise<void> {
    await this.lightTurnedOffTrigger.trigger(device);
  }

  public async triggerFanSpeedChanged(device: Homey.Device, speed: number): Promise<void> {
    await this.fanSpeedChangedTrigger.trigger(device, { speed });
  }

  public async triggerFanDirectionChanged(device: Homey.Device, direction: string): Promise<void> {
    await this.fanDirectionChangedTrigger.trigger(device, { direction });
  }

  public async triggerBreezeModeChanged(device: Homey.Device, enabled: boolean): Promise<void> {
    await this.breezeModeChangedTrigger.trigger(device, {
      mode: enabled ? 'enabled' : 'disabled',
    });
  }

  public async triggerLightBrightnessChanged(device: Homey.Device, brightness: number): Promise<void> {
    await this.lightBrightnessChangedTrigger.trigger(device, { brightness });
  }

  public async getLightTurnedOnForArguments(device: Homey.Device): Promise<Array<{ duration: number; unit: 'seconds' | 'minutes' }>> {
    return this.lightTurnedOnForTrigger.getArgumentValues(device);
  }

  public async getLightTurnedOffForArguments(device: Homey.Device): Promise<Array<{ duration: number; unit: 'seconds' | 'minutes' }>> {
    return this.lightTurnedOffForTrigger.getArgumentValues(device);
  }

  public async triggerLightTurnedOnFor(device: Homey.Device, durationMilliseconds: number): Promise<void> {
    await this.lightTurnedOnForTrigger.trigger(device, {}, { durationMilliseconds });
  }

  public async triggerLightTurnedOffFor(device: Homey.Device, durationMilliseconds: number): Promise<void> {
    await this.lightTurnedOffForTrigger.trigger(device, {}, { durationMilliseconds });
  }

  public register(): void {
    this.registerTriggers();
    this.registerConditions();
    this.registerActions();
  }

  private registerTriggers(): void {
    this.registerLightTurnedOnTrigger();
    this.registerLightTurnedOffTrigger();
    this.registerFanSpeedChangedTrigger();
    this.registerFanDirectionChangedTrigger();
    this.registerBreezeModeChangedTrigger();
    this.registerLightBrightnessChangedTrigger();
    this.registerLightTurnedOnForTrigger();
    this.registerLightTurnedOffForTrigger();
  }

  private registerConditions(): void {
    this.registerFanSpeedIsCondition();
    this.registerFanSpeedLessThanCondition();
    this.registerFanSpeedGreaterThanCondition();
    this.registerFanDirectionIsCondition();
    this.registerBreezeModeIsCondition();
    this.registerLightIsOnCondition();
  }

  private registerActions(): void {
    this.registerSetFanSpeedAction();
    this.registerIncreaseFanSpeedAction();
    this.registerDecreaseFanSpeedAction();
    this.registerSetFanDirectionAction();
    this.registerSetBreezeModeAction();
    this.registerTurnLightOnAction();
    this.registerTurnLightOffAction();
    this.registerSetDimLevelAction();
    this.registerSetRelativeDimLevelAction();
  }

  // TRIGGERS

  private registerLightTurnedOnTrigger(): void {
    this.lightTurnedOnTrigger =
      this.app.homey.flow.getDeviceTriggerCard('light_turned_on');
  }

  private registerLightTurnedOffTrigger(): void {
    this.lightTurnedOffTrigger =
      this.app.homey.flow.getDeviceTriggerCard('light_turned_off');
  }

  private registerFanSpeedChangedTrigger(): void {
    this.fanSpeedChangedTrigger =
      this.app.homey.flow.getDeviceTriggerCard('fan_speed_changed');
  }

  private registerFanDirectionChangedTrigger(): void {
    this.fanDirectionChangedTrigger =
      this.app.homey.flow.getDeviceTriggerCard('fan_direction_changed');
  }

  private registerBreezeModeChangedTrigger(): void {
    this.breezeModeChangedTrigger =
      this.app.homey.flow.getDeviceTriggerCard('breeze_mode_changed');
  }

  private registerLightBrightnessChangedTrigger(): void {
    this.lightBrightnessChangedTrigger =
      this.app.homey.flow.getDeviceTriggerCard('light_brightness_changed');
  }

  private registerLightTurnedOnForTrigger(): void {
    this.lightTurnedOnForTrigger =
      this.app.homey.flow.getDeviceTriggerCard('light_turned_on_for');

    this.lightTurnedOnForTrigger.registerRunListener(
      async ({ duration, unit }, state) => {
        const configuredMilliseconds = this.toMilliseconds(
          Number(duration),
          unit as 'seconds' | 'minutes'
        );

        return configuredMilliseconds === state.durationMilliseconds;
      }
    );
  }

  private registerLightTurnedOffForTrigger(): void {
    this.lightTurnedOffForTrigger =
      this.app.homey.flow.getDeviceTriggerCard('light_turned_off_for');

    this.lightTurnedOffForTrigger.registerRunListener(
      async ({ duration, unit }, state) => {
        const configuredMilliseconds = this.toMilliseconds(
          Number(duration),
          unit as 'seconds' | 'minutes'
        );

        return configuredMilliseconds === state.durationMilliseconds;
      }
    );
  }

  // CONDITIONS

  private registerFanSpeedIsCondition(): void {
    this.fanSpeedIsCard =
      this.app.homey.flow.getConditionCard('fan_speed_is');

    this.fanSpeedIsCard.registerRunListener(async ({ device, speed }) => {
      const expectedSpeed = Number(speed);
      const result = device.isFanSpeed(expectedSpeed);

      this.logger.debug(
        `Flow: Checking whether ${device.getName()} is at speed ${expectedSpeed}: ${result}`
      );

      return result;
    });
  }

  private registerFanSpeedLessThanCondition(): void {
    this.fanSpeedLessThanCard =
      this.app.homey.flow.getConditionCard('fan_speed_less_than');

    this.fanSpeedLessThanCard.registerRunListener(
      async ({ device, speed }) => {
        const compareSpeed = Number(speed);
        const result = device.isFanSpeedLessThan(compareSpeed);

        this.logger.debug(
          `Flow: Checking whether ${device.getName()} speed is less than ${compareSpeed}: ${result}`
        );

        return result;
      }
    );
  }

  private registerFanSpeedGreaterThanCondition(): void {
    this.fanSpeedGreaterThanCard =
      this.app.homey.flow.getConditionCard('fan_speed_greater_than');

    this.fanSpeedGreaterThanCard.registerRunListener(
      async ({ device, speed }) => {
        const compareSpeed = Number(speed);
        const result = device.isFanSpeedGreaterThan(compareSpeed);

        this.logger.debug(
          `Flow: Checking whether ${device.getName()} speed is greater than ${compareSpeed}: ${result}`
        );

        return result;
      }
    );
  }

  private registerFanDirectionIsCondition(): void {
    this.fanDirectionIsCard =
      this.app.homey.flow.getConditionCard('fan_direction_is');

    this.fanDirectionIsCard.registerRunListener(
      async ({ device, direction }) => {
        const expectedDirection = direction as FanDirection;
        const result = device.isFanDirection(expectedDirection);

        this.logger.debug(
          `Flow: Checking whether ${device.getName()} direction is ${expectedDirection}: ${result}`
        );

        return result;
      }
    );
  }

  private registerBreezeModeIsCondition(): void {
    this.breezeModeIsCard =
      this.app.homey.flow.getConditionCard('breeze_mode_is');

    this.breezeModeIsCard.registerRunListener(
      async ({ device, mode }) => {
        const enabled = mode === 'enabled';
        const result = device.isBreezeMode(enabled);

        this.logger.debug(
          `Flow: Checking whether ${device.getName()} breeze mode is ${mode}: ${result}`
        );

        return result;
      }
    );
  }

  private registerLightIsOnCondition(): void {
    this.lightIsOnCard =
      this.app.homey.flow.getConditionCard('light_is_on');

    this.lightIsOnCard.registerRunListener(async ({ device }) => {
      const result = device.isLightOn();

      this.logger.debug(
        `Flow: Checking whether ${device.getName()} light is on: ${result}`
      );

      return result;
    });
  }

  // ACTIONS

  private registerSetFanSpeedAction(): void {
    this.setFanSpeedCard =
      this.app.homey.flow.getActionCard('set_fan_speed');

    this.setFanSpeedCard.registerRunListener(
      async ({ device, speed }) => {
        const fanSpeed = Number(speed);

        this.logger.info(
          `Flow: Setting ${device.getName()} to speed ${fanSpeed}`
        );

        await device.setFanSpeed(fanSpeed);

        return true;
      }
    );
  }

  private registerIncreaseFanSpeedAction(): void {
    this.increaseFanSpeedCard =
      this.app.homey.flow.getActionCard('increase_fan_speed');

    this.increaseFanSpeedCard.registerRunListener(
      async ({ device }) => {
        this.logger.info(
          `Flow: Increasing fan speed for ${device.getName()}`
        );

        await device.increaseFanSpeed();

        return true;
      }
    );
  }

  private registerDecreaseFanSpeedAction(): void {
    this.decreaseFanSpeedCard =
      this.app.homey.flow.getActionCard('decrease_fan_speed');

    this.decreaseFanSpeedCard.registerRunListener(
      async ({ device }) => {
        this.logger.info(
          `Flow: Decreasing fan speed for ${device.getName()}`
        );

        await device.decreaseFanSpeed();

        return true;
      }
    );
  }

  private registerSetFanDirectionAction(): void {
    this.setFanDirectionCard =
      this.app.homey.flow.getActionCard('set_fan_direction');

    this.setFanDirectionCard.registerRunListener(
      async ({ device, direction }) => {
        this.logger.info(
          `Flow: Setting ${device.getName()} direction to ${direction}`
        );

        await device.setFanDirection(direction as FanDirection);

        return true;
      }
    );
  }

  private registerSetBreezeModeAction(): void {
    this.setBreezeModeCard =
      this.app.homey.flow.getActionCard('set_breeze_mode');

    this.setBreezeModeCard.registerRunListener(
      async ({ device, mode }) => {
        this.logger.info(
          `Flow: Setting ${device.getName()} breeze mode to ${mode}`
        );

        await device.setBreezeMode(mode === 'enabled');

        return true;
      }
    );
  }

  private registerTurnLightOnAction(): void {
    this.turnLightOnCard =
      this.app.homey.flow.getActionCard('turn_light_on');

    this.turnLightOnCard.registerRunListener(async ({ device }) => {
      this.logger.info(`Flow: Turning on light for ${device.getName()}`);

      await device.setLightPower(true);
      return true;
    });
  }

  private registerTurnLightOffAction(): void {
    this.turnLightOffCard =
      this.app.homey.flow.getActionCard('turn_light_off');

    this.turnLightOffCard.registerRunListener(async ({ device }) => {
      this.logger.info(`Flow: Turning off light for ${device.getName()}`);

      await device.setLightPower(false);
      return true;
    });
  } 

  private registerSetDimLevelAction(): void {
    this.setDimLevelCard =
      this.app.homey.flow.getActionCard('set_dim_level');

    this.setDimLevelCard.registerRunListener(
      async ({ device, level }) => {
        const brightness = Number(level);

        this.logger.info(
          `Flow: Setting ${device.getName()} dim level to ${Math.round(brightness * 100)}%`
        );

        await device.setLightBrightness(brightness);

        return true;
      }
    );
  }

  private registerSetRelativeDimLevelAction(): void {
    this.relativeDimLevelCard =
      this.app.homey.flow.getActionCard('set_relative_dim_level');

    this.relativeDimLevelCard.registerRunListener(
      async ({ device, amount }) => {
        const delta = Math.round(Number(amount) * 100);

        this.logger.info(
          `Flow: Adjusting ${device.getName()} brightness by ${delta}%`
        );

        await device.adjustLightBrightness(delta);

        return true;
      }
    );
  }

  // Helper Methods
  
  private toMilliseconds(duration: number, unit: 'seconds' | 'minutes'): number {
    return unit === 'seconds' ? duration * 1000 : duration * 60 * 1000;
  }
}
