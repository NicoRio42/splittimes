<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	let { data, children } = $props();

	const baseUrl = `/${$page.params.provider}/${$page.params.eventId}/classes/${$page.params.classId}`;
	let detailsElement: HTMLDetailsElement = $state();

	afterNavigate(() => detailsElement?.removeAttribute('open'));
</script>

<div>
	{#if data.eventName !== undefined}
		<p class="event-link">
			Event: <a href="/{$page.params.provider}/{$page.params.eventId}">{data.eventName}</a> -
			<a
				href="/{$page.params.provider}/{$page.params.eventId}/classes/${$page.params.classId}/table"
				>{data.className}</a
			>
		</p>
	{/if}

	<details role="list" bind:this={detailsElement} class="dropdown">
		<summary aria-haspopup="listbox" class="mode-select-summary">
			{#if $page.url.pathname.includes('superman-graph')}
				Superman graph
			{:else if $page.url.pathname.includes('leader-graph')}
				Leader graph
			{:else if $page.url.pathname.includes('leg-table')}
				Leg table
			{:else}
				Table
			{/if}
		</summary>

		<ul role="listbox">
			<li>
				<a href="{baseUrl}/table{$page.url.search}"> Table </a>
			</li>

			<li>
				<a href="{baseUrl}/leg-table{$page.url.search}"> Leg Table </a>
			</li>

			<li><a href="{baseUrl}/superman-graph{$page.url.search}">Superman graph</a></li>

			<li><a href="{baseUrl}/leader-graph{$page.url.search}">Leader graph</a></li>
		</ul>
	</details>
</div>

{@render children?.()}

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

	details summary.mode-select-summary {
		padding-top: 0.3825rem;
		padding-bottom: 0.5rem;
		height: 2.5rem;
	}
</style>
