import type { Canvas } from 'fabric/fabric-impl';
import { writable } from 'svelte/store';

export interface FabricSceneState {
	canvas: Canvas | null;
	zoom: number;
	pan: { x: number; y: number };
}

const DEFAULT_STATE: FabricSceneState = {
	canvas: null,
	zoom: 1,
	pan: { x: 0, y: 0 }
};

function createFabricSceneStore() {
	const { subscribe, update } = writable<FabricSceneState>(DEFAULT_STATE);

	function setCanvas(canvas: Canvas | null) {
		update((state) => ({ ...state, canvas }));
	}

	function setZoom(zoom: number) {
		update((state) => {
			if (state.canvas) {
				state.canvas.setZoom(zoom);
			}
			return { ...state, zoom };
		});
	}

	function setPan(pan: { x: number; y: number }) {
		update((state) => {
			if (state.canvas) {
				state.canvas.absolutePan(pan);
			}
			return { ...state, pan };
		});
	}

	function reset() {
		update((state) => {
			state.canvas?.dispose();
			return { ...DEFAULT_STATE };
		});
	}

	return {
		subscribe,
		setCanvas,
		setZoom,
		setPan,
		reset
	};
}

export const fabricSceneStore = createFabricSceneStore();
