<script lang="ts">
	import { onMount } from 'svelte';
	import type { WinsplitClass } from '$lib/models/class.model.js';
	import { page } from '$app/stores';

	export let data;
	let classes: WinsplitClass[] = [];

	onMount(() => {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(data.classes, 'application/xml');
		const eventTags = xmlDoc.querySelectorAll('Class');

		classes = Array.from(eventTags).map((eventTag) => {
			const idTag = eventTag.querySelector('Id');
			const nameTag = eventTag.querySelector('Name');

			if (idTag === null || nameTag === null) throw new Error('Problem with file format');

			const id = idTag.textContent;
			const name = nameTag.textContent;

			if (id === null || name === null) throw new Error('Problem with file format');

			return {
				id,
				name
			};
		});
	});
</script>

<main class="container">
	<h1>Classes</h1>

	<ul>
		{#each classes as winClass (winClass.id)}
			<li>
				<a href={`/events/${$page.params.eventId}/classes/${winClass.id}`}> {winClass.name} </a>
			</li>
		{/each}
	</ul>
</main>
