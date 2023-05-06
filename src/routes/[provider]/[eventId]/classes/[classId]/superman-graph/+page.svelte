<script lang="ts">
	import Polyline from '../components/Polyline.svelte';

	export let data;
	let selectedRunners = data.runners.slice(0, 10);

	$: maxY = Math.max(...selectedRunners.map((r) => r.legs.at(-1)?.timeBehindSuperman ?? 0));
</script>

<figure>
	<form action="">
		{#each data.runners as runner (runner.id)}
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
		{#if data.runners !== undefined && data.supermanOverall !== undefined}
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
	}

	label {
		white-space: nowrap;
	}
</style>
