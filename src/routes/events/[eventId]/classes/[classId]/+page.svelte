<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { RunnerLeg } from '../../../../../lib/o-utils/models/runner-leg.js';
	import type Runner from '../../../../../lib/o-utils/models/runner.js';
	import { parseIOFXML3SplitTimesFile } from '../../../../../lib/o-utils/split-times/parsers/iof-xml-3.js';

	export let data;

	let runners: Runner[] = [];
	let legs: (RunnerLeg | null)[] = [];

	onMount(() => {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(data.splittimes, 'application/xml');

		runners = parseIOFXML3SplitTimesFile(xmlDoc, $page.params.classId, '+02:00', 0);
		console.log(runners);
		const firstRunner = runners[0];

		if (firstRunner !== undefined) legs = firstRunner.legs;
	});
</script>

<main class="container">
	<table>
		<thead>
			<tr>
				<th>Name</th>

				{#each legs as leg}
					<th>{leg?.finishControlCode}</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each runners as runner (runner.id)}
				<tr>
					<td>{runner.lastName}</td>

					{#each runner.legs as runnerLeg}
						<td>{runnerLeg?.time}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</main>
