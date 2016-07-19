#!/usr/bin/env bash

ts_json="node_modules/typescript-json-schema/bin/typescript-json-schema --required"
root="src/mappings/d2sb"

$ts_json ${root}/CommandLineTool.ts CommandLineTool > src/schemas/d2sb/CLT-schema.json
$ts_json ${root}/Workflow.ts Workflow > src/schemas/d2sb/WF-schema.json
$ts_json ${root}/ExpressionTool.ts ExpressionTool > src/schemas/d2sb/ET-schema.json

sed -i.bak 's/oneOf/anyOf/g' src/schemas/d2sb/CLT-schema.json
sed -i.bak 's/"itemSeparator": "string"/"itemSeparator"/g' src/schemas/d2sb/CLT-schema.json
sed -i.bak 's/oneOf/anyOf/g' src/schemas/d2sb/WF-schema.json
sed -i.bak 's/oneOf/anyOf/g' src/schemas/d2sb/WF-schema.json
sed -i.bak 's/oneOf/anyOf/g' src/schemas/d2sb/ET-schema.json

echo Finished creating schemas for d2SB