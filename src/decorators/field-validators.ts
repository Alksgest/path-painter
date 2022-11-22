import { TypeDecoratorParams } from "../types/enums";
import { RequestError } from "../types/errors";
import { PropertyMetadata } from "../types/metadata";
import { ConstructorType } from "../types/settings";
import { validationParamsMetadataKey } from "../types/symbols";
import { isNullOrUndefined } from "../util";

const validationFunctions: {
  [key: string]: <T>(
    value: any,
    fieldName: string,
    params?: TypeDecoratorParams
  ) => T | undefined;
} = {
  string: <T>(value: any, fieldName: string, params?: TypeDecoratorParams) => {
    if (params?.isOptional && !value) {
      return undefined;
    }

    if (!value) {
      throw new RequestError(
        400,
        `Value of ${fieldName} can not be null or undefined.`
      );
    }

    const isString = typeof value === "string";

    if (!params?.notStrictTypeCheck && !isString) {
      throw new RequestError(
        400,
        `Value of field ${fieldName} was ${value} that is not a string.`
      );
    }

    return (value as any).toString() as T;
  },
  number: <T>(value: any, fieldName: string, params?: TypeDecoratorParams) => {
    if (params?.isOptional && !value) {
      return undefined;
    }

    if (isNullOrUndefined(value)) {
      //TODO: create errors hierarchy
      throw new RequestError(
        400,
        `Value of ${fieldName} can not be null or undefined.`
      );
    }

    const isNumber = typeof value === "number";

    if (!params?.notStrictTypeCheck && !isNumber) {
      throw new RequestError(
        400,
        `Value of field ${fieldName} was ${value} that is not a number.`
      );
    }

    const castedValue = Number(value);

    if (isNaN(castedValue)) {
      throw new RequestError(
        400,
        `Value of ${fieldName} was ${value} and can not be converted to number.`
      );
    }

    return castedValue as unknown as T;
  },
  boolean: <T>(value: T, fieldName: string, params?: TypeDecoratorParams) => {
    const isBoolean = typeof value === "boolean";

    if (!params?.notStrictTypeCheck && !isBoolean) {
      throw new RequestError(
        400,
        `Value of field ${fieldName} was ${value} that is not a boolean.`
      );
    }

    return !!value as unknown as T;
  },
  //   Date: <T>(value: T, fieldName: string, params?: TypeDecoratorParams) =>
  //     void 0,
};

export function validateBodyModel(
  initialModel: Record<string, unknown>,
  ctorFunc: ConstructorType
) {
  const props: string[] = Reflect.getMetadataKeys(ctorFunc.prototype);

  if (!props.length) {
    return initialModel;
  }

  const obj = new ctorFunc();

  for (const prop of props) {
    const initialValue = initialModel[prop];
    const metadata: PropertyMetadata = Reflect.getMetadata(
      prop,
      ctorFunc.prototype
    );

    const validated = validationFunctions[metadata.dataType](
      initialValue,
      prop,
      metadata.params
    );

    obj[prop] = validated;
  }

  return obj;
}
