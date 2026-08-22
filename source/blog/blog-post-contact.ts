import { contactEmailAddress } from "../contact/contact-email.ts";

export function createBlogPostContactMailtoUrl(articleTitle: string, articleUrl: string): string {
	const mailtoUrl = new URL(`mailto:${contactEmailAddress}`);
	const subject = `Feedback on "${articleTitle}"`;
	const body = `Article: ${articleUrl}`;

	mailtoUrl.search = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

	return mailtoUrl.href;
}
