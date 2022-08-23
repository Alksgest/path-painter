export interface ControllerBaseConfig {
  cors?: boolean | string;
  controllers?: Function[];
  errorHandler?: Function;
}
