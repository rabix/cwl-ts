export class ExpressionEvaluator {
    public static evaluate(expr: string, job: any): any {

        let tokens = ExpressionEvaluator.grabExpressions(expr);
        if (tokens.length > 1 && tokens[0].type === "expr") {

        }

        return undefined;
    }

    public static grabExpressions(exprStr: string): exprObj[] {
        let tokens = [];
        let i = 0;
        let state = State.LITERAL;
        let literal = "";
        let expr = "";
        let func = "";
        let bracketCount = 0;
        let parenCount = 0;

        // go through character by character
        while (i < exprStr.length) {
            let currentChar = exprStr[i];

            switch(state) {
                case State.LITERAL:
                    if (currentChar === "$" && exprStr[i + 1] === "{") {
                        // start expression and push past literal
                        if (literal) {
                            tokens.push({type: "literal", value: literal});
                            literal = "";
                        }
                        i++;
                        expr = "${";
                        state = State.EXPR;

                    } else if (currentChar === "$" && exprStr[i + 1] === "(") {
                        // start expression and push past literal
                        if (literal) {
                            tokens.push({type: "literal", value: literal});
                            literal = "";
                        }
                        i++;
                        func = "$(";
                        state = State.FUNC;
                    } else if (currentChar === "\\" && exprStr[i + 1] === "$") {
                        literal += "\\$";
                        i++;
                    } else {
                        literal += currentChar;
                    }
                    break;
                case State.EXPR:
                    expr += currentChar;

                    if (currentChar === "{") {
                        bracketCount++;
                    }

                    if (currentChar === "}") {
                        if (bracketCount === 0) {
                            tokens.push({type: "expr", value: expr});
                            state = State.LITERAL;
                        } else {
                            bracketCount--;
                        }
                    }
                    break;
                case State.FUNC:
                    func += currentChar;

                    if (currentChar === "(") {
                        bracketCount++;
                    }

                    if (currentChar === ")") {
                        if (bracketCount === 0) {
                            tokens.push({type: "func", value: func});
                            state = State.LITERAL;
                        } else {
                            bracketCount--;
                        }
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

    private static evaluateExpression(expr: string): any {
        // sandbox evaluation
        return expr;
    }
}

interface exprObj {
    type: string;
    value: string;
}

enum State {
    LITERAL,
    FUNC,
    EXPR,
}