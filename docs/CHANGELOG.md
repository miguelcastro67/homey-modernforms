# Changelog

All notable changes to released versions of the Modern Forms Homey app are documented in this file.

Changes made before the initial public release are tracked in `ENGINEERING_JOURNAL.md`.

## [1.1.0] - 2026-08-06

### Initial public release

## [1.1.1] - 2026-08-22

### Changed

- Modification to the fan speed to change it from a dropdown to a number field so it supports a tag variable.

## [1.1.2] - 2026-08-22

### Changed

- Set Fan Speed now accepts numeric Flow tags/variables.
- Set Fan Speed accepts only whole numbers from 1–6; invalid or out-of-range values are rejected.
- Added the read-only numeric Fan speed value capability/tag.
- Existing paired fans automatically receive the new capability.

## [1.1.3] - 2026-08-22

### Changed

- Updated the Set Fan Speed card label to clearly indicate the valid 1–6 range.
- Updated Flow card documentation for numeric tag/variable support and the Fan speed value tag.

## [1.1.4] - 2026-08-22

### Changed

- Fan speed values are now limited to 1–6, requiring the fan to be explicitly turned off using the Turn Off card.
- Dim Level now has a minimum value of 1%, preventing dimming commands from implicitly turning the light off.
- Brightness adjustments are now clamped to a minimum of 1%.

## [Unreleased] - 2026-08-24

### Added

- Added a Toggle Light Flow action card.
- Added Increase Dim Level and Decrease Dim Level Flow action cards.
- Increase/Decrease Dim Level support an optional whole-number percentage amount; when omitted, the adjustment defaults to 5%.
- Increase/Decrease Dim Level amount fields support numeric Flow tags/variables.

### Fixed

- Fixed the Light is turned on condition card so Homey's Invert option correctly evaluates the light-off state.

### Changed

- Increase/Decrease Dim Level adjustments remain clamped to the supported 1%–100% brightness range.

