<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { RunnerLeg } from '../../../../../lib/o-utils/models/runner-leg.js';
	import type Runner from '../../../../../lib/o-utils/models/runner.js';
	import { parseIOFXML3SplitTimesFile } from '../../../../../lib/o-utils/split-times/parsers/iof-xml-3.js';
	import { secondsToPrettyTime } from '$lib/utils.js';

	export let data;

	let runners: Runner[] = [];
	let legs: (RunnerLeg | null)[] = [];
	let scrollLeft = 0;
	let compact = false;

	onMount(() => {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(data.splittimes, 'application/xml');

		runners = parseIOFXML3SplitTimesFile(xmlDoc, $page.params.classId, '+02:00', 0);
		console.log(runners);
		const firstRunner = runners[0];

		if (firstRunner !== undefined) legs = firstRunner.legs;
	});

	function handleScroll(
		e: UIEvent & {
			currentTarget: EventTarget & HTMLElement;
		}
	): void {
		if (e.currentTarget.scrollLeft > scrollLeft + 5) {
			compact = true;
			scrollLeft = e.currentTarget.scrollLeft;
			return;
		}

		if (e.currentTarget.scrollLeft < scrollLeft - 5) {
			compact = false;
			scrollLeft = e.currentTarget.scrollLeft;
			return;
		}
	}
</script>

<figure class="wrapper" on:scroll={handleScroll}>
	<table>
		<thead>
			<tr>
				<th class="sticky-top sticky-left name-th" />

				{#each legs as leg, index}
					<th class="sticky-top">{index + 1}</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each runners as runner (runner.id)}
				<tr>
					<td class="sticky-left">
						{#if compact}
							{runner.firstName?.at(0)}{runner.lastName?.at(0)}
						{:else}
							{runner.lastName}
						{/if}

						<span class="nowrap">
							{#if runner.time}
								{secondsToPrettyTime(runner.time)}
							{/if}

							{#if runner.rank}
								({secondsToPrettyTime(runner.rank)})
							{/if}
						</span>
					</td>

					{#each runner.legs as runnerLeg}
						<td>
							<span class="nowrap">
								{#if runnerLeg?.time}
									{secondsToPrettyTime(runnerLeg.time)}
								{/if}

								{#if runnerLeg?.rankSplit}
									({secondsToPrettyTime(runnerLeg.rankSplit)})
								{/if}
							</span>

							<span class="nowrap">
								{#if runnerLeg?.timeOverall}
									{secondsToPrettyTime(runnerLeg.timeOverall)}
								{/if}

								{#if runnerLeg?.rankOverall}
									({secondsToPrettyTime(runnerLeg.rankOverall)})
								{/if}
							</span>
						</td>
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

	.nowrap {
		white-space: nowrap;
	}
</style>
