export type FireAndForgetOperation = () => Promise<void>;

export type FireAndForgetInvoker = {
	readonly invoke: (operation: FireAndForgetOperation) => void;
};

export type CreateFireAndForgetInvokerOptions = {
	/** The reporter must not throw. */
	readonly reportFailure: (error: unknown) => void;
};

export function createFireAndForgetInvoker(
	createFireAndForgetInvokerOptions: CreateFireAndForgetInvokerOptions
): FireAndForgetInvoker {
	const { reportFailure } = createFireAndForgetInvokerOptions;

	return {
		invoke(operation): void {
			async function observeOperationFailure(): Promise<void> {
				try {
					await operation();
				} catch (error) {
					reportFailure(error);
				}
			}

			void observeOperationFailure();
		}
	};
}
