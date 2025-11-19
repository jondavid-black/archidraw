<script lang="ts">
	import { browser } from '$app/environment';
	import FabricStage from '$lib/components/canvas/FabricStage.svelte';
	import GridToggle from '$lib/components/canvas/GridToggle.svelte';
	import CanvasStatus from '$lib/components/overlay/CanvasStatus.svelte';
	import { workspaceLayoutStore } from '$lib/stores/workspaceLayoutStore';
	import { onMount } from 'svelte';

	type FabricPageData = {
		initialGridEnabled: boolean;
		featureFlags: {
			gridToggle: boolean;
			telemetryOverlay: boolean;
		};
	};

	export let data: FabricPageData;

	const layout = workspaceLayoutStore;

	let stageKey = 0;
	let canvasElement: HTMLCanvasElement | null = null;

	function handleStageReady(event: CustomEvent<HTMLCanvasElement>) {
		canvasElement = event.detail;
		canvasElement?.focus();
	}

	function handleRetry() {
		stageKey += 1;
	}

	onMount(() => {
		if (!browser) return;
		const restored = layout.restoreFromSession();
		if (!restored) {
			layout.toggleGrid(data.initialGridEnabled ?? false);
		}
		layout.measureViewport('resize');

		let resizeRaf: number | null = null;
		const handleResize = () => {
			if (resizeRaf) return;
			resizeRaf = window.requestAnimationFrame(() => {
				layout.measureViewport('resize');
				resizeRaf = null;
			});
		};

		const handleVisibility = () => layout.measureViewport('visibility');
		window.addEventListener('resize', handleResize);
		document.addEventListener('visibilitychange', handleVisibility);
		window.addEventListener('pageshow', handleVisibility);

		return () => {
			if (resizeRaf) {
				window.cancelAnimationFrame(resizeRaf);
			}
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('visibilitychange', handleVisibility);
			window.removeEventListener('pageshow', handleVisibility);
		};
	});
</script>

<section class="workspace-shell" aria-live="polite">
	<header class="workspace-header">
		<h1 class="branding">
			<span class="app">Archidraw</span>
			<span class="divider"></span>
			<span class="label">Fabric canvas baseline</span>
		</h1>
		{#if data.featureFlags.gridToggle}
			<GridToggle />
		{/if}
	</header>
	<div class="canvas-region">
		<FabricStage mountKey={stageKey} on:ready={handleStageReady} />
		{#if data.featureFlags.telemetryOverlay}
			<CanvasStatus on:retry={handleRetry} />
		{/if}
		{#if $layout.breakpoint === 'mobile'}
			<p class="mobile-hint">Pinch to zoom and drag with two fingers to pan the canvas.</p>
		{/if}
	</div>
</section>

<style>
	.workspace-shell {
		height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 1rem 2rem;
		gap: 1rem;
		box-sizing: border-box;
		width: 100%;
		max-width: 100vw;
		overflow: hidden;
	}

	.workspace-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.branding {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.85);
	}

	.branding .app {
		font-weight: 600;
	}

	.branding .divider {
		width: 1px;
		height: 1.25rem;
		background: rgba(255, 255, 255, 0.2);
	}

	.canvas-region {
		position: relative;
		flex: 1;
		min-height: 0;
		border-radius: 1.25rem;
		background:
			radial-gradient(circle at top, rgba(62, 98, 255, 0.2), transparent 45%), rgba(8, 10, 18, 0.9);
		overflow: hidden;
	}

	.canvas-region :global(.fabric-stage) {
		width: 100%;
		height: 100%;
	}

	.mobile-hint {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(5, 7, 13, 0.85);
		border-radius: 999px;
		padding: 0.35rem 1rem;
		font-size: 0.85rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	@media (max-width: 768px) {
		.workspace-shell {
			padding: 0.75rem;
		}
		.workspace-header {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
