<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	export let data;

	const baseUrl = `/${$page.params.provider}/${$page.params.eventId}/classes/${$page.params.classId}`;
	let detailsElement: HTMLDetailsElement;

	$: event = data.events.find((e) => e.id === $page.params.eventId);

	afterNavigate(() => detailsElement?.removeAttribute('open'));
</script>

<div>
	{#if event !== undefined}
		<p class="event-link">
			Event: <a href="/{$page.params.provider}/{event.id}">{event.name}</a>
		</p>
	{/if}
	<details role="list" bind:this={detailsElement}>
		<summary aria-haspopup="listbox">
			{#if $page.url.pathname.includes('superman-graph')}
				Superman graph
			{:else if $page.url.pathname.includes('leader-graph')}
				Leader graph
			{:else}
				Table
			{/if}
		</summary>

		<ul role="listbox">
			<li>
				<a href="{baseUrl}{$page.url.search}"> Table </a>
			</li>

			<li><a href="{baseUrl}/superman-graph{$page.url.search}">Superman graph</a></li>

			<li><a href="{baseUrl}/leader-graph{$page.url.search}">Leader graph</a></li>
		</ul>
	</details>
</div>

<slot />

<style>
	.event-link {
		text-align: center;
		margin: 0;
	}

	details {
		margin: 0.25rem;
	}

	@media (min-width: 20rem) {
		details {
			width: 20rem;
			margin-left: auto;
			margin-right: auto;
		}
	}
</style>
