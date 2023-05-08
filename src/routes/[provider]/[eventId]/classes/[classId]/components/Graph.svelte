<script lang="ts">
	import { RunnerStatusEnum, type Runner } from 'orienteering-js/models';
	import Polyline from '../components/Polyline.svelte';
	import EnlargeToggle from '$lib/components/EnlargeToggle.svelte';
	import { clickOutside } from '$lib/actions/click-outside.js';
	import { secondsToPrettyTime } from '$lib/utils.js';

	export let runners: Runner[];
	export let supermanOrLeader: number[];
	export let runnerLegKey: 'timeBehindSuperman' | 'timeBehindOverall';

	let validRunners = runners.filter((r) => r.status === RunnerStatusEnum.OK);
	let selectedRunners = validRunners.slice(0, 6);
	let hoveredLegIndex = 1;
	let compact = false;
	const maxX = supermanOrLeader.at(-1)!;
	let displayPanel = false;

	$: areAllRunnersSelected = selectedRunners.length === validRunners.length;
	$: maxY =
		selectedRunners.length === 0
			? 0
			: Math.max(
					...selectedRunners.flatMap((r) => r.legs.map((l) => (l === null ? 0 : l[runnerLegKey])))
			  );
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Escape') displayPanel = false;
	}}
/>

<figure>
	<form>
		<p class="header">
			<input
				type="checkbox"
				checked={areAllRunnersSelected}
				on:change={(e) => (selectedRunners = e.currentTarget.checked ? validRunners : [])}
			/>

			<EnlargeToggle bind:compact />
		</p>

		{#each validRunners as runner (runner.id)}
			<label style:color={runner.track?.color ?? 'black'}>
				<input type="checkbox" value={runner} bind:group={selectedRunners} />

				{#if compact}
					{runner.firstName.at(0)}.{runner.lastName.at(0)}
				{:else}
					{runner.firstName.at(0)}. {runner.lastName}
				{/if}
			</label>
		{/each}
	</form>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="svg-wrapper"
		on:click={(e) => {
			const x = (e.offsetX * maxX) / e.currentTarget.clientWidth;
			const newHoveredLegIndex = supermanOrLeader.findIndex((l) => x < l);

			if (displayPanel && newHoveredLegIndex === hoveredLegIndex) {
				displayPanel = false;
				return;
			}

			hoveredLegIndex = newHoveredLegIndex;
			displayPanel = true;
		}}
		use:clickOutside={() => (displayPanel = false)}
	>
		<svg height="100%" width="100%" preserveAspectRatio="none" viewBox="0 0 {maxX} {maxY}">
			{#each supermanOrLeader as leg, index (index)}
				<Polyline
					color="var(--table-border-color)"
					points={[
						[leg, 0],
						[leg, maxY]
					]}
				/>
			{/each}

			{#each selectedRunners as runner (runner.id)}
				<Polyline
					color={runner.track?.color ?? 'black'}
					points={[[0, 0]].concat(
						runner.legs.map((leg, index) => {
							const value = leg === null ? 0 : leg[runnerLegKey];
							return [supermanOrLeader[index], value];
						})
					)}
				/>
			{/each}
		</svg>

		{#each supermanOrLeader as leg, index (index)}
			{#if index !== supermanOrLeader.length - 1}
				<p class="x-label" style:left={(leg / maxX) * 100 + '%'}>{index + 1}</p>
			{/if}
		{/each}

		{#if displayPanel}
			{@const sortedSelectedRunners = [...selectedRunners].sort((r1, r2) => {
				const leg1 = r1.legs[hoveredLegIndex];
				const leg2 = r2.legs[hoveredLegIndex];

				if (!leg1 && !leg2) return 0;
				if (!leg1) return 1;
				if (!leg2) return -1;
				const key = runnerLegKey === 'timeBehindOverall' ? 'rankOverall' : 'rankSplit';
				return leg1[key] - leg2[key];
			})}

			<article
				class="leg-panel"
				style:left={hoveredLegIndex < supermanOrLeader.length / 2
					? (supermanOrLeader[hoveredLegIndex] / maxX) * 100 + '%'
					: 'unset'}
				style:right={hoveredLegIndex >= supermanOrLeader.length / 2
					? (1 - supermanOrLeader[hoveredLegIndex - 1] / maxX) * 100 + '%'
					: 'unset'}
				on:click|stopPropagation
			>
				<p class="leg-panel-head">
					Leg: {hoveredLegIndex + 1}

					<button
						type="button"
						class="raw-btn close-button"
						on:click={() => (displayPanel = false)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"
							><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
								d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
							/></svg
						>
					</button>
				</p>

				{#each sortedSelectedRunners as runner (runner.id)}
					{@const leg = runner.legs[hoveredLegIndex]}

					{#if leg !== null && leg !== undefined}
						<p class="leg-panel-line" style:color={runner.track?.color ?? 'black'}>
							{runner.lastName}
							{secondsToPrettyTime(leg[runnerLegKey])}
						</p>
					{/if}
				{/each}
			</article>
		{/if}
	</div>
</figure>

<style>
	figure {
		flex-basis: 0;
		flex-shrink: 0;
		flex-grow: 1;
		margin: 0;
		position: relative;
		display: flex;
		padding-right: 0.5rem;
	}

	form {
		height: 100%;
		overflow-y: scroll;
		margin: 0;
		padding-left: 0.5rem;
		padding-right: 0.25rem;
		flex: none;
	}

	.header {
		display: flex;
		align-items: center;
		margin: 0.125rem 0;
		font-size: 1rem;
	}

	label {
		white-space: nowrap;
		font-size: 1rem;
	}

	.svg-wrapper {
		padding-bottom: 1.75rem;
		position: relative;
		flex-grow: 1;
	}

	.x-label {
		position: absolute;
		bottom: 0.25rem;
		margin: 0;
		transform: translateX(-50%);
		font-size: 0.75rem;
	}

	.leg-panel {
		position: absolute;
		top: 0;
		left: 0;
		padding: 0 0.5rem 0.5rem 0.5rem;
		margin: 0;
		max-height: 100%;
		overflow: auto;
	}

	.leg-panel-head {
		margin: 0;
		padding: 0.5rem 0;
		position: sticky;
		background-color: var(--card-background-color);
		top: 0;
		display: flex;
		justify-content: space-between;
	}

	.close-button {
		width: fit-content;
		background-color: transparent;
		box-shadow: none;
		border: none;
		margin: 0;
		padding: 0;
		color: var(--h1-color);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.close-button svg {
		width: 1rem;
		height: 1rem;
	}

	.leg-panel-line {
		margin: 0;
	}

	@media (max-width: 768px) {
		svg {
			width: 35rem;
		}
	}
</style>
