import { ConstructorType, UnknownFunction } from "../types/settings";
import {
  controllerMetadataKey,
  singletonMetadataKey,
  transientMetadataKey,
} from "../types/symbols";
import { DependencyInjectionError } from "../types";

export class DiContainer {
  private readonly singletons: Record<string, unknown> = {};

  /**
   *
   * @param type - type to create
   * @param creationContext - recording creation chain to not screw up with singletons
   */
  public get<T>(type: ConstructorType<T>, creationContext: symbol[] = []): T {
    const keys: symbol[] = Reflect.getMetadataKeys(type);

    const key = keys.find(
      (k) => k === singletonMetadataKey || k === transientMetadataKey,
    );

    if (!key) {
      throw new DependencyInjectionError(
        `${type.name} is not decorated with proper decorator and cannot be created.`,
      );
    }

    if (
      creationContext.includes(singletonMetadataKey) &&
      key !== singletonMetadataKey
    ) {
      throw new DependencyInjectionError(
        `It is impossible to create ${type.name} because it is not singleton but creation context contains singleton`,
      );
    }

    if (!!this.singletons[type.name]) {
      return this.singletons[type.name] as T;
    }

    const ctor = type.prototype["constructor"] as UnknownFunction;

    const paramTypes = Reflect.getMetadata("design:paramtypes", ctor);

    if (!paramTypes?.length) {
      creationContext.push(key);
      const object = new type() as T;

      if (key === singletonMetadataKey) {
        this.singletons[type.name] = object;
      }

      return object;
    }

    const params = [];

    for (const paramType of paramTypes) {
      creationContext.push(key);
      const obj = this.get(paramType, [...creationContext]);
      params.push(obj);
    }

    const object = new type(...params) as T;

    if (key === singletonMetadataKey) {
      this.singletons[type.name] = object;
    }

    return object;
  }
}
