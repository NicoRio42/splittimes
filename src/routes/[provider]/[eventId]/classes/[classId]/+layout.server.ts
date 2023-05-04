import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { ProvidersEnum } from '$lib/models/enums/providers.enum.js';
import { error } from '@sveltejs/kit';
import { parseIOFXML3SplitTimesFile } from 'orienteering-js/split-times';

import { DOMParser } from 'linkedom';

export async function load({ fetch, params }) {
	if (!Object.values(ProvidersEnum).some((p) => params.provider === p)) throw error(404);

	const response = await fetch(`${TWO_D_RERUN_URL}?id=${params.eventId}&classid=${params.classId}`);
	const splittimesText = await response.text();

	const parser = new DOMParser();

	try {
		const xmlDoc = parser.parseFromString(splittimesText, 'text/xml');
		// @ts-ignore
		const runners = parseIOFXML3SplitTimesFile(xmlDoc, params.classId, '+02:00', 0);
		return { runners };
	} catch (e) {
		throw error(500, 'An error occured while loading split times.');
	}
}
