import { Express } from "express";

export type ConstructorType<T = unknown> = new (...args: any[]) => T;

export type UnknownFunction<ReturnType = unknown> = (
  ...args: unknown[]
) => ReturnType;

export type RestMethod = "get" | "post" | "put" | "delete";

export type RestHandler = {
  [key in RestMethod]: (
    app: Express,
    path: string,
    controller: ConstructorType,
    functionName: string,
  ) => void;
};
