var chai = require('chai');
var expect = chai.expect;

describe("schema for V1 CommandLineTool", function () {
    var AJV = require("ajv");
    var v = new AJV({allErrors: true});
    var cwlV1Schema = require("../schemas/cwl-v10.json");
    var v1Validator = v.compile(cwlV1Schema);
    var YAML = require("js-yaml");
    var fs = require("fs");
    var path = require('path');

    describe("Batch for Variant Call", function () {
        var batchForVariantCallPath = path.join(__dirname, 'apps/batch_for_variantcall.cwl')
        var batchForVariantCall = fs.readFileSync(batchForVariantCallPath);
        var result = v1Validator(YAML.safeLoad(batchForVariantCall));

        var errors = v1Validator.errors || [];
        console.log(errors);
        expect(errors).to.be.empty;
    });

    describe("GATK-VariantRecalibrator-SNPs", function () {
        var gatkVariantRecalibratorPath = path.join(__dirname, 'apps/GATK-VariantRecalibrator-SNPs.cwl')
        var gatkVariantRecalibrator = fs.readFileSync(gatkVariantRecalibratorPath);
        var result = v1Validator(YAML.safeLoad(gatkVariantRecalibrator));
        
        var errors = v1Validator.errors || [];
        console.log(errors);
        expect(errors).to.be.empty;
    });

    describe("LobSTR tool", function () {
        var lobSTRPath = path.join(__dirname, 'apps/lobSTR-tool.cwl')
        var lobSTR = fs.readFileSync(lobSTRPath);
        var result = v1Validator(YAML.safeLoad(lobSTR));
        
        var errors = v1Validator.errors || [];
        console.log(errors);
        expect(errors).to.be.empty;
    });

});
