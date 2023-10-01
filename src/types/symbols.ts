export const bodyDataMetadataKey = Symbol("bodyData");
export const headerDataMetadataKey = Symbol("headersData");
export const queryDataMetadataKey = Symbol("queryData");
export const paramDataMetadataKey = Symbol("paramData");

export const getMetadataKey = Symbol("get");
export const postMetadataKey = Symbol("post");
export const putMetadataKey = Symbol("put");
export const deleteMetadataKey = Symbol("delete");

export const requestMetadataKey = Symbol("request");
export const bodyMetadataKey = Symbol("body");
export const headerMetadataKey = Symbol("header");
export const queryMetadataKey = Symbol("query");
export const paramMetadataKey = Symbol("param");

export const controllerMetadataKey = Symbol("controller");

export const useBeforeMetadataKey = Symbol("useBefore");
export const useAfterMetadataKey = Symbol("useAfter");

export const singletonMetadataKey = Symbol("singleton");
export const transientMetadataKey = Symbol("transient");

export const emptySymbol = Symbol();

export const restMethodSwitchObj: { [key: string]: symbol } = {
  get: getMetadataKey,
  post: postMetadataKey,
  put: putMetadataKey,
  delete: deleteMetadataKey,
};

export const middlewareSwitchObj: { [key: string]: symbol } = {
  useBefore: useBeforeMetadataKey,
  useAfter: useAfterMetadataKey,
};
