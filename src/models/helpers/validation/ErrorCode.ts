export enum ErrorCode {

    ID_ALL = 100, // all ID errors
    ID_INVALID_CHAR = 101,
    ID_MISSING = 102,
    ID_DUPLICATE = 103,

    EXPR_ALL = 200,
    EXPR_SYNTAX = 201,
    EXPR_REFERENCE = 202,
    EXPR_TYPE = 203,
    EXPR_NOT_JSON = 204


}