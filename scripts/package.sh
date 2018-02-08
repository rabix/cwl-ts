#!/usr/bin/env bash
# run this from root
# cd lib, do npm version bump
# npm publish inside lib

# clears lib directory
rm -r lib/mappings
rm -r lib/models
rm -r lib/schemas

mkdir lib/schemas

# copies schemas (that are version controlled)
cp -R src/schemas/d2sb/ lib/schemas/d2sb/
cp -R src/schemas/draft-3/ lib/schemas/draft-3/
cp src/schemas/cwl-v10.json lib/schemas/cwl-v10.json
cp src/schemas/cwl-mixed.json lib/schemas/cwl-mixed.json

# compiles ts and generates declarations for mappings and model
tsc -p tsconfig.json

# removes tests in case tsconfig didn't exclude them
rm -r lib/tests

cd lib

#npm publish cwlts

#npm logout