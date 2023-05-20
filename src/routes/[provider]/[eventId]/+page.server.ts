import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { ProvidersEnum } from '$lib/models/enums/providers.enum.js';
import { error } from '@sveltejs/kit';
import { DOMParser } from 'linkedom';

export async function load({ fetch, params: { provider, eventId }, url: { searchParams } }) {
	if (!Object.values(ProvidersEnum).some((p) => provider === p)) throw error(404);

	let classUrl: string;

	if (provider === ProvidersEnum.FILE_URL) {
		const fileUrl = searchParams.get('file-url');
		console.log(fileUrl);
		if (fileUrl === null) throw error(403);
		classUrl = decodeURI(fileUrl);
	} else {
		classUrl = `${TWO_D_RERUN_URL}?id=${eventId}`;
	}

	const response = await fetch(classUrl);
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
