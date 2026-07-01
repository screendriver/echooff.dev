import { baseConfig } from "@enormora/eslint-config-base";
import { astroConfig as astroTypeScriptConfig } from "@enormora/eslint-config-astro-ts";
import { browserConfig } from "@enormora/eslint-config-browser";
import { typescriptConfig } from "@enormora/eslint-config-typescript";
import { nodeConfig, nodeConfigFileConfig } from "@enormora/eslint-config-node";
import { vitestConfig } from "@enormora/eslint-config-vitest";
import globals from "globals";

const astroAccessibilityRuleNames = [
	"astro/jsx-a11y/alt-text",
	"astro/jsx-a11y/anchor-ambiguous-text",
	"astro/jsx-a11y/anchor-has-content",
	"astro/jsx-a11y/anchor-is-valid",
	"astro/jsx-a11y/aria-activedescendant-has-tabindex",
	"astro/jsx-a11y/aria-props",
	"astro/jsx-a11y/aria-proptypes",
	"astro/jsx-a11y/aria-role",
	"astro/jsx-a11y/aria-unsupported-elements",
	"astro/jsx-a11y/autocomplete-valid",
	"astro/jsx-a11y/click-events-have-key-events",
	"astro/jsx-a11y/control-has-associated-label",
	"astro/jsx-a11y/heading-has-content",
	"astro/jsx-a11y/html-has-lang",
	"astro/jsx-a11y/iframe-has-title",
	"astro/jsx-a11y/img-redundant-alt",
	"astro/jsx-a11y/interactive-supports-focus",
	"astro/jsx-a11y/label-has-associated-control",
	"astro/jsx-a11y/lang",
	"astro/jsx-a11y/media-has-caption",
	"astro/jsx-a11y/mouse-events-have-key-events",
	"astro/jsx-a11y/no-access-key",
	"astro/jsx-a11y/no-aria-hidden-on-focusable",
	"astro/jsx-a11y/no-autofocus",
	"astro/jsx-a11y/no-distracting-elements",
	"astro/jsx-a11y/no-interactive-element-to-noninteractive-role",
	"astro/jsx-a11y/no-noninteractive-element-interactions",
	"astro/jsx-a11y/no-noninteractive-element-to-interactive-role",
	"astro/jsx-a11y/no-noninteractive-tabindex",
	"astro/jsx-a11y/no-redundant-roles",
	"astro/jsx-a11y/no-static-element-interactions",
	"astro/jsx-a11y/prefer-tag-over-role",
	"astro/jsx-a11y/role-has-required-aria-props",
	"astro/jsx-a11y/role-supports-aria-props",
	"astro/jsx-a11y/scope",
	"astro/jsx-a11y/tabindex-no-positive"
];

const disabledAstroAccessibilityRules = Object.fromEntries(
	astroAccessibilityRuleNames.map((astroAccessibilityRuleName) => {
		return [astroAccessibilityRuleName, "off"];
	})
);

const [javaScriptAndTypeScriptBaseConfig] = baseConfig;

export default [
	{
		ignores: [".astro/**/*", "public/**/*", "target/**/*"]
	},
	{
		...javaScriptAndTypeScriptBaseConfig,
		files: ["**/*.{js,cjs,mjs,ts,mts,cts}"],
		rules: {
			...javaScriptAndTypeScriptBaseConfig.rules,

			"@cspell/spellchecker": "off",
			"@stylistic/array-bracket-spacing": ["error", "never"],
			"@stylistic/no-extra-parens": "off",
			"@stylistic/quotes": ["error", "double", { avoidEscape: true }],
			"@stylistic/no-tabs": "off",
			"dprint/typescript": "off",
			"import/no-unused-modules": "off",
			"restricted-syntax/no-unnecessary-arrow-function": "off",
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
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["./*.js", "./**/*.js", "../*.js", "../**/*.js"],
							message: "Use .ts extensions for local TypeScript imports."
						}
					]
				}
			],
			"no-void": "off"
		}
	},
	...astroTypeScriptConfig,
	{
		files: ["**/*.astro"],
		rules: {
			...disabledAstroAccessibilityRules,
			"astro/no-set-html-directive": "off",
			"astro/no-unsafe-inline-scripts": "off"
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
			"@vitest/no-alias-methods": "off",
			"@vitest/no-restricted-vi-methods": [
				"error",
				{
					doMock: "Use explicit fakes instead of Vitest module mocking.",
					doUnmock: "Use explicit fakes instead of Vitest module mocking.",
					mock: "Use explicit fakes instead of Vitest module mocking.",
					mocked: "Use explicit fakes instead of Vitest module mocking.",
					spyOn: "Use vi.fn() with explicit dependency injection instead of spying on existing objects.",
					stubEnv: "Use explicit dependency injection instead of mutating environment state.",
					stubGlobal: "Use explicit dependency injection instead of mutating global state.",
					unmock: "Use explicit fakes instead of Vitest module mocking.",
					unstubAllEnvs: "Use explicit dependency injection instead of mutating environment state.",
					unstubAllGlobals: "Use explicit dependency injection instead of mutating global state."
				}
			],
			"@vitest/prefer-called-with": "off",
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
