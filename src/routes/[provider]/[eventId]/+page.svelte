<script lang="ts">
	import { page } from '$app/stores';

	export let data;
</script>

<main class="container">
	<h1>Classes</h1>

	<ul>
		{#each data.classes as winClass (winClass.id)}
			<li>
				<a href={`/winsplits/${$page.params.eventId}/classes/${winClass.id}`}> {winClass.name} </a>
			</li>
		{/each}
	</ul>
</main>
