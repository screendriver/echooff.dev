import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

function readCssModuleClassNames(sourceCode) {
	const classNames = [...sourceCode.matchAll(/^\s*\.([A-Za-z_][A-Za-z0-9_-]*)/gmu)].map((match) => match[1]);

	return [...new Set(classNames)];
}

registerHooks({
	load(url, context, nextLoad) {
		if (!url.endsWith(".module.scss")) {
			return nextLoad(url, context);
		}

		const sourceCode = readFileSync(fileURLToPath(url), "utf8");
		const classNames = readCssModuleClassNames(sourceCode);
		const cssModuleExports = Object.fromEntries(classNames.map((className) => [className, className]));

		return {
			format: "module",
			shortCircuit: true,
			source: `export default ${JSON.stringify(cssModuleExports)};`
		};
	}
});
