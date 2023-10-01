import "reflect-metadata";
import { singletonMetadataKey, transientMetadataKey } from "../types/symbols";

export function Singleton(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function <TFunction extends Function>(target: TFunction) {
    Reflect.defineMetadata(singletonMetadataKey, "", target);
    return target;
  };
}

export function Transient(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function <TFunction extends Function>(target: TFunction) {
    Reflect.defineMetadata(transientMetadataKey, "", target);
    return target;
  };
}
