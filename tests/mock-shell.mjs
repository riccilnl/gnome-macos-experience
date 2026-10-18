// GNOME mock: exercise extension from a pristine session, no external add-ons.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve('.');
const context = vm.createContext({console});
const registrations = new Map();
let hides = 0, stockPopups = 0, releaseCalls = 0, settingsWrites = 0;
const overviewSignals = new Map();
const sourceState = {index: 0};
const manager = {
    _currentSource: sourceState,
    _inputSources: {
        0: {activate: () => {sourceState.index = 0;}},
        1: {activate: () => {sourceState.index = 1;}},
        2: {activate: () => {sourceState.index = 2;}},
    },
    _switchInputSource() {stockPopups++;}
};
const Main = {
    wm: {
        removeKeybinding(name) {registrations.delete(name);},
        addKeybinding(name, settings, flag, mode, callback) {
            assert.equal(settings.schema_id, 'org.gnome.desktop.wm.keybindings');
            registrations.set(name, {callback, flag});
            return registrations.size;
        }
    },
    overview: {hide() {hides++;}},
    layoutManager: {
        connectObject(signal, handler, owner) {
            assert.equal(signal, 'startup-complete');
            overviewSignals.set(owner, handler);
        },
        disconnectObject(owner) {overviewSignals.delete(owner);}
    }
};
const exportsByName = {
    'gi://Gio': {default: {Settings: class {
        constructor(obj) {this.schema_id = obj.schema_id;}
        set_value() {settingsWrites++;}
        set_strv() {settingsWrites++;}
    }}},
    'gi://Meta': {default: {KeyBindingFlags: {NONE: 0, IS_REVERSED: 1}}},
    'gi://Shell': {default: {ActionMode: {ALL: 7}}},
    'resource:///org/gnome/shell/ui/main.js': Main,
    'resource:///org/gnome/shell/misc/keyboardManager.js': {
        releaseKeyboard: () => {releaseCalls++;}
    },
    'resource:///org/gnome/shell/ui/status/keyboard.js': {
        getInputSourceManager: () => manager
    },
    'resource:///org/gnome/shell/extensions/extension.js': {Extension: class {}}
};
const modules = new Map();
function load(filename) {
    if (modules.has(filename))
        return modules.get(filename);
    const source = fs.readFileSync(filename, 'utf8');
    const result = new vm.SourceTextModule(source, {context, identifier: filename});
    modules.set(filename, result);
    return result;
}
async function link(specifier, parent) {
    if (specifier.startsWith('./'))
        return load(path.resolve(path.dirname(parent.identifier), specifier));
    assert.ok(Object.hasOwn(exportsByName, specifier), 'unbundled runtime module: '+specifier);
    if (modules.has(specifier))
        return modules.get(specifier);
    const entries = exportsByName[specifier];
    const module = new vm.SyntheticModule(Object.keys(entries), function() {
        for (const [key, value] of Object.entries(entries))
            this.setExport(key, value);
    }, {context, identifier: specifier});
    modules.set(specifier, module);
    return module;
}
const module = load(path.join(root, 'extension.js'));
await module.link(link);
await module.evaluate();
const Extension = module.namespace.default;
const extension = new Extension();
extension.enable();
assert.equal(registrations.size, 2);
assert.equal(overviewSignals.size, 1);
const forward = registrations.get('switch-input-source');
const backward = registrations.get('switch-input-source-backward');
assert.equal(forward.flag, 0);
assert.equal(backward.flag, 1);
const normal = {is_reversed: () => false};
const reverse = {is_reversed: () => true};
forward.callback(null, null, normal);
assert.equal(sourceState.index, 1);
forward.callback(null, null, normal);
assert.equal(sourceState.index, 2);
forward.callback(null, null, normal);
assert.equal(sourceState.index, 0);
backward.callback(null, null, reverse);
assert.equal(sourceState.index, 2);
for (const cb of overviewSignals.values())
    cb();
assert.equal(hides, 1);
assert.equal(stockPopups, 0);
assert.equal(settingsWrites, 0);
extension.disable();
assert.equal(overviewSignals.size, 0);
assert.equal(registrations.size, 2);
registrations.get('switch-input-source').callback();
assert.equal(stockPopups, 1);
assert.equal(settingsWrites, 0);
assert.equal(releaseCalls, 0);
console.log('GNOME_MOCK_PASS: 3-source cycle, reverse, no popup, startup overview, disable restores stock behavior, no shortcut writes');
