import { TypeDecoratorParams } from "../types/enums";
import { RequestError } from "../types/errors";

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
      throw new RequestError(400, `Value of ${fieldName} can not be null or undefined.`);
    }

    const isString = typeof value === "string";

    if (!params?.notStrictTypingCheck && !isString) {
      throw new RequestError(400,
        `Value of field ${fieldName} was ${value} that is not a string.`
      );
    }

    return (value as any).toString() as T;
  },
  number: <T>(value: any, fieldName: string, params?: TypeDecoratorParams) => {
    if (params?.isOptional && !value) {
      return undefined;
    }

    if (!value) {
      //TODO: create errors hierarchy
      throw new RequestError(400,`Value of ${fieldName} can not be null or undefined.`);
    }

    const isNumber = typeof value === "number";

    if (!params?.notStrictTypingCheck && !isNumber) {
      throw new RequestError(400,
        `Value of field ${fieldName} was ${value} that is not a number.`
      );
    }

    const castedValue = Number(value);

    if (isNaN(castedValue)) {
      throw new RequestError(400,
        `Value of ${fieldName} was ${value} and can not be converted to number.`
      );
    }

    return castedValue as unknown as T;
  },
  Boolean: <T>(value: T, fieldName: string, params?: TypeDecoratorParams) => {
    const isBoolean = typeof value === "boolean";

    if (!params?.notStrictTypingCheck && !isBoolean) {
      throw new RequestError(400,
        `Value of field ${fieldName} was ${value} that is not a boolean.`
      );
    }

    return !!value as unknown as T;
  },
  //   Date: <T>(value: T, fieldName: string, params?: TypeDecoratorParams) =>
  //     void 0,
};

export function validateBodyModel(
  initialModel: any,
  ctorFunc: Function,
  params?: TypeDecoratorParams
) {
  const props = Reflect.getMetadataKeys(ctorFunc.prototype);

  const obj = new (ctorFunc as any)();

  for (const prop of props) {
    const initialValue = initialModel[prop];
    const propType = Reflect.getMetadata(prop, ctorFunc.prototype);

    const validated = validationFunctions[propType](initialValue, prop, params);

    obj[prop] = initialValue;
  }

  return obj;
}
