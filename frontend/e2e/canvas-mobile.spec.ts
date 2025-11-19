import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 720, height: 1000 } });

test('mobile viewport surfaces pinch guidance and stays scroll-free after resume', async ({
	page
}) => {
	await page.goto('/');
	await page.waitForSelector('.status-overlay.is-ready', { timeout: 2000 });
	const hint = page.locator('.mobile-hint');
	await expect(hint).toBeVisible();
	const beforeScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 2);
	expect(beforeScroll).toBe(false);
	await page.evaluate(() => {
		document.dispatchEvent(new Event('visibilitychange'));
		window.dispatchEvent(new Event('pageshow'));
	});
	const afterScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 2);
	expect(afterScroll).toBe(false);
});
