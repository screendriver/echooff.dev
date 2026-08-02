import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

function readCssModuleClassNames(sourceCode) {
	return Array.from(
		sourceCode.split("\n").reduce((classNames, sourceLine) => {
			const className = sourceLine.trimStart().slice(1).split(/[\s{]/u, 1)[0];

			if (className === undefined || !/^[A-Za-z_][A-Za-z0-9_-]*$/u.test(className)) {
				return classNames;
			}

			classNames.add(className);
			return classNames;
		}, new Set())
	);
}

registerHooks({
	load(url, context, nextLoad) {
		if (!url.endsWith(".module.scss")) {
			return nextLoad(url, context);
		}

		const sourceCode = readFileSync(fileURLToPath(url), "utf8");
		const classNames = readCssModuleClassNames(sourceCode);
		const cssModuleExports = Object.fromEntries(
			classNames.map((className) => {
				return [className, className];
			})
		);

		return {
			format: "module",
			shortCircuit: true,
			source: `export default ${JSON.stringify(cssModuleExports)};`
		};
	}
});
