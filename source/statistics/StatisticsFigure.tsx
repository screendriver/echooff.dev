import type { FunctionComponent, PropsWithChildren } from "react";
import styles from "./StatisticsFigure.module.scss";

type Properties = {
	readonly description: string;
};

export const StatisticsFigure: FunctionComponent<PropsWithChildren<Properties>> = (properties) => {
	const { description, children } = properties;

	return (
		<div className={styles.div}>
			<p className={styles.p}>{description}</p>

			{children}
		</div>
	);
};
