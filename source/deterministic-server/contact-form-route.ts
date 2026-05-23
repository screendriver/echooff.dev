import type { Hono } from "hono";
import { isErr } from "true-myth/result";
import { validateContactFormRequest } from "./request-validation.ts";

export function registerContactFormRoute(application: Hono): void {
	application.post("/contact-form", async (context) => {
		const requestValidationResult = await validateContactFormRequest(context.req.raw);

		if (isErr(requestValidationResult)) {
			return context.json({ error: requestValidationResult.error.message }, 400);
		}

		return context.json({});
	});
}
