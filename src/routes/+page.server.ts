import { error } from '@sveltejs/kit';
import z from 'zod';
import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { DOMParser } from 'linkedom';

export async function load({ url, fetch }) {
	const dateSearch = url.searchParams.get('date');
	const dateString = dateSearch ? dateSearch + 'T00:00:00Z' : new Date().toISOString();

	let datetime;
	try {
		datetime = z.string().datetime().parse(dateString);
	} catch (e) {
		throw error(400, 'Bad date format');
	}

	const date = datetime.split('T')[0];

	const response = await fetch(`${TWO_D_RERUN_URL}?date=${date}`);
	const eventsString = await response.text();

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(eventsString, 'text/xml');
	const eventTags = xmlDoc.querySelectorAll('Event');

	const events = Array.from(eventTags).map((eventTag) => {
		const idTag = eventTag.querySelector('Id');
		const nameTag = eventTag.querySelector('Name');
		const typeTag = eventTag.querySelector('Classification');
		const organiserTag = eventTag.querySelector('Organiser Name');
		const countryTag = eventTag.querySelector('Organiser Country');

		if (
			idTag === null ||
			nameTag === null ||
			typeTag === null ||
			organiserTag === null ||
			countryTag === null
		)
			throw new Error('Problem with file format');

		const id = idTag.textContent;
		const name = nameTag.textContent;
		const type = typeTag.textContent;
		const organiser = organiserTag.textContent;
		const country = countryTag.getAttribute('code');

		if (id === null || name === null || type === null || organiser === null || country === null)
			throw new Error('Problem with file format');

		return {
			id,
			name,
			type,
			organiser,
			country
		};
	});

	return { events, date };
}
