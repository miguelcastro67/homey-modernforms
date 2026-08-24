# Modern Forms Homey App
# TODO

## High Priority

- [ ] Compare `icon.svg` and `backup_icon.svg` structurally.
- [ ] Rebuild the Modern Forms logo using the working backup SVG wrapper.
- [ ] Test the revised icon in all four Homey rendering contexts.
- [ ] Check Modern Forms API doc and see if "firmware update" is exposed.
- [ ] Leave **Automatically publish upon approval** disabled.
- [ ] Ensure synchronization and network calls have appropriate error handling.
- [ ] Complete one final clean install, pair, delete, and re-pair test.

## Final Testing

- [ ] Regression-test custom light Flow actions and inverted light condition before each submitted release.

- [ ] Disconnect fan Wi-Fi and verify graceful behavior.
- [ ] Reconnect Wi-Fi and verify recovery.
- [ ] Reboot Homey.
- [ ] Reboot fan.
- [ ] Reboot both.
- [ ] Add multiple fans.
- [ ] Attempt duplicate pairing.
- [ ] Remove and re-pair a device.
- [ ] Change brightness while polling.
- [ ] Change Breeze Mode while polling.
- [ ] Make simultaneous changes from Homey and the Modern Forms app.
- [ ] Test Turn light on/off Flow actions.
- [ ] Run lint and publish-level validation.

## Release Documentation

- [x] Create GitHub repository.
- [x] Add MIT license.
- [x] Prepare production README.
- [x] Add `CONTRIBUTING.md`.
- [x] Add `SECURITY.md`.
- [ ] Add issue templates.
- [ ] Add initial GitHub release notes.
- [ ] Document architecture, folder layout, lifecycle, Flow architecture, polling, and synchronization.

## Localization

- [ ] Inventory all user-visible strings.
- [ ] Confirm Homey localization conventions.
- [ ] Select initial target languages.
- [ ] Decide whether translations are maintained internally or through contributors.
- [ ] Localize app metadata, driver metadata, capabilities, Flow cards, and Store text.
- [ ] Test Flow-card formatting and UI layout in each language.

## Polish

- [ ] Review production logging.
- [ ] Review comments.
- [ ] Remove dead and commented-out code.
- [ ] Review naming and spelling.
- [ ] Confirm no temporary assets remain.

## Future

- [ ] Statistics.
- [ ] Device health.
- [ ] Firmware version.
- [ ] Last seen.
- [ ] Response time.
- [ ] Manual IP entry.
- [ ] Favorite speed.
- [ ] Diagnostics page.
- [ ] Custom capability icons.
- [ ] Export/import configuration.

## Parking Lot

- [ ] Homey dashboard ideas.
- [ ] Investigate adaptive polling.
- [ ] Consider staggering synchronization for multiple devices.
- [ ] Evaluate additional discovery providers.
- [ ] Investigate whether custom Condition cards can expose tags.


## Release Maintenance

- [ ] Regression-test custom Flow actions and conditions before each submitted release.
- [ ] Verify existing paired fans survive application upgrades without re-pairing.
- [ ] Keep `CHANGELOG.md`, `RELEASE_NOTES.md`, `FLOW_CARDS.md`, `PROJECT_NOTES.md`, `ARCHITECTURE.md`, and `ENGINEERING_JOURNAL.md` synchronized with behavior-changing releases.
