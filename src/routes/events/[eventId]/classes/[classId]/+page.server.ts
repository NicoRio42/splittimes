import { TWO_D_RERUN_URL } from '../../../../../lib/constants.js';

export async function load({ fetch, params }) {
	const response = await fetch(`${TWO_D_RERUN_URL}?id=${params.eventId}&classid=${params.classId}`);
	const splittimes = await response.text();

	return { splittimes };
}
