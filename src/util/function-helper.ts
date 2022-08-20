import { restMethodSwitchObj } from "../types/symbols";

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

export function getRestKeys(keys: symbol[]) {
  const mapKeys = Object.keys(restMethodSwitchObj);
  return keys.filter((key) => {
    const has = mapKeys.find((el) => {
      const symbol = restMethodSwitchObj[key.description || ""];
      return !!symbol;
    });
    return has;
  });
}

export function getRestKey(keys: symbol[]) {
  const mapKeys = Object.keys(restMethodSwitchObj);
  return keys.find((key) => {
    const has = mapKeys.find((el) => {
      const symbol = restMethodSwitchObj[key.description || ""];
      return !!symbol;
    });
    return has;
  });
}
