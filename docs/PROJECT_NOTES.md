# Modern Forms Homey App
**Author:** Miguel Castro
**Assistant:** ChatGPT
**Status:** Release Candidate — Test channel, version 1.0.16

---

# Project Philosophy

The goal of this project is **not simply to expose the Modern Forms API**.

The goal is to build the best Modern Forms integration available for Homey by providing features, reliability, and automation beyond what the manufacturer's app offers.

Primary design goals:

- Clean Architecture
- Dependency Injection
- SOLID Principles
- Provider Pattern
- Explicit code over clever code
- Minimal coupling
- Easy extensibility
- Linter clean at all times
- Production-quality logging

---

# Coding Philosophy

This project follows several principles that guide design decisions.

## Work smarter, not harder

Prefer solutions that reduce future effort over solutions that simply work.

## Explicit over clever

Readable code is preferred over compact code.

## Enterprise Architecture

Use dependency injection.

Use interfaces.

Use provider and repository patterns.

Keep responsibilities singular.

## Composition over inheritance

Favor small composable objects.

## Testability

Classes should be easy to test in isolation.

## Lint Clean

The project should remain lint-clean.

Warnings are treated as technical debt.

## Logging

Production logging should be meaningful.

Debug logging should help diagnose issues.

Avoid console.log().

## Refactoring

Do not hesitate to replace temporary implementations with better designs.

Git preserves history.

The working tree should represent today's best design.

---

# Current Architecture

## Clients

IFanClient

ModernFormsFanClient

Responsible only for communication with the fan.

---

## Services

DiscoveryService

Responsible for:

- Discover candidates
- Validate candidates
- Persist remembered fans

StateSynchronizationService

Responsible for:

- Synchronizing Homey capabilities
- Polling
- Updating state

---

## Discovery

CompositeDiscoveryProvider

Contains multiple providers.

Current providers:

- BonjourDiscoveryProvider
- RememberedDiscoveryProvider

Future providers may include:

- SSDP
- Cloud
- Additional protocols

---

BonjourDiscoveryProvider

Uses Bonjour (mDNS).

Discovery is session-based.

---

DiscoverySession

Owns:

- Bonjour browser
- Timers
- Cleanup
- Candidate collection

Responsible for running one discovery session.

---

RememberedDiscoveryProvider

Loads previously discovered fans from storage.

Does not validate.

Does not communicate with the fan.

Only supplies remembered candidates.

---

## Repository

IFanRepository

Implemented by:

HomeyFanRepository

Uses:

homey.settings

Stores:

- Display Name
- IP Address
- Client ID (MAC)

---

# Device Model

FanConnection

Contains:

- Display Name
- IP Address
- Client ID

Used throughout discovery.

---

# Current Capabilities

Implemented:

✓ Fan power

✓ Six discrete fan speeds

✓ Fan direction

✓ Breeze Mode

✓ Light power

✓ Light brightness

Capabilities:

- `onoff`
- `discrete_fan_speed`
- `fan_direction`
- `breeze_mode`
- `onoff.light`
- `dim.light`

Insights is disabled for selected low-value capabilities, including `onoff.light`, to avoid a confirmed Homey deletion race.

# Flow Cards

## When

- Fan turned on/off
- Light turned on/off
- Fan speed changed
- Fan direction changed
- Breeze Mode changed
- Light brightness changed
- Fan/light on or off for X seconds or minutes

## And

- Fan is turned on
- Fan speed is / less than / greater than
- Fan direction is
- Breeze Mode is
- Light is turned on
- Built-in brightness comparisons

## Then

- Turn fan on/off
- Set, increase, or decrease fan speed
- Set fan direction
- Set Breeze Mode
- Turn light on/off
- Set or adjust dim level

Flow registration is centralized in `FlowManager`.

# Discovery

Current implementation:

Composite Provider

Bonjour
+
Remembered Fans

↓

DiscoveryService validates every candidate.

This makes discovery reliable even when mDNS announcements are inconsistent.

Discovery validation enriches the connection with the device name (fan's friendly name)

Current average discovery:

10–13 seconds

Reliability is prioritized over speed.

-

Validation enrichment:

Discovery validation retrieves the fan's static shadow data.

The deviceName from the static shadow replaces the temporary mDNS
service name before the FanConnection is persisted.

This provides friendly pairing names while preserving a fallback
to the mDNS name if necessary.

---

# Logging

Uses custom Logger wrapper.

Production logging through logger.info()

Verbose logging through logger.debug()

Avoid direct console.log()

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

Project should remain lint-clean.

Avoid dead code.

Delete unused classes rather than commenting them out.

---

# Outstanding Items

## High Priority

- Submit version 1.0.9 for review.
- Keep automatic publication disabled until GitHub and public documentation are ready.
- Resolve or confirm the remaining icon-rendering discrepancy.
- Complete final release-candidate testing.
- Review synchronization and network error handling.

## Medium Priority

- Create GitHub repository.
- Add MIT license.
- Add contributor and support documentation.
- Plan localization and initial target languages.
- Final logging and dead-code review.

## Future

- Manual IP entry
- Favorite speed
- Statistics
- Device health
- Offline detection
- Last seen
- Last state change
- Response time
- Diagnostics
- Firmware reporting

# Design Decisions

Provider Pattern is preferred over switch statements.

Repositories own persistence.

Services orchestrate workflows.

Providers discover.

Clients communicate.

Repositories store.

Models represent data.

Keep responsibilities singular.

---

# Current Folder Layout

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

# Future Goal

Create the definitive Modern Forms Homey integration that exceeds the functionality of the official Modern Forms application while following clean enterprise architecture.


---

# Release Status

Current version: **1.0.9**

Current channel: **Homey App Store Test**

Validation: **Passes publish-level validation**

Store presentation:

- Modern Forms logo used as the app icon.
- Real Modern Forms product imagery used for App Store assets.
- Supported device is named **Smart Fan**.
- The installed-app list renders the app icon correctly.
- Three cached/strict-renderer interfaces still show only the brand-color circle.
- `backup_icon.svg` renders correctly everywhere and is retained as the structural comparison file.

Submission plan:

Submit for review with **Automatically publish upon approval** disabled.

Documentation plan:

Continue recording pre-release work in the Engineering Journal. Begin user-facing release-by-release entries in the Changelog once the app is publicly live.
