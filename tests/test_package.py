from pathlib import Path
import json, unittest, zipfile, tempfile, shutil
ROOT=Path(__file__).resolve().parents[1]
class Package(unittest.TestCase):
    def test_gnome_shell_files_and_license(self):
        expected={'extension.js','metadata.json','input-sources.js',
                  'startup-overview.js','LICENSE','LICENSE-QUICK-LANG-SWITCH',
                  'LICENSE-NO-OVERVIEW','README.md'}
        self.assertTrue(all((ROOT/x).is_file() for x in expected))
        m=json.loads((ROOT/'metadata.json').read_text())
        self.assertEqual(m['uuid'],'gnome-macos-experience@local')
        self.assertIn('50',m['shell-version'])
        self.assertIn('GNU AFFERO GENERAL PUBLIC LICENSE',(ROOT/'LICENSE').read_text())
        self.assertIn('GNU GENERAL PUBLIC LICENSE',(ROOT/'LICENSE-NO-OVERVIEW').read_text())
