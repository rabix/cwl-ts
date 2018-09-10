#!/usr/bin/env bash
# run this from root
# cd dist, do npm version bump
# npm publish inside dist

# clears dist directory
rm -r dist/mappings
rm -r dist/models
rm -r dist/schemas

mkdir dist/schemas

# copies schemas (that are version controlled)
cp -R src/schemas/d2sb/ dist/schemas/d2sb/
cp -R src/schemas/draft-3/ dist/schemas/draft-3/
cp src/schemas/cwl-v10.json dist/schemas/cwl-v10.json
cp src/schemas/cwl-mixed.json dist/schemas/cwl-mixed.json

# compiles ts and generates declarations for mappings and model
tsc -p tsconfig.json

# removes tests in case tsconfig didn't exclude them
rm -r dist/tests

cd dist

#npm publish cwlts

#npm logout