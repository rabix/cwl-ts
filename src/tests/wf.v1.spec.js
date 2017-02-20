var chai = require('chai');
var expect = chai.expect;

describe("schema for V1 Workflow", function() {
    var AJV = require("ajv");
    var v = new AJV({allErrors: true});
    var cwlV1Schema = require("../schemas/cwl-v10.json");
    var v1Validator = v.compile(cwlV1Schema);
    var YAML = require("js-yaml");
    var fs = require("fs");
    var path = require('path');

    describe("GATK workflow", function() {
        var gatkPath = path.join(__dirname, 'apps/GATK-complete-Workflow.cwl')
        var gatkWorkflow = fs.readFileSync(gatkPath);
        var isValid = v1Validator(YAML.safeLoad(gatkWorkflow));
        
        var errors = v1Validator.errors || [];
        console.log(errors);
        expect(errors).to.be.empty;
    });

    describe("BcBio workflow", function() {
        var bcbioPath = path.join(__dirname, 'apps/main-run_info-cwl.cwl')
        var bcbioWorkflow = fs.readFileSync(bcbioPath);
        var result = v1Validator(YAML.safeLoad(bcbioWorkflow));
        
        var errors = v1Validator.errors || [];
        console.log(errors);
        expect(errors).to.be.empty;
    });

    describe("LobSTR workflow", function() {
        var lobstrPath = path.join(__dirname, 'apps/lobSTR-workflow.cwl')
        var lobstrWorkflow = fs.readFileSync(lobstrPath);
        var result = v1Validator(YAML.safeLoad(lobstrWorkflow));
        
        var errors = v1Validator.errors || [];
        console.log(errors);
        expect(errors).to.be.empty;
    });
});