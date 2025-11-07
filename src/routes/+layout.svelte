<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	let { children } = $props();

	let currentPath = $derived($page.url.pathname);
</script>

<div class="app">
	<nav class="tabs">
		<a href="/" class:active={currentPath === '/'}>
			<span>Discover</span>
		</a>
		<a href="/map" class:active={currentPath.startsWith('/map')}>
			<span>Map</span>
		</a>
	</nav>
	<main>
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.tabs {
		display: flex;
		justify-content: center;
		padding: 0 1rem;
		gap: 0.5rem;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.tabs a {
		padding: 1rem 1.5rem;
		text-decoration: none;
		color: #495057;
		font-weight: 500;
		border-bottom: 3px solid transparent;
		transition: all 0.2s;
		position: relative;
		top: 2px;
	}

	.tabs a:hover {
		color: #014aaa;
	}

	.tabs a.active {
		color: #014aaa;
		border-bottom-color: #014aaa;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	/* For the map page, remove max-width restriction */
	:global(body:has(.map-container)) main {
		max-width: 100%;
		padding: 0;
	}

	@media (min-width: 640px) {
		main {
			padding: 1.5rem;
		}

		:global(body:has(.map-container)) main {
			padding: 0;
		}
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
		text-align: center;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
