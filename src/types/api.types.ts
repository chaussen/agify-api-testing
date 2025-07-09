import { AxiosError, AxiosResponse } from "axios";

export interface AgifyOptionalParams {
  country_id?: string;
  api_key?: string;
}
export type AgifyRequestSingleParams = AgifyOptionalParams & {
  name: string;
};

export interface AgifyCommonResponse {
  name: string;
  age: number | null;
  count: number;
}
export type AgifyBatchResponse = AgifyCommonResponse[];

export type AgifySuccessResponse = AgifyCommonResponse | AgifyBatchResponse;

export interface AgifyErrorResponse {
  error: string;
  message: string;
}

export type RawCommonResponse = AxiosResponse<AgifyCommonResponse, unknown>;
export type RawSuccessArrayResponse = AxiosResponse<
  AgifyBatchResponse,
  unknown
>;

// Only common response has a "data" field
export type RawCommonResponseBody = RawCommonResponse["data"];
export type RawErrorResponse = AxiosError<AgifyErrorResponse, unknown>;
