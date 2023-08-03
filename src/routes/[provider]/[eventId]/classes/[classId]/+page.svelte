<script lang="ts">
	import { addSearchParamsToURL, secondsToPrettyTime } from '$lib/utils.js';
	import type { Runner, RunnerLeg } from 'orienteering-js/models';
	import LegCell from './components/LegCell.svelte';
	import EnlargeToggle from '$lib/components/EnlargeToggle.svelte';
	import RunnerSelect from './components/RunnerSelect.svelte';
	import { page } from '$app/stores';

	export let data;

	let runners: Runner[] = data.runners;
	let legs: (RunnerLeg | null)[] = data.runners[0].legs;
	let compact = false;

	$: showRunnerSelect = $page.url.searchParams.get('showRunnerSelect') !== null;
	$: selectedRunner = runners.find((r) => r.id === $page.url.searchParams.get('selectedRunner'));
</script>

{#if showRunnerSelect}
	<RunnerSelect runners={data.runners} />
{/if}

<figure class="wrapper">
	<table role="grid">
		<thead>
			<tr>
				<th class="sticky-top sticky-left compact-toggle name-th z-index-1">
					<EnlargeToggle bind:compact />
				</th>

				{#each legs as _, index}
					<th class="sticky-top center z-index-1">
						{#if index === legs.length - 1}
							Finish
						{:else}
							{index + 1}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each runners as runner (runner.id)}
				<tr>
					<td class="sticky-left z-index-1">
						<div class="name-td-content">
							{#if runner.rank}
								{runner.rank}
							{/if}

							<div class="tooltip-container">
								{#if compact}
									{runner.firstName?.at(0)}{runner.lastName?.at(0)}
								{:else}
									{runner.firstName?.at(0)}.{runner.lastName}

									{#if runner.time}
										<div>
											{secondsToPrettyTime(runner.time)}
										</div>
									{/if}
								{/if}

								<div class="tooltip tooltip-right">
									<div class="nowrap">
										{runner.firstName}&nbsp;{runner.lastName}
									</div>

									{#if runner.timeBehind}
										+&nbsp;{secondsToPrettyTime(runner.timeBehind)}
									{/if}

									{#if runner.totalTimeLost}
										<div class="nowrap">
											Time lost:&nbsp;{secondsToPrettyTime(runner.totalTimeLost)}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</td>

					{#each runner.legs as runnerLeg}
						<LegCell {runnerLeg} />
					{/each}
				</tr>
			{/each}

			<tr class="selected-runner-row">
				<td class="sticky-left sticky-bottom selected-runner-td z-index-1">
					<div class="name-td-content">
						<a href={addSearchParamsToURL($page.url, 'showRunnerSelect', 'true')}>
							{#if compact}
								{#if selectedRunner !== undefined}
									{selectedRunner.rank}
									{selectedRunner.firstName?.at(0)}{selectedRunner.lastName?.at(0)}
								{:else}
									CR
								{/if}
							{:else if selectedRunner !== undefined}
								{selectedRunner.rank}
								{selectedRunner.firstName?.at(0)}.{selectedRunner.lastName}
							{:else}
								Select runner
							{/if}
						</a>
					</div>
				</td>

				{#if selectedRunner !== undefined}
					{#each selectedRunner.legs as runnerLeg}
						<LegCell {runnerLeg} stickyBottom={true} />
					{/each}
				{:else}
					{#each legs as _}
						<td class="sticky-bottom thick-border-top">--</td>
					{/each}
				{/if}
			</tr>
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

	table {
		font-size: 1rem;
	}

	@media (max-width: 768px) {
		table {
			font-size: 0.875rem;
		}
	}

	.center {
		text-align: center;
	}

	.name-th {
		z-index: 2;
	}

	.name-td-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: 100%;
	}

	.sticky-top,
	.sticky-left,
	.sticky-bottom {
		position: sticky;
		background-color: var(--background-color);
	}

	.z-index-1 {
		z-index: 1;
	}

	.sticky-top {
		top: 0;
	}

	.sticky-left {
		left: 0;
		border-right: 0.1875rem solid var(--table-border-color);
	}

	.sticky-bottom {
		bottom: 0;
	}

	.nowrap {
		white-space: nowrap;
	}

	.compact-toggle {
		z-index: 2;
	}

	table {
		margin: 0;
		border-collapse: initial;
	}

	.selected-runner-td {
		border-top: 0.1875rem solid var(--table-border-color);
		padding-left: 0.5rem;
		padding-right: 0.125rem;
	}

	.thick-border-top {
		border-top: 0.1875rem solid var(--table-border-color);
	}
</style>
