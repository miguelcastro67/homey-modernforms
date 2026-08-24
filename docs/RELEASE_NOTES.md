# Release Notes

## Current Test / Pending Release

### Fan speed and Flow tags

- Set Fan Speed accepts manually entered numeric values and numeric Flow tags/variables.
- Fan speed is strictly limited to whole numbers from 1 through 6.
- Added a read-only numeric Fan speed value capability/tag for use in Flows.
- Existing paired fans automatically receive the Fan speed value capability.

### Light controls

- Dim Level has a minimum of 1%, keeping light power separate from brightness.
- Brightness adjustments are clamped to the supported 1%–100% range.
- Fixed the Light is turned on condition so Homey's Invert option works correctly.
- Added a Toggle Light action.
- Added Increase Dim Level and Decrease Dim Level actions.
- Increase/Decrease Dim Level default to a 5% adjustment when the optional amount is omitted, and accept manual whole-number percentages or numeric Flow tags/variables.

## Version 1.1.0

Initial public release.

### Features

- Automatic discovery of Modern Forms smart ceiling fans
- Local network communication
- Fan speed, direction, and Breeze Mode control
- Light on/off and brightness control
- Real-time synchronization with the Modern Forms app
- Comprehensive Homey Flow support with actions, conditions, and triggers
