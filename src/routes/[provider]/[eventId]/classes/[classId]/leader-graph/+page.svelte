<script lang="ts">
	import Graph from '../components/Graph.svelte';

	export let data;
</script>

<Graph
	runners={data.runners}
	supermanOrLeader={data.supermanOverall}
	runnerLegKey={'timeBehindOverall'}
/>
