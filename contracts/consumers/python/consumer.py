"""Offline validation of the portable TUN wire layer. See contracts/SEMANTICS.md."""
from pathlib import Path
import json
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.exceptions import NoSuchResource


def no_remote(uri):
    raise NoSuchResource(ref=uri)


def compile_contracts(path: Path):
    bundle = json.loads(path.read_text(encoding="utf-8"))
    if bundle.get("$id") != "urn:tun:contracts:0.1.0" or not bundle.get("$defs"):
        raise ValueError("Unsupported TUN schema bundle")
    Draft202012Validator.check_schema(bundle)
    registry = Registry(retrieve=no_remote).with_resource(bundle["$id"], Resource.from_contents(bundle))
    return {name: Draft202012Validator({"$ref": bundle["$id"] + "#/$defs/" + name}, registry=registry)
            for name in bundle["$defs"]}
