import { pipe, string, url, transform, minLength } from "valibot";

export const gitHubBaseUrlSchema = pipe(
	string(),
	url(),
	transform((urlString) => {
		return new URL(urlString);
	})
);

export const gitHubLoginSchema = pipe(string(), minLength(1));

export const gitHubApiTokenSchema = pipe(string(), minLength(1));
