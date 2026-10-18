# GNOME macOS Experience — v0.1.0

A **self-contained GNOME Shell 50 extension**. Install it on a fresh GNOME
desktop and enable it; it requires **no FedoraAHK, XIME, other extension,
system service, custom shortcut, or bundled script**.

This extension changes only two GNOME Shell interactions:

1. **Direct input source cycling**: the stock GNOME
   switch-input-source / switch-input-source-backward actions keep
   their existing key assignments, but switch immediately and show no
   input source popup. The extension never reads or writes the shortcut
   values themselves. Fresh GNOME installs can use their default shortcut.
2. **No login Activities overview**: after desktop startup completes,
   return to the normal desktop. Activities remains available thereafter.

## Install on a fresh GNOME 50 desktop

1. Obtain gnome-macos-experience@local.shell-extension.zip.
2. Run: gnome-extensions install ./gnome-macos-experience@local.shell-extension.zip
3. Log out and back in if GNOME Wayland has not yet discovered the new UUID.
4. Run: gnome-extensions enable gnome-macos-experience@local
   if not already enabled. Log in once more to verify skipping startup overview.

No desktop input-source configuration or shortcut customization is part of
installation. This extension does not **create** extra input sources:
GNOME must already have the input sources the user wants to cycle through.

## Architecture

extension.js is only lifecycle orchestration; the modules are:
- input-sources.js: bypass popup, preserve configured shortcuts,
  restore stock handlers on disable.
- startup-overview.js: dismiss overview on startup-complete,
  disconnect signal on disable.

FedoraAHK separately handles **any physical key remapping**. XIME/Rime,
Fcitx5, and/or GNOME IBus independently handle composition. This extension
does not require or know about any such program.

## Existing machine migration

Do **not** enable this extension simultaneously with Quick Lang Switch:
both register the same GNOME Shell input-source action. Keep existing
Quick Lang Switch files as a rollback option. Disable the old extension
and enable this one in a single atomic GNOME enabled-extensions list update,
then log out/in so Wayland loads the new UUID.

## Development and verification

    python3 -B tests/test_contract.py -v
    node --check extension.js
    node --check input-sources.js
    node --check startup-overview.js
    node --experimental-vm-modules --no-warnings tests/mock-shell.mjs

The package contains JS, metadata and license notices only; runtime is
GNOME Shell itself. The GNOME Shell private input-source APIs can change
with a future major version; do not claim untested GNOME versions.

## Attribution and license

- Quick Lang Switch, ankostis; https://github.com/ankostis/gnome-shell-quick-lang-switch
  — original AGPL-3.0 codebase; this project's keybinding algorithm adapted
  from v17. See LICENSE-QUICK-LANG-SWITCH.
- No overview at start-up, fthx; https://github.com/fthx/no-overview
  — original GPL-3.0 codebase; startup signal logic adapted. See
  LICENSE-NO-OVERVIEW.

Source notices are retained; this combined project is distributed under the
GNU Affero General Public License v3 or later (see LICENSE), with the
original No Overview GPLv3 code combined under GPLv3 section 13. Keep
the full upstream license texts and attribution when redistributing.
