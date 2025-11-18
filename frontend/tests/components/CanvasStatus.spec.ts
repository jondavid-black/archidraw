import { render, screen, fireEvent } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CanvasStatus from '$lib/components/overlay/CanvasStatus.svelte';
import CanvasStatusHarness from './CanvasStatusHarness.svelte';
import { canvasStatusStore } from '$lib/stores/canvasStatusStore';

function flush() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('CanvasStatus component', () => {
	beforeEach(() => {
		canvasStatusStore.reset();
	});

	it('dismisses overlay when Fabric is ready', async () => {
		const { container } = render(CanvasStatus);
		canvasStatusStore.beginInitialization();
		canvasStatusStore.markReady({ viewportWidth: 1000, viewportHeight: 700 });
		await flush();
		const overlay = container.querySelector('.status-overlay');
		expect(overlay).toHaveClass('is-ready');
	});

	it('fires retry event on CTA click', async () => {
		const handler = vi.fn();
		render(CanvasStatusHarness, { props: { onRetry: handler } });
		canvasStatusStore.markError('boom');
		const button = await screen.findByRole('button', { name: /retry initialization/i });
		await fireEvent.click(button);
		expect(handler).toHaveBeenCalledTimes(1);
	});
});
