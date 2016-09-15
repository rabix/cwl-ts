var chai = require('chai');
var expect = chai.expect;

describe("schema for D2SB CommandLineTool", function () {
    var Validator = require('jsonschema').Validator;
    var v = new Validator();
    var d2sbCLTSchema = require('../schemas/d2sb/CLT-schema.json');

    describe("BamTools Split", function () {
        var bamToolsSplit = require('./apps/bamtools-split.json');
        var result = v.validate(bamToolsSplit, d2sbCLTSchema);
        expect(result.valid).to.be.true;
    });

    describe("BamTools Index", function () {
        var bamToolsIndex = require('./apps/bamtools-index.json');
        var result = v.validate(bamToolsIndex, d2sbCLTSchema);
        expect(result.valid).to.be.true;
    });

    describe("BCFTools Annotate", function () {
        var bcfToolsAnnotate = require("./apps/bcftools-annotate.json");
        var result = v.validate(bcfToolsAnnotate, d2sbCLTSchema);
        expect(result.valid).to.be.true;
    });

    //todo: write tests for major cases were validation should fail (no class, no base command, etc)
});
