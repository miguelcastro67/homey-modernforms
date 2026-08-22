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
