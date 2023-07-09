import { DataType, DecoratorParamsType } from "./enums";

export interface PropertyMetadata {
  dataType: DataType;
  params?: DecoratorParamsType;
}

export interface ParamMetadata {
  position: number;
  name: string;
}

export type ValidationFunction<T> = (
  value: unknown,
  fieldName: string,
  params?: DecoratorParamsType,
) => T | undefined;
