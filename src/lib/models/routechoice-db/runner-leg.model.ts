export type RoutechoiceDbRunnerLeg = {
	id: string;
	time: number;
	fkLeg: string;
	fkDetectedRoutechoice: string | null;
	fkManualRoutechoice: string | null;
	fkRunner: string;
	timeOverall: number;
	rankSplit: number;
	timeBehindSplit: number;
	rankOverall: number | null;
	timeBehindOverall: number | null;
	timeBehindSuperman: number | null;
	timeLoss: number;
	routechoiceTimeLoss: number;
};
