<script lang="ts">
	import { page } from '$app/stores';
	import { deleteSearchParamsToURL } from '$lib/utils.js';
	import type { Runner } from 'orienteering-js/models';

	export let runners: Runner[];

	let filter = '';
	let filteredRunner: Runner[];

	$: {
		const trimedLowerCaseFilter = filter.trim().toLowerCase();

		filteredRunner =
			trimedLowerCaseFilter === ''
				? runners
				: runners.filter(
						(r) =>
							r.firstName.toLowerCase().includes(trimedLowerCaseFilter) ||
							r.lastName.toLowerCase().includes(trimedLowerCaseFilter)
				  );
	}

	$: closeUrl = deleteSearchParamsToURL($page.url, 'showRunnerSelect');
</script>

<dialog open>
	<article>
		<a
			href={closeUrl === '' ? $page.url.pathname : closeUrl}
			aria-label="Close"
			class="close"
			data-sveltekit-replacestate
		/>

		<label>
			Runner Name
			<input type="text" bind:value={filter} />
		</label>

		<ul>
			{#each filteredRunner as runner (runner.id)}
				<li>
					<a href="?selectedRunner={runner.id}" data-sveltekit-replacestate>
						{runner.firstName}
						{runner.lastName}
					</a>
				</li>
			{/each}
		</ul>
	</article>
</dialog>

<style>
	article {
		padding: 2rem;
		height: calc(100vh - var(--spacing) * 2);
	}

	ul li {
		list-style: none;
	}
</style>
