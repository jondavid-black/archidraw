import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { workspaceLayoutStore } from '$lib/stores/workspaceLayoutStore';

describe('workspaceLayoutStore', () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it('measures viewport size and breakpoint', () => {
		window.innerWidth = 700;
		window.innerHeight = 500;
		workspaceLayoutStore.measureViewport('resize');
		const state = get(workspaceLayoutStore);
		expect(state.breakpoint).toBe('mobile');
		expect(state.viewportWidth).toBe(700);
		expect(state.viewportHeight).toBe(500);
	});

	it('persists and restores grid preference', () => {
		workspaceLayoutStore.toggleGrid(true);
		const snapshot = sessionStorage.getItem('archidraw::workspace-layout');
		expect(snapshot).toContain('"gridEnabled":true');

		workspaceLayoutStore.toggleGrid(false);
		// Simulate a new session by restoring the prior snapshot value
		if (snapshot) {
			sessionStorage.setItem('archidraw::workspace-layout', snapshot);
		}
		const restored = workspaceLayoutStore.restoreFromSession();
		expect(restored).toBe(true);
		expect(get(workspaceLayoutStore).gridEnabled).toBe(true);
	});
});
