import { expect, test } from '@playwright/test';

type TelemetryEvent = { event: string; timestamp: number };

test('records telemetry for error + retry flows', async ({ page }) => {
	await page.addInitScript(() => {
		const win = window as Window & {
			__ARCHIDRAW_FORCE_FABRIC_ERROR__?: boolean;
		};
		win.__ARCHIDRAW_FORCE_FABRIC_ERROR__ = true;
	});

	await page.goto('/');
	await page.getByText('Canvas failed to initialize', { exact: false }).waitFor();
	let telemetry = await page.evaluate<TelemetryEvent[]>(() => {
		const win = window as Window & {
			__ARCHIDRAW_TELEMETRY__?: { buffer: TelemetryEvent[] };
		};
		return win.__ARCHIDRAW_TELEMETRY__?.buffer ?? [];
	});
	expect(telemetry.some((event) => event.event === 'fabric-error')).toBe(true);

	await page.evaluate(() => {
		const win = window as Window & {
			__ARCHIDRAW_FORCE_FABRIC_ERROR__?: boolean;
		};
		win.__ARCHIDRAW_FORCE_FABRIC_ERROR__ = false;
	});
	await page.getByRole('button', { name: /retry initialization/i }).click();
	await page.waitForSelector('.status-overlay.is-ready', { timeout: 2000 });
	telemetry = await page.evaluate<TelemetryEvent[]>(() => {
		const win = window as Window & {
			__ARCHIDRAW_TELEMETRY__?: { buffer: TelemetryEvent[] };
		};
		return win.__ARCHIDRAW_TELEMETRY__?.buffer ?? [];
	});
	const readyEvents = telemetry.filter((event) => event.event === 'fabric-ready');
	expect(readyEvents.length).toBeGreaterThanOrEqual(1);
});
