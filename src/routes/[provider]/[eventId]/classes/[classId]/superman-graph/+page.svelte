<script lang="ts">
	import Graph from '../components/Graph.svelte';

	let { data } = $props();
</script>

<Graph
	runners={data.runners}
	supermanOrLeader={data.supermanOverall}
	runnerLegKey={'timeBehindSuperman'}
/>
