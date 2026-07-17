# Modern Forms Homey App
# Engineering Journal

Author: Miguel Castro

---

# Project Vision

The objective of this project is not simply to integrate Modern Forms fans into Homey.

The objective is to build the definitive Modern Forms Homey application by providing superior reliability, richer automation, better diagnostics, and a cleaner user experience than the official Modern Forms application.

The project is intended to be an example of clean enterprise architecture while remaining approachable and easy to maintain.

---

# Development Philosophy

Throughout development we agreed on several guiding principles.

## Work smarter, not harder

Prefer solutions that permanently reduce complexity rather than simply solving today's problem.

## Explicit over clever

Readable code is preferred over compact or overly clever implementations.

## Reliability over speed

When forced to choose between speed and reliability, reliability wins.

Example:

Discovery averages approximately 10–13 seconds because reliable discovery is more important than saving a few seconds during pairing.

## Small responsibilities

Every class should have one clear responsibility.

Examples:

Clients communicate.

Providers discover.

Repositories persist.

Services orchestrate.

Models represent data.

## Refactor aggressively

Temporary implementations are expected.

Good software evolves through refactoring.

Do not hesitate to replace yesterday's implementation with today's better design.

---

# Session 1
## Project Foundation

Established the overall architecture.

Created the first communication layer.

Introduced dependency injection throughout the project.

Primary architectural decision:

Communication should be separated from business logic.

---

# Session 2
## Device Communication

Implemented the Modern Forms client.

Separated HTTP communication from Homey device behavior.

Introduced interfaces for all external communication.

---

# Session 3
## State Synchronization

Created:

StateSynchronizationService

Responsibilities:

- Poll devices
- Apply Homey capabilities
- Keep Homey synchronized with the physical fan

Major refactor:

Introduced applyState() to centralize capability updates.

---

# Session 4
## Device Capabilities

Implemented:

✓ Fan Power

✓ Fan Speed

✓ Light Power

✓ Light Brightness

Introduced discrete fan speed capability.

Began replacing generic Homey controls with fan-specific behavior.

---

# Session 5
## Flow Cards

Created the first custom Flow card.

Implemented:

Set Fan Speed

Planned future Flow cards including:

- Reverse
- Breeze Mode
- Favorite Speed
- Timed Conditions

--

titleFormatted uses camelCase.

The [[device]] placeholder is not valid inside titleFormatted.
Only Flow card arguments (such as dropdowns, text, numbers, etc.) may be referenced.

---

# Session 6
## Discovery

Initial implementation:

StaticDiscoveryProvider

Refactored to:

BonjourDiscoveryProvider

Discovered that Modern Forms fans advertise inconsistently using mDNS.

Created:

DiscoverySession

Responsibilities:

- Manage Bonjour browser
- Own timers
- Collect candidates
- Cleanup resources

Major architectural lesson:

Discovery execution belongs in a session object rather than inside the provider.

---

# Session 7
## Discovery Reliability

Observed:

Discovery timing alone could not reliably locate all fans.

Introduced:

CompositeDiscoveryProvider

Purpose:

Allow multiple discovery providers to contribute candidates.

Current providers:

- BonjourDiscoveryProvider
- RememberedDiscoveryProvider

Major design decision:

Discovery providers should remain independent and composable.

---

# Session 8
## Persistence

Introduced:

IFanRepository

Implemented:

HomeyFanRepository

using:

homey.settings

Purpose:

Remember previously discovered fans.

Repositories own persistence.

Services determine when persistence occurs.

---

# Current Architecture

Clients

↓

Services

↓

Providers

↓

Repositories

↓

Models

Responsibilities

Clients

Communicate with the Modern Forms API.

Services

Coordinate workflows.

Providers

Locate candidate devices.

Repositories

Persist information.

Models

Represent application data.

---

# Current Folder Structure

abstractions/

clients/

core/

discovery/

drivers/

models/

providers/

repositories/

services/

types/

---

# File Responsibilities

## app.ts

- Bootstrap
- Services
- Discovery
- Synchronization
- FlowManager

## FlowManager.ts

- Trigger registration
- Condition registration
- Action registration
- Trigger execution
- Trigger argument lookup
  
## Device.ts

- Device state
- Capability handlers
- State machine
- Timer scheduling
- Calls FlowManager

---

# Coding Standards

Always:

Compile

↓

Lint

↓

Run

↓

Refactor

The project should remain lint-clean.

Warnings are treated as technical debt.

Unused classes should be deleted rather than commented out.

Logging should go through the Logger wrapper.

Avoid console.log().

---

# Current Features

Implemented

✓ Discovery

✓ Pairing

✓ Fan Power

✓ Fan Speed

✓ Light Power

✓ Light Brightness

✓ State Synchronization

✓ Composite Discovery

✓ Repository-backed Discovery

---

# Future Features

## Device

- Friendly device names
- Reverse direction
- Breeze mode
- Favorite speed
- Improved Homey UI

## Flow Cards

When

- Fan Turned On
- Fan Turned Off
- Light Turned On
- Light Turned Off
- Speed Changed

And

- Fan Is On
- Light Is On
- Fan Speed Equals
- Brightness Equals
- Fan Turned On For X
- Fan Turned Off For X
- Light Turned On For X
- Light Turned Off For X

Then

- Reverse Direction
- Breeze Mode
- Favorite Speed

---

# Diagnostics

Future diagnostics may include:

- Firmware version
- Device health
- Last seen
- Last state change
- Offline detection
- Response time
- Statistics

---

# Lessons Learned

Real hardware determines architecture.

The first implementation is usually a hypothesis.

Good architecture makes refactoring inexpensive.

Dependency Injection simplified every major refactor performed during development.

The Provider Pattern proved especially valuable for discovery.

Repositories cleanly separated persistence from discovery.

---

# Project Status

Current version:

1.0.9

Current channel:

Homey App Store Test

Current stability:

- Discovery consistently finds all four fans using composite and remembered discovery.
- Local control, synchronization, device capabilities, and Flow cards are functioning.
- Publish-level validation passes.
- The App Store Test listing is visually complete.
- The intermittent `LogLocal ... :onoff.light` deletion error was resolved using `preventInsights: true`, confirmed through repeated A/B testing.

Current priority:

- Final submission preparation.
- Resolve or confirm the remaining icon-rendering discrepancy.
- Create the GitHub repository and public documentation.
- Plan localization support.

# Favorite Project Quotes

"Work smarter, not harder."

"Explicit over clever."

"Reliable over fast."

"Providers discover."

"Services orchestrate."

"Repositories persist."

"The first implementation is a hypothesis."

"Future Miguel should enjoy reading this code."

---

# Notes

This journal is intended to record why architectural decisions were made rather than simply documenting code.

PROJECT_NOTES.md should describe the current system.

ENGINEERING_JOURNAL.md should describe how the system evolved.

---

# Development Change Log *(pre-release)*

## [1.0.10] = 2026-07-15

### Fixed

- Used another approach towarc the app icon SVG file so it displays everywhere correctly.
  
## [1.0.9] - 2026-07-14

### Changed

- Changed the App Icon to actual Modern Forms logo.
- Changed the Device (drive) image to an actual Modern Forms fan.

### Fixed

- Created the proper files in the right formats and sizes for the icons and images.

## [1.0.8] - 2026-07-13

### Added

- Added separate **Turn light on** and **Turn light off** Flow action cards.
- Added the new light action cards to the centralized `FlowManager`.

### Changed

- Refined App Store branding, icons, app imagery, and supported-device presentation.
- Replaced placeholder and generated artwork with cleaner production assets.
- Updated the app description and README content for the Homey App Store.
- Changed the app platform configuration to local-only.
- Updated the app brand color and later restored the preferred blue branding.
- Improved consistency between app icons, driver icons, and device imagery.
- Updated the app icon to use the Modern Forms logo.
- Updated App Store images using official Modern Forms product imagery.
- Updated supported-device and driver artwork.
- Updated App Store metadata and presentation.
- Changed the supported device name from **Fan** to **Smart Fan**.
- Disabled unnecessary Homey Insights logging for selected capabilities.

### Fixed

- Fixed missing or blank icons in several Homey interfaces.
- Fixed incorrect image aspect ratios and dimensions that prevented publish-level validation.
- Corrected the separation between:
  - app images under `assets/images`;
  - app icon under `assets/icon.svg`;
  - driver images under `drivers/fan/assets/images`;
  - driver icon under `drivers/fan/assets/icon.svg`.
- Resolved the stray “T” artifact present in earlier fan artwork.
- Confirmed successful Homey validation at the `publish` level.
- Fixed an intermittent `Not Found: LogLocal ... :onoff.light` error when deleting a newly paired fan.
- Identified the deletion error as a Homey Insights race involving the `onoff.light` capability.
- Added `preventInsights: true` to `onoff.light`, confirmed through repeated A/B testing.
- Prevented redundant capability updates when the capability already contains the requested value.
- Added deletion guards around synchronization, capability updates, timer callbacks, and command responses.
- Improved cleanup of polling and duration timers when a device is removed.
- Corrected App Store and driver image dimensions.
- Corrected app and driver icon placement and asset paths.
- Corrected the missing space in the `Fan speed is less than [[speed]]` Flow-card title.

## [1.0.7] - 2026-07-13

### Added

- Added duration-based Flow triggers:
  - Fan turned on for a specified duration.
  - Fan turned off for a specified duration.
  - Light turned on for a specified duration.
  - Light turned off for a specified duration.
- Added support for duration values in seconds and minutes.
- Added timer scheduling based on Flow-card argument values.

### Changed

- Improved duration-timer management and cleanup.
- Added protection against duplicate timers when multiple Flows use the same duration.
- Improved state-transition handling so triggers receive the current value.
- Improved synchronization behavior during device initialization and removal.

### Fixed

- Fixed duplicate fan and light on/off trigger execution.
- Fixed duration triggers firing with stale or previous values.
- Fixed trigger tags for fan speed, direction, Breeze Mode, and brightness.
- Fixed timers remaining active after state transitions or device deletion.
- Fixed repeated transition detection caused by concurrent state applications.

## [1.0.6] - 2026-07-12

### Added

- Added Flow conditions:
  - Fan speed is.
  - Fan speed is less than.
  - Fan speed is greater than.
  - Fan direction is.
  - Breeze Mode is.
  - Light is turned on.
- Added support for Homey’s built-in light-brightness comparison conditions.

### Changed

- Improved Flow-card wording and formatting.
- Standardized device filters and argument definitions across Flow cards.
- Improved Flow registration and organization.

### Fixed

- Corrected `titleFormatted` keys and argument placeholders.
- Fixed inconsistent card titles and labels.
- Fixed Flow cards displaying previous values instead of current values.

## [1.0.5] - 2026-07-11

### Added

- Added Flow triggers:
  - Fan turned on.
  - Fan turned off.
  - Light turned on.
  - Light turned off.
  - Fan speed changed.
  - Fan direction changed.
  - Breeze Mode changed.
  - Light brightness changed.
- Added centralized Flow-trigger helper methods.

### Changed

- Improved state comparison using previous and current fan states.
- Updated capability values before firing Flow triggers.
- Reduced duplicate state-change logging.

### Fixed

- Fixed duplicate fan and light state-change messages.
- Fixed Flow triggers reporting the previous value.
- Improved initial synchronization so startup establishes a baseline without firing false transition triggers.

## [1.0.4] - 2026-07-10

### Added

- Added centralized `FlowManager`.
- Added Flow action cards:
  - Set fan speed.
  - Increase fan speed.
  - Decrease fan speed.
  - Set fan direction.
  - Set Breeze Mode.
  - Set dim level.
  - Adjust dim level by a relative percentage.
- Added centralized registration of actions, conditions, and triggers.

### Changed

- Refactored Flow-card registration out of the app and driver classes.
- Consolidated Flow-card listeners and trigger references in `FlowManager`.
- Improved type safety and separation of responsibilities.
- Updated project documentation following the FlowManager refactor.

### Fixed

- Fixed missing or duplicated Flow-card registration.
- Fixed a FlowManager registration line inadvertently removed during editing.
- Fixed action-card arguments and device filtering.

## [1.0.3] - 2026-07-10

### Added

- Added light brightness control.
- Added absolute dim-level action support.
- Added relative light-brightness adjustment.
- Added Breeze Mode as a dedicated capability.
- Added fan direction as a dedicated capability.

### Changed

- Replaced the legacy continuous fan-speed slider with a discrete 1–6 speed selector.
- Updated the device UI to include:
  - fan power;
  - fan speed;
  - fan direction;
  - Breeze Mode;
  - light power;
  - light brightness.
- Improved capability titles and Homey UI presentation.

### Fixed

- Removed the legacy `fan_speed` capability after migration.
- Fixed duplicated speed controls after capability migration.
- Corrected relative brightness scaling from Homey’s `-1..1` range to percentages.
- Removed the redundant percent symbol from relative dim-level labels.

## [1.0.2] - 2026-07-09

### Added

- Added local control methods for:
  - fan power;
  - fan speed;
  - light power;
  - light brightness;
  - fan direction;
  - Breeze Mode.
- Added automatic synchronization between Homey and the current fan state.
- Added background polling for state changes made through the Modern Forms app or fan controls.
- Added support for multiple fans during pairing.

### Changed

- Updated the pairing process to use friendly fan names.
- Added retrieval of the fan’s static shadow data and `deviceName`.
- Used the Bonjour-discovered name as a fallback when a friendly name is unavailable.
- Improved local transport and fan-client abstractions.

### Fixed

- Fixed pairing so multiple discovered fans can be selected.
- Fixed discovered devices displaying only technical names or IP addresses.
- Fixed device state synchronization after commands.
- Improved error handling for local network requests.

## [1.0.1] - 2026-07-09

### Added

- Added Bonjour/mDNS discovery for compatible Modern Forms fans.
- Added the initial Modern Forms fan driver.
- Added pairing through Homey’s standard device-list and add-device templates.
- Added persistent connection information for paired fans.
- Added initial fan power capability and local command support.

### Changed

- Established the Modern Forms-specific app architecture.
- Added core abstractions for discovery, transport, clients, and static fan data.
- Added logging, HTTP client, and development test-harness infrastructure.

### Fixed

- Fixed remote Homey development and deployment workflow.
- Fixed initial device discovery and pairing issues.
- Fixed TypeScript, ESLint, Prettier, and project configuration issues.

---

# Session 9
## App Store Preparation, Release Hardening, and Icon Investigation

### Release status

Current release candidate:

1.0.9

The app validates successfully at Homey's publish level and is available in the Test channel.

The submission plan is to leave **Automatically publish upon approval** disabled until the GitHub repository and public documentation are ready.

### App Store assets

The app now uses:

- the Modern Forms logo as the app icon;
- real Modern Forms product imagery for the App Store images;
- a real Modern Forms fan image for the supported-device artwork;
- **Smart Fan** as the supported-device name.

Homey's asset groups are intentionally separated:

- `assets/icon.svg` — app icon
- `assets/images/` — App Store images
- `drivers/fan/assets/icon.svg` — driver/device/Flow icon
- `drivers/fan/assets/images/` — supported-device images

### Missing light actions

Added separate Flow action cards:

- Turn light on
- Turn light off

Both are registered in `FlowManager` and call `device.setLightPower()`.

### Device deletion issue

Observed an intermittent deletion error:

`Not Found: LogLocal ... :onoff.light`

The issue was isolated to Homey Insights handling for `onoff.light` during device teardown.

Controlled testing confirmed:

- Removing `preventInsights` reproduced the error immediately.
- Adding `preventInsights: true` eliminated the error across repeated pair/delete cycles.
- Removing it again reproduced the issue.
- Restoring it resolved the issue again.

This confirmed a Homey Insights race rather than a polling, synchronization-service, FlowManager, or fan-API defect.

### Remaining icon issue

Three Homey interfaces continue to show only the app's brand-color circle instead of the app icon, while the installed-app list renders the same source icon correctly.

Two SVG files were retained for comparison:

#### Current `icon.svg`

- 960 × 960 viewBox
- one hand-authored path
- no explicit `preserveAspectRatio`
- no grouping or transform
- no explicit `stroke="none"`

#### Working `backup_icon.svg`

- Potrace-generated SVG
- explicit `preserveAspectRatio`
- transformed `<g>`
- explicit fill and stroke settings
- large native coordinate system
- confirmed to render in all affected Homey locations

Next diagnostic approach:

Preserve the Modern Forms logo artwork but place it into the exact structural wrapper used by the working backup SVG. Do not continue changing production images blindly.

### Localization

Localization is planned but not yet implemented.

Current English user-visible strings exist in:

- app metadata
- driver metadata
- capability definitions
- Flow cards
- README and Store copy

Before adding languages:

- inventory all user-visible strings;
- confirm Homey's localization conventions;
- select initial target languages;
- decide whether translations are maintained internally or through contributors;
- test layout and Flow-card formatting per language.

### Documentation strategy

Before the first public release:

- development details remain in `ENGINEERING_JOURNAL.md`;
- `CHANGELOG.md` contains the initial public-release entry.

After the app is live:

- released additions, changes, and fixes go into `CHANGELOG.md`;
- investigations, architecture, and implementation rationale remain in the Engineering Journal.
