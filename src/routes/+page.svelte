<script lang="ts">
	import type { Event } from '$lib/models/event.model.js';

	let { data } = $props();

	let events: Event[] = $state($state.snapshot(data.events));
	let filteredEvents: Event[] = $state($state.snapshot(data.events));
	let filter = $state('');
	let form: HTMLFormElement | undefined = $state();

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
	<form class="form" bind:this={form}>
		<label>
			Date

			<input
				class="date"
				type="date"
				name="date"
				value={data.date}
				onchange={() => form?.submit()}
			/>
		</label>
	</form>

	<label class="search">
		Search

		<input name="search" bind:value={filter} oninput={handleFilter} />
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
						<td><a href={`/winsplits/${event.id}`}> {event.name} </a></td>
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
