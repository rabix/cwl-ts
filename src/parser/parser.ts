let Validator = require('jsonschema').Validator;
let v = new Validator();

const draft4CLTSchema = require('./schemas/draft-4/CLT-schema.json');
const draft4WFSchema = require('./schemas/draft-4/WF-schema.json');
const draft3CLTSchema = require('./schemas/draft-3/CLT-schema.json');
const draft3WFSchema = require('./schemas/draft-3/WF-schema.json');


export class Parser {
    static parse(json: any) {
        // should check against json schema
    }
}
