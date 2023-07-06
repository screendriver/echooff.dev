/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
	test: {
		coverage: {
			provider: "c8",
			all: true,
			extension: [".ts"],
			include: ["source/**/*"],
			reporter: ["lcov", "text-summary", "clover"],
			reportsDirectory: "./target/coverage",
		},
		threads: false,
	},
});
