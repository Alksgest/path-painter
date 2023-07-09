import "reflect-metadata";
import { controllerMetadataKey } from "../types/symbols";

export function Controller(basePath = "/"): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function <TFunction extends Function>(target: TFunction) {
    Reflect.defineMetadata(controllerMetadataKey, basePath, target);
    return target;
  };
}
