<script lang="ts">
	import type { RunnerLeg } from 'orienteering-js/models';
	import { rankToCSSClass, secondsToPrettyTime } from '$lib/utils.js';
	import TimeRank from './TimeRank.svelte';

	export let runnerLeg: RunnerLeg | null;
	export let stickyBottom = false;
	export let isLastSplit = false;
</script>

<td class:mistake={runnerLeg?.isMistake} class:stickyBottom>
	{#if runnerLeg}
		<div class="nowrap tooltip-container">
			{#if runnerLeg?.time}
				<TimeRank time={runnerLeg.time} rank={runnerLeg?.rankSplit} {isLastSplit} />
			{/if}

			{#if runnerLeg.timeBehindSplit || runnerLeg.timeLoss}
				<div class="tooltip" class:tooltip-top={stickyBottom}>
					{#if runnerLeg.timeBehindSplit}
						<div class="nowrap">
							+&nbsp;{secondsToPrettyTime(runnerLeg.timeBehindSplit)}
						</div>
					{/if}

					{#if runnerLeg.timeLoss}
						<div class="nowrap">
							Time lost:&nbsp;{secondsToPrettyTime(runnerLeg.timeLoss)}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="nowrap tooltip-container">
			{#if runnerLeg?.timeOverall}
				<TimeRank time={runnerLeg.timeOverall} rank={runnerLeg?.rankOverall} />
			{/if}

			{#if runnerLeg.timeBehindOverall}
				<div class="tooltip" class:tooltip-top={stickyBottom}>
					+&nbsp;{secondsToPrettyTime(runnerLeg.timeBehindOverall)}
				</div>
			{/if}
		</div>
	{/if}
</td>

<style>
	.nowrap {
		white-space: nowrap;
	}

	:global(table tr) td.mistake {
		background-color: #dc8a8a;
	}

	@media (prefers-color-scheme: dark) {
		:global(table tr) td.mistake {
			background-color: #8c3b3b;
		}
	}

	:global(html[data-theme='light'] table tr) td.mistake {
		background-color: #dc8a8a;
	}

	:global(html[data-theme='dark'] table tr) td.mistake {
		background-color: #8c3b3b;
	}

	.stickyBottom {
		position: sticky;
		bottom: 0;
		background-color: var(--background-color);
		border-top: 0.1875rem solid var(--table-border-color);
	}
</style>
