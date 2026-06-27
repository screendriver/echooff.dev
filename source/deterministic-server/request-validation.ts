import { isNonEmptyString, isPlainObject, isString } from "@sindresorhus/is";
import { err, isErr, ok, type Result } from "true-myth/result";

export type RequestValidationResult = Result<void, TypeError>;

function readHeaderValue(request: Request, headerName: string): string | null {
	return request.headers.get(headerName);
}

function validateRequiredHeaderValue(
	request: Request,
	headerName: string,
	expectedHeaderValue: string
): RequestValidationResult {
	const actualHeaderValue = readHeaderValue(request, headerName);

	if (actualHeaderValue !== expectedHeaderValue) {
		return err(new TypeError(`The ${headerName} header must be ${expectedHeaderValue}.`));
	}

	return ok(undefined);
}

function validatePresentHeader(request: Request, headerName: string): RequestValidationResult {
	const headerValue = readHeaderValue(request, headerName);

	if (!isNonEmptyString(headerValue)) {
		return err(new TypeError(`The ${headerName} header is required.`));
	}

	return ok(undefined);
}

function validateGraphQlRequestBody(requestBody: unknown): RequestValidationResult {
	if (!isPlainObject(requestBody)) {
		return err(new TypeError("The request body must contain a query string."));
	}

	if (!isString(requestBody.query)) {
		return err(new TypeError("The request body must contain a query string."));
	}

	return ok(undefined);
}

async function parseJsonRequestBody(request: Request): Promise<unknown> {
	try {
		return await request.json();
	} catch {
		return undefined;
	}
}

export async function validateGraphQlRequest(request: Request): Promise<RequestValidationResult> {
	const acceptHeaderValidationResult = validateRequiredHeaderValue(
		request,
		"accept",
		"application/vnd.github.v3+json"
	);

	if (isErr(acceptHeaderValidationResult)) {
		return acceptHeaderValidationResult;
	}

	const authorizationHeaderValidationResult = validatePresentHeader(request, "authorization");

	if (isErr(authorizationHeaderValidationResult)) {
		return authorizationHeaderValidationResult;
	}

	const userAgentHeaderValidationResult = validatePresentHeader(request, "user-agent");

	if (isErr(userAgentHeaderValidationResult)) {
		return userAgentHeaderValidationResult;
	}

	const requestBody = await parseJsonRequestBody(request);

	return validateGraphQlRequestBody(requestBody);
}

export async function validateContactFormRequest(request: Request): Promise<RequestValidationResult> {
	const contentTypeHeaderValidationResult = validateRequiredHeaderValue(
		request,
		"content-type",
		"application/x-www-form-urlencoded"
	);

	if (isErr(contentTypeHeaderValidationResult)) {
		return contentTypeHeaderValidationResult;
	}

	try {
		await request.formData();
	} catch {
		return err(new TypeError("The request body must be form encoded."));
	}

	return ok(undefined);
}
