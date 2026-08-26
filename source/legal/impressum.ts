export type ImpressumDetails = {
	readonly legalName: string;
	readonly addressLines: readonly string[];
};

export const impressumDetails: ImpressumDetails = {
	legalName: "Christian Rackerseder",
	addressLines: ["c/o Impressumservice Dein-Impressum", "Stettiner Str. 41", "35410 Hungen", "Deutschland"]
};

export const impressumEmailAddress = "blog@echooff.de";
