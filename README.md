# cwl-ts

[![Build Status](https://travis-ci.org/rabix/cwl-ts.svg?branch=master)](https://travis-ci.org/rabix/cwl-ts)
[![npm version](https://img.shields.io/npm/v/cwlts.svg?style=flat)](https://img.shields.io/npm/v/cwlts.svg?style=flat)

CWL-ts is a data model library for the [Common Workflow Language](http://www.commonwl.org/) made for use in TypeScript and JavaScript (primarily client-side) applications.

It supports JSON schemas and mappings for draft-3, draft-4, and v1.0. Draft-2 support is [SevenBridges](https://www.sbgenomics.com/) flavored.

## Installation
```bash
npm install cwlts
```

## Build
The npm package can be built locally by running the following command. It will generate `.d.ts` and compiled `.js` files into the `/lib` directory.
```bash
./scripts/package.sh
```

## Mappings

`lib/mappings` contains TypeScript interfaces that can be used for type hinting when working with CWL documents in TS/JS.

## Schemas

`lib/schemas` contains [JSON Schema](http://json-schema.org/) definitions for CommandLineTool, Workflow and ExpressionTool for each draft/version. They can be used with a JSON Schema validator to ensure schema validity of a CWL document.

## Models [WIP]

`lib/models` contains TypeScript classes representing CWL entities. Models are still in early development, so many intended features are not implemented yet or don't function properly. The purpose of these models is to provide a set of methods that will facilitate working with CWL in a client-side application--one that graphically displays CWL documents or creates them. They should abstract differences between drafts and versions, provide a consistent API, and always generate correct and valid CWL documents. 

CommandLineToolModel should:

- generate command line when supplied test data
- evaluate and validate expressions
- enable operations on complex child objects (inputs, outputs, arguments, etc)

WorkflowModel should:.

- generate DAG of workflow
- enable adding and connecting steps
- enable operations on complex child objects (inputs, outputs, steps, etc)
