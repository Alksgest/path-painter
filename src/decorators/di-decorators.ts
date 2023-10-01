import "reflect-metadata";

import { singletonMetadataKey, transientMetadataKey } from "../types/symbols";
import { InjectionType } from "../types/enums";
import { DependencyInjectionError } from "../types";

export function Injectable(type: InjectionType): ClassDecorator {
  switch (type) {
    case InjectionType.Singleton:
      return Singleton;
    case InjectionType.Transient:
      return Transient;
    default:
      throw new DependencyInjectionError(
        `Invalid injection type ${type} was provided`,
      );
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function Singleton<TFunction extends Function>(target: TFunction) {
  Reflect.defineMetadata(singletonMetadataKey, "", target);
  return target;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function Transient<TFunction extends Function>(target: TFunction) {
  Reflect.defineMetadata(transientMetadataKey, "", target);
  return target;
}
