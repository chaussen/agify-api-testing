import * as dotenv from "dotenv";
dotenv.config();
export const config = {
  baseUrl: process.env.BASE_URL || "https://api.agify.io",
  debug: process.env.DEBUG === "true",
};
