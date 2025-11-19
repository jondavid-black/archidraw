<script lang="ts">
	import { browser } from '$app/environment';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import type { FabricStageController } from '$lib/canvas/createFabricStage';
	import { createFabricStage } from '$lib/canvas/createFabricStage';
	import { canvasStatusStore } from '$lib/stores/canvasStatusStore';
	import { workspaceLayoutStore } from '$lib/stores/workspaceLayoutStore';

	type ReadyEvent = { ready: HTMLCanvasElement };
	const dispatch = createEventDispatcher<ReadyEvent>();

	export let mountKey = 0;

	let canvasEl: HTMLCanvasElement | null = null;
	let controller: FabricStageController | null = null;
	let unsubscribers: Array<() => void> = [];
	let initializedKey = mountKey;
	let mounted = false;

	async function setupStage() {
		if (!browser || !canvasEl) return;
		controller?.destroy();
		controller = null;
		cleanupSubscriptions();

		const layout = get(workspaceLayoutStore);
		canvasStatusStore.beginInitialization({
			viewportWidth: layout.viewportWidth,
			viewportHeight: layout.viewportHeight,
			pixelRatio: layout.pixelRatio,
			breakpoint: layout.breakpoint
		});

		try {
			controller = await createFabricStage(canvasEl, layout);
			unsubscribers.push(workspaceLayoutStore.subscribe((state) => controller?.resize(state)));
			unsubscribers.push(
				workspaceLayoutStore.subscribe((state) => controller?.setGrid(state.gridEnabled))
			);
			controller.setGrid(layout.gridEnabled);
			dispatch('ready', canvasEl);
		} catch (error) {
			canvasStatusStore.markError(error instanceof Error ? error : new Error(String(error)));
		}
	}

	function cleanupSubscriptions() {
		unsubscribers.forEach((fn) => fn());
		unsubscribers = [];
	}

	onMount(() => {
		mounted = true;
		setupStage();
		return () => {
			cleanupSubscriptions();
			controller?.destroy();
		};
	});

	onDestroy(() => {
		cleanupSubscriptions();
		controller?.destroy();
	});

	$: if (mounted && mountKey !== initializedKey) {
		initializedKey = mountKey;
		setupStage();
	}
</script>

<canvas bind:this={canvasEl} class="fabric-stage" tabindex="-1" aria-label="Archidraw Fabric canvas"
></canvas>

<style>
	.fabric-stage {
		width: 100%;
		height: 100%;
		display: block;
		outline: none;
		border: none;
		background: #111217;
	}
</style>
