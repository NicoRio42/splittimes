<script lang="ts">
	import { RunnerStatusEnum } from 'orienteering-js/models';
	import Polyline from '../components/Polyline.svelte';

	export let data;
	let runners = data.runners.filter((r) => r.status === RunnerStatusEnum.OK);
	let selectedRunners = runners.slice(0, 6);

	$: maxY = Math.max(...selectedRunners.map((r) => r.legs.at(-1)?.timeBehindSuperman ?? 0));
</script>

<figure>
	<form action="">
		{#each runners as runner (runner.id)}
			<label style:color={runner.track?.color ?? 'black'}>
				<input type="checkbox" value={runner} bind:group={selectedRunners} />

				{runner.lastName}
			</label>
		{/each}
	</form>

	<svg
		height="100%"
		width="100%"
		preserveAspectRatio="none"
		viewBox="0 0 {data.supermanOverall.at(-1)} {maxY}"
	>
		{#if runners !== undefined && data.supermanOverall !== undefined}
			{#each selectedRunners as runner (runner.id)}
				<Polyline
					color={runner.track?.color ?? 'black'}
					points={runner.legs.map((leg, index) => {
						if (index === 0) return [0, 0];
						return [data.supermanOverall[index], leg?.timeBehindSuperman ?? 0];
					})}
				/>
			{/each}
		{/if}
	</svg>
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

	label {
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		svg {
			width: 200%;
		}
	}
</style>
