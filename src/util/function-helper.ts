import {
  emptySymbol,
  middlewareSwitchObj,
  restMethodSwitchObj,
  useAfterMetadataKey,
  useBeforeMetadataKey,
} from "../types/symbols";

export function getFunctionArgumentsList(func: string): string[] {
  const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
  const ARGUMENT_NAMES = /([^\s,]+)/g;

  const fnStr = func.toString().replace(STRIP_COMMENTS, "");
  const result =
    fnStr
      .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
      .match(ARGUMENT_NAMES) || [];

  return result;
}

export function getMiddlewareKeys(keys: symbol[]) {
  const mapKeys = Object.keys(middlewareSwitchObj);
  return keys.filter((key) => {
    const has = mapKeys.find((el) => {
      const symbol = middlewareSwitchObj[key.description || ""];
      return !!symbol;
    });
    return has;
  });
}

export function getUseBeforeKey(keys: symbol[]): symbol {
  const key = middlewareSwitchObj[useBeforeMetadataKey.description!];
  return keys.includes(key) ? key : emptySymbol;
}

export function getUseAfterKey(keys: symbol[]): symbol {
  const key = middlewareSwitchObj[useAfterMetadataKey.description!];
  return keys.includes(key) ? key : emptySymbol;
}

export function getRestKey(keys: symbol[]): symbol {
  return (
    keys.find((key) => {
      const symbol = restMethodSwitchObj[key.description || ""];
      return !!symbol;
    }) || emptySymbol
  );
}
