import { config } from "../config/environment";
import { RawErrorResponse, RawCommonResponse } from "../types";

export class Debugger {
  private static isDebugEnabled(): boolean {
    return config.debug;
  }

  static log(message: string): void {
    if (!this.isDebugEnabled()) return;

    console.log(`\n🔧 === DEBUG ===`);
    console.log(message);
    console.log("==================\n");
  }

  static logRequest(method: string, url: string): void {
    if (!this.isDebugEnabled()) return;

    console.log("\n🔄 === API REQUEST ===");
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log("==================\n");
  }

  static logResponse(
    response: RawCommonResponse,
    label: string = "API RESPONSE",
  ): void {
    if (!this.isDebugEnabled()) return;

    console.log(`\n✅ === ${label} ===`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
    console.log(`Data: ${JSON.stringify(response.data, null, 2)}`);
    console.log("==================\n");
  }

  static logError(error: RawErrorResponse, label: string = "API ERROR"): void {
    if (!this.isDebugEnabled()) return;
    console.error(`\n❌ === ${label} ===`);
    console.error(`Message: ${error.message}`);
    if (error.stack) {
      console.error(`Stack: ${error.stack}`);
    }
    console.error("==================\n");
  }

  static logContractValidation(
    actual: string,
    expected: string,
    label: string = "CONTRACT VALIDATION",
  ): void {
    if (!this.isDebugEnabled()) return;

    console.log(`\n🔍 === ${label} ===`);
    console.log("Expected Contract:");
    console.log(JSON.stringify(expected, null, 2));
    console.log("\nActual Response:");
    console.log(JSON.stringify(actual, null, 2));
    console.log("=".repeat(label.length + 8));
    console.log("");
  }

  static logDataTable(
    dataTable: unknown[],
    label: string = "DATA TABLE",
  ): void {
    if (!this.isDebugEnabled()) return;

    console.log(`\n📊 === ${label} ===`);
    console.table(dataTable);
    console.log("=".repeat(label.length + 8));
    console.log("");
  }

  static enableDebug(): void {
    process.env.DEBUG = "true";
    console.log("🔧 Debug mode enabled");
  }

  static disableDebug(): void {
    process.env.DEBUG = "false";
    console.log("🔧 Debug mode disabled");
  }
}
