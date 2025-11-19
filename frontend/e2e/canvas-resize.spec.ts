import { expect, test, type Page } from '@playwright/test';

const widths = [1280, 1024, 980, 768];

async function hasHorizontalScroll(page: Page) {
	return page.evaluate(() => document.body.scrollWidth > window.innerWidth + 2);
}

test('canvas stays within viewport across resize loops', async ({ page }) => {
	await page.goto('/');
	await page.waitForSelector('.status-overlay.is-ready', { timeout: 1500 });
	let passes = 0;

	for (let loop = 0; loop < 5; loop += 1) {
		for (const width of widths) {
			await page.setViewportSize({ width, height: 900 });
			const scrolls = await hasHorizontalScroll(page);
			if (!scrolls) {
				passes += 1;
			}
		}
	}

	expect(passes).toBeGreaterThanOrEqual(19);
});
