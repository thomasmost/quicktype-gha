# quicktype-gha

A GitHub Action for generating type bindings from JSON schema files

## Inputs

### `source-file`

Schema JSON file to generate type bindings from.

### `out-langs`

Comma-separated list of language extensions to generate bindings for

### `out-dir` (optional)

Directory to output generated bindings to

## Example Usage

You can use this action to generate artifacts with the type bindings in your preferred languages.

For example, you might design a workflow to generate bindings for both TypeScript and Rust, e.g.

```yml
name: Build
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: API Schema
        uses: thomasmost/quicktype-gha@0.1.1
        with:
          source-file: data_objects/api.schema.json
          out-langs: ts,rs
      - name: Upload files
        uses: actions/upload-artifact@v4
        with:
          name: bindings
          path: |
            ./api.ts
            ./api.rs
```
