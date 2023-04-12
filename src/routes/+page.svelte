<script lang="ts">
	import { onMount } from 'svelte';
	import type { Event } from '../lib/models/event.model.js';

	export let data;
	let events: Event[] = [];

	onMount(() => {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(data.events, 'text/xml');
		const eventTags = xmlDoc.querySelectorAll('Event');

		events = Array.from(eventTags).map((eventTag) => {
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
	<form class="form">
		<label>
			Date

			<input type="date" name="date" />
		</label>

		<button>Load events</button>
	</form>

	<ul>
		{#each events as event (event.id)}
			<li><a href={`/events/${event.id}`}> {event.name} </a></li>
		{/each}
	</ul>
</main>

<style>
	.form {
		max-width: 20rem;
		margin-left: auto;
		margin-right: auto;
	}
</style>
