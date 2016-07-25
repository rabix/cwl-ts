/**
 * 'Expression' is not a real type.  It indicates that a field must allow
 runtime parameter references.  If [InlineJavascriptRequirement](#InlineJavascriptRequirement)
 is declared and supported by the platform, the field must also allow
 Javascript expressions.

 */
export type Expression = "ExpressionPlaceholder";