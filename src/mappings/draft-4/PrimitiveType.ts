/**
 * Salad data types are based on Avro schema declarations.  Refer to the
 [Avro schema declaration documentation](https://avro.apache.org/docs/current/spec.html#schemas) for
 detailed information.
 ,null: no value,boolean: a binary value,int: 32-bit signed integer,long: 64-bit signed integer,float: single precision (32-bit) IEEE 754 floating-point number,double: double precision (64-bit) IEEE 754 floating-point number,string: Unicode character sequence
 */
export type PrimitiveType = "null" | "boolean" | "int" | "long" | "float" | "double" | "string";