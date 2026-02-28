import { type } from "arktype";

export const gitHubBaseUrlInputSchema = type("string.url");

export const gitHubLoginInputSchema = type("string > 0");

export const gitHubApiTokenInputSchema = type("string > 0");
