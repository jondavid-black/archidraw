import type { PageLoad } from './$types';

export const ssr = false;
export const csr = true;

export const load: PageLoad = async () => {
	return {
		initialGridEnabled: false,
		featureFlags: {
			gridToggle: true,
			telemetryOverlay: true
		}
	};
};
