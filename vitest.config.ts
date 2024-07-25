/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
	test: {
		coverage: {
			reportsDirectory: "./target/coverage",
			exclude: ["astro.config.ts", "postcss.config.cjs", "tailwind.config.cjs", "target/"],
		},
	},
});
