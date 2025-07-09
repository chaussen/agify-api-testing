import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  AgifyErrorResponse,
  AgifyOptionalParams,
  AgifyRequestSingleParams,
  AgifySuccessResponse,
  CountryId,
} from "../types";
import { Debugger } from "./debug";

export class AgifyApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private constructOptionalParameters = (
    countryId?: string,
    apiKey?: string,
  ): AgifyOptionalParams => {
    const params: AgifyOptionalParams = {};
    if (countryId && countryId !== "DEFAULT") {
      params.country_id = countryId;
    }
    if (apiKey && apiKey.trim() !== "") {
      params.api_key = apiKey;
    }
    return params;
  };

  async getAgeForName(
    name: string,
    apiKey?: string,
    countryId: CountryId = "DEFAULT",
  ): Promise<AxiosResponse<AgifySuccessResponse, unknown>> {
    const params: AgifyRequestSingleParams = { name: encodeURIComponent(name) };
    const optionalParams = this.constructOptionalParameters(countryId, apiKey);
    const url = `?name=${params.name}${optionalParams.country_id ? `&country_id=${optionalParams.country_id}` : ""}${optionalParams.api_key ? `&api_key=********` : ""}`;
    Debugger.logRequest("GET", url);
    return await this.client.get("/", {
      params: { ...params, ...optionalParams },
    });
  }

  async getAgeForNames(
    names: string[],
    apiKey?: string,
    countryId: CountryId = "DEFAULT",
  ): Promise<AxiosResponse<AgifySuccessResponse, unknown>> {
    const namesParam = names
      .map((name) => `name[]=${encodeURIComponent(name)}`)
      .join("&");
    const endpoint = `?${namesParam}`;
    Debugger.logRequest("GET", endpoint);
    const optionalParams = this.constructOptionalParameters(countryId, apiKey);
    return await this.client.get(endpoint, { params: optionalParams });
  }

  async makeRawRequest(
    url: string,
  ): Promise<
    AxiosResponse<AgifySuccessResponse | AgifyErrorResponse, unknown>
  > {
    // disable error code failure for debugging
    Debugger.logRequest("GET", url);
    return await this.client.get(url, {
      validateStatus: (status) => status >= 200 && status < 500, // Accept all 2xx and 4xx responses
    });
  }
}
