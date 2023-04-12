import { error } from '@sveltejs/kit';
import z from 'zod';
import { TWO_D_RERUN_URL } from '../lib/constants.js';

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
	const events = await response.text();

	return { events };
}
