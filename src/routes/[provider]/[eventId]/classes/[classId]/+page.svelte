<script lang="ts">
	import { secondsToPrettyTime } from '$lib/utils.js';
	import type { Runner, RunnerLeg } from 'orienteering-js/models';
	import LegCell from './components/LegCell.svelte';
	import EnlargeToggle from '$lib/components/EnlargeToggle.svelte';

	export let data;

	let runners: Runner[] = data.runners;
	let selectedRunner = runners[0];
	let legs: (RunnerLeg | null)[] = selectedRunner !== undefined ? selectedRunner.legs : [];
	let compact = false;
</script>

<figure class="wrapper">
	<table role="grid">
		<thead>
			<tr>
				<th class="sticky-top sticky-left compact-toggle name-th">
					<EnlargeToggle bind:compact />
					<!-- <input type="checkbox" id="compact-checkbox" /> -->
				</th>

				{#each legs as _, index}
					<th class="sticky-top center">
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
					<td class="sticky-left">
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

			{#if selectedRunner !== undefined}
				<tr class="selected-runner-row">
					<td class="sticky-left sticky-bottom selected-runner-td">
						<div class="name-td-content">
							{#if selectedRunner.rank}
								{selectedRunner.rank}
							{/if}

							{#if compact}
								{selectedRunner.firstName?.at(0)}{selectedRunner.lastName?.at(0)}
							{:else}
								<select class="selected-runner" bind:value={selectedRunner}>
									{#each runners as runner (runner.id)}
										<option value={runner}>
											{#if compact}
												{runner.firstName?.at(0)}{runner.lastName?.at(0)}
											{:else}
												{runner.firstName?.at(0)}.{runner.lastName}
											{/if}
										</option>
									{/each}
								</select>
							{/if}
						</div>
					</td>

					{#each selectedRunner.legs as runnerLeg}
						<LegCell {runnerLeg} stickyBottom={true} />
					{/each}
				</tr>
			{/if}
		</tbody>
	</table>
</figure>

<style>
	/* table:has(#compact-checkbox:checked) .compact {
		display: block;
	}

	table:has(#compact-checkbox:checked) .large {
		display: none;
	}

	table:has(#compact-checkbox:not(:checked)) .compact {
		display: none;
	}

	table:has(#compact-checkbox:not(:checked)) .large {
		display: block;
	} */

	.wrapper {
		flex-basis: 0;
		flex-shrink: 0;
		flex-grow: 1;
		margin: 0;
		position: relative;
	}

	table,
	.selected-runner {
		font-size: 1rem;
	}

	@media (max-width: 768px) {
		table,
		.selected-runner {
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

	.selected-runner {
		margin: 0;
		padding: 0.25rem 1rem 0.25rem 0.25rem;
		background-position: center right 0;
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
		padding-left: 0.125rem;
		padding-right: 0.125rem;
	}
</style>
