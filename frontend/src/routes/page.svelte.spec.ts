import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/components/canvas/FabricStage.svelte', () =>
	import('../../tests/mocks/FabricStageStub.svelte').then((module) => ({ default: module.default }))
);

import Page from './+page.svelte';

const defaultData = {
	initialGridEnabled: false,
	featureFlags: {
		gridToggle: true,
		telemetryOverlay: true
	}
};

describe('/+page.svelte', () => {
	it('renders hero heading', () => {
		render(Page, { props: { data: defaultData } });
		const heading = screen.getByRole('heading', { level: 1, name: /archidraw/i });
		expect(heading).toBeVisible();
	});
});
