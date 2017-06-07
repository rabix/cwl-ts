const ref = require('json-schema-ref-parser');
schemas = require("./../schemas/cwl-v10.json");

ref.dereference(schemas, function(err, schemas) {
});