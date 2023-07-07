import type { FunctionComponent, PropsWithChildren } from "react";

interface FigureProperties {
	readonly description: string;
}

export const Figure: FunctionComponent<PropsWithChildren<FigureProperties>> = (properties) => {
	return (
		<div className="flex flex-col justify-center items-center bg-dracula-darker rounded h-20 lg:h-28 lg:text-lg text-center">
			<p className="text-dracula-light">{properties.description}</p>

			{properties.children}
		</div>
	);
};
