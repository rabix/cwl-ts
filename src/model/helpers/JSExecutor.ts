const vm = require('vm');

export class JSExecutor {
    static evaluate(expr: string, job?: any, self?: any): any {
        const options = {
            displayErrors: true
        };

        let script = new vm.Script(expr, options);

        return script.runInContext(vm.createContext({$job: job, $self: self}));
    }
}