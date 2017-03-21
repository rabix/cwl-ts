declare function require(name: string);
const vm = require('vm');

export class JSExecutor {
    static evaluate(expr: string, context?: any): Promise<any> {
        const options = {
            displayErrors: true,
            timeout: 1000
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

        context = context || {};

        return new Promise((res, rej) => {
            try {
                const result = script.runInContext(vm.createContext(context), {timeout: 1000});
                //@todo this timeout works in isolation but not when targeted from the editor
                res(result);
            } catch (err) {
                rej(err);
            }
        });
    }
}