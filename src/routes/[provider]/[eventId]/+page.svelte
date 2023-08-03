<script lang="ts">
	import { page } from '$app/stores';

	export let data;
</script>

<main class="container">
	<h1>Classes</h1>

	<ul>
		{#each data.classes as splitClass (splitClass.id)}
			<li>
				<a
					href="/{$page.params.provider}/{$page.params.eventId}/classes/{splitClass.id}{$page.url
						.search}"
					data-sveltekit-reload
				>
					{splitClass.name}
				</a>
			</li>
		{/each}
	</ul>
</main>
