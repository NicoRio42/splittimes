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
		const firstRunner = runners[0];

		if (firstRunner !== undefined) legs = firstRunner.legs;
	});
</script>

<figure class="wrapper">
	<table role="grid">
		<thead>
			<tr>
				<th class="sticky-top sticky-left name-th">
					<button class="compact-button" on:click={() => (compact = !compact)}>
						{#if compact}
							<svg class="enlarge" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"
								><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
									d="M32 64c17.7 0 32 14.3 32 32l0 320c0 17.7-14.3 32-32 32s-32-14.3-32-32V96C0 78.3 14.3 64 32 64zm214.6 73.4c12.5 12.5 12.5 32.8 0 45.3L205.3 224l229.5 0-41.4-41.4c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L434.7 288l-229.5 0 41.4 41.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-96-96c-12.5-12.5-12.5-32.8 0-45.3l96-96c12.5-12.5 32.8-12.5 45.3 0zM640 96V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V96c0-17.7 14.3-32 32-32s32 14.3 32 32z"
								/></svg
							>
						{:else}
							<svg
								class="shrink rotate-90"
								xmlns="http://www.w3.org/2000/svg"
								height="48"
								viewBox="0 96 960 960"
								width="48"
								><path
									d="M450 976V774l-86 86-44-44 160-160 160 160-44 44-86-86v202h-60ZM160 606v-60h640v60H160Zm320-110L320 336l44-44 86 86V176h60v202l86-86 44 44-160 160Z"
								/></svg
							>
						{/if}
					</button>
				</th>

				{#each legs as leg, index}
					<th class="sticky-top center">{index + 1}</th>
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
								{runner.firstName?.at(0)}.{runner.lastName}

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
	.compact-button {
		width: fit-content;
		background-color: transparent;
		box-shadow: none;
		border: none;
		margin: 0;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.shrink {
		width: 1.5rem;
		height: 1.5rem;
	}

	.enlarge {
		width: 1.25rem;
		height: 1.25rem;
	}

	.rotate-90 {
		transform: rotate(90deg);
	}

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

	.center {
		text-align: center;
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
		background-color: #dc8a8a;
	}

	@media (prefers-color-scheme: dark) {
		table tr td.mistake {
			background-color: #8c3b3b;
		}
	}

	:global(html[data-theme='light']) table tr td.mistake {
		background-color: #dc8a8a;
	}

	:global(html[data-theme='dark']) table tr td.mistake {
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
