import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
declare function require(name: string);
const vm = require('vm');

export class JSExecutor {
    static evaluate(version: CWLVersion, expr: string, job?: any, self?: any): Promise<any> {
        const options = {
            displayErrors: true
        };

        let script = new vm.Script("", options);

        try {
            script = new vm.Script(expr, options);
        } catch (ex) {
            //@todo figure out why this exception is even thrown..
            return new Promise((res, rej) => {
                rej(ex);
            })
        }

        let context = {};

        switch (version) {
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

        return new Promise((res, rej) => {
            try {
                const result = script.runInContext(vm.createContext(context));
                res(result);
            } catch (err) {
                rej(err);
            }
        });
    }
}