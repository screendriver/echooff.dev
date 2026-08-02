import { isEmptyString } from "@sindresorhus/is";
import { just, nothing, type Maybe } from "true-myth/maybe";

export type DevelopmentReactionProxyOptions = {
	readonly changeOrigin: true;
	readonly rewrite: (requestPath: string) => string;
	readonly target: string;
};

export type DevelopmentServerProxy = {
	readonly "/api/reactions": DevelopmentReactionProxyOptions;
};

export type CreateDevelopmentServerProxyOptions = {
	readonly deterministicServerUrl: Maybe<string>;
};

function preserveDevelopmentProxyRequestPath(requestPath: string): string {
	return requestPath;
}

export function createDevelopmentServerProxy(
	createDevelopmentServerProxyOptions: CreateDevelopmentServerProxyOptions
): Maybe<DevelopmentServerProxy> {
	const { deterministicServerUrl } = createDevelopmentServerProxyOptions;

	if (deterministicServerUrl.isNothing || isEmptyString(deterministicServerUrl.value)) {
		return nothing();
	}

	return just({
		"/api/reactions": {
			changeOrigin: true,
			rewrite: preserveDevelopmentProxyRequestPath,
			target: deterministicServerUrl.value
		}
	});
}
