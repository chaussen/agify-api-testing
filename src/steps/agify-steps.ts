import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "chai";
import { AxiosError } from "axios";
import { ContractValidator } from "../utils/validator";
import { Debugger } from "../utils/debug";
import { config } from "../config/environment";
import {
  ApiContext,
  ContractField,
  CountryId,
  InvalidRequestType,
  AgifyErrorResponse,
  RawCommonResponse,
  RawSuccessArrayResponse,
} from "../types";
import { AgifyApiClient } from "../utils/api";

const context: ApiContext = {
  baseUrl: "",
  client: null,
  response: {},
};

const errorHandler = (error: unknown): void => {
  const axiosError = error as AxiosError<AgifyErrorResponse, unknown>;
  if (axiosError.response) {
    Debugger.logError(axiosError, "API ERROR RESPONSE");
    context.response = axiosError.response;
  } else {
    Debugger.log(`API request failed: ${axiosError.message}`);
    throw new Error(`API request failed: ${axiosError.message}`);
  }
};

const dataTableHandler = (dataTable: DataTable): ContractField[] => {
  return dataTable.hashes().map((row) => ({
    field: row.field,
    validation: row.validation,
    expected: row.expected,
  })) as ContractField[];
};

Given("the agify API is available at base url", () => {
  context.baseUrl = config.baseUrl;
  context.apiKey = process.env.API_KEY ? process.env.API_KEY : "";
  context.client = new AgifyApiClient(context.baseUrl);
});

When(
  "I request age estimation for name {string} with {string} country:",
  async (name: string, country: CountryId) => {
    context.currentRequestName = name;
    context.currentRequestCountry = country;
    if (context.client === null) {
      throw new Error("API client is not initialized");
    }
    try {
      context.response = await context.client.getAgeForName(
        name,
        context.apiKey,
        context.currentRequestCountry,
      );
    } catch (error) {
      errorHandler(error);
    }
    Debugger.logResponse(
      context.response as RawCommonResponse,
      `NAME ${name} with ${country} COUNTRY RESPONSE`,
    );
  },
);

When(
  "I request age predictions for the following names with {string} country:",
  async (country: CountryId, dataTable: DataTable) => {
    const names = dataTable.hashes().map((row) => row.name);
    context.currentRequestName = names.join(", ");
    context.currentRequestCountry = country;
    if (context.client === null) {
      throw new Error("API client is not initialized");
    }
    try {
      context.response = await context.client.getAgeForNames(
        names,
        context.apiKey,
        context.currentRequestCountry,
      );
      Debugger.logResponse(
        context.response as RawCommonResponse,
        `NAMES ${names.join(", ")} RESPONSE`,
      );
    } catch (error) {
      errorHandler(error);
    }
  },
);

When(
  "I make an invalid request with {string}",
  async (invalidInput: InvalidRequestType) => {
    if (context.client === null) {
      throw new Error("API client is not initialized");
    }
    let url = context.baseUrl;

    switch (invalidInput) {
      case "no_params":
        url += "";
        break;
      case "empty_name":
        url += "?name=";
        break;
      case "whitespace_name":
        url += "?name=%20";
        break;
      case "invalid_api_key":
        url += "?name=john&apikey=invalid-key";
        break;
      case "error_402_param":
        url += "?name=john&apikey=inactive-subscription";
        break;
      case "error_429_param":
        url += "?name=john&apikey=limit-reached";
        break;
      case "error_429_low_param":
        url += "?name=john&apikey=limit-too-low";
        break;
      default:
        url += `?${invalidInput}`;
    }
    const response = await context.client.makeRawRequest(url);
    context.response = response;
  },
);

Then("the response status should be {int}", (expectedStatus: number) => {
  const response = context.response as RawCommonResponse;
  Debugger.logResponse(response, `RESPONSE STATUS CHECK`);
  expect(response.status).to.equal(expectedStatus);
});

Then(
  "the response should match the expected contract:",
  (dataTable: DataTable) => {
    const expectedContract = dataTableHandler(dataTable);
    const response = context.response as RawCommonResponse;
    ContractValidator.validateContract(response.data, expectedContract);
  },
);

Then(
  "the response should be an array with {int} items",
  (expectedLength: number) => {
    const response = context.response as RawCommonResponse;
    expect(response.data).to.be.an("array");
    expect(response.data).to.have.lengthOf(expectedLength);
  },
);

Then(
  "each array item should match the expected contract:",
  (dataTable: DataTable) => {
    const expectedContract = dataTableHandler(dataTable);
    const response = context.response as RawSuccessArrayResponse;
    ContractValidator.validateArrayContract(
      response.data,
      expectedContract as ContractField[],
    );
  },
);
