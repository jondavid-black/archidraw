<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { canvasStatusStore } from '$lib/stores/canvasStatusStore';

	const dispatch = createEventDispatcher<{ retry: void }>();
	const status = canvasStatusStore;

	function requestRetry() {
		dispatch('retry');
	}
</script>

<div
	class:is-ready={$status.status === 'ready'}
	class="status-overlay"
	aria-live="polite"
	aria-busy={$status.status !== 'ready'}
>
	<div class="panel" data-state={$status.status}>
		<p class="eyebrow">Fabric workspace</p>
		<h2>{$status.message}</h2>
		{#if $status.status !== 'error' && $status.status !== 'ready'}
			<p>Hold tight while we prepare the scene…</p>
		{/if}
		{#if $status.status === 'ready' && $status.readyDurationMs}
			<p class="metric">Ready in {Math.round($status.readyDurationMs)} ms</p>
		{/if}
		{#if $status.status === 'error'}
			<p class="error">{$status.lastError ?? 'Fabric failed to load.'}</p>
			<button type="button" class="retry" on:click={requestRetry}> Retry initialization </button>
		{/if}
	</div>
</div>

<style>
	.status-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(5, 7, 13, 0.9);
		color: #f5f7fb;
		z-index: 10;
		transition:
			opacity 240ms ease,
			visibility 240ms ease;
		pointer-events: auto;
	}

	.status-overlay.is-ready {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	.panel {
		background: rgba(15, 18, 30, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 1.5rem 2rem;
		max-width: 420px;
		text-align: center;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
	}

	.eyebrow {
		text-transform: uppercase;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		color: rgba(255, 255, 255, 0.6);
		margin-bottom: 0.75rem;
	}

	h2 {
		margin: 0;
		font-size: 1.4rem;
	}

	.metric {
		margin-top: 0.5rem;
		font-weight: 600;
	}

	.error {
		color: #ff7676;
		margin: 0.5rem 0 1rem;
	}

	.retry {
		background: #3e62ff;
		border: none;
		border-radius: 999px;
		color: white;
		padding: 0.5rem 1.25rem;
		cursor: pointer;
		font-weight: 600;
	}

	.retry:hover,
	.retry:focus-visible {
		background: #5a79ff;
		outline: none;
	}
</style>
