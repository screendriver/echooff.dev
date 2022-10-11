import type { VercelApiHandler } from "@vercel/node";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import got from "got";
import { contactFormUrlSchema } from "../src/contact/environment-variables";

if (process.env.NODE_ENV === "production") {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0,
	});
}

const handler: VercelApiHandler = async (request, response) => {
	const transaction = Sentry.startTransaction({
		op: "post",
		name: "ContactForm",
	});

	try {
		const contactFormUrl = contactFormUrlSchema.parse(process.env.CONTACT_FORM_URL);

		await got.post(contactFormUrl, {
			headers: {
				Accept: "application/json",
				"Content-Type": request.headers["Content-Type"],
			},
			form: request.body as Record<string, unknown>,
		});

		response.status(200).send({});
	} catch (error: unknown) {
		Sentry.captureException(error);
		throw error;
	} finally {
		transaction.finish();
	}
};

export default handler;
