# Modern Forms Homey App
# Flow Cards

This document describes the Flow cards currently implemented in the app.

## Design Philosophy

Custom cards are implemented where they add value beyond Homey's built-in capability cards.

# When — Triggers

- Fan turned on
- Fan turned off
- Light turned on
- Light turned off
- Fan speed changed
- Fan direction changed
- Breeze Mode changed
- Light brightness changed
- Fan has been on for a specified duration
- Fan has been off for a specified duration
- Light has been on for a specified duration
- Light has been off for a specified duration

Duration triggers support seconds and minutes.

# And — Conditions

- Fan is turned on
- Fan speed is
- Fan speed is less than
- Fan speed is greater than
- Fan direction is
- Breeze Mode is
- Light is turned on
- Built-in Homey light-brightness comparison cards

# Then — Actions

- Turn fan on
- Turn fan off
- Set fan speed
- Increase fan speed
- Decrease fan speed
- Set fan direction
- Set Breeze Mode
- Turn light on
- Turn light off
- Set dim level
- Adjust dim level by a relative percentage

# Implementation Notes

Flow registration is centralized in `src/flow/FlowManager.ts`.

`FlowManager` owns card lookup, listener registration, trigger references, trigger execution, and duration-trigger argument lookup.

The device class owns state-transition detection, timer scheduling and cleanup, capability listeners, and calls into `FlowManager`.

`titleFormatted` uses camelCase.

The `[[device]]` placeholder is not valid inside `titleFormatted`; only declared Flow-card arguments may be referenced.
