import { describe, expect, it } from 'vitest';
import { canvasStatusStore, fabricSceneStore, workspaceLayoutStore } from '$lib';

describe('store exports', () => {
	it('exposes the core stores', () => {
		expect(canvasStatusStore).toBeDefined();
		expect(fabricSceneStore).toBeDefined();
		expect(workspaceLayoutStore).toBeDefined();
	});
});
