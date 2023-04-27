<script lang="ts">
	import './global.css';
	import ThemeSwitch from './components/ThemeSwitch.svelte';
	import { navigating } from '$app/stores';
</script>

<div class="wrapper">
	{#if $navigating !== null}
		<progress />
	{/if}

	<nav class="container-fluid nav">
		<ul>
			<li class="brand">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="brand-logo">
					<!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
						d="M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H448v96H288zM448 256H288V160H448v96zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z"
					/>
				</svg>

				<strong> <a href="/">Splittimes</a> </strong>
			</li>
		</ul>

		<ThemeSwitch />
	</nav>

	<slot />
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
	}

	progress {
		position: fixed;
		height: 0.25rem;
		border-radius: 0;
	}

	.nav {
		align-items: center;
		border-bottom: 0.125rem solid var(--table-border-color);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 1.25rem;
	}

	.brand-logo {
		width: 1.5rem;
		height: 1.5rem;
	}
</style>
