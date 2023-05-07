<script lang="ts">
	import { RunnerStatusEnum } from 'orienteering-js/models';
	import Polyline from '../components/Polyline.svelte';
	import EnlargeToggle from '$lib/components/EnlargeToggle.svelte';
	import { clickOutside } from '$lib/actions/click-outside.js';
	import { secondsToPrettyTime } from '$lib/utils.js';

	export let data;
	let runners = data.runners.filter((r) => r.status === RunnerStatusEnum.OK);
	let selectedRunners = runners.slice(0, 6);
	let hoveredLegIndex = 1;
	let compact = false;
	const maxX = data.supermanOverall.at(-1)!;
	let displayPanel = false;

	$: areAllRunnersSelected = selectedRunners.length === runners.length;
	$: maxY =
		selectedRunners.length === 0
			? 0
			: Math.max(...selectedRunners.map((r) => r.legs.at(-1)?.timeBehindSuperman ?? 0));
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
				on:change={(e) => (selectedRunners = e.currentTarget.checked ? runners : [])}
			/>

			<EnlargeToggle bind:compact />
		</p>

		{#each runners as runner (runner.id)}
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
			hoveredLegIndex = data.supermanOverall.findIndex((l) => x < l);
			displayPanel = true;
		}}
		use:clickOutside={() => (displayPanel = false)}
	>
		<svg height="100%" width="100%" preserveAspectRatio="none" viewBox="0 0 {maxX} {maxY}">
			{#each data.supermanOverall as leg, index (index)}
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
						runner.legs.map((leg, index) => [
							data.supermanOverall[index],
							leg?.timeBehindSuperman ?? 0
						])
					)}
				/>
			{/each}
		</svg>

		{#each data.supermanOverall as leg, index (index)}
			{#if index !== data.supermanOverall.length - 1}
				<p class="x-label" style:left={(leg / maxX) * 100 + '%'}>{index + 1}</p>
			{/if}
		{/each}

		{#if displayPanel}
			{@const sortedSelectedRunners = [...selectedRunners].sort((r1, r2) => {
				const leg1 = r1.legs[hoveredLegIndex];
				const leg2 = r2.legs[hoveredLegIndex];

				if (leg1 === null && leg2 === null) return 0;
				if (leg1 === null) return 1;
				if (leg2 === null) return -1;
				return leg1.rankSplit - leg2.rankSplit;
			})}

			<article
				class="leg-panel"
				style:left={hoveredLegIndex < data.supermanOverall.length / 2
					? (data.supermanOverall[hoveredLegIndex] / maxX) * 100 + '%'
					: 'unset'}
				style:right={hoveredLegIndex >= data.supermanOverall.length / 2
					? (1 - data.supermanOverall[hoveredLegIndex - 1] / maxX) * 100 + '%'
					: 'unset'}
			>
				<p>
					Leg: {hoveredLegIndex + 1}

					<button type="button" class="close-button" on:click={() => (displayPanel = false)}>
						X
					</button>
				</p>

				{#each sortedSelectedRunners as runner (runner.id)}
					{@const leg = runner.legs[hoveredLegIndex]}

					{#if leg !== null}
						<p class="leg-panel-line">
							{runner.lastName}: {secondsToPrettyTime(leg.timeBehindSuperman)}
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
		padding: 0;
		margin: 0;
	}

	.close-button {
		width: fit-content;
		background-color: transparent;
		box-shadow: none;
		border: none;
		margin: 0;
		padding: 0;
		display: inline;
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
