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
	return {
		defaultOpenGraphUrl: parameters.defaultOpenGraphUrl,
		...(isString(parameters.canonicalUrl) && { canonicalUrl: parameters.canonicalUrl }),
		...(isString(parameters.openGraphUrl) && { openGraphUrl: parameters.openGraphUrl })
	};
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
