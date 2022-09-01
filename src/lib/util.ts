import _ from "lodash";

export function parseJsonString(str: string): string | undefined {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

export function valueToString(value: any): string {
  if (_.isEqual(value, {})) {
    return "{ }";
  } else if (_.isEqual(value, [])) {
    return "[ ]";
  }
  return _.toString(value);
}