#!/usr/bin/env bash

rm -r lib/mappings
rm -r lib/models
rm -r lib/schemas

mkdir lib/schemas

cp -R src/schemas/d2sb/ lib/schemas/d2sb/
cp -R src/schemas/draft-3/ lib/schemas/draft-3/
cp -R src/schemas/draft-4/ lib/schemas/draft-4/
cp -R src/schemas/v1.0/ lib/schemas/v1.0/

tsc -p tsconfig.json

rm -r lib/tests #in case they're copied

cd lib

#npm publish cwlts

#npm logout