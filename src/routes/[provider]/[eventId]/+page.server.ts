import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { ProvidersEnum } from '$lib/models/enums/providers.enum.js';
import { error } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';

export async function load({ fetch, params }) {
	if (!Object.values(ProvidersEnum).some((p) => params.provider === p)) throw error(404);

	const response = await fetch(`${TWO_D_RERUN_URL}?id=${params.eventId}`);
	const classesText = await response.text();

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(classesText, 'text/xml');
	const eventTags = xmlDoc.querySelectorAll('Class');

	const classes = Array.from(eventTags).map((eventTag) => {
		const idTag = eventTag.querySelector('Id');
		const nameTag = eventTag.querySelector('Name');

		if (idTag === null || nameTag === null) throw new Error('Problem with file format');

		const id = idTag.textContent;
		const name = nameTag.textContent;

		if (id === null || name === null) throw new Error('Problem with file format');

		return {
			id,
			name
		};
	});

	return { classes };
}
