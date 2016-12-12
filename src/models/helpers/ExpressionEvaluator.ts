import {JSExecutor} from "./JSExecutor";
import {Expression as ExpressionD2} from "../../mappings/d2sb/Expression";
import {Expression as ExpressionV1} from "../../mappings/draft-4/Expression";

export class ExpressionEvaluator {
    public static evaluate(expr: string | ExpressionV1, job?: any, self?: any): any {
        let results = ExpressionEvaluator.grabExpressions(expr).map(token => {
            switch (token.type) {
                case "func":
                    return JSExecutor.evaluate("v1.0", "(function() {" + token.value + "})()", job, self);
                case "expr":
                    return JSExecutor.evaluate("v1.0", token.value, job, self);
                case "literal":
                    return token.value;
            }
        });

        if (results.length === 1) {
            return results[0];
        } else {
            return results.join('');
        }
    }

    public static evaluateD2(expr: number | string | ExpressionD2, job?: any, self?: any) {
        if (typeof expr === "string" || typeof expr === "number") {
            return expr;
        } else {
            let script = expr.script.charAt(0) === '{'
                ? "(function()" + expr.script + ")()"
                : expr.script;

            return JSExecutor.evaluate("draft-2", script, job, self);
        }
    }

    public static grabExpressions(exprStr: string): exprObj[] {
        let tokens: exprObj[] = [];
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
            throw("Invalid expression");
        }
        return tokens;
    }
}

export interface exprObj {
    type: string;
    value: string;
}

enum State {
    LITERAL,
    FUNC,
    EXPR,
}