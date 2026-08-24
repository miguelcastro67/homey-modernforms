# Modern Forms Homey App — Architecture

## 1. Overview

The Modern Forms Homey app is a Homey SDK v3 application for local-network integration of compatible Modern Forms smart ceiling fans.

The architecture is intentionally layered so device communication, discovery, persistence, state synchronization, Homey device behavior, and Flow behavior remain separable.

High-level structure:

```text
Modern Forms Homey App
├── Homey app bootstrap
├── Fan driver
├── FlowManager
├── Modern Forms client
├── Discovery service
│   └── Composite discovery provider
│       ├── Bonjour discovery
│       └── Remembered-device discovery
├── State synchronization service
└── Homey-backed fan repository
```

The app is LAN-local and does not depend on a vendor cloud path for normal fan control.

## 2. Design Principles

### Explicit code over clever code

Readable, inspectable behavior is preferred over compact abstractions that hide important state transitions.

### Separation of responsibilities

Each architectural layer has one primary job:

```text
Clients       → communicate with Modern Forms fans
Providers     → discover candidate fans
Repositories  → persist remembered fan connections
Services      → coordinate discovery and synchronization workflows
FlowManager   → owns custom Flow card registration and runtime Flow behavior
Device        → owns Homey device lifecycle, capabilities, state transitions, timers, and device commands
Models        → represent normalized application data
```

### Constructor injection

Services and providers receive dependencies through constructors rather than locating them globally.

### Composition over inheritance

Behavior is assembled from small components, especially in discovery.

### Homey is an adapter

Homey-specific capabilities, device lifecycle, and Flow cards sit around the application/domain behavior rather than defining the network protocol itself.

### Preserve device truth

The app synchronizes from the state returned by the fan. Homey capability state should reflect the actual state reported by the device rather than an assumed command outcome.

### Power state and level state are separate

Fan power is not encoded as fan speed 0.

Light power is not encoded as brightness 0.

The architecture intentionally treats:

```text
Fan power       ≠ fan speed
Light power     ≠ light brightness
```

This keeps on/off state explicit and avoids ambiguous automation behavior.

## 3. Source Layout

Current source organization:

```text
app.ts

src/
├── abstractions/
│   ├── IDeviceDiscoveryProvider.ts
│   ├── IFanClient.ts
│   └── IFanRepository.ts
├── clients/
│   └── ModernFormsClient.ts
├── constants/
├── core/
│   ├── Configuration.ts
│   ├── HttpClient.ts
│   └── Logger.ts
├── discovery/
│   └── DiscoverySession.ts
├── flow/
│   └── FlowManager.ts
├── models/
│   ├── FanConnection.ts
│   ├── FanDirection.ts
│   ├── FanState.ts
│   └── FanStaticData.ts
├── providers/
│   ├── BonjourDiscoveryProvider.ts
│   ├── CompositeDiscoveryProvider.ts
│   ├── RememberedDiscoveryProvider.ts
│   └── StaticDiscoveryProvider.ts
├── repositories/
│   └── HomeyFanRepository.ts
├── services/
│   ├── DiscoveryService.ts
│   └── StateSynchronizationService.ts
└── testing/
    └── TestHarness.ts

drivers/
└── fan/
    ├── device.ts
    ├── driver.ts
    └── driver.compose.json

.homeycompose/
├── capabilities/
└── flow/
    ├── triggers/
    ├── conditions/
    └── actions/
```

## 4. Application Bootstrap

`app.ts` is the composition root.

It creates and wires the application-wide dependencies:

```text
Logger
  ↓
HttpClient
  ↓
ModernFormsClient

FlowManager

HomeyFanRepository
  ↓
BonjourDiscoveryProvider
RememberedDiscoveryProvider
  ↓
CompositeDiscoveryProvider
  ↓
DiscoveryService

ModernFormsClient
  ↓
StateSynchronizationService
```

`FlowManager.register()` is called during application initialization so custom Flow cards are registered centrally.

The app exposes the shared fan client, discovery service, synchronization service, logger, HTTP client, and Flow manager to the driver/device layer.

## 5. Communication Architecture

### `IFanClient`

`IFanClient` defines the application-facing fan communication contract.

The device layer depends on this abstraction rather than directly implementing HTTP/network behavior.

### `ModernFormsClient`

`ModernFormsClient` implements local Modern Forms communication.

Responsibilities include:

```text
Get static fan data
Get dynamic fan state
Set fan power
Set fan speed
Set light power
Set light brightness
Set fan direction
Set Breeze/Wind mode
```

The client returns normalized `FanState` data after state-changing commands.

### `HttpClient`

`HttpClient` owns lower-level HTTP transport concerns.

The Modern Forms client uses it rather than embedding generic HTTP handling into Homey device code.

## 6. Domain Models

### `FanConnection`

Represents the information required to identify and communicate with a fan:

```text
displayName
ipAddress
clientId
```

The client ID, when available, is preferred as a stable discovery identity; the IP address remains a fallback.

### `FanStaticData`

Represents static data returned by the fan, including the friendly `deviceName` used to improve pairing presentation.

### `FanState`

Represents normalized dynamic state used throughout synchronization and Flow transition detection.

Current state includes the application concepts needed for:

```text
Fan power
Fan speed
Fan direction
Breeze/Wind mode
Light power
Light brightness
```

## 7. Discovery Architecture

Discovery is provider-based and composable.

Current production discovery path:

```text
BonjourDiscoveryProvider
        +
RememberedDiscoveryProvider
        ↓
CompositeDiscoveryProvider
        ↓
DiscoveryService
        ↓
Candidate validation
        ↓
Persist validated fans
```

### `IDeviceDiscoveryProvider`

Defines a common discovery contract so discovery sources remain interchangeable and composable.

### `BonjourDiscoveryProvider`

Uses mDNS/Bonjour to discover Modern Forms fans visible on the local network.

Bonjour discovery is session-oriented through `DiscoverySession`, which owns browser lifetime, collection, timing, and cleanup.

### `RememberedDiscoveryProvider`

Loads previously discovered fan connections from the repository.

It does not itself validate or communicate with the device.

Its purpose is to make discovery resilient when mDNS advertisement is incomplete or inconsistent.

### `CompositeDiscoveryProvider`

Combines candidates from multiple discovery providers.

Candidates are deduplicated using:

```text
clientId
```

when available, otherwise:

```text
ipAddress
```

This allows discovery strategies to be added later without rewriting `DiscoveryService`.

### `DiscoveryService`

`DiscoveryService` validates every candidate by communicating with the fan.

Validation flow:

```text
Candidate
   ↓
getStaticData()
   ↓
Use deviceName when available
   ↓
Create validated FanConnection
   ↓
getState()
   ↓
Candidate accepted
   ↓
Repository save
```

A candidate that cannot be validated is omitted from the discovered result.

Reliability is preferred over the shortest possible pairing time.

## 8. Persistence Architecture

### `IFanRepository`

Defines persistence operations for fan connections.

### `HomeyFanRepository`

Stores remembered fan connections using Homey's application settings storage.

The repository owns persistence format and reconstruction of `FanConnection` instances.

Discovery logic decides when the repository is read or written; the repository itself does not perform discovery.

## 9. Pairing Architecture

The fan driver uses Homey's standard list/add device pairing templates.

Pairing flow:

```text
User starts pairing
      ↓
driver.onPairListDevices()
      ↓
DiscoveryService.discover()
      ↓
Validated FanConnection[]
      ↓
Homey list_devices
      ↓
User selects one or more fans
      ↓
Connection stored in device store
```

The driver supports multi-selection during pairing.

The paired device identity uses:

```text
clientId ?? ipAddress
```

The friendly fan name comes from validated discovery data where available.

## 10. Device Capability Model

Current driver capabilities:

```text
onoff
discrete_fan_speed
fan_speed_value
fan_direction
breeze_mode
onoff.light
dim.light
```

### `onoff`

Represents fan power.

### `discrete_fan_speed`

Represents the user-facing discrete fan speed control.

Valid speeds are:

```text
1
2
3
4
5
6
```

Speed 0 is intentionally not part of the fan-speed domain.

Turning the fan off is a separate power operation.

### `fan_speed_value`

Read-only numeric representation of the current fan speed.

Purpose:

- expose current speed as a persistent numeric Homey Flow tag;
- allow one fan's speed to be reused as an input to another Flow card;
- preserve the existing discrete speed control without changing its enum representation.

### `fan_direction`

Represents forward/reverse fan direction.

### `breeze_mode`

Represents Modern Forms wind/Breeze behavior.

### `onoff.light`

Represents light power independently of brightness.

### `dim.light`

Represents light brightness using Homey's normalized `0..1` capability scale.

Application dimming commands intentionally operate within a 1%–100% range so brightness does not become an implicit power-off command.

## 11. Existing-Device Capability Migration

The device lifecycle explicitly migrates capabilities in `onInit()`.

Current migration behavior includes:

```text
Remove legacy fan_speed capability if present

Ensure:
- onoff
- discrete_fan_speed
- fan_speed_value
- fan_direction
- breeze_mode
- onoff.light
- dim.light
```

This allows new capabilities such as `fan_speed_value` to be introduced without forcing users to remove and re-pair existing fans.

Normal application updates should preserve paired devices and stored connection data.

## 12. Homey Capability Listeners

`device.ts` owns Homey capability listeners.

Current mapping:

```text
onoff                 → setFanPower()
discrete_fan_speed    → setFanSpeed()
fan_direction         → setFanDirection()
breeze_mode           → setBreezeMode()
onoff.light           → setLightPower()
dim.light             → setLightBrightness()
```

Capability listeners call application/device methods rather than directly performing transport operations.

## 13. State Synchronization

### `StateSynchronizationService`

The synchronization service is intentionally small.

It receives a `FanConnection` and retrieves the latest `FanState` through the fan client.

### Device polling

Each paired device performs:

```text
Initial synchronize()
        ↓
Periodic synchronize()
        ↓
StateSynchronizationService
        ↓
ModernFormsClient.getState()
        ↓
applyState()
```

The polling interval is centralized through configuration/constants rather than hard-coded into the synchronization service.

### Command synchronization

State-changing commands also return a `FanState`.

Example:

```text
Flow / capability command
        ↓
device.setFanSpeed()
        ↓
ModernFormsClient.setFanSpeed()
        ↓
Fan returns state
        ↓
device.applyState()
```

This lets both polling and commands converge through the same state-application path.

## 14. State Application

`applyState()` is the central state-update path.

Current sequence:

```text
Receive FanState
      ↓
Capture previous state
      ↓
Store new lastState first
      ↓
Update Homey capabilities
      ↓
Detect transitions
      ↓
Fire relevant Flow triggers
```

The new state is assigned to `lastState` before asynchronous capability updates so concurrent state applications do not detect the same transition more than once.

Capability synchronization includes:

```text
fanOn          → onoff
fanSpeed       → discrete_fan_speed
fanSpeed       → fan_speed_value
fanDirection   → fan_direction
wind           → breeze_mode
lightOn        → onoff.light
brightness     → dim.light
```

`setCapabilityIfPresent()` avoids redundant writes when Homey already contains the same value.

## 15. State-Transition Architecture

`detectStateChanges()` compares the previous and current `FanState`.

Current transition categories:

```text
Fan power
Light power
Fan speed
Fan direction
Breeze mode
Light brightness
```

Startup is treated specially.

The first synchronized state establishes a baseline and does not fire transition triggers because the app cannot know when the physical state originally changed.

## 16. Flow Architecture

Custom Flow registration is centralized in:

```text
src/flow/FlowManager.ts
```

`FlowManager` owns:

```text
Card lookup
Run-listener registration
Condition listeners
Trigger references
Trigger execution
Duration-trigger argument lookup
Runtime argument validation
```

The device class detects physical/application state changes and delegates Flow trigger execution to `FlowManager`.

Flow JSON definitions remain under:

```text
.homeycompose/flow/
├── triggers/
├── conditions/
└── actions/
```

The device argument associates a card with the Modern Forms fan driver:

```json
{
  "type": "device",
  "name": "device",
  "filter": "driver_id=fan"
}
```

## 17. Flow Trigger Strategy

Current custom trigger categories include:

```text
Light turned on
Light turned off
Fan speed changed
Fan direction changed
Breeze Mode changed
Light brightness changed
Fan turned on for a duration
Fan turned off for a duration
Light turned on for a duration
Light turned off for a duration
```

State-changing triggers use the normalized `FanState` transition path.

Trigger tags provide relevant values such as fan speed, direction, Breeze state, or brightness.

## 18. Duration Trigger Architecture

The device owns duration timestamps and timers because duration behavior is tied to each physical device instance.

Tracked state includes:

```text
fanOnSince
fanOffSince
lightOnSince
lightOffSince
```

Light duration timers are maintained in maps keyed by duration.

When a light transition occurs:

```text
Transition detected
      ↓
Timestamp updated
      ↓
Opposite-state timers cleared
      ↓
Configured duration arguments queried from FlowManager
      ↓
Timers scheduled
      ↓
State rechecked when timer expires
      ↓
Duration trigger fired
```

Timers are cleared during device deletion.

Startup does not synthesize duration timestamps because the app does not know how long the device was already in its initial state.

## 19. Flow Condition Strategy

Current custom conditions include:

```text
Fan speed is
Fan speed is less than
Fan speed is greater than
Fan direction is
Breeze Mode is
Light is turned on
```

Brightness comparisons may use Homey's built-in capability conditions where those provide adequate behavior.

### Light condition inversion

The `Light is turned on` condition supports Homey's normal Invert behavior.

The condition listener returns the actual light state.

The Flow-card metadata provides Homey's normal/inverted condition wording, and Homey performs the inversion of the boolean result.

Protocol/device code does not contain a separate "light is off" condition implementation.

## 20. Flow Action Strategy

Current custom actions include:

```text
Set fan speed
Increase fan speed
Decrease fan speed
Set fan direction
Set Breeze Mode
Turn light on
Turn light off
Toggle light
Set dim level
Adjust dim level by a relative percentage
Increase dim level
Decrease dim level
```

Homey also provides built-in cards for standard capabilities such as primary fan power.

Custom cards are added when Homey's generated cards do not expose the desired secondary capability behavior or automation semantics.

## 21. Fan-Speed Flow Semantics

`Set Fan Speed` accepts:

```text
Manual numeric value
or
Numeric Flow tag/variable
```

Valid runtime domain:

```text
whole number 1–6
```

Runtime validation rejects:

```text
non-numeric values
fractions
values below 1
values above 6
```

Homey's editor may allow a variable/tag whose current value is outside the range because the value can change later.

Runtime validation remains authoritative.

Fan speed does not use 0 to mean off.

To stop the fan, use fan power.

## 22. Fan Speed Value Tag

`fan_speed_value` exists specifically to expose current speed as a numeric Flow value.

State path:

```text
Fan state
   ↓
applyState()
   ↓
fan_speed_value
   ↓
Homey numeric Flow tag
```

This keeps the app's user-facing speed selector discrete while still enabling numeric automation composition.

## 23. Light Power and Brightness Semantics

Light power and brightness remain independent.

Rules:

```text
Turn Light Off
    → changes light power

Set Dim Level
    → changes brightness
    → does not substitute for Turn Light Off
```

Application dimming actions use 1% as the minimum intentional brightness.

This prevents contradictory/synthetic states such as treating 0% brightness as a hidden off command while the light-power capability remains logically separate.

## 24. Light Action Architecture

### Turn Light On / Off

Custom cards call the existing `setLightPower()` device method.

### Toggle Light

A custom Toggle Light card is required because Homey provides a generated toggle for the primary `onoff` capability but does not provide the equivalent desired card for the secondary `onoff.light` capability.

Toggle path:

```text
FlowManager
    ↓
device.isLightOn()
    ↓
invert current boolean
    ↓
device.setLightPower()
    ↓
ModernFormsClient
    ↓
applyState()
```

The toggle card reuses existing state helpers rather than maintaining its own state.

## 25. Dim-Level Action Architecture

### Set Dim Level

The Flow card uses Homey's normalized dim range.

The intentional command floor is:

```text
0.01 = 1%
```

The upper bound is:

```text
1.00 = 100%
```

### Relative dim adjustment

`adjustLightBrightness()` operates in device percentage units.

Current clamping:

```text
1% ≤ resulting brightness ≤ 100%
```

### Increase / Decrease Dim Level

Dedicated Increase and Decrease cards accept an optional percentage amount.

Behavior:

```text
Amount omitted     → 5%
Manual amount      → use supplied whole-number percentage
Numeric Flow tag   → use resolved whole-number percentage
```

Valid adjustment argument range:

```text
1–100
```

The resulting device brightness is still clamped to 1%–100%.

The Decrease card passes a negative adjustment to the same device-level brightness adjustment method.

This keeps one authoritative clamping implementation.

## 26. Homey Flow Argument Validation

Flow-card JSON handles editor metadata such as:

```text
min
max
step
required
placeholder
```

Runtime validation remains necessary for tag/variable inputs because their values can change after a Flow is saved.

Where Homey's editor cannot enforce an application rule, `FlowManager` validates before issuing a device command.

Optional dim adjustment arguments use runtime fallback behavior:

```text
undefined/null amount → 5
```

Homey requires `titleFormatted` to reference declared Flow arguments, so optional arguments still appear in the formatted card title.

## 27. Insights Strategy

Insights are intentionally disabled for selected low-value capabilities through `preventInsights`.

Current examples include:

```text
onoff.light
dim.light
fan_direction
breeze_mode
```

This reduces unnecessary Insights activity.

`onoff.light` also has historical significance: a confirmed Homey Insights deletion race produced `LogLocal ... :onoff.light` errors during device teardown.

The production architecture therefore avoids relying on light-power Insights.

## 28. Device Deletion and Lifecycle Safety

The device maintains an `isDeleting` guard.

During deletion:

```text
Polling is stopped
Duration timers are cleared
Further synchronization/state application is suppressed
```

Command responses and polling callbacks check deletion state before applying new Homey state.

This avoids asynchronous work racing against Homey device teardown.

## 29. Logging

The project uses a custom `Logger` wrapper.

General rules:

```text
logger.info()   → meaningful production events
logger.debug()  → diagnostic detail
logger.warn()   → recoverable problems
logger.error()  → failures
```

Direct `console.log()` should not be used for production application behavior.

Device lifecycle may still use Homey's device logging methods where appropriate.

## 30. Reliability and Upgrade Requirements

Normal app updates must preserve paired fans.

A user should not be required to remove and re-pair a fan merely because:

```text
A Flow card was added
A Flow card was fixed
A read-only capability was introduced
An application version was upgraded
```

Existing-device capability migration is handled in `device.onInit()`.

Before public submission of behavior-changing releases, regression testing should cover:

```text
App restart
Version upgrade
Existing paired devices
Capability migration
Fan power
Fan speed
Light power
Light brightness
Polling synchronization
Flow actions
Flow conditions
Flow condition inversion
Flow tags/variables
Duration triggers
Device deletion
```

## 31. Network Failure Strategy

The app communicates locally over the LAN.

Polling and commands can therefore fail because of:

```text
Fan Wi-Fi loss
IP/network changes
Temporary network interruption
Fan reboot
Homey restart
```

Network failures must not corrupt Homey state or require re-pairing.

Remembered-device discovery and periodic synchronization are intended to support recovery without making discovery depend solely on current mDNS visibility.

Further error-handling and offline-state work remains an architectural extension point.

## 32. Extensibility

The current abstractions intentionally allow future additions without redesigning the core application.

Examples:

### Discovery

Additional `IDeviceDiscoveryProvider` implementations can be added to `CompositeDiscoveryProvider`.

Potential future discovery sources may include:

```text
Manual IP
SSDP
Other Modern Forms-compatible discovery mechanisms
```

### Diagnostics

Potential future device/application features include:

```text
Firmware reporting
Device health
Offline detection
Last seen
Response time
Statistics
Diagnostics
```

These should be added without moving network transport responsibilities into the Homey device class.

## 33. Architectural Boundaries

The following boundaries should be preserved.

### Device code should not own raw transport

Do not put generic Modern Forms HTTP protocol implementation directly into `drivers/fan/device.ts`.

### FlowManager should not own device state

FlowManager may query device helpers and execute device methods, but persistent device state belongs to the device/state synchronization path.

### Providers should not validate

Providers discover candidates.

`DiscoveryService` validates them.

### Repository should not discover

The repository persists and reconstructs remembered connections.

It does not decide whether a fan is currently reachable.

### Client should not own Homey capabilities

The client communicates with Modern Forms devices and returns normalized models.

It should not call Homey capability APIs.

### One authoritative state path

Whenever practical, command responses and polling should converge through:

```text
FanState
  ↓
applyState()
```

This prevents multiple competing synchronization implementations.

## 34. Current Architectural Data Flow

### Pairing

```text
Homey pairing
   ↓
Fan driver
   ↓
DiscoveryService
   ↓
CompositeDiscoveryProvider
   ├── Bonjour
   └── Remembered devices
   ↓
Candidate validation via ModernFormsClient
   ↓
Homey device created
```

### Periodic synchronization

```text
Device timer
   ↓
StateSynchronizationService
   ↓
ModernFormsClient.getState()
   ↓
FanState
   ↓
device.applyState()
   ↓
Homey capabilities
   ↓
Transition detection
   ↓
Flow triggers
```

### Flow command

```text
Homey Flow
   ↓
FlowManager
   ↓
ModernFormsFanDevice method
   ↓
ModernFormsClient
   ↓
Physical fan
   ↓
Returned FanState
   ↓
applyState()
```

## 35. Documentation Roles

Project documentation is intentionally separated.

- `ARCHITECTURE.md` — durable technical design, current component responsibilities, data flows, state semantics, and architectural rules.
- `PROJECT_NOTES.md` — current project snapshot, release status, known issues, and immediate next steps.
- `ENGINEERING_JOURNAL.md` — chronological development history, experiments, discoveries, failures, fixes, and design rationale.
- `FLOW_CARDS.md` — user/developer reference for implemented Flow cards and Flow-specific behavior.
- `CHANGELOG.md` — public release-by-release changes.
- `RELEASE_NOTES.md` — concise release-facing summary of notable user-visible functionality.
- `TODO.md` — remaining work and future ideas.

Together these documents should provide enough context to resume development in a fresh conversation without reconstructing the codebase or development history.
