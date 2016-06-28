let Validator = require('jsonschema').Validator;
let v = new Validator();

const draft4CLTSchema = require('./schemas/draft-4/CLT-schema.json');
const draft4WFSchema = require('./schemas/draft-4/WF-schema.json');
const draft3CLTSchema = require('./schemas/draft-3/CLT-schema.json');
const draft3WFSchema = require('./schemas/draft-3/WF-schema.json');

// const validate = v.validate({class: "CommandLineTool", inputs: [], outputs: []}, schema);

// console.log(validate);


export class Parser {
    static parse(json: any) {
        let processType = json.class;


    }

    private static _parseCommandLineTool(tool: any) {


    }

    private static _parseWorkflow(json: any) {

    }

    private static _parseExpressionTool(json: any) {

    }
}

try {
    Parser.parse({class: "CommandLineTool", baseCommand: '', inputs: [], outputs: []});
} catch(ex) {
    console.error(ex);
}