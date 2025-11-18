import { describe, expect, it, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { createFabricStage } from '$lib/canvas/createFabricStage';
import { canvasStatusStore } from '$lib/stores/canvasStatusStore';
import type { WorkspaceLayoutState } from '$lib/stores/workspaceLayoutStore';

const mockHandlers = new Map<string, Set<() => void>>();

async function flush() {
	await Promise.resolve();
	await new Promise((resolve) => setTimeout(resolve, 25));
}

class MockCanvas {
	static lastInstance: MockCanvas | null = null;
	width: number;
	height: number;
	background: unknown;
	backgroundColor: unknown;
	disposed = false;
	setDimensions = vi.fn((dimensions: { width: number; height: number }) => {
		this.width = dimensions.width;
		this.height = dimensions.height;
	});
	setBackgroundColor = vi.fn((color: unknown, cb?: () => void) => {
		this.background = color;
		this.backgroundColor = color;
		cb?.();
	});
	absolutePan = vi.fn();
	setZoom = vi.fn();
	requestRenderAll = vi.fn();

	constructor(_: HTMLCanvasElement, options: Record<string, number>) {
		this.width = options.width;
		this.height = options.height;
		mockHandlers.set('after:render', new Set());
		MockCanvas.lastInstance = this;
	}

	on(event: string, handler: () => void) {
		if (!mockHandlers.has(event)) {
			mockHandlers.set(event, new Set());
		}
		mockHandlers.get(event)?.add(handler);
	}

	off(event: string, handler: () => void) {
		mockHandlers.get(event)?.delete(handler);
	}

	renderAll() {
		mockHandlers.get('after:render')?.forEach((handler) => handler());
	}

	dispose() {
		this.disposed = true;
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}
}

class MockPattern {
	constructor(public options: Record<string, unknown>) {}
}

vi.mock('fabric', () => {
	return {
		fabric: {
			Canvas: MockCanvas,
			Pattern: MockPattern
		},
		default: {
			Canvas: MockCanvas,
			Pattern: MockPattern
		}
	};
});

const layout: WorkspaceLayoutState = {
	viewportWidth: 900,
	viewportHeight: 600,
	pixelRatio: 2,
	breakpoint: 'tablet',
	gridEnabled: false,
	lastResizeAt: 0
};

beforeEach(() => {
	canvasStatusStore.reset();
});

describe('createFabricStage', () => {
	it('marks the canvas ready after the first render', async () => {
		const canvas = document.createElement('canvas');
		canvasStatusStore.beginInitialization({
			viewportWidth: layout.viewportWidth,
			viewportHeight: layout.viewportHeight,
			pixelRatio: layout.pixelRatio,
			breakpoint: layout.breakpoint
		});
		await createFabricStage(canvas, layout);
		await flush();

		const status = get(canvasStatusStore);
		expect(status.status).toBe('ready');
		expect(status.readyDurationMs).toBeGreaterThanOrEqual(0);
	});

	it('resizes and toggles grid background', async () => {
		const canvas = document.createElement('canvas');
		canvasStatusStore.beginInitialization({
			viewportWidth: layout.viewportWidth,
			viewportHeight: layout.viewportHeight,
			pixelRatio: layout.pixelRatio,
			breakpoint: layout.breakpoint
		});
		const stage = await createFabricStage(canvas, layout);
		stage.resize({ ...layout, viewportWidth: 1024, viewportHeight: 768 });
		stage.setGrid(true);
		stage.setGrid(false);
		stage.destroy();

		const lastCanvas = MockCanvas.lastInstance as MockCanvas;
		expect(lastCanvas.setDimensions).toHaveBeenCalledWith({ width: 1024, height: 768 });
		expect(lastCanvas.setBackgroundColor).toHaveBeenCalledTimes(2);
		expect(lastCanvas.disposed).toBe(true);
	});
});
