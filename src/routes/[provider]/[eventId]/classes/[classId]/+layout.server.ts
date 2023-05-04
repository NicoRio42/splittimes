import { TWO_D_RERUN_URL } from '$lib/constants.js';
import { ProvidersEnum } from '$lib/models/enums/providers.enum.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params }) {
	if (!Object.values(ProvidersEnum).some((p) => params.provider === p)) throw error(404);

	const response = await fetch(`${TWO_D_RERUN_URL}?id=${params.eventId}&classid=${params.classId}`);
	const splittimes = await response.text();

	return { splittimes };
}
