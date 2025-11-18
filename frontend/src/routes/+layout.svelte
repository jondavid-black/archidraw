<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(html, body) {
		margin: 0;
		height: 100%;
		min-height: 100vh;
		width: 100%;
		overflow: hidden;
		background: #05070d;
		color: #f5f7fb;
		font-family:
			'Inter',
			'SF Pro Display',
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
	}

	:global(body) {
		display: flex;
		width: 100%;
	}

	:global(#svelte) {
		flex: 1;
		min-height: 100vh;
		width: 100%;
	}
</style>
