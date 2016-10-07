#!/usr/bin/env bash

cd ..
# DO NOT REMOVE SCHEMAS they are partially generated,
# but also manually edited and committed to the repo
rm -r lib/mappings
rm -r lib/models

tsc -p tsconfig.json


cd lib

#npm publish cwlts

#npm logout