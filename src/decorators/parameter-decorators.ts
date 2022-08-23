import { DataType } from "../types/enums";
import {
  bodyMetadataKey,
  headerMetadataKey,
  paramMetadataKey,
  paramNameMetadataKey,
  queryMetadataKey,
  validationMetadataKey,
  validationSchemaMetadataKey,
} from "../types/symbols";

export function Validate() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    Reflect.defineMetadata(
      validationMetadataKey,
      parameterIndex,
      target,
      propertyKey
    );
  };
}

export function FromBody(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  let existingParams: number[] =
    Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];

  existingParams.push(parameterIndex);

  Reflect.defineMetadata(bodyMetadataKey, parameterIndex, target, propertyKey);
}

export function FromHeader(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  Reflect.defineMetadata(
    headerMetadataKey,
    parameterIndex,
    target,
    propertyKey
  );
}

export function FromQuery(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  Reflect.defineMetadata(queryMetadataKey, parameterIndex, target, propertyKey);
}

export function FromParam(name: string): ParameterDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    Reflect.defineMetadata(
      paramMetadataKey,
      parameterIndex,
      target,
      propertyKey
    );

    Reflect.defineMetadata(paramNameMetadataKey, name, target, propertyKey);
  };
}
