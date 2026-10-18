// GNOME-only interaction replacement, adapted from Quick Lang Switch v17.
// Neither reads nor writes user shortcut values, nor maps physical keys.
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as KeyboardManager from 'resource:///org/gnome/shell/misc/keyboardManager.js';
import {getInputSourceManager} from 'resource:///org/gnome/shell/ui/status/keyboard.js';

const INPUT_BINDINGS = 'org.gnome.desktop.wm.keybindings';
const FORWARD = 'switch-input-source';
const BACKWARD = 'switch-input-source-backward';

export class NoPopupInputSources {
    enable() {
        if (this._manager)
            return;
        const manager = getInputSourceManager();
        try {
            this._bindHandlers(manager, (...args) => this._directSwitch(manager, ...args));
            this._manager = manager;
        } catch (error) {
            // Restore the stock popup handler if installing ours failed.
            this._restore(manager);
            throw error;
        }
    }

    disable() {
        if (!this._manager)
            return;
        const manager = this._manager;
        this._manager = null;
        this._restore(manager);
    }

    _bindHandlers(manager, handler) {
        // Gio.Settings is read by GNOME's keybinding registration.
        // No set_* calls: whichever shortcuts are configured remain untouched.
        const settings = new Gio.Settings({schema_id: INPUT_BINDINGS});
        Main.wm.removeKeybinding(FORWARD);
        manager._keybindingAction = Main.wm.addKeybinding(
            FORWARD, settings, Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL, handler);
        Main.wm.removeKeybinding(BACKWARD);
        manager._keybindingActionBackward = Main.wm.addKeybinding(
            BACKWARD, settings, Meta.KeyBindingFlags.IS_REVERSED,
            Shell.ActionMode.ALL, handler);
    }

    _restore(manager) {
        this._bindHandlers(manager, manager._switchInputSource.bind(manager));
    }

    _directSwitch(manager, ...args) {
        const binding = args[args.length - 1];
        const sources = manager._inputSources;
        const count = Object.keys(sources).length;
        if (count === 0) {
            KeyboardManager.releaseKeyboard();
            return;
        }
        const direction = binding.is_reversed() ? -1 : 1;
        const current = manager._currentSource?.index ?? 0;
        const next = (current + direction + count) % count;
        const source = sources[next];
        if (!source) {
            KeyboardManager.releaseKeyboard();
            return;
        }
        source.activate(true);
    }
}
