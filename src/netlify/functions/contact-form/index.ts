import "@sentry/tracing";
import * as Sentry from "@sentry/node";
import type { Handler } from "@netlify/functions";
import got from "got";
import is from "@sindresorhus/is";
import { contactFormUrlSchema } from "./environment-variables";

if (process.env.NODE_ENV === "production") {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0
	});
}

export const handler: Handler = async (event) => {
	const transaction = Sentry.startTransaction({
		op: "post",
		name: "ContactForm"
	});

	try {
		if (is.nullOrUndefined(event.body)) {
			throw new Error("Empty request body");
		}

		const contactFormUrl = contactFormUrlSchema.parse(process.env.CONTACT_FORM_URL);

		await got.post(contactFormUrl, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: event.body
		});

		return { statusCode: 200 };
	} catch (error: unknown) {
		Sentry.captureException(error);

		return { statusCode: 500 };
	} finally {
		transaction.finish();
	}
};
