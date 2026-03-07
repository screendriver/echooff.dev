type FailedRequestValidationResult = {
	readonly isValid: false;
	readonly errorMessage: string;
};

type SuccessfulRequestValidationResult = {
	readonly isValid: true;
};

type RequestValidationResult = FailedRequestValidationResult | SuccessfulRequestValidationResult;

function createSuccessfulValidationResult(): RequestValidationResult {
	return { isValid: true };
}

function createFailedValidationResult(errorMessage: string): RequestValidationResult {
	return {
		isValid: false,
		errorMessage
	};
}

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
		return createFailedValidationResult(`The ${headerName} header must be ${expectedHeaderValue}.`);
	}

	return createSuccessfulValidationResult();
}

function validatePresentHeader(request: Request, headerName: string): RequestValidationResult {
	const headerValue = readHeaderValue(request, headerName);

	if (headerValue === null || headerValue.length === 0) {
		return createFailedValidationResult(`The ${headerName} header is required.`);
	}

	return createSuccessfulValidationResult();
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function validateGraphQlRequestBody(requestBody: unknown): RequestValidationResult {
	if (!isRecord(requestBody)) {
		return createFailedValidationResult("The request body must contain a query string.");
	}

	if (typeof requestBody.query !== "string") {
		return createFailedValidationResult("The request body must contain a query string.");
	}

	return createSuccessfulValidationResult();
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

	if (!acceptHeaderValidationResult.isValid) {
		return acceptHeaderValidationResult;
	}

	const authorizationHeaderValidationResult = validatePresentHeader(request, "authorization");

	if (!authorizationHeaderValidationResult.isValid) {
		return authorizationHeaderValidationResult;
	}

	const userAgentHeaderValidationResult = validatePresentHeader(request, "user-agent");

	if (!userAgentHeaderValidationResult.isValid) {
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

	if (!contentTypeHeaderValidationResult.isValid) {
		return contentTypeHeaderValidationResult;
	}

	try {
		await request.formData();
	} catch {
		return createFailedValidationResult("The request body must be form encoded.");
	}

	return createSuccessfulValidationResult();
}
