<script lang="ts">
	export let points: [number, number][];
	export let color: string;
</script>

<polyline fill="none" stroke={color} points={points.map(([x, y]) => `${x},${y}`).join(' ')} />
