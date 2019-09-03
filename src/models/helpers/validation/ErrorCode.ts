export enum ErrorCode {
    ALL                     = 0,

    ID_ALL                  = 100,
    ID_INVALID_CHAR         = 101,
    ID_MISSING              = 102,
    ID_DUPLICATE            = 103,

    EXPR_ALL                = 200,
    EXPR_SYNTAX             = 201,
    EXPR_REFERENCE          = 202,
    EXPR_TYPE               = 203,
    EXPR_NOT_JSON           = 204,
    EXPR_LINTER_WARNING     = 205,

    CONNECTION_ALL          = 300,
    CONNECTION_TYPE         = 301,
    CONNECTION_FILE_TYPE    = 302,
    CONNECTION_SAME_STEP    = 303,

    OUTPUT_ALL              = 400,
    OUTPUT_GLOB_MISSING     = 401,
    OUTPUT_EVAL_EXPR        = 402,
    OUTPUT_EVAL_INHERIT     = 403,

    TYPE_ALL                = 500,
    TYPE_FIELDS_MISSING     = 501,
    TYPE_ITEMS_MISSING      = 502,
    TYPE_SYMBOLS_MISSING    = 503,
    TYPE_NAME_MISSING       = 504,

    TYPE_EXTRA_PROPS        = 505,
    TYPE_UNSUPPORTED        = 506,

    TYPE_FIELD_DUPLICATE_ID = 507,
}

export class ValidityError<T> extends Error {
    constructor(str, public code: ErrorCode, public data?: T) {
        super(str);
    }
}
