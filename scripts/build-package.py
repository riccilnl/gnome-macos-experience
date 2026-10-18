#!/usr/bin/env python3
"""Create deterministic, standalone GNOME Shell ZIP using Python stdlib only."""
from pathlib import Path
import hashlib, zipfile, json
ROOT=Path(__file__).resolve().parents[1]
FILES=['metadata.json','extension.js','input-sources.js','startup-overview.js',
       'LICENSE','LICENSE-QUICK-LANG-SWITCH','LICENSE-NO-OVERVIEW','README.md']
assert all((ROOT/p).is_file() for p in FILES)
metadata=json.loads((ROOT/'metadata.json').read_text())
assert metadata['uuid']=='gnome-macos-experience@local'
assert '50' in metadata['shell-version']
out=ROOT/'dist'/(metadata['uuid']+'.shell-extension.zip')
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for filename in FILES:
        info=zipfile.ZipInfo(filename,(2026,10,19,0,0,0))
        info.external_attr=0o644<<16
        info.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(info,(ROOT/filename).read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
with zipfile.ZipFile(out,'r') as z:
    assert z.namelist()==FILES and z.testzip() is None
print('PORTABLE_GNOME_ZIP='+str(out))
print('SHA256='+hashlib.sha256(out.read_bytes()).hexdigest())
