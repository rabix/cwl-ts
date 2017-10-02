export enum ErrorCode {

    ID_ALL = 100, // all ID errors
    ID_INVALID_CHAR = 101,
    ID_MISSING = 102,
    ID_DUPLICATE = 103,

    EXPR_ALL = 200,
    EXPR_SYNTAX = 201,
    EXPR_REFERENCE = 202,
    EXPR_TYPE = 203,
    EXPR_NOT_JSON = 204,

    CONNECTION_ALL = 300,
    CONNECTION_TYPE = 301,
    CONNECTION_FILE_TYPE = 302,
    CONNECTION_SAME_STEP = 303,
}

export class ValidityError extends Error {
    constructor(str, public code: ErrorCode) {
        super(str);
    }
}