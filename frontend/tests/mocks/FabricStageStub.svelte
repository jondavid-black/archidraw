<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	export let mountKey = 0;
	const dispatch = createEventDispatcher<{ ready: HTMLCanvasElement }>();
	let canvas: HTMLCanvasElement | null = null;

	onMount(() => {
		if (canvas) {
			dispatch('ready', canvas);
		}
	});

	$: if (canvas && mountKey !== undefined) {
		dispatch('ready', canvas);
	}
</script>

<canvas
	data-testid="fabric-stage-stub"
	bind:this={canvas}
	aria-label="Fabric stage stub"
	tabindex="-1"
></canvas>
