import {CWLVersions} from "../../mappings/draft-4/CWLVersions";
declare function require(name:string);
const vm = require('vm');

export class JSExecutor {
    static evaluate(version: CWLVersions, expr: string, job?: any, self?: any): any {
        const options = {
            displayErrors: true
        };

        const script = new vm.Script(expr, options);
        let context = {};

        switch(version) {
            case "draft-2":
                context = {
                    $job: job,
                    $self: self
                };
                break;
            case "v1.0":
                context = {
                    inputs: job,
                    self: self
                };
                break;
        }

        //@todo(maya): add runtime variable
        const result = script.runInContext(vm.createContext(context));

        return result;
    }
}