import type { RoutechoiceDbControlPoint } from './control-point.model.js';
import type { RoutechoiceDbLeg } from './leg.model.js';
import type { RoutechoiceDbRunner } from './runner.model.js';

export type RoutechoiceDbEvent = {
	id: string;
	name: string;
	startTime: Date;
	finishTime: Date;
	publishTime: Date;
	runners: RoutechoiceDbRunner[];
	legs: RoutechoiceDbLeg[];
	controlPoints: RoutechoiceDbControlPoint[];
};
