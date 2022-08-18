import {ErrorCode, ValidityError} from "./validation";
import {WorkflowInputParameterModel, WorkflowOutputParameterModel} from "../generic";
import {ensureArray, intersection} from "./utils";

export const checkIfConnectionIsValid = (pointA, pointB, ltr = true) => {

    // if both ports belong to the same step, connection is not possible
    if (pointA.parentStep && pointB.parentStep && pointA.parentStep.id === pointB.parentStep.id) {
        throw new ValidityError(`Invalid connection. Source and destination ports belong to the same step`, ErrorCode.CONNECTION_SAME_STEP);
    }

    const getType = (type) => {
        if (typeof type === "string") {
            return type;
        }

        if (Array.isArray(type)) {
            return "union";
        }
        if (typeof type === "object" && type !== null) {
            return "object";
        }
    };

    const stepHasScatterInput = (step: { scatter: string | string[] }, scatter: string) => {
        return ensureArray(step.scatter).some(s => s == scatter);
    };

    const checkBothPointsForSameScatter = () => {
        if (pointA instanceof WorkflowInputParameterModel ||
            pointA instanceof WorkflowOutputParameterModel ||
            pointB instanceof WorkflowInputParameterModel ||
            pointB instanceof WorkflowOutputParameterModel) {
            return true;
        }

        if (pointB.parentStep && pointA.parentStep) {
            const stepBHasDefinedScatter = stepHasScatterInput(pointB.parentStep, pointB.id);
            const stepAHasDefinedScatter = stepHasScatterInput(pointA.parentStep, pointB.id);

            if ((!stepAHasDefinedScatter && stepBHasDefinedScatter) ||
                (stepAHasDefinedScatter && !stepBHasDefinedScatter)) {
                throw new ValidityError(
                    `Invalid connection. Scatter '${pointB.id}' is making a mismatch in connection`,
                    ErrorCode.CONNECTION_SCATTER_TYPE
                );
            }

            return true;
        }

        return true;
    }

    // fetch type
    const pointAType  = pointA.type.type;
    const pointBType  = pointB.type.type;
    const pointAItems = getType(pointA.type.items);
    const pointBItems = getType(pointB.type.items);

    if (pointAType === 'any' || pointBType === 'any') {
        return true;
    }

    if (pointAType === 'File' && pointBType === 'stdin') {
        return true
    }

    // match types, defined types can be matched with undefined types
    if (pointAType === pointBType // match exact type
        || ((pointAItems === pointBType || pointAItems === "union") && !ltr) //match File[] to File
        || ((pointBItems === pointAType || pointBItems === "union") && ltr) // match File to File[]
        || pointAType === "null"
        || pointBType === "null") {

        // If union[] -> any[] or vice versa
        if (pointBItems === "union" || pointAItems === "union") {
            return true;
        }

        // If record[] -> object[] or vice versa
        if ((pointBItems === "record" && pointAItems === "object")
            || (pointAItems === "record" && pointBItems === "object")) {
            return true;
        }

        // if both are arrays but not of the same type
        if (pointAItems && pointBItems && pointAItems !== pointBItems) {
            throw new ValidityError(`Invalid connection. Connection type mismatch, attempting to connect "${pointAItems}[]" to "${pointBItems}[]"`, ErrorCode.CONNECTION_TYPE);
        }
        // if type match is file, and fileTypes are defined on both ports,
        // match only if fileTypes match
        if ((pointAType === "File" || pointAItems === "File") && pointB.fileTypes.length && pointA.fileTypes.length) {
            if (!!intersection(pointB.fileTypes.map((type) => type.toLowerCase()), pointA.fileTypes.map(type => type.toLowerCase())).length) {
                return true;
            } else {
                throw new ValidityError(`Invalid connection. File type mismatch, connecting formats "${pointA.fileTypes}" to "${pointB.fileTypes}"`, ErrorCode.CONNECTION_FILE_TYPE);
            }
        }

        if (pointAType === pointBType) {
            checkBothPointsForSameScatter();
        }

        if (pointB.secondaryFiles.length) {

            if (pointB.secondaryFiles.length > pointA.secondaryFiles.length) {
                throw new ValidityError(`Input connection is missing required secondary files`, ErrorCode.CONNECTION_SEC_FILES);
            }

            const isRequired = (secondaryFile): boolean => secondaryFile.required !== undefined ? secondaryFile.required : true;
            const getPattern = (secondaryFile) => secondaryFile.pattern ? secondaryFile.pattern : secondaryFile;

            const requiredSecondaryFiles = pointB.secondaryFiles
                .filter(isRequired)
                .map(getPattern);

            const outputSecondaryFiles = pointA.secondaryFiles.map(getPattern);

            requiredSecondaryFiles.forEach(secondaryFile => {
                if (secondaryFile.isExpression) {
                    return;
                }

                const secondaryFilePattern = `${secondaryFile}`;
                const foundSamePattern = outputSecondaryFiles.find(sf => sf.toString().toUpperCase() === secondaryFilePattern.toUpperCase());

                if (!foundSamePattern) {
                    throw new ValidityError(`Input connection is missing required secondary files with a pattern: ${secondaryFilePattern}`, ErrorCode.CONNECTION_SEC_FILES);
                }
            });

            return true;
        }

        // if not file or fileTypes not defined
        return true;
    }

    // mark connection as valid if pointB has scatter and pointA[]
    if ((pointAItems === pointBType) && stepHasScatterInput(pointB.parentStep, pointB.id)) {
        return true;
    }

    // if types are both defined and do not match
    const pointATypeOutput = pointAItems ? `"${pointAItems}[]"` : `"${pointAType}"`;
    const pointBTypeOutput = pointBItems ? `"${pointBItems}[]"` : `"${pointBType}"`;

    throw new ValidityError(`Invalid connection. Connection type mismatch, attempting to connect ${pointATypeOutput} to ${pointBTypeOutput}`, ErrorCode.CONNECTION_TYPE);
};
