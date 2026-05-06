import { isString } from "@sindresorhus/is";

export type OpenGraphUrlResolutionInput = {
	readonly canonicalUrl: string | undefined;
	readonly defaultOpenGraphUrl: string;
	readonly openGraphUrl: string | undefined;
};

type NormalizedOpenGraphUrlResolutionInput = {
	readonly canonicalUrl?: string;
	readonly defaultOpenGraphUrl: string;
	readonly openGraphUrl?: string;
};

function createOpenGraphUrlResolutionInput(
	parameters: OpenGraphUrlResolutionInput
): NormalizedOpenGraphUrlResolutionInput {
	let openGraphUrlResolutionInput: NormalizedOpenGraphUrlResolutionInput = {
		defaultOpenGraphUrl: parameters.defaultOpenGraphUrl
	};

	if (isString(parameters.canonicalUrl)) {
		openGraphUrlResolutionInput = {
			canonicalUrl: parameters.canonicalUrl,
			defaultOpenGraphUrl: parameters.defaultOpenGraphUrl
		};
	}

	if (isString(parameters.openGraphUrl)) {
		openGraphUrlResolutionInput = {
			defaultOpenGraphUrl: parameters.defaultOpenGraphUrl,
			openGraphUrl: parameters.openGraphUrl
		};

		if (isString(parameters.canonicalUrl)) {
			openGraphUrlResolutionInput = {
				canonicalUrl: parameters.canonicalUrl,
				defaultOpenGraphUrl: parameters.defaultOpenGraphUrl,
				openGraphUrl: parameters.openGraphUrl
			};
		}
	}

	return openGraphUrlResolutionInput;
}

export function resolveOpenGraphUrl(parameters: OpenGraphUrlResolutionInput): string {
	const openGraphUrlResolutionInput = createOpenGraphUrlResolutionInput(parameters);

	if (isString(openGraphUrlResolutionInput.openGraphUrl)) {
		return openGraphUrlResolutionInput.openGraphUrl;
	}

	if (isString(openGraphUrlResolutionInput.canonicalUrl)) {
		return openGraphUrlResolutionInput.canonicalUrl;
	}

	return openGraphUrlResolutionInput.defaultOpenGraphUrl;
}
