import { UnknownFunction } from "./settings";

export interface AppConfig {
  cors?: boolean | string;
  controllers?: object[];
  errorHandler?: UnknownFunction<void>;
}