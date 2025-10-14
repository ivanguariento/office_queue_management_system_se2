import { removeNullAttributes } from "utils";

export interface Error {
  /**
   * HTTP code of the error
   * @type {number}
   * @memberof Error
   */
  code: number;
  /**
   * Name of the error
   * @type {string}
   * @memberof Error
   */
  name?: string;
  /**
   * Message describing the type and the cause of the error
   * @type {string}
   * @memberof Error
   */
  message?: string;
}

/**
 * Check if a given object implements the Error interface.
 */
export function instanceOfError(value: object): value is Error {
  if (!("code" in value) || value["code"] === undefined) return false;
  return true;
}

export function ErrorFromJSON(json: any): Error {
  if (json == null) {
    return json;
  }
  return {
    code: json["code"],
    name: json["name"] == null ? undefined : json["name"],
    message: json["message"] == null ? undefined : json["message"],
  };
}

export function ErrorToJSON(json: Error): any {
  if (json == null) {
    return json;
  }

  return {
    code: json["code"],
    name: json["name"],
    message: json["message"],
  };
}

export function createErrorDTO(
  code: number,
  message?: string,
  name?: string
): Error {
  return removeNullAttributes({
    code,
    name,
    message,
  }) as Error;
}
