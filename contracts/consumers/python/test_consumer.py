"""Shared fixtures test wire semantics, not the additional JavaScript refinements."""
import json
from pathlib import Path
import unittest
from consumer import compile_contracts, no_remote
from referencing.exceptions import NoSuchResource
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[2]

class WireContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.validators = compile_contracts(ROOT / "json-schema/contracts.schema.json")
        cls.cases = json.loads((ROOT / "fixtures/cases.json").read_text(encoding="utf-8"))["cases"]

    def test_shared_wire_fixtures(self):
        self.assertTrue(self.cases)
        self.assertEqual(set(self.validators), {case["contract"] for case in self.cases})
        for case in self.cases:
            with self.subTest(case=case["id"]):
                self.assertEqual(self.validators[case["contract"]].is_valid(case["input"]), case["wire"])

    def test_external_resolution_disabled(self):
        with self.assertRaises(NoSuchResource):
            no_remote("https://example.invalid/schema")

    def test_bundle_requires_a_named_definition(self):
        bundle = json.loads((ROOT / "json-schema/contracts.schema.json").read_text(encoding="utf-8"))
        self.assertFalse(Draft202012Validator(bundle).is_valid({}))

if __name__ == "__main__":
    unittest.main()
