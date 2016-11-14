import {Validation} from "./Validation";

export class ValidationUpdater {
    public static interchangeErrors(o: Validation, u: Validation): Validation {
        const base = {errors: [], warnings: []};

        const original = Object.assign({}, base, o);
        const update = Object.assign({}, base, u);

        const locations = update.errors
            .map((error) => error.loc)
            .concat(update.warnings.map((warning) => warning.loc));

        original.errors.forEach((error, index) => {
            if (locations.indexOf(error.loc) !== -1) {
                original.errors.splice(index, 1);
            }
        });

        original.warnings.forEach((warning, index) => {
            if (locations.indexOf(warning.loc) !== -1) {
                original.warnings.splice(index, 1);
            }
        });

        original.warnings = original.warnings.concat(update.warnings);
        original.errors = original.errors.concat(update.errors);

        return original;
    }
}