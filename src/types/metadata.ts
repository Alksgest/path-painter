import { DataType, TypeDecoratorParams } from "./enums";

export interface PropertyMetadata {
  dataType: DataType;
  params?: TypeDecoratorParams;
}
