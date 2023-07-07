import type { FunctionComponent } from "react";
import type { StatisticsStoreState } from "./statistics-store";
import { Figure } from "./Figure";
import { Cite } from "./Cite";

interface YearsInBusinessProperties {
	readonly yearsOfExperience: StatisticsStoreState["yearsOfExperience"];
}

export const YearsInBusiness: FunctionComponent<YearsInBusinessProperties> = (properties) => {
	return (
		<Figure description="Experience">
			<Cite ariaLabel="Years of experience">{properties.yearsOfExperience} yrs</Cite>
		</Figure>
	);
};
