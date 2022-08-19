import "reflect-metadata";

export const controllerMetadataKey = Symbol("Controller");

export function Controller(basePath: string = "/"): ClassDecorator {
  return function <TFunction extends Function>(target: TFunction) {
    Reflect.defineMetadata(controllerMetadataKey, basePath, target);
    return target;
  };
}
