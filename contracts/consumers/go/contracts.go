// Package consumer demonstrates offline use of the TUN JSON Schema definitions.
package consumer

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/dlclark/regexp2"
	"github.com/santhosh-tekuri/jsonschema/v6"
	"sort"
	"time"
)

// JSON Schema patterns use ECMAScript syntax, including strict end assertions.
type ecmaRegexp struct{ compiled *regexp2.Regexp }

func (r ecmaRegexp) String() string { return r.compiled.String() }
func (r ecmaRegexp) MatchString(value string) bool {
	matched, err := r.compiled.MatchString(value)
	return err == nil && matched
}
func compilePattern(pattern string) (jsonschema.Regexp, error) {
	re, err := regexp2.Compile(pattern, regexp2.ECMAScript)
	if err != nil {
		return nil, err
	}
	re.MatchTimeout = time.Second
	return ecmaRegexp{re}, nil
}

type localOnly struct{}

func (localOnly) Load(string) (any, error) {
	return nil, errors.New("external schema loading is disabled")
}

// CompileContracts compiles all wire definitions once. It never fetches remote schemas.
// Apply the x-tun-semantic-checks algorithms separately for full validateContract behavior.
func CompileContracts(bundle []byte) (map[string]*jsonschema.Schema, error) {
	doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(bundle))
	if err != nil {
		return nil, err
	}
	var inventory struct {
		ID   string                     `json:"$id"`
		Defs map[string]json.RawMessage `json:"$defs"`
	}
	if err = json.Unmarshal(bundle, &inventory); err != nil {
		return nil, err
	}
	if inventory.ID != "urn:tun:contracts:0.1.0" || len(inventory.Defs) == 0 {
		return nil, errors.New("unsupported TUN schema bundle")
	}
	c := jsonschema.NewCompiler()
	c.UseRegexpEngine(compilePattern)
	c.UseLoader(localOnly{})
	if err = c.AddResource(inventory.ID, doc); err != nil {
		return nil, err
	}
	names := make([]string, 0, len(inventory.Defs))
	for name := range inventory.Defs {
		names = append(names, name)
	}
	sort.Strings(names)
	result := make(map[string]*jsonschema.Schema, len(names))
	for _, name := range names {
		schema, err := c.Compile(inventory.ID + "#/$defs/" + name)
		if err != nil {
			return nil, err
		}
		result[name] = schema
	}
	return result, nil
}
