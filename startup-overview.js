// Adapted from No overview at start-up by fthx, GPL-3.0.
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class NoStartupOverview {
    enable() {
        Main.layoutManager.connectObject(
            'startup-complete', () => Main.overview.hide(), this);
    }

    disable() {
        Main.layoutManager.disconnectObject(this);
    }
}
