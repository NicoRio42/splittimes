<script lang="ts">
	import { browser } from '$app/environment';
	import type { Event } from '../lib/models/event.model.js';

	export let data;

	let events: Event[] = [];
	let filteredEvents: Event[] = [];
	let filter = '';

	$: if (browser) initEvents(data.events);

	function initEvents(eventsString: string) {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(eventsString, 'text/xml');
		const eventTags = xmlDoc.querySelectorAll('Event');

		console.log(typeof eventsString);

		events = Array.from(eventTags).map((eventTag) => {
			const idTag = eventTag.querySelector('Id');
			const nameTag = eventTag.querySelector('Name');
			const typeTag = eventTag.querySelector('Classification');
			const organiserTag = eventTag.querySelector('Organiser Name');
			const countryTag = eventTag.querySelector('Organiser Country');

			if (
				idTag === null ||
				nameTag === null ||
				typeTag === null ||
				organiserTag === null ||
				countryTag === null
			)
				throw new Error('Problem with file format');

			const id = idTag.textContent;
			const name = nameTag.textContent;
			const type = typeTag.textContent;
			const organiser = organiserTag.textContent;
			const country = countryTag.getAttribute('code');

			if (id === null || name === null || type === null || organiser === null || country === null)
				throw new Error('Problem with file format');

			return {
				id,
				name,
				type,
				organiser,
				country
			};
		});

		filteredEvents = [...events];
		filter = '';
	}

	function handleFilter() {
		const lowercaseFilter = filter.toLowerCase();

		filteredEvents = events.filter(
			(event) =>
				event.country.toLowerCase().includes(lowercaseFilter) ||
				event.name.toLowerCase().includes(lowercaseFilter) ||
				event.type.toLowerCase().includes(lowercaseFilter) ||
				event.organiser.toLowerCase().includes(lowercaseFilter)
		);
	}
</script>

<main class="container">
	<form class="form">
		<label>
			Date

			<input class="date" type="date" name="date" value={data.date} onchange="this.form.submit()" />
		</label>
	</form>

	<label class="search">
		Search

		<input name="search" bind:value={filter} on:input={handleFilter} />
	</label>

	<figure>
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Type</th>
					<th>Organiser</th>
					<th>Country</th>
				</tr>
			</thead>

			<tbody>
				{#each filteredEvents as event (event.id)}
					<tr>
						<td><a href={`/events/${event.id}`}> {event.name} </a></td>
						<td>{event.type}</td>
						<td>{event.organiser}</td>
						<td>{event.country}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</figure>
</main>

<style>
	:root {
		--spacing: 0.5rem;
	}

	.container {
		margin-top: 1rem;
	}

	.form,
	.search {
		max-width: 20rem;
		margin-left: auto;
		margin-right: auto;
	}

	.form,
	.date {
		margin-bottom: 0;
	}
</style>
