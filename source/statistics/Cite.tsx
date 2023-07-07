import type { FunctionComponent, PropsWithChildren } from "react";

interface CiteProperties {
	readonly ariaLabel: string;
}

export const Cite: FunctionComponent<PropsWithChildren<CiteProperties>> = (properties) => {
	return (
		<cite aria-label={properties.ariaLabel} className="text-lg text-dracula-green font-bold not-italic mt-2">
			{properties.children}
		</cite>
	);
};
