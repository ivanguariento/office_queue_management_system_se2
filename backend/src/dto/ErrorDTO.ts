export interface ErrorDTO {
  code: number;
  name?: string;
  message?: string;
}

/**
 * Check if a given object implements the ErrorDTO interface.
 */
export function instanceOfErrorDTO(value: object): value is ErrorDTO {
  if (!("code" in value) || value["code"] === undefined) return false;
  return true;
}

export function ErrorDTOFromJSON(json: any): ErrorDTO {
  return ErrorDTOFromJSONTyped(json);
}

export function ErrorDTOFromJSONTyped(
  json: any,
): ErrorDTO {
  if (json == null) {
    return json;
  }
  return {
    code: json["code"],
    name: json["name"] == null ? undefined : json["name"],
    message: json["message"] == null ? undefined : json["message"]
  };
}

export function ErrorDTOToJSON(json: any): ErrorDTO {
  return ErrorDTOToJSONTyped(json);
}

export function ErrorDTOToJSONTyped(
  value?: ErrorDTO | null,
): any {
  if (value == null) {
    return value;
  }

  return {
    code: value["code"],
    name: value["name"],
    message: value["message"]
  };
}

export function createErrorDTO(
  code: number,
  message?: string,
  name?: string
): ErrorDTO {
  return {
    code,
    name,
    message,
  } as ErrorDTO;
}