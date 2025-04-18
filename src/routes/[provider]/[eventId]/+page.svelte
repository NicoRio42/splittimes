<script lang="ts">
	import { page } from '$app/stores';

	let { data } = $props();
</script>

<main class="container">
	<h1>Classes</h1>

	<ul>
		{#each data.classes as splitClass (splitClass.id)}
			<li>
				<a
					href="/{$page.params.provider}/{$page.params.eventId}/classes/{splitClass.id}/table{$page
						.url.search}"
				>
					{splitClass.name}
				</a>
			</li>
		{/each}
	</ul>
</main>
