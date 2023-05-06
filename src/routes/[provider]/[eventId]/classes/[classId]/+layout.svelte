<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	const baseUrl = `/${$page.params.provider}/${$page.params.eventId}/classes/${$page.params.classId}`;
	let detailsElement: HTMLDetailsElement;

	afterNavigate(() => detailsElement?.removeAttribute('open'));
</script>

<details role="list" bind:this={detailsElement}>
	<summary aria-haspopup="listbox">
		{#if $page.url.pathname.includes('superman-graph')}
			Superman graph
		{:else}
			Table
		{/if}
	</summary>

	<ul role="listbox">
		<li>
			<a href={baseUrl}> Table </a>
		</li>

		<li><a href={`${baseUrl}/superman-graph`}>Superman graph</a></li>
	</ul>
</details>

<slot />
