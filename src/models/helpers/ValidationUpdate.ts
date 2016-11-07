import {Validation} from "../interfaces/Validatable";
export class ValidationUpdater {
    public static interchangeErrors(original: Validation, update: Validation): Validation {
        update = Object.assign({warning: [], error: []}, update);
        original = Object.assign({warning: [], error: []}, original);

        const locations = update.error
            .map((error) => error.loc)
            .concat(update.warning.map((warning) => warning.loc));

        console.log(locations);
        original.error.forEach((error, index) => {
            if (locations.indexOf(error.loc) !== -1) {
                original.error.splice(index, 1);
            }
        });

        original.warning.forEach((warning, index) => {
            if (locations.indexOf(warning.loc) !== -1) {
                original.warning.splice(index, 1);
            }
        });

        console.log('update error', update.error);
        original.warning = original.warning.concat(update.warning);
        original.error = original.error.concat(update.error);

        console.log(JSON.stringify(original, null, 4));
        return original;
    }
}