// GNOME Shell presentation only. FedoraAHK owns physical key mappings.
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {NoPopupInputSources} from './input-sources.js';
import {NoStartupOverview} from './startup-overview.js';

export default class GnomeMacOSExperience extends Extension {
    enable() {
        this._overview = new NoStartupOverview();
        this._switcher = new NoPopupInputSources();
        this._overview.enable();
        try {
            this._switcher.enable();
        } catch (error) {
            this._overview.disable();
            this._overview = null;
            this._switcher = null;
            throw error;
        }
    }

    disable() {
        try {
            this._switcher?.disable();
        } finally {
            this._overview?.disable();
            this._switcher = null;
            this._overview = null;
        }
    }
}
