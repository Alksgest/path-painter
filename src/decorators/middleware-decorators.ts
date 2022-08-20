import "reflect-metadata";
import {
  getMetadataKey,
  restMethodSwitchObj,
  useBeforeMetadataKey,
} from "../types/symbols";

export function UseBefore(): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    // const ctor = target.constructor;
    // console.log("ctor: ", ctor);

    // const ctorKeys = Reflect.getMetadataKeys(ctor.prototype);
    // console.log("ctorKeys: ", ctorKeys);

    // const funcKeys: symbol[] = Reflect.getMetadataKeys(descriptor.value);
    // const restMethodKey = funcKeys[0].description || "";

    // const methodPath = Reflect.getMetadata(
    //   restMethodSwitchObj[restMethodKey],
    //   descriptor.value
    // );

    Reflect.defineMetadata(useBeforeMetadataKey, "", descriptor.value);
  };
}
