/**
 * Not a real type.  Indicates that a field must allow runtime parameter
 references.  If [InlineJavascriptRequirement](#InlineJavascriptRequirement)
 is declared and supported by the platform, the field must also allow
 Javascript expressions.

 */
export type Expression = "ExpressionPlaceholder";