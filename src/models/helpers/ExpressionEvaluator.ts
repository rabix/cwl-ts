import {Expression as ExpressionD2} from "../../mappings/d2sb/Expression";

export class ExpressionEvaluator {

    public static evaluateExpression: Function = null;

    public static libraries: string[] = [];

    public static evaluate(expr: number | string | ExpressionD2, context: any = {}, version:
                               "v1.0"
                               | "draft-2"): Promise<any> {
        if (version === "v1.0") {
            if (typeof expr === "number") {
                expr = expr.toString();
            } else if (typeof expr === "object") {
                return new Promise((res, rej) => {
                    rej(`Unexpected object type when evaluating v1.0 Expression: ${expr}`)
                });
            }

            try {
                let results: Promise<any>[] = ExpressionEvaluator.grabExpressions(expr).map(token => {
                    switch (token.type) {
                        case "func":
                            return ExpressionEvaluator.evaluateExpression("(function() {" + this.libraries.join("\n\n") + "\n\n"
                                + token.value + "})()", context, version);
                        case "expr":
                            return ExpressionEvaluator.evaluateExpression(this.libraries.join("\n\n") + "\n\n" + token.value, context, version);
                        case "literal":
                            return new Promise(res => res(token.value));
                    }
                });

                if (results.length === 1) {
                    return results[0];
                } else {
                    return Promise.all(results).then(res => res.join(""));
                }
            } catch (ex) {
                return new Promise((res, rej) => {
                    rej(ex);
                });
            }

        } else if (version === "draft-2") {
            if (typeof expr === "string" || typeof expr === "number") {
                return new Promise(res => res(expr));
            } else {
                let script = expr.script.trim().charAt(0) === '{'
                    ? "(function()" + expr.script + ")()"
                    : expr.script;

                return ExpressionEvaluator.evaluateExpression(script, context, version);
            }
        }

    }

    public static evaluateD2(expr: number | string | ExpressionD2, context?: any): Promise<any> {
        if (typeof expr === "string" || typeof expr === "number") {
            return new Promise(res => res(expr));
        } else {
            let script = expr.script.trim().charAt(0) === '{'
                ? "(function()" + expr.script + ")()"
                : expr.script;

            return ExpressionEvaluator.evaluateExpression(script, context);
        }
    }

    public static grabExpressions(exprStr: string): ExprObj[] {
        let tokens: ExprObj[] = [];
        let i                 = 0;
        let state             = State.LITERAL;
        let literal           = "";
        let expr              = "";
        let func              = "";
        let bracketCount      = 0;
        let parenCount        = 0;

        // go through character by character
        while (i < exprStr.length) {
            let currentChar = exprStr[i];

            switch (state) {
                case State.LITERAL:
                    if (currentChar === "$" && exprStr[i + 1] === "(") {
                        // start expression and push past literal
                        if (literal) {
                            tokens.push({type: "literal", value: literal});
                            literal = "";
                        }
                        i++;
                        expr  = "";
                        state = State.EXPR;

                    } else if (currentChar === "$" && exprStr[i + 1] === "{") {
                        // start expression and push past literal
                        if (literal) {
                            tokens.push({type: "literal", value: literal});
                            literal = "";
                        }
                        i++;
                        func  = "";
                        state = State.FUNC;
                    } else if (currentChar === "\\" && exprStr[i + 1] === "$") {
                        literal += "\\$";
                        i++;
                    } else {
                        literal += currentChar;
                    }
                    break;
                case State.EXPR:

                    switch (currentChar) {
                        case "(":
                            expr += currentChar;
                            parenCount++;
                            break;
                        case ")":
                            if (parenCount === 0) {
                                tokens.push({type: "expr", value: expr});
                                state = State.LITERAL;
                            } else {
                                expr += currentChar;
                                parenCount--;
                            }
                            break;
                        default:
                            expr += currentChar;
                    }
                    break;
                case State.FUNC:

                    switch (currentChar) {
                        case "{":
                            func += currentChar;
                            bracketCount++;
                            break;
                        case "}":
                            if (bracketCount === 0) {
                                tokens.push({type: "func", value: func});
                                state = State.LITERAL;
                            } else {
                                func += currentChar;
                                bracketCount--;
                            }
                            break;
                        default:
                            func += currentChar;
                            break;
                    }
                    break;
            }

            i++;
        }

        if (state === State.LITERAL && literal.length > 0) {
            tokens.push({type: "literal", value: literal});
        }

        if (state === State.EXPR || state === State.FUNC) {
            // if expression is invalid, treat the whole thing as a literal
            tokens = [{value: exprStr, type: "literal"}];
        }
        return tokens;
    }
}

export interface ExprObj {
    type: "func" | "literal" | "expr";
    value: string;
}

enum State {
    LITERAL,
    FUNC,
    EXPR,
}
