export enum DataType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  // Object = "object",
  Date = "date",
}

export type TypeDecoratorParams = {
  isArray?: boolean;
  isOptional?: boolean;
  notStrictTypingCheck?: boolean;
};