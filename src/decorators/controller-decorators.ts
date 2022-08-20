import "reflect-metadata";
import { controllerMetadataKey } from "../types/symbols";

export function Controller(basePath: string = "/"): ClassDecorator {
  return function <TFunction extends Function>(target: TFunction) {
    Reflect.defineMetadata(controllerMetadataKey, basePath, target);
    return target;
  };
}
