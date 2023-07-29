import { ROUTECHOICE_DB_DEV_URL, TWO_D_RERUN_URL } from '$lib/constants.js';
import { ProvidersEnum } from '$lib/models/enums/providers.enum.js';
import type { RoutechoiceDbEvent } from '$lib/models/routechoice-db/event.model.js';
import type { RoutechoiceDbLeg } from '$lib/models/routechoice-db/leg.model.js';
import { error } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';
import type { Runner, RunnerLeg } from 'orienteering-js/models';
import { routesColors } from 'orienteering-js/ocad';
import { parseIOFXML3SplitTimesFile } from 'orienteering-js/split-times';

export async function load({
	fetch,
	params: { provider, eventId, classId },
	url: { searchParams }
}) {
	if (provider === ProvidersEnum.WINSPLIT) {
		const response = await fetch(`${TWO_D_RERUN_URL}?id=${eventId}&classid=${classId}`);
		const splittimesText = await response.text();
		return getSplitTimesFromIOFXMLFile(splittimesText, classId);
	}

	if (provider === ProvidersEnum.ROUTECHOICE_DB_DEV)
		return getSplittimesFromRoutechoiceDBDev(eventId, fetch, 'dev');

	if (provider === ProvidersEnum.ROUTECHOICE_DB_STAGING)
		return getSplittimesFromRoutechoiceDBDev(eventId, fetch, 'staging');

	if (provider === ProvidersEnum.ROUTECHOICE_DB_PROD)
		return getSplittimesFromRoutechoiceDBDev(eventId, fetch, 'prod');

	if (provider === ProvidersEnum.FILE_URL) {
		const fileUrl = searchParams.get('file-url');
		if (fileUrl === null) throw error(403);
		const decodedFileUrl = decodeURI(fileUrl);
		const response = await fetch(`${decodedFileUrl}/${classId}.xml`);
		const splittimesText = await response.text();
		return getSplitTimesFromIOFXMLFile(splittimesText, classId);
	}

	throw error(404);
}

async function getSplitTimesFromIOFXMLFile(iofXmlFile: string, classId: string) {
	const parser = new DOMParser();

	try {
		const xmlDoc = parser.parseFromString(iofXmlFile, 'text/xml');
		const runners = parseIOFXML3SplitTimesFile(
			xmlDoc as unknown as XMLDocument,
			classId,
			'+02:00',
			0
		);
		return {
			runners: addRunnerTrackColorIfDontExists(runners),
			supermanOverall: getSupermanOverallTimes(runners),
			leaderOverall: getLeaderOverallTimes(runners)
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'An error occured while loading split times.');
	}
}

type Fetch = typeof fetch;

async function getSplittimesFromRoutechoiceDBDev(
	eventID: string,
	fetch: Fetch,
	env: 'dev' | 'staging' | 'prod'
): Promise<{
	runners: Runner[];
	supermanOverall: number[];
	leaderOverall: number[];
}> {
	const eventResponse = await fetch(`${ROUTECHOICE_DB_DEV_URL}/events/${eventID}`);

	if (eventResponse.status === 404) {
		throw error(404, 'No event for this event id in Routechoice DB.');
	}

	if (!eventResponse.ok) {
		throw error(500, 'An error occured while fetching the event from Routechoice DB.');
	}

	// TODO: zod
	const event: RoutechoiceDbEvent = await eventResponse.json();

	const runners: Runner[] = event.runners.map((runner) => {
		return {
			id: runner.id,
			firstName: runner.firstName,
			lastName: runner.lastName,
			rank: runner.rank,
			startTime: new Date(runner.startTime).getTime(),
			status: runner.status,
			trackingDeviceId: null,
			userId: null,
			time: runner.time,
			timeBehind: runner.timeBehind,
			totalTimeLost: runner.totalTimeLost,
			track: null,
			timeOffset: runner.timeOffset,
			legs: runner.legs.map((runnerLeg) => {
				if (runnerLeg === null) return null;

				const leg = event.legs.find((l) => l.id === runnerLeg.fkLeg);
				if (leg === undefined) throw error(500, 'Problem parsing event from Routechoice DB.');

				const startControl = event.controlPoints.find((c) => c.id === leg.fkStartControlPoint);
				const finishControl = event.controlPoints.find((c) => c.id === leg.fkFinishControlPoint);

				if (startControl === undefined || finishControl === undefined) {
					throw error(500, 'Problem parsing event from Routechoice DB.');
				}

				return {
					startControlCode: startControl.code,
					finishControlCode: finishControl.code,
					timeOverall: runnerLeg.timeOverall,
					time: runnerLeg.time,
					rankSplit: runnerLeg.rankSplit,
					timeBehindSplit: runnerLeg.timeBehindSplit,
					rankOverall: runnerLeg.rankOverall,
					timeBehindOverall: runnerLeg.timeBehindOverall,
					timeBehindSuperman: runnerLeg.timeBehindSuperman,
					isMistake: runnerLeg.timeLoss !== 0,
					timeLoss: runnerLeg.timeLoss,
					routeChoiceTimeLoss: runnerLeg.routechoiceTimeLoss,
					detectedRouteChoice: null,
					manualRouteChoice: null
				} as RunnerLeg;
			})
		};
	});

	return {
		runners: addRunnerTrackColorIfDontExists(runners),
		supermanOverall: getSupermanOverallTimes(runners),
		leaderOverall: getLeaderOverallTimes(runners)
	};
}

function getSupermanOverallTimes(runners: Runner[]): number[] {
	let previousTime = 0;

	const supermanOverall = runners[0].legs.map((leg, legIndex) => {
		let bestSplit = leg?.time ?? null;

		runners.forEach((runner) => {
			const runnerLeg = runner.legs[legIndex];
			if (runnerLeg === null) return;
			if (bestSplit === null || runnerLeg.time < bestSplit) bestSplit = runnerLeg.time;
		});

		if (bestSplit === null) throw new Error('Not enouth runners');

		const time = previousTime + bestSplit;
		previousTime = time;
		return time;
	});

	return supermanOverall;
}

function getLeaderOverallTimes(runners: Runner[]): number[] {
	return runners[0].legs.map((leg, legIndex) => {
		let bestOverallTime = leg?.timeOverall ?? null;

		runners.forEach((runner) => {
			const runnerLeg = runner.legs[legIndex];
			if (runnerLeg === null) return;
			if (bestOverallTime === null || runnerLeg.timeOverall < bestOverallTime)
				bestOverallTime = runnerLeg.timeOverall;
		});

		if (bestOverallTime === null) throw new Error('Not enouth runners');

		return bestOverallTime;
	});
}

function addRunnerTrackColorIfDontExists(runners: Runner[]): Runner[] {
	return runners.map((runner, index) => {
		if (!runner.track?.color)
			runner.track = { color: routesColors[index], lats: [], lons: [], times: [] };

		return runner;
	});
}
