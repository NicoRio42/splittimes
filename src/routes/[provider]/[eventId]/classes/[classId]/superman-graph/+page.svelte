<script lang="ts">
	import { RunnerStatusEnum } from 'orienteering-js/models';
	import Polyline from '../components/Polyline.svelte';
	import EnlargeToggle from '$lib/components/EnlargeToggle.svelte';

	export let data;
	let runners = data.runners.filter((r) => r.status === RunnerStatusEnum.OK);
	let selectedRunners = runners.slice(0, 6);
	let isMouseInGraph = false;
	let hoveredLegNumber = 1;
	let compact = false;
	const maxX = data.supermanOverall.at(-1)!;

	$: areAllRunnersSelected = selectedRunners.length === runners.length;
	$: maxY =
		selectedRunners.length === 0
			? 0
			: Math.max(...selectedRunners.map((r) => r.legs.at(-1)?.timeBehindSuperman ?? 0));
</script>

<figure>
	<form action="">
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

	<div
		class="svg-wrapper"
		on:mouseenter={() => (isMouseInGraph = true)}
		on:mouseleave={() => (isMouseInGraph = false)}
		on:mousemove={(e) => {
			const x =
				((e.clientX + e.currentTarget.clientWidth - window.innerWidth) * maxX) /
				e.currentTarget.clientWidth;

			hoveredLegNumber = data.supermanOverall.findIndex((l) => x < l) + 1;
		}}
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
					points={runner.legs.map((leg, index) => {
						if (index === 0) return [0, 0];
						return [data.supermanOverall[index], leg?.timeBehindSuperman ?? 0];
					})}
				/>
			{/each}
		</svg>

		{#each data.supermanOverall as leg, index (index)}
			{#if index !== data.supermanOverall.length - 1}
				<p class="x-label" style:left={(leg / maxX) * 100 + '%'}>{index + 1}</p>
			{/if}
		{/each}

		{#if isMouseInGraph}
			<article
				class="leg-panel"
				style:left={hoveredLegNumber < data.supermanOverall.length / 2
					? (data.supermanOverall[hoveredLegNumber - 1] / maxX) * 100 + '%'
					: 'unset'}
				style:right={hoveredLegNumber >= data.supermanOverall.length / 2
					? (1 - data.supermanOverall[hoveredLegNumber - 2] / maxX) * 100 + '%'
					: 'unset'}
			>
				{#each selectedRunners as runner (runner.id)}
					<p>{runner.lastName}: {runner.legs[hoveredLegNumber - 1]?.timeBehindSuperman}</p>
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
		flex: none;
	}

	.header {
		display: flex;
		align-items: center;
		margin: 0.125rem 0;
	}

	label {
		white-space: nowrap;
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

	@media (max-width: 768px) {
		svg {
			width: 25rem;
		}
	}
</style>
