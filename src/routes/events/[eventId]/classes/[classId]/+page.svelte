<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { RunnerLeg } from '../../../../../lib/o-utils/models/runner-leg.js';
	import type Runner from '../../../../../lib/o-utils/models/runner.js';
	import { parseIOFXML3SplitTimesFile } from '../../../../../lib/o-utils/split-times/parsers/iof-xml-3.js';
	import { rankToCSSClass, secondsToPrettyTime } from '$lib/utils.js';

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
						<div class="tooltip-container">
							{#if compact}
								{runner.firstName?.at(0)}{runner.lastName?.at(0)}
							{:else}
								{runner.lastName}

								<div>
									{#if runner.time}
										{secondsToPrettyTime(runner.time)}
									{/if}

									{#if runner.rank}
										({runner.rank})
									{/if}
								</div>
							{/if}

							{#if runner.timeBehind || runner.totalTimeLost}
								<div class="tooltip tooltip-right">
									<div class="nowrap">
										+&nbsp;

										{#if runner.timeBehind}
											{secondsToPrettyTime(runner.timeBehind)}
										{/if}
									</div>

									{#if runner.totalTimeLost}
										{secondsToPrettyTime(runner.totalTimeLost)}
									{/if}
								</div>
							{/if}
						</div>
					</td>

					{#each runner.legs as runnerLeg}
						<td class:mistake={runnerLeg?.isMistake}>
							{#if runnerLeg}
								<div class="nowrap tooltip-container {rankToCSSClass(runnerLeg.rankSplit)}">
									{#if runnerLeg?.time}
										{secondsToPrettyTime(runnerLeg.time)}
									{/if}

									{#if runnerLeg?.rankSplit}
										({secondsToPrettyTime(runnerLeg.rankSplit)})
									{/if}

									{#if runnerLeg.timeBehindSplit || runnerLeg.timeLoss}
										<div class="tooltip">
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
										({runnerLeg.rankOverall})
									{/if}

									{#if runnerLeg.timeBehindOverall}
										<div class="tooltip">
											+&nbsp;{secondsToPrettyTime(runnerLeg.timeBehindOverall)}
										</div>
									{/if}
								</div>
							{/if}
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

	.sticky-top,
	.sticky-left {
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

	.first {
		color: #f44336;
	}

	.second {
		color: #4caf50;
	}

	.third {
		color: #2196f3;
	}

	table tr td.mistake {
		background-color: #8c3b3b;
	}

	.tooltip-container {
		position: relative;
	}

	.tooltip-container:hover .tooltip,
	.tooltip-container:active .tooltip {
		visibility: visible;
		opacity: 1;
	}

	.tooltip {
		z-index: 1;
		display: inline-block;
		position: absolute;
		left: 10%;
		top: 100%;
		color: #fff;
		background-color: #616161;
		padding-left: 8px;
		padding-right: 8px;
		text-align: center;
		border-radius: 4px;
		visibility: hidden;
		opacity: 0;
		transition: visibility 0s, opacity 0.5s linear;
	}

	.tooltip-right {
		top: 50%;
		transform: translateY(-50%);
		left: calc(100% + 1rem);
	}
</style>
