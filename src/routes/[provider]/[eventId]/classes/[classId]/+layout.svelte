<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	const baseUrl = `/${$page.params.provider}/${$page.params.eventId}/classes/${$page.params.classId}`;
	let detailsElement: HTMLDetailsElement;

	afterNavigate(() => detailsElement?.removeAttribute('open'));
</script>

<div>
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
