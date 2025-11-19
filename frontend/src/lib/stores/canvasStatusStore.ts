import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { CanvasTelemetryEvent } from '$lib/instrumentation/telemetry';
import { publishCanvasEvent } from '$lib/instrumentation/telemetry';

export type CanvasStatus = 'idle' | 'initializing' | 'ready' | 'error';

export interface CanvasStatusState {
	status: CanvasStatus;
	attempts: number;
	message: string;
	readyDurationMs?: number;
	lastError?: string;
	layoutMountedAt?: number;
	initializedAt?: number;
}

const DEFAULT_STATE: CanvasStatusState = {
	status: 'idle',
	attempts: 0,
	message: 'Preparing canvas'
};

const now = () => (browser && typeof performance !== 'undefined' ? performance.now() : Date.now());

function createCanvasStatusStore() {
	const { subscribe, update, set } = writable<CanvasStatusState>(DEFAULT_STATE);

	function emit(event: CanvasTelemetryEvent) {
		publishCanvasEvent(event);
	}

	function beginInitialization(payload?: Record<string, unknown>) {
		const timestamp = now();
		update((state) => {
			const next = {
				status: 'initializing' as const,
				attempts: state.attempts + 1,
				message: 'Initializing Fabric…',
				layoutMountedAt: timestamp,
				initializedAt: undefined,
				readyDurationMs: undefined,
				lastError: undefined
			};
			emit({ event: 'layout-mounted', timestamp, payload });
			return next;
		});
	}

	function markInitialized(payload?: Record<string, unknown>) {
		const timestamp = now();
		update((state) => {
			const next = { ...state, initializedAt: timestamp };
			emit({ event: 'fabric-initialized', timestamp, payload });
			return next;
		});
	}

	function markReady(payload?: Record<string, unknown>) {
		const timestamp = now();
		update((state) => {
			const duration = state.layoutMountedAt ? timestamp - state.layoutMountedAt : undefined;
			const next: CanvasStatusState = {
				...state,
				status: 'ready',
				message: 'Ready to draw',
				readyDurationMs: duration,
				initializedAt: state.initializedAt ?? timestamp
			};
			emit({ event: 'fabric-ready', timestamp, payload: { ...payload, duration } });
			return next;
		});
	}

	function markError(error: Error | string, payload?: Record<string, unknown>) {
		const timestamp = now();
		const errorMessage = typeof error === 'string' ? error : error.message;
		update((state) => {
			const next: CanvasStatusState = {
				...state,
				status: 'error',
				message: 'Canvas failed to initialize',
				lastError: errorMessage
			};
			emit({ event: 'fabric-error', timestamp, payload: { ...payload, message: errorMessage } });
			return next;
		});
	}

	function reset() {
		set(DEFAULT_STATE);
	}

	return {
		subscribe,
		beginInitialization,
		markInitialized,
		markReady,
		markError,
		reset
	};
}

export const canvasStatusStore = createCanvasStatusStore();
