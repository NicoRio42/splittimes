<script lang="ts">
	import type { Event } from '$lib/models/event.model.js';

	export let data;

	let events: Event[] = data.events;
	let filteredEvents: Event[] = [...data.events];
	let filter = '';

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
						<td><a href="/winsplits/{event.id}?date={data.date}"> {event.name} </a></td>
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
