import { expect, test } from '@playwright/test';

type TelemetryEvent = { event: string; timestamp: number };

const ensureEvent = (event: TelemetryEvent | undefined, name: string): TelemetryEvent => {
	if (!event) {
		throw new Error(`Missing telemetry event: ${name}`);
	}
	return event;
};

test('canvas boots and telemetry stays within thresholds', async ({ page }) => {
	await page.goto('/');
	await page.waitForSelector('.status-overlay.is-ready', { timeout: 1500 });
	const telemetry = await page.evaluate<TelemetryEvent[]>(() => {
		const win = window as Window & {
			__ARCHIDRAW_TELEMETRY__?: { buffer: TelemetryEvent[] };
		};
		return win.__ARCHIDRAW_TELEMETRY__?.buffer ?? [];
	});
	const layoutEvent = ensureEvent(
		telemetry.find((event) => event.event === 'layout-mounted'),
		'layout-mounted'
	);
	const initialized = ensureEvent(
		telemetry.find((event) => event.event === 'fabric-initialized'),
		'fabric-initialized'
	);
	const ready = ensureEvent(
		telemetry.find((event) => event.event === 'fabric-ready'),
		'fabric-ready'
	);
	const initDelta = initialized.timestamp - layoutEvent.timestamp;
	const totalDelta = ready.timestamp - layoutEvent.timestamp;
	expect(initDelta).toBeLessThan(1000);
	expect(totalDelta).toBeLessThan(1500);
});
