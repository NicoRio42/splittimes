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

<figure class="wrapper" on:scroll={console.log}>
	<table>
		<thead>
			<tr>
				<th class="sticky-top sticky-left name-th">Name</th>

				{#each legs as leg}
					<th class="sticky-top">{leg?.finishControlCode}</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each runners as runner (runner.id)}
				<tr>
					<td class="sticky-left">{runner.lastName}</td>

					{#each runner.legs as runnerLeg}
						<td>{runnerLeg?.time}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</figure>

<style>
	.wrapper {
		flex-basis: 0;
		flex-shrink: 0;
		flex-grow: 1;
		margin: 0;
		position: relative;
	}

	.sticky-top {
		position: sticky;
		top: 0;
		background-color: var(--background-color);
		z-index: 1;
	}

	.name-th {
		z-index: 2;
	}

	.sticky-left {
		position: sticky;
		left: 0;
		background-color: var(--background-color);
	}
</style>
