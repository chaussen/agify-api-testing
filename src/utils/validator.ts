import { expect } from "chai";
import {
  ContractField,
  ValueTypes,
  RawCommonResponseBody,
  CommonResponseFieldTypes,
} from "../types";
import { Debugger } from "./debug";

// This class is responsible for validating the contract of the API response
export class ContractValidator {
  private static validationCommonResponseFieldType = (
    field: CommonResponseFieldTypes,
    response: RawCommonResponseBody,
    expected: ValueTypes,
  ): void => {
    expected === "null"
      ? expect(response[field]).to.be.null
      : expect(response[field]).to.be.a(
          expected as string,
          `Expected ${field} to be a '${expected}' but got ${typeof response[field]}`,
        );
  };
  private static validationCommonResponseFieldValue = (
    field: CommonResponseFieldTypes,
    response: RawCommonResponseBody,
    expected: ValueTypes,
  ): void => {
    expect(response[field]).to.equal(
      expected,
      `Expected ${field} to equal '${expected}' but got '${response[field]}'`,
    );
    // Add switch case for different value checks if needed
  };

  static validateContract(
    response: RawCommonResponseBody,
    expectedContract: ContractField[],
  ): void {
    expectedContract.forEach((contract) => {
      const { field, validation, expected } = contract;
      const fieldWithType = field as CommonResponseFieldTypes;
      Debugger.log(
        `Validating field: ${field} with validation: ${validation} and expected value: ${expected}`,
      );
      validation === "is"
        ? ContractValidator.validationCommonResponseFieldType(
            fieldWithType,
            response,
            expected,
          )
        : ContractValidator.validationCommonResponseFieldValue(
            fieldWithType,
            response,
            expected,
          );
    });
    // Add more validation logic if needed. e.g. optional, range
  }

  static validateArrayContract(
    responseArray: RawCommonResponseBody[],
    expectedContract: ContractField[],
  ): void {
    expect(responseArray).to.be.an("array");
    responseArray.forEach((item, index) => {
      Debugger.log(
        `Validating item at index ${index} with contract: ${JSON.stringify(
          expectedContract,
        )}`,
      );
      ContractValidator.validateContract(item, expectedContract);
    });
  }
}
