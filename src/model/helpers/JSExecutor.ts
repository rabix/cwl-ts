const vm = require('vm');

export class JSExecutor {
    static evaluate(expr: string, job?: any, self?: any): any {
        const options = {
            displayErrors: true
        };

        let script = new vm.Script(expr, options);

        // IMPORTANT!
        // this is draft-4/v1.0 specific, before inputs ==> $job and self ==> $self
        //@todo(maya): add runtime variable
        return script.runInContext(vm.createContext({inputs: job, self: self}));
    }
}