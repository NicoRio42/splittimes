<script lang="ts">
	import { run } from 'svelte/legacy';

	import { addSearchParamsToURL, secondsToPrettyTime } from '$lib/utils.js';
	import type { Runner, RunnerLeg } from 'orienteering-js/models';
	import EnlargeToggle from '$lib/components/EnlargeToggle.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import RunnerSelect from '../components/RunnerSelect.svelte';
	import { goto } from '$app/navigation';
	import LegCell from '../components/LegCell.svelte';

	let { data } = $props();

	let runners: Runner[] = data.runners;
	let selectedRunner: Runner | undefined = $state();



	function getLegNumber(legNumberSearchParams: string | null) {
		if (legNumberSearchParams === null) return 1;
		const parsedNumber = parseInt(legNumberSearchParams, 10);
		if (isNaN(parsedNumber)) return 1;
		if (parsedNumber > runners[0].legs.length) return 1;
		return parsedNumber;
	}


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
	let showRunnerSelect = $derived($page.url.searchParams.get('showRunnerSelect') !== null);
	let legNumber = $derived(getLegNumber($page.url.searchParams.get('legNumber')));
	let sortedRunners = $derived(runners.sort((runner1, runner2) => {
		const runner1Leg = runner1.legs[legNumber - 1];
		const runner2Leg = runner2.legs[legNumber - 1];

		if (runner1Leg !== null && runner2Leg !== null) {
			return runner1Leg.time - runner2Leg.time;
		}

		if (runner1Leg === null && runner2Leg !== null) {
			return 1;
		}

		if (runner1Leg !== null && runner2Leg === null) {
			return -1;
		}

		return 0;
	}));
	run(() => {
		selectedRunner = runners.find((r) => r.id === $page.url.searchParams.get('selectedRunner'));

		if (selectedRunner !== undefined && 'localStorage' in globalThis) {
			localStorage.setItem(
				'selectedRunner',
				`${selectedRunner.firstName.trim().toLowerCase()}-${selectedRunner.lastName
					.trim()
					.toLowerCase()}`
			);
		}
	});
</script>

{#if showRunnerSelect}
	<RunnerSelect runners={data.runners} />
{/if}

<figure class="wrapper">
	<table role="grid">
		<thead>
			<tr>
				<th class="sticky-top name-th z-index-1"> Rank</th>

				<th class="sticky-top name-th z-index-1"> Runner </th>

				<th class="sticky-top center z-index-1"> Leg </th>
			</tr>
		</thead>

		<tbody>
			{#each sortedRunners as runner (runner.id)}
				<tr>
					<td class="z-index-1">
						{runner.legs[legNumber - 1]?.rankSplit}
					</td>

					<td class="z-index-1">
						<div class="name-td-content">
							<div class="tooltip-container">
								{runner.firstName?.at(0)}.{runner.lastName}

								{#if runner.time}
									<div>
										{secondsToPrettyTime(runner.time)}

										<small>({runner.rank})</small>
									</div>
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

					<LegCell runnerLeg={runner.legs[legNumber - 1]} />
				</tr>
			{/each}

			<tr class="selected-runner-row">
				<td class="sticky-bottom selected-runner-td z-index-1">
					{selectedRunner?.legs[legNumber - 1]?.rankSplit ?? ''}
				</td>

				<td class="sticky-bottom selected-runner-td z-index-1">
					<div class="name-td-content">
						<a href={addSearchParamsToURL($page.url, 'showRunnerSelect', 'true')}>
							{#if selectedRunner !== undefined}
								{selectedRunner.firstName?.at(0)}.{selectedRunner.lastName}
							{:else}
								Select runner
							{/if}
						</a>
					</div>
				</td>

				{#if selectedRunner !== undefined}
					<LegCell runnerLeg={selectedRunner.legs[legNumber - 1]} stickyBottom={true} />
				{:else}
					<td class="sticky-bottom thick-border-top">--</td>
				{/if}
			</tr>
		</tbody>
	</table>
</figure>

<section class="leg-nav">
	<a
		href={addSearchParamsToURL($page.url, 'legNumber', String(legNumber === 1 ? 1 : legNumber - 1))}
		role="button"
	>
		<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"
			><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
				d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
			/></svg
		>
	</a>

	<select
		value={legNumber}
		onchange={(e) =>
			goto(addSearchParamsToURL($page.url, 'legNumber', String(e.currentTarget.value)))}
	>
		{#each runners[0].legs as leg, index}
			<option value={index + 1}>
				{index + 1 === runners[0].legs.length ? 'Finish' : index + 1}
			</option>
		{/each}
	</select>

	<a
		href={addSearchParamsToURL(
			$page.url,
			'legNumber',
			String(legNumber === runners[0].legs.length ? legNumber : legNumber + 1)
		)}
		role="button"
	>
		<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"
			><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
				d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
			/></svg
		>
	</a>
</section>

<style>
	.leg-nav {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		margin: 0.5rem 0;
		padding: 0;
	}

	.leg-nav select {
		width: fit-content;
		margin: 0;
	}

	.leg-nav a {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: 99rem;
	}

	.wrapper {
		flex-basis: 0;
		flex-shrink: 0;
		flex-grow: 1;
		margin: 0 auto;
		position: relative;
		width: 768px;
		overflow-x: hidden;
	}

	table {
		font-size: 1rem;
		width: 100%;
	}

	@media (max-width: 768px) {
		table {
			font-size: 0.875rem;
		}

		.wrapper {
			width: 100%;
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

	.sticky-bottom {
		bottom: 0;
	}

	.nowrap {
		white-space: nowrap;
	}

	table {
		margin: 0;
		border-collapse: initial;
	}

	.selected-runner-td {
		border-top: 0.1875rem solid var(--pico-table-border-color);
		padding-left: 0.5rem;
		padding-right: 0.125rem;
	}

	.thick-border-top {
		border-top: 0.1875rem solid var(--pico-table-border-color);
	}
</style>
