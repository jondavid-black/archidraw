import { browser } from '$app/environment';

export type CanvasTelemetryEventName =
	| 'layout-mounted'
	| 'fabric-initialized'
	| 'fabric-ready'
	| 'fabric-error';

export interface CanvasTelemetryEvent {
	/**
	 * Event identifier that maps back to spec success metrics.
	 */
	event: CanvasTelemetryEventName;
	/**
	 * `performance.now()` timestamp captured when the event was emitted.
	 */
	timestamp: number;
	/**
	 * Arbitrary metadata (durations, viewport info, errors, etc.).
	 */
	payload?: Record<string, unknown>;
}

const MAX_BUFFER = 50;
const TELEMETRY_WINDOW_KEY = '__ARCHIDRAW_TELEMETRY__' as const;
const buffer: CanvasTelemetryEvent[] = [];
const subscribers = new Set<(event: CanvasTelemetryEvent) => void>();
const HAS_WINDOW = typeof window !== 'undefined';

type TelemetryBridge = {
	publish: typeof publishCanvasEvent;
	subscribe: typeof subscribeToTelemetry;
	buffer: CanvasTelemetryEvent[];
	reset: typeof resetTelemetryBuffer;
};

const now = () =>
	HAS_WINDOW && typeof performance !== 'undefined' ? performance.now() : Date.now();

function normalizeEvent(event: CanvasTelemetryEvent): CanvasTelemetryEvent {
	return {
		...event,
		timestamp: typeof event.timestamp === 'number' ? event.timestamp : now()
	};
}

function pushToBuffer(event: CanvasTelemetryEvent) {
	buffer.push(event);
	if (buffer.length > MAX_BUFFER) {
		buffer.shift();
	}
}

function notify(event: CanvasTelemetryEvent) {
	for (const callback of subscribers) {
		callback(event);
	}
}

export function publishCanvasEvent(event: CanvasTelemetryEvent): CanvasTelemetryEvent {
	const normalized = normalizeEvent(event);
	pushToBuffer(normalized);
	if (HAS_WINDOW && browser) {
		console.info('[telemetry]', normalized.event, normalized.payload ?? {}, normalized.timestamp);
	}
	notify(normalized);
	return normalized;
}

export function subscribeToTelemetry(callback: (event: CanvasTelemetryEvent) => void) {
	subscribers.add(callback);
	return () => subscribers.delete(callback);
}

export function resetTelemetryBuffer() {
	buffer.length = 0;
}

export function getTelemetryBuffer() {
	return [...buffer];
}

type TelemetryWindow = Window & {
	[TELEMETRY_WINDOW_KEY]?: TelemetryBridge;
	__ARCHIDRAW_TELEMETRY__?: TelemetryBridge;
};

declare global {
	interface Window {
		__ARCHIDRAW_TELEMETRY__?: TelemetryBridge;
	}
}

function exposeOnWindow() {
	if (!HAS_WINDOW) return;
	const win = window as TelemetryWindow;
	const bridge: TelemetryBridge = {
		publish: publishCanvasEvent,
		subscribe: subscribeToTelemetry,
		buffer,
		reset: resetTelemetryBuffer
	};
	win[TELEMETRY_WINDOW_KEY] = bridge;
	win.__ARCHIDRAW_TELEMETRY__ = bridge;
}

exposeOnWindow();
