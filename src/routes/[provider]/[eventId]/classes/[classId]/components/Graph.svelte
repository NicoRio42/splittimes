<script lang="ts">
	import { RunnerStatusEnum, type Runner } from 'orienteering-js/models';
	import Polyline from '../components/Polyline.svelte';
	import EnlargeToggle from '$lib/components/EnlargeToggle.svelte';
	import { clickOutside } from '$lib/actions/click-outside.js';
	import { addAlpha, secondsToPrettyTime } from '$lib/utils.js';

	interface Props {
		runners: Runner[];
		supermanOrLeader: number[];
		runnerLegKey: 'timeBehindSuperman' | 'timeBehindOverall';
	}

	let { runners, supermanOrLeader, runnerLegKey }: Props = $props();

	let validRunnersIds = $state(runners.filter((r) => r.status === 'ok').map((r) => r.id));
	let validRunners = $derived(runners.filter((r) => validRunnersIds.includes(r.id)));
	let selectedRunnersIds = $state(validRunnersIds.slice(0, 6));
	let selectedRunners = $derived(runners.filter((r) => selectedRunnersIds.includes(r.id)));
	let hoveredLegIndex = $state(1);
	let compact = $state(false);
	const maxX = supermanOrLeader.at(-1)!;
	let displayPanel = $state(false);

	let areAllRunnersSelected = $derived(selectedRunners.length === validRunners.length);

	let maxY = $derived(
		selectedRunners.length === 0
			? 0
			: Math.max(
					...selectedRunners.flatMap((r) => r.legs.map((l) => (l === null ? 0 : l[runnerLegKey])))
				)
	);
</script>

<svelte:window
	onkeydown={(e: KeyboardEvent) => {
		if (e.key === 'Escape') displayPanel = false;
	}}
/>

<figure class="overflow-auto">
	<form>
		<p class="header">
			<small>
				<input
					type="checkbox"
					checked={areAllRunnersSelected}
					onchange={(e: Event) =>
						(selectedRunnersIds = (e.currentTarget as HTMLInputElement)?.checked
							? validRunnersIds
							: [])}
				/>
			</small>

			<EnlargeToggle bind:compact />
		</p>

		{#each validRunners as runner (runner.id)}
			<label style:color={runner.track?.color ?? 'black'}>
				<small>
					<input
						type="checkbox"
						value={runner.id}
						bind:group={selectedRunnersIds}
						style:--pico-border-color={runner.track?.color}
						style:--pico-primary-background={runner.track?.color}
						style:--pico-form-element-focus-color={addAlpha(runner.track?.color ?? '#FFFFFF', 0.13)}
					/>
				</small>

				{#if compact}
					{runner.firstName.at(0)}.{runner.lastName.at(0)}
				{:else}
					{runner.firstName.at(0)}. {runner.lastName}
				{/if}
			</label>
		{/each}
	</form>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="svg-wrapper"
		onclick={(e: MouseEvent) => {
			if (!(e.currentTarget instanceof HTMLDivElement)) return;

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
					color="var(--pico-table-border-color)"
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

			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<article
				class="leg-panel"
				style:left={hoveredLegIndex < supermanOrLeader.length / 2
					? (supermanOrLeader[hoveredLegIndex] / maxX) * 100 + '%'
					: 'unset'}
				style:right={hoveredLegIndex >= supermanOrLeader.length / 2
					? (1 - supermanOrLeader[hoveredLegIndex - 1] / maxX) * 100 + '%'
					: 'unset'}
				onclick={(e: MouseEvent) => e.stopPropagation()}
			>
				<p class="leg-panel-head" bg-pico-card-background-color>
					Leg: {hoveredLegIndex + 1}

					<button
						type="button"
						class="raw-btn close-button"
						text-pico-h1-color
						onclick={() => (displayPanel = false)}
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
