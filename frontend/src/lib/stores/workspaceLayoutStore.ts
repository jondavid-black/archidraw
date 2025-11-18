import { writable } from 'svelte/store';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface WorkspaceLayoutState {
	viewportWidth: number;
	viewportHeight: number;
	pixelRatio: number;
	breakpoint: Breakpoint;
	gridEnabled: boolean;
	lastResizeAt: number;
}

const STORAGE_KEY = 'archidraw::workspace-layout';
const HAS_WINDOW = typeof window !== 'undefined';
const DEFAULT_STATE: WorkspaceLayoutState = {
	viewportWidth: 1280,
	viewportHeight: 720,
	pixelRatio: 1,
	breakpoint: 'desktop',
	gridEnabled: false,
	lastResizeAt: 0
};

function deriveBreakpoint(width: number): Breakpoint {
	if (width < 768) return 'mobile';
	if (width < 1280) return 'tablet';
	return 'desktop';
}

function safePerformanceNow() {
	return HAS_WINDOW && typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function createWorkspaceLayoutStore() {
	const { subscribe, update } = writable<WorkspaceLayoutState>(DEFAULT_STATE);

	function persist(next: WorkspaceLayoutState) {
		if (!HAS_WINDOW) return;
		try {
			sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					gridEnabled: next.gridEnabled,
					viewportWidth: next.viewportWidth,
					viewportHeight: next.viewportHeight,
					pixelRatio: next.pixelRatio
				})
			);
		} catch (error) {
			console.warn('Unable to persist workspace layout', error);
		}
	}

	function measureViewport(source: 'resize' | 'visibility' = 'resize') {
		if (!HAS_WINDOW) return source;
		const width = window.innerWidth || DEFAULT_STATE.viewportWidth;
		const height = window.innerHeight || DEFAULT_STATE.viewportHeight;
		const ratio = window.devicePixelRatio || DEFAULT_STATE.pixelRatio;
		update((state) => {
			const merged = {
				...state,
				viewportWidth: width,
				viewportHeight: height,
				pixelRatio: ratio,
				breakpoint: deriveBreakpoint(width),
				lastResizeAt: safePerformanceNow()
			};
			persist(merged);
			return merged;
		});
		return source;
	}

	function toggleGrid(force?: boolean) {
		update((state) => {
			const gridEnabled = typeof force === 'boolean' ? force : !state.gridEnabled;
			const next = { ...state, gridEnabled };
			persist(next);
			return next;
		});
	}

	function restoreFromSession() {
		if (!HAS_WINDOW) return false;
		let restored = false;
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (!stored) return false;
			const parsed = JSON.parse(stored) as Partial<WorkspaceLayoutState>;
			update((current) => {
				const width = parsed.viewportWidth ?? current.viewportWidth;
				const height = parsed.viewportHeight ?? current.viewportHeight;
				const restored: WorkspaceLayoutState = {
					viewportWidth: width,
					viewportHeight: height,
					pixelRatio: parsed.pixelRatio ?? current.pixelRatio,
					gridEnabled: parsed.gridEnabled ?? current.gridEnabled,
					breakpoint: deriveBreakpoint(width),
					lastResizeAt: safePerformanceNow()
				};
				persist(restored);
				return restored;
			});
			restored = true;
		} catch (error) {
			console.warn('Unable to restore workspace layout', error);
		}
		return restored;
	}

	return {
		subscribe,
		measureViewport,
		toggleGrid,
		restoreFromSession
	};
}

export const workspaceLayoutStore = createWorkspaceLayoutStore();
