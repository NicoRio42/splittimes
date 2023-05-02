<script lang="ts">
	import { onMount } from 'svelte';
	import Polyline from '../components/Polyline.svelte';
	import type Runner from '$lib/o-utils/models/runner';
	import { parseIOFXML3SplitTimesFile } from '$lib/o-utils/split-times/parsers/iof-xml-3';
	import { page } from '$app/stores';

	export let data;
	let runners: Runner[];
	let supermanOverall: number[];
	let maxX = 0;
	let maxY = 0;

	onMount(() => {
		const parser = new DOMParser();

		try {
			const xmlDoc = parser.parseFromString(data.splittimes, 'application/xml');
			runners = parseIOFXML3SplitTimesFile(xmlDoc, $page.params.classId, '+02:00', 0);

			let previousTime = 0;

			supermanOverall = runners[0].legs.map((leg, legIndex) => {
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

			maxX = supermanOverall.at(-1)!;
			maxY = Math.max(...runners.slice(0, 10).map((r) => r.legs.at(-1)?.timeBehindSuperman ?? 0));
		} catch (e) {
			alert('An error occured while loading split times. ' + e);
			console.error(e);
			return;
		}
	});
</script>

<figure>
	<svg height="100%" width="100%" preserveAspectRatio="none" viewBox="0 0 {maxX} {maxY}">
		{#if runners !== undefined && supermanOverall !== undefined}
			{#each runners.slice(0, 10) as runner (runner.id)}
				<Polyline
					color="red"
					points={runner.legs.map((leg, index) => {
						if (index === 0) return [0, 0];
						return [supermanOverall[index], leg?.timeBehindSuperman ?? 0];
					})}
				/>
			{/each}
		{/if}
	</svg>
</figure>

<style>
	figure {
		flex-basis: 0;
		flex-shrink: 0;
		flex-grow: 1;
		margin: 0;
		position: relative;
	}
</style>
