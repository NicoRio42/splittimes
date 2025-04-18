<script lang="ts">
	interface Props {
		points: number[][];
		color: string;
	}

	let { points, color }: Props = $props();
</script>

<polyline fill="none" stroke={color} points={points.map(([x, y]) => `${x},${y}`).join(' ')} />

<style>
	polyline {
		vector-effect: non-scaling-stroke;
	}
</style>
