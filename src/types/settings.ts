import { Express } from "express";

export type ConstructorType<T = Record<string, any>> = new (
  ...args: unknown[]
) => T;

export interface ControllerBaseConfig {
  cors?: boolean | string;
  controllers?: ConstructorType[];
  errorHandler?: Function;
}

export type RestHandler = {
  [key: string]: (
    app: Express,
    path: string,
    controller: ConstructorType,
    functionName: string
  ) => void;
};
