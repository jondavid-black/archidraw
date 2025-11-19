<script lang="ts">
	import CanvasStatus from '$lib/components/overlay/CanvasStatus.svelte';
	export let onRetry: () => void = () => {};
</script>

<CanvasStatus on:retry={onRetry} />
