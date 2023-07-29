import type { RunnerStatusEnum } from 'orienteering-js/models';
import type { RoutechoiceDbRunnerLeg } from './runner-leg.model.js';

export type RoutechoiceDbRunner = {
	id: string;
	startTime: string;
	fkEvent: string;
	firstName: string;
	lastName: string;
	fkUser: string | null;
	fkLiveEvent: string | null;
	trackingDeviceId: string | null;
	status: RunnerStatusEnum;
	time: number | null;
	rank: number | null;
	timeBehind: number | null;
	totalTimeLost: number;
	timeOffset: number;
	legs: (RoutechoiceDbRunnerLeg | null)[];
};
