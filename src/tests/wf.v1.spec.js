var chai = require('chai');
var expect = chai.expect;

describe("schema for V1 Workflow", function() {
    var Validator = require('jsonschema').Validator;
    var v = new Validator();
    var cwlV1Schema = require("../schemas/cwl-v1.json");

    describe("RNA-seq Alignment STAR", function() {
        var rnaSeq = require('./apps/rna-seq-alignment-star.json');
        var result = v.validate(rnaSeq, cwlV1Schema);

        expect(result.valid).to.be.true;
    });

    describe("Whole Exome Sequencing GATK", function() {
        var wholeExome = require('./apps/whole-exome-sequencing-gatk.json');
        var result = v.validate(wholeExome, cwlV1Schema);

        expect(result.valid).to.be.true;
    });

    describe("Fusion Transcript Detection ChimeraScan", function() {
        var chimeraScan = require('./apps/chimerascan.json');
        var result = v.validate(chimeraScan, cwlV1Schema);

        expect(result.valid).to.be.true;
    });
});