#!/usr/bin/env python3
"""Portable extension contract. No GNOME process or user settings modified."""
from pathlib import Path
import json, re, unittest

ROOT=Path(__file__).resolve().parents[1]
SOURCES=[ROOT/'extension.js', ROOT/'input-sources.js', ROOT/'startup-overview.js']

class Portability(unittest.TestCase):
    def test_unique_extension_uuid_and_shell_50(self):
        m=json.loads((ROOT/'metadata.json').read_text())
        self.assertEqual(m['uuid'],'gnome-macos-experience@local')
        self.assertIn('50',m['shell-version'])
        self.assertNotIn('quick-lang-switch',m['uuid'])

    def test_no_physical_key_or_user_shortcut_settings(self):
        data='\n'.join(p.read_text() for p in SOURCES)
        for word in ('f19', 'capslock', 'key_capslock', '/dev/input',
                     'evdev', 'uinput', 'xime-rime', 'gsettings set',
                     'set_strv(', 'set_value(', 'set_string(', 'spawn_command_line'):
            self.assertNotIn(word,data.lower(),word)
        self.assertIn("'switch-input-source'",data)
        self.assertIn("'switch-input-source-backward'",data)

    def test_independent_of_other_extensions(self):
        data='\n'.join(p.read_text() for p in SOURCES)
        for forbidden in ('quick-lang-switch@', 'no-overview@', 'ExtensionUtils',
                          'Soup.Session', 'libadwaita', 'Gtk.Application'):
            self.assertNotIn(forbidden,data)
        imports=re.findall(r"""from\s+['"]([^'"]+)['"]""",data)
        for target in imports:
            self.assertTrue(target.startswith('gi://')
                            or target.startswith('resource:///org/gnome/shell/')
                            or target.startswith('./'),target)

    def test_cleanup_and_no_popup(self):
        quick=(ROOT/'input-sources.js').read_text()
        ov=(ROOT/'startup-overview.js').read_text()
        self.assertIn('source.activate(true)',quick)
        self.assertIn('manager._switchInputSource.bind(manager)',quick)
        self.assertIn('manager._keybindingActionBackward',quick)
        self.assertIn('Main.layoutManager.disconnectObject(this)',ov)
        self.assertIn("'startup-complete'",ov)

if __name__=='__main__':
    unittest.main()
