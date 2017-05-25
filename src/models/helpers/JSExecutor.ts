declare function require(name: string);
const vm = require('vm');

export class JSExecutor {
    static evaluate(expr: string, context?: any): Promise<any> {
        return new Promise((res, rej) => {
            try {
                const result = vm.runInNewContext(expr, context || {}, {timeout: 1000});

                res(result);
            } catch (ex) {
                rej(ex);
            }
        });
    }
}