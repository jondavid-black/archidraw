<script lang="ts">
	import { workspaceLayoutStore } from '$lib/stores/workspaceLayoutStore';

	const layout = workspaceLayoutStore;

	function toggleGrid() {
		layout.toggleGrid();
	}
</script>

<button
	type="button"
	class="grid-toggle"
	class:active={$layout.gridEnabled}
	aria-pressed={$layout.gridEnabled}
	on:click={toggleGrid}
>
	{$layout.gridEnabled ? 'Hide grid' : 'Show grid'}
</button>

<style>
	.grid-toggle {
		background: rgba(17, 18, 23, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 999px;
		color: #f8fafc;
		padding: 0.4rem 0.9rem;
		font-size: 0.9rem;
		cursor: pointer;
		transition:
			background 120ms ease,
			border 120ms ease;
	}

	.grid-toggle:hover,
	.grid-toggle:focus-visible {
		background: rgba(62, 98, 255, 0.2);
		border-color: rgba(62, 98, 255, 0.6);
		outline: none;
	}

	.grid-toggle.active {
		background: rgba(62, 98, 255, 0.3);
		border-color: rgba(62, 98, 255, 0.9);
	}
</style>
