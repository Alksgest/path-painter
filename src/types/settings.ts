export type Constructor<T = unknown> = { new (): T };

export interface ControllerBaseConfig {
  cors?: boolean | string;
  controllers?: Constructor[];
  errorHandler?: Function;
}
