import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	getTelemetryBuffer,
	publishCanvasEvent,
	resetTelemetryBuffer,
	subscribeToTelemetry
} from '$lib/instrumentation/telemetry';

afterEach(() => {
	resetTelemetryBuffer();
});

describe('telemetry shim', () => {
	it('stores events on the global buffer', () => {
		const layoutEvent = publishCanvasEvent({ event: 'layout-mounted', timestamp: 10 });
		const readyEvent = publishCanvasEvent({ event: 'fabric-ready', timestamp: 900 });
		const buffer = getTelemetryBuffer();
		expect(buffer).toHaveLength(2);
		expect(buffer[0]).toEqual(layoutEvent);
		expect(buffer[1]).toEqual(readyEvent);
		const telemetryBridge = window.__ARCHIDRAW_TELEMETRY__;
		expect(telemetryBridge).toBeDefined();
		expect(telemetryBridge?.buffer).toHaveLength(2);
	});

	it('notifies subscribers immediately', () => {
		const handler = vi.fn();
		subscribeToTelemetry(handler);
		publishCanvasEvent({ event: 'fabric-initialized', timestamp: 100 });
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('supports latency assertions under 1s', () => {
		publishCanvasEvent({ event: 'layout-mounted', timestamp: 1000 });
		publishCanvasEvent({ event: 'fabric-initialized', timestamp: 1700 });
		const [, initialized] = getTelemetryBuffer();
		expect(initialized.timestamp - 1000).toBeLessThan(1000);
	});
});
