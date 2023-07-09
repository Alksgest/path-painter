import { DecoratorParamsType } from "../types/enums";
import { RequestError } from "../types/errors";
import { PropertyMetadata, ValidationFunction } from "../types/metadata";
import { ConstructorType } from "../types/settings";
import { isNullOrUndefined } from "../util";

export interface ValidationFunctionsSwitch<T> {
  [key: string]: ValidationFunction<T>;
}

const validationFunctions: ValidationFunctionsSwitch<unknown> = {
  string: (value: unknown, fieldName: string, params?: DecoratorParamsType) => {
    if (params?.isOptional && !value) {
      return undefined;
    }

    if (!value) {
      throw new RequestError(
        400,
        `Value of ${fieldName} can not be null or undefined.`,
      );
    }

    const isString = typeof value === "string";

    if (!params?.notStrictTypeCheck && !isString) {
      throw new RequestError(
        400,
        `Value of field ${fieldName} was ${value} that is not a string.`,
      );
    }

    return value.toString();
  },
  number: (value: unknown, fieldName: string, params?: DecoratorParamsType) => {
    if (params?.isOptional && !value) {
      return undefined;
    }

    if (isNullOrUndefined(value)) {
      //TODO: create errors hierarchy
      throw new RequestError(
        400,
        `Value of ${fieldName} can not be null or undefined.`,
      );
    }

    const isNumber = typeof value === "number";

    if (!params?.notStrictTypeCheck && !isNumber) {
      throw new RequestError(
        400,
        `Value of field ${fieldName} was ${value} that is not a number.`,
      );
    }

    const castedValue = Number(value);

    if (isNaN(castedValue)) {
      throw new RequestError(
        400,
        `Value of ${fieldName} was ${value} and can not be converted to number.`,
      );
    }

    return castedValue;
  },
  boolean: (
    value: unknown,
    fieldName: string,
    params?: DecoratorParamsType,
  ) => {
    const isBoolean = typeof value === "boolean";

    if (!params?.notStrictTypeCheck && !isBoolean) {
      throw new RequestError(
        400,
        `Value of field ${fieldName} was ${value} that is not a boolean.`,
      );
    }

    return !!value;
  },
  //   Date: <T>(value: T, fieldName: string, params?: TypeDecoratorParams) =>
  //     void 0,
};

export function validateBodyModel(
  initialModel: Record<string, unknown>,
  ctorFunc: ConstructorType,
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
      ctorFunc.prototype,
    );

    obj[prop] = validationFunctions[metadata.dataType](
      initialValue,
      prop,
      metadata.params,
    );
  }

  return obj;
}
