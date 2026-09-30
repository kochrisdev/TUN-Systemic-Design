#!/usr/bin/env python3
"""Run local-host integration tests and retain named, revision-scoped evidence."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import unittest
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

class Results(unittest.TextTestResult):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.outcomes = {}
    def addSuccess(self, test):
        super().addSuccess(test)
        self.outcomes[test.id()] = 'passed'
    def addFailure(self, test, err):
        super().addFailure(test, err)
        self.outcomes[test.id()] = 'failed'
    def addError(self, test, err):
        super().addError(test, err)
        self.outcomes[test.id()] = 'error'
    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        self.outcomes[test.id()] = 'skipped'

if __name__ == '__main__':
    paths = sorted([HERE / 'service.py', HERE / 'server.py', Path(__file__), *HERE.joinpath('tests').glob('test_*.py')])
    hashes = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
    started = datetime.now(timezone.utc).isoformat()
    result = unittest.TextTestRunner(verbosity=2, resultclass=Results).run(unittest.defaultTestLoader.discover(str(HERE / 'tests'), pattern='test_*.py'))
    unchanged = all(hashlib.sha256((ROOT / p).read_bytes()).hexdigest() == h for p,h in hashes.items())
    passed = result.wasSuccessful() and not result.skipped and result.testsRun > 0 and unchanged
    try:
        commit = subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,capture_output=True,text=True,check=True).stdout.strip()
    except (OSError,subprocess.SubprocessError):
        commit = None
    report = {'profile':'local-sqlite-host-v0.1','sourceCommit':commit,'startedAt':started,'finishedAt':datetime.now(timezone.utc).isoformat(),'inputSha256':hashes,'passed':passed,'testsRun':result.testsRun,'outcomes':result.outcomes,'scope':'Loopback HTTP, local bearer principals, host SQLite and independent sandbox provider SQLite. No remote provider or production deployment assessment.'}
    (ROOT / 'artifacts').mkdir(exist_ok=True)
    (ROOT / 'artifacts/host-backend-results.json').write_text(json.dumps(report,indent=2)+'\n')
    sys.exit(0 if passed else 1)
