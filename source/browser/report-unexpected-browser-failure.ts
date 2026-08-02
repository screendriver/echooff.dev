export type UnexpectedFailureContext = {
	readonly feature?: string;
	readonly operation?: string;
	readonly properties?: Readonly<Record<string, boolean | number | string>>;
	readonly runtime: "browser" | "deployment_check" | "server";
};

export type UnexpectedFailureReporter = {
	readonly report: (error: unknown, context: UnexpectedFailureContext) => void;
};
