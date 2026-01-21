import type { FunctionComponent } from "react";
import { StatisticsFigure } from "./StatisticsFigure.js";
import { StatisticsCite } from "./StatisticsCite.js";

type Properties = {
	readonly yearsOfExperience: number;
};

export const YearsInBusiness: FunctionComponent<Properties> = (properties) => {
	const { yearsOfExperience } = properties;

	return (
		<StatisticsFigure description="Experience">
			<StatisticsCite description="Years of experience">
				{yearsOfExperience} {"yrs"}
			</StatisticsCite>
		</StatisticsFigure>
	);
};
