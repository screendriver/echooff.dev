declare var umami: umami.umami;

declare namespace umami {
	interface TrackPayload {
		website: string;
		hostname?: string;
		language?: string;
		referrer?: string;
		screen?: string;
		title?: string;
		url?: string;
	}

	interface umami {
		track(): void;
		track(payload: TrackPayload): void;
		track(eventName: string): void;
		track(eventName: string, eventData: Record<string, unknown>): void;
	}
}
