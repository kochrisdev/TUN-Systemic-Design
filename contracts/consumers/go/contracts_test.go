package consumer

import (
	"bytes"
	"encoding/json"
	"os"
	"testing"
	"github.com/santhosh-tekuri/jsonschema/v6"
)

func TestSharedWireFixtures(t *testing.T) {
	bundle, err := os.ReadFile("../../json-schema/contracts.schema.json")
	if err != nil { t.Fatal(err) }
	validators, err := CompileContracts(bundle)
	if err != nil { t.Fatal(err) }
	data, err := os.ReadFile("../../fixtures/cases.json")
	if err != nil { t.Fatal(err) }
	var fixture struct {
		Cases []struct {
			ID string `json:"id"`
			Contract string `json:"contract"`
			Input json.RawMessage `json:"input"`
			Wire bool `json:"wire"`
		} `json:"cases"`
	}
	if err = json.Unmarshal(data, &fixture); err != nil { t.Fatal(err) }
	if len(fixture.Cases) == 0 { t.Fatal("empty fixture corpus") }
	seen := map[string]bool{}
	for _, item := range fixture.Cases {
		t.Run(item.ID, func(t *testing.T) {
			validator, exists := validators[item.Contract]
			if !exists { t.Fatalf("unknown contract %s", item.Contract) }
			input, err := jsonschema.UnmarshalJSON(bytes.NewReader(item.Input))
			if err != nil { t.Fatal(err) }
			valid := validator.Validate(input) == nil
			if valid != item.Wire { t.Errorf("wire validity %t, expected %t", valid, item.Wire) }
			seen[item.Contract] = true
		})
	}
	if len(seen) != len(validators) { t.Fatal("not all schemas have fixtures") }
	t.Logf("%d wire fixtures across %d contracts", len(fixture.Cases), len(validators))
}
func TestExternalLoadingDisabled(t *testing.T) {
	_, err := (localOnly{}).Load("https://example.invalid/schema")
	if err == nil { t.Fatal("remote schemas must not load") }
}
func TestRejectInvalidBundle(t *testing.T) {
	for _, content := range []string{`{}`, `{"$id":"wrong","$defs":{"Actor":{}}}`, `not json`} {
		if _, err := CompileContracts([]byte(content)); err == nil { t.Fatal("invalid bundle accepted") }
	}
}
