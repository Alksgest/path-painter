import { Express } from "express";

export type ConstructorType<T = Record<string, any>> = new (
  ...args: unknown[]
) => T;

export type UnknownFunction<ReturnType = unknown> = (
  ...args: unknown[]
) => ReturnType;

export interface ControllerBaseConfig {
  cors?: boolean | string;
  controllers?: ConstructorType[];
  errorHandler?: UnknownFunction<void>;
}

export type RestHandler = {
  [key: string]: (
    app: Express,
    path: string,
    controller: ConstructorType,
    functionName: string,
  ) => void;
};
