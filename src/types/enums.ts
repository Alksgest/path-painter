export enum DataType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  // Object = "object",
  Date = "date",
}

export type DecoratorParamsType = {
  isArray?: boolean;
  isOptional?: boolean;
  notStrictTypeCheck?: boolean;
};

export enum InjectionType {
  Singleton = "singleton",
  Transient = "transient",
}
