"use strict";
var CommandLineToolModel = (function () {
    function CommandLineToolModel() {
        this.class = 'CommandLineTool';
    }
    CommandLineToolModel.prototype.generateCommandLine = function () {
        var parts = this.generateCommandLineParts();
        parts.sort(function (a, b) {
            var posA = a.sortingKey[0];
            var posB = b.sortingKey[0];
            if (posA > posB) {
                return 1;
            }
            if (posA < posB) {
                return -1;
            }
            var indA = a.sortingKey[1];
            var indB = b.sortingKey[1];
            if (indA > indB) {
                return 1;
            }
            if (indA < indB) {
                return -1;
            }
            // defaults to returning 1 in case both position and index match (should never happen)
            return 1;
        });
        return parts.map(function (part) { return part.value; }).join(' ');
    };
    CommandLineToolModel.prototype.generateCommandLineParts = function () {
        // let argParts = this.arguments.map(arg => arg.getCommandPart());
        var inputParts = this.mappedInputs.map(function (input) { return input.getCommandPart(); });
        return inputParts;
    };
    return CommandLineToolModel;
}());
exports.CommandLineToolModel = CommandLineToolModel;
//# sourceMappingURL=CommandLineToolModel.js.map