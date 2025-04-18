<script lang="ts">
	import { addSearchParamsToURL, secondsToPrettyTime } from '$lib/utils.js';
	import type { Runner, RunnerLeg } from 'orienteering-js/models';
	import EnlargeToggle from '$lib/components/EnlargeToggle.svelte';
	import { onMount } from 'svelte';
	import RunnerSelect from '../components/RunnerSelect.svelte';
	import { goto } from '$app/navigation';
	import LegCell from '../components/LegCell.svelte';
	import { page } from '$app/state';

	let { data } = $props();

	let runners: Runner[] = data.runners;
	let legs: (RunnerLeg | null)[] = data.runners[0].legs;
	let compact = $state(false);
	let selectedRunner: Runner | undefined = $state();

	let showRunnerSelect = $derived(page.url.searchParams.get('showRunnerSelect') !== null);

	$effect(() => {
		selectedRunner = runners.find((r) => r.id === page.url.searchParams.get('selectedRunner'));

		if (selectedRunner !== undefined && 'localStorage' in globalThis) {
			localStorage.setItem(
				'selectedRunner',
				`${selectedRunner.firstName.trim().toLowerCase()}-${selectedRunner.lastName
					.trim()
					.toLowerCase()}`
			);
		}
	});

	onMount(() => {
		if (selectedRunner !== undefined) return;
		const selectedRunnerFromLocalStorage = localStorage.getItem('selectedRunner');
		if (selectedRunnerFromLocalStorage === null) return;
		const [firstName, lastName] = selectedRunnerFromLocalStorage.split('-');

		const correspondingRunner = runners.find(
			(r) =>
				(r.firstName.trim().toLowerCase() === firstName &&
					r.lastName.trim().toLowerCase() === lastName) ||
				(r.firstName.trim().toLowerCase() === lastName &&
					r.lastName.trim().toLowerCase() === firstName)
		);

		if (correspondingRunner === undefined) return;

		goto(`?selectedRunner=${correspondingRunner.id}`);
	});
</script>

{#if showRunnerSelect}
	<RunnerSelect runners={data.runners} />
{/if}

<figure class="wrapper overflow-auto">
	<table role="grid">
		<thead>
			<tr>
				<th class="sticky-top sticky-left compact-toggle name-th z-index-1">
					<EnlargeToggle bind:compact />
				</th>

				{#each legs as _, index}
					<th class="sticky-top center z-index-1">
						<a
							href="/{page.params.provider}/{page.params.eventId}/classes/{page.params
								.classId}/leg-table?legNumber={index + 1}{selectedRunner !== undefined
								? `&selectedRunner=${selectedRunner.id}`
								: ''}"
						>
							{#if index === legs.length - 1}
								Finish
							{:else}
								{index + 1}
							{/if}
						</a>
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

					{#each runner.legs as runnerLeg, index}
						<LegCell {runnerLeg} isLastSplit={index === runner.legs.length - 1} />
					{/each}
				</tr>
			{/each}

			<tr class="relative">
				<td class="sticky-left sticky-bottom selected-runner-td z-index-1" px-1>
					<a
						href={addSearchParamsToURL(page.url, 'showRunnerSelect', 'true')}
						role="button"
						class="outline !flex !w-full"
						items-center
						justify-between
						py0
						px1
						text-3.5
						min-h-10
					>
						{#if selectedRunner?.rank}
							{selectedRunner.rank}
						{/if}

						<div grow text-left>
							{#if compact}
								<span class="my-2 nowrap">
									{#if selectedRunner !== undefined}
										{selectedRunner.firstName?.at(0)}{selectedRunner.lastName?.at(0)}
									{:else}
										SR
									{/if}
								</span>
							{:else if selectedRunner !== undefined}
								<div class="nowrap ml-1">
									{selectedRunner.firstName?.at(0)}.{selectedRunner.lastName}

									{#if selectedRunner.time}
										<div class="text-left">
											{secondsToPrettyTime(selectedRunner.time)}
										</div>
									{/if}
								</div>
							{:else}
								<span class="nowrap my2">Select runner</span>
							{/if}
						</div>

						<i i-carbon-chevron-down block h4 w4></i>
					</a>
				</td>

				{#if selectedRunner !== undefined}
					{#each selectedRunner.legs as runnerLeg, index}
						<LegCell
							{runnerLeg}
							stickyBottom={true}
							isLastSplit={index === selectedRunner.legs.length - 1}
						/>
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
		font-size: 0.875rem;
		margin: 0;
		border-collapse: initial;
	}

	table :global(td) {
		padding: calc(var(--pico-spacing) / 2);
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
		background-color: var(--pico-background-color);
	}

	.z-index-1 {
		z-index: 1;
	}

	.sticky-top {
		top: 0;
	}

	.sticky-left {
		left: 0;
		border-right: 0.1875rem solid var(--pico-table-border-color);
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

	.selected-runner-td {
		border-top: 0.1875rem solid var(--pico-table-border-color);
	}

	.thick-border-top {
		border-top: 0.1875rem solid var(--pico-table-border-color);
	}
</style>
