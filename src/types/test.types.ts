import { CountryId } from "./common.types";
import { AgifyApiClient } from "../utils/api";
import { AgifyErrorResponse, AgifyCommonResponse } from "./api.types";

export interface ApiContext {
  baseUrl: string;
  client: AgifyApiClient | null;
  response: unknown;
  apiKey?: string;
  currentRequestName?: string;
  currentRequestCountry?: CountryId;
}

export type ValidationType = "equal" | "is";
export type ValueTypes = "string" | "number" | "null" | string | number;
export type CommonResponseFieldTypes = keyof AgifyCommonResponse;
export type AllFieldTypes =
  | keyof AgifyCommonResponse
  | keyof AgifyErrorResponse;

export type InvalidRequestType =
  | "no_params"
  | "empty_name"
  | "whitespace_name"
  | "invalid_api_key"
  | "error_401_param"
  | "error_402_param"
  | "error_429_param"
  | "error_429_low_param"
  | "error_401_apikey"
  | "error_402_apikey"
  | "error_429_apikey"
  | "error_401_name"
  | "error_402_name"
  | "error_429_name";

export interface ContractField {
  field: AllFieldTypes;
  validation: ValidationType;
  expected: ValueTypes;
}
