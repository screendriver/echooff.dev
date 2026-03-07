import type { Hono } from "hono";
import { validateContactFormRequest } from "./request-validation.js";

export function registerContactFormRoute(application: Hono): void {
	application.post("/contact-form", async (context) => {
		const requestValidationResult = await validateContactFormRequest(context.req.raw);

		if (!requestValidationResult.isValid) {
			return context.json({ error: requestValidationResult.errorMessage }, 400);
		}

		return context.json({});
	});
}
