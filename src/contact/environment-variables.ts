import { z } from "zod";

export const contactFormUrlSchema = z
	.string()
	.url()
	.transform((url) => {
		return new URL(url);
	});
