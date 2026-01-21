import type { FunctionComponent, PropsWithChildren } from "react";
import styles from "./StatisticsCite.module.scss";

type Properties = {
	readonly description: string;
};

export const StatisticsCite: FunctionComponent<PropsWithChildren<Properties>> = (properties) => {
	const { description, children } = properties;

	return (
		<cite aria-label={description} className={styles.cite}>
			{children}
		</cite>
	);
};
