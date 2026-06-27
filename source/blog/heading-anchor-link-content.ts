type HeadingAnchorLinkContentPart = {
	type: string;
	value: string;
};

export function buildHeadingAnchorLinkContent(): HeadingAnchorLinkContentPart[] {
	return [{ type: "text", value: "\u{A0}#" }];
}
