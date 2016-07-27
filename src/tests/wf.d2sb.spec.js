var chai = require('chai');
var expect = chai.expect;

describe("schema for D2SB Workflow", function() {
    var Validator = require('jsonschema').Validator;
    var v = new Validator();
    var d2sbWFSchema = require("../schemas/d2sb/WF-schema.json");

    describe("RNA-seq Alignment STAR", function() {
        var rnaSeq = require('./apps/rna-seq-alignment-star.json');
        var result = v.validate(rnaSeq, d2sbWFSchema);
        if (!result.valid) {
            console.log(JSON.stringify(result.errors[0], null, 4));
        }

        expect(result.valid).to.be.true;
    });

    describe("Whole Exome Sequencing GATK", function() {
        var wholeExome = require('./apps/whole-exome-sequencing-gatk.json');
        var result = v.validate(wholeExome, d2sbWFSchema);
        if (!result.valid) {
            console.log(JSON.stringify(result.errors[0], null, 4));
        }

        expect(result.valid).to.be.true;
    });

    describe("Fusion Transcript Detection ChimeraScan", function() {
        var chimeraScan = require('./apps/chimerascan.json');
        var result = v.validate(chimeraScan, d2sbWFSchema);
        if (!result.valid) {
            console.log(JSON.stringify(result.errors[0], null, 4));
        }

        expect(result.valid).to.be.true;
    });
});