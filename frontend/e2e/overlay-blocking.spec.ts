import { expect, test } from '@playwright/test';

test('readiness overlay blocks input until Fabric resolves', async ({ page }) => {
	await page.addInitScript(() => {
		(
			window as Window & { __ARCHIDRAW_FORCE_FABRIC_DELAY__?: number }
		).__ARCHIDRAW_FORCE_FABRIC_DELAY__ = 300;
	});
	await page.goto('/');
	const overlay = page.locator('.status-overlay');
	await expect(overlay).toBeVisible();
	await expect(overlay).toHaveAttribute('aria-busy', 'true');
	const blocking = await overlay.evaluate((node) => getComputedStyle(node).pointerEvents);
	expect(blocking).toBe('auto');
	await expect(overlay).toHaveClass(/is-ready/, { timeout: 2000 });
	const nonBlocking = await overlay.evaluate((node) => getComputedStyle(node).pointerEvents);
	expect(nonBlocking).toBe('none');
});
