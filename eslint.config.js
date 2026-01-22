import { baseConfig } from "@enormora/eslint-config-base";
import { browserConfig } from "@enormora/eslint-config-browser";
import { typescriptConfig } from "@enormora/eslint-config-typescript";
import { nodeConfig, nodeConfigFileConfig } from "@enormora/eslint-config-node";
import { vitestConfig } from "@enormora/eslint-config-vitest";
import globals from "globals";

export default [
	{
		ignores: [".astro/**/*", "public/**/*", "target/**/*"]
	},
	{
		...baseConfig,
		files: ["**/*.{js,cjs,mjs,ts,mts,cts}"],
		rules: {
			...baseConfig.rules,

			"@cspell/spellchecker": "off",
			"@stylistic/quotes": ["error", "double", { avoidEscape: true }],
			"@stylistic/no-tabs": "off",
			"@stylistic/indent": [
				"error",
				"tab",
				{
					SwitchCase: 1,
					VariableDeclarator: 1,
					MemberExpression: 1
				}
			]
		}
	},
	{
		...typescriptConfig,
		files: ["**/*.ts"]
	},
	{
		files: ["**/*.ts"],
		rules: {
			"@typescript-eslint/no-magic-numbers": "off",
			"@stylistic/indent-binary-ops": "off",
			"functional/type-declaration-immutability": "off",
			"functional/prefer-immutable-types": "off",
			"import/max-dependencies": "off",
			"max-statements": "off",
			"no-void": "off"
		}
	},
	{
		...nodeConfig,
		files: ["source/start-develop.ts", "source/pages/api/**/*.ts"],
		languageOptions: {
			globals: {
				...globals.nodeBuiltin,
				RequestInit: false
			}
		}
	},
	{
		files: ["source/start-develop.ts"],
		rules: {
			"node/no-process-exit": "off",
			"unicorn/no-process-exit": "off"
		}
	},
	{
		files: ["source/**/*.ts"],
		languageOptions: { globals: globals["shared-node-browser"] }
	},
	{
		...browserConfig,
		files: ["source/**/*.{ts,tsx}"]
	},
	{
		...vitestConfig,
		files: ["**/*.test.ts"],
		rules: {
			...vitestConfig.rules,

			"@typescript-eslint/no-magic-numbers": "off",
			"@typescript-eslint/no-shadow": "off",
			"@typescript-eslint/no-unsafe-type-assertion": "off"
		}
	},
	{
		files: ["source/statistics/graphql-query.test.ts"],
		rules: {
			"@vitest/expect-expect": "off"
		}
	},
	{
		...nodeConfigFileConfig,
		files: ["astro.config.js", "eslint.config.js", "prettier.config.js", "vitest.config.js"]
	}
];
