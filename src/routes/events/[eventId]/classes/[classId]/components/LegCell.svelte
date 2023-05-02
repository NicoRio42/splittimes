<script lang="ts">
	import type { RunnerLeg } from '$lib/o-utils/models/runner-leg';
	import { rankToCSSClass, secondsToPrettyTime } from '$lib/utils';

	export let runnerLeg: RunnerLeg | null;
	export let stickyBottom = false;
</script>

<td class:mistake={runnerLeg?.isMistake} class:stickyBottom>
	{#if runnerLeg}
		<div class="nowrap tooltip-container {rankToCSSClass(runnerLeg.rankSplit)}">
			{#if runnerLeg?.time}
				{secondsToPrettyTime(runnerLeg.time)}
			{/if}

			{#if runnerLeg?.rankSplit}
				<small>
					({runnerLeg.rankSplit})
				</small>
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

		<div class="nowrap tooltip-container {rankToCSSClass(runnerLeg.rankOverall)}">
			{#if runnerLeg?.timeOverall}
				{secondsToPrettyTime(runnerLeg.timeOverall)}
			{/if}

			{#if runnerLeg?.rankOverall}
				<small>
					({runnerLeg.rankOverall})
				</small>
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

	.first {
		color: #f44336;
	}

	.second {
		color: #4caf50;
	}

	.third {
		color: #2196f3;
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
