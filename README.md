# GNOME macOS Experience

A lightweight GNOME Shell extension that makes input-source switching immediate and starts the desktop without opening the Activities overview.

## Features

- **Instant input-source switching.** Uses GNOME's existing *Switch to next/previous input source* shortcuts, but switches directly without showing the selection popup.
- **Clean startup.** Skips the Activities overview when the desktop session starts. Activities remains available whenever you open it.

The extension leaves your input sources and shortcut assignments unchanged.

## Compatibility

GNOME Shell **50**. Input-source cycling works with the sources already configured in GNOME Settings.

The extension uses GNOME Shell internals that may change between major GNOME releases. Support for other versions is not yet verified.

## Installation

1. Download the [extension ZIP](dist/gnome-macos-experience%40local.shell-extension.zip).
2. Install it:

   ```bash
   gnome-extensions install ./gnome-macos-experience@local.shell-extension.zip
   ```

3. If it doesn't appear in the Extensions app, log out and log back in.
4. Enable **GNOME macOS Experience** in the Extensions app, or run:

   ```bash
   gnome-extensions enable gnome-macos-experience@local
   ```

5. Log out and back in to verify the startup behavior.

To remove the extension:

```bash
gnome-extensions uninstall gnome-macos-experience@local
```

## Development

The code is split into three files:

- `extension.js` — extension lifecycle.
- `input-sources.js` — direct input-source switching.
- `startup-overview.js` — startup overview behavior.

Run the checks:

```bash
python3 -B -m unittest discover -s tests -p 'test_*.py' -q
node --check extension.js
node --check input-sources.js
node --check startup-overview.js
node --experimental-vm-modules --no-warnings tests/mock-shell.mjs
```

Rebuild the installation ZIP with `python3 scripts/build-package.py`.

## Credits and license

This project adapts code from [Quick Lang Switch](https://github.com/ankostis/gnome-shell-quick-lang-switch) and [No overview at start-up](https://github.com/fthx/no-overview). The original authors and license notices are preserved.

Distributed under the **GNU Affero General Public License v3 or later**. See [LICENSE](LICENSE), [LICENSE-QUICK-LANG-SWITCH](LICENSE-QUICK-LANG-SWITCH), and [LICENSE-NO-OVERVIEW](LICENSE-NO-OVERVIEW).
