import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { ProvidersEnum } from '$lib/models/enums/providers.enum.js';
import {
	routechoiceDBDevFirebaseConfig,
	routechoiceDBProdFirebaseConfig,
	routechoiceDBStagingFirebaseConfig
} from '$lib/routechoice-db/configs.js';
import { error } from '@sveltejs/kit';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, query } from 'firebase/firestore/lite';
import { DOMParser } from 'linkedom';
import { runnerValidator, type Runner } from 'orienteering-js/models';
import { parseIOFXML3SplitTimesFile } from 'orienteering-js/split-times';
import { routesColors } from 'orienteering-js/ocad';

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
		return getSplittimesFromRoutechoiceDBDev(eventId, 'dev');

	if (provider === ProvidersEnum.ROUTECHOICE_DB_STAGING)
		return getSplittimesFromRoutechoiceDBDev(eventId, 'staging');

	if (provider === ProvidersEnum.ROUTECHOICE_DB_PROD)
		return getSplittimesFromRoutechoiceDBDev(eventId, 'prod');

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
		const xmlDocFromLinkeDom = parser.parseFromString(iofXmlFile, 'text/xml');
		// @ts-ignore
		const xmlDoc = xmlDocFromLinkeDom as XMLDocument;
		const runners = parseIOFXML3SplitTimesFile(xmlDoc, classId, '+02:00', 0);
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

async function getSplittimesFromRoutechoiceDBDev(eventID: string, env: 'dev' | 'staging' | 'prod') {
	if (env === 'dev') initializeApp(routechoiceDBDevFirebaseConfig);
	if (env === 'staging') initializeApp(routechoiceDBStagingFirebaseConfig);
	if (env === 'prod') initializeApp(routechoiceDBProdFirebaseConfig);
	const db = getFirestore();
	const runnersRef = collection(db, 'coursesData', eventID, 'runners');
	const runnersQuery = query(runnersRef);
	const runnersCollection = await getDocs(runnersQuery);

	const runners: Runner[] = [];

	runnersCollection.forEach((doc) => {
		try {
			runners.push(runnerValidator.parse({ ...doc.data(), id: doc.id }));
		} catch (error) {
			console.error(error);
		}
	});

	runners.sort((r1, r2) => {
		if (r1.rank === null && r2.rank === null) return 0;
		if (r1.rank === null) return 1;
		if (r2.rank === null) return -1;
		return r1.rank - r2.rank;
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
