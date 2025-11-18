import type { Canvas as FabricCanvas, Pattern } from 'fabric/fabric-impl';
import type { WorkspaceLayoutState } from '$lib/stores/workspaceLayoutStore';
import { canvasStatusStore } from '$lib/stores/canvasStatusStore';
import { fabricSceneStore } from '$lib/stores/fabricSceneStore';

type FabricNamespace = {
	Canvas: new (element: HTMLCanvasElement, options?: Record<string, unknown>) => FabricCanvas;
	Pattern: new (options: { source: HTMLCanvasElement; repeat?: string }) => Pattern;
};

interface FabricTestWindow extends Window {
	__ARCHIDRAW_FORCE_FABRIC_ERROR__?: boolean;
	__ARCHIDRAW_FORCE_FABRIC_DELAY__?: number;
}

export interface FabricStageController {
	resize: (state: WorkspaceLayoutState) => void;
	setGrid: (enabled: boolean) => void;
	destroy: () => void;
}

const BACKGROUND_SOLID = '#111217';
const GRID_LINE = 'rgba(255,255,255,0.12)';
const GRID_TILE_SIZE = 32;

async function loadFabric(): Promise<FabricNamespace> {
	const module = (await import('fabric')) as unknown as {
		fabric?: FabricNamespace;
		default?: FabricNamespace;
	};
	if (module.fabric) return module.fabric;
	if (module.default) return module.default;
	return module as unknown as FabricNamespace;
}

function createGridPattern(Fabric: FabricNamespace, pixelRatio: number): Pattern | string {
	const canvasEl = document.createElement('canvas');
	const size = GRID_TILE_SIZE * pixelRatio;
	canvasEl.width = size;
	canvasEl.height = size;
	let context: CanvasRenderingContext2D | null = null;
	try {
		context = canvasEl.getContext('2d');
	} catch (error) {
		console.warn('Unable to create grid pattern context', error);
		return BACKGROUND_SOLID;
	}
	if (!context) return BACKGROUND_SOLID;
	context.strokeStyle = GRID_LINE;
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(size, 0);
	context.lineTo(size, size);
	context.lineTo(0, size);
	context.stroke();
	return new Fabric.Pattern({
		source: canvasEl,
		repeat: 'repeat'
	}) as unknown as Pattern;
}

export async function createFabricStage(
	element: HTMLCanvasElement,
	layout: WorkspaceLayoutState
): Promise<FabricStageController> {
	if (typeof window === 'undefined') {
		throw new Error('Fabric stage can only be created in the browser');
	}

	const testWindow = window as FabricTestWindow;
	if (testWindow.__ARCHIDRAW_FORCE_FABRIC_ERROR__) {
		throw new Error('Simulated Fabric failure');
	}

	const Fabric = await loadFabric();
	const canvas = new Fabric.Canvas(element, {
		selection: false,
		backgroundColor: BACKGROUND_SOLID,
		width: layout.viewportWidth,
		height: layout.viewportHeight
	});

	fabricSceneStore.setCanvas(canvas as unknown as FabricCanvas);
	canvasStatusStore.markInitialized({
		viewportWidth: layout.viewportWidth,
		viewportHeight: layout.viewportHeight,
		pixelRatio: layout.pixelRatio
	});

	const readyHandler = () => {
		const scheduleFinalization = () => {
			const finalize = () => {
				canvasStatusStore.markReady({
					viewportWidth: canvas.getWidth(),
					viewportHeight: canvas.getHeight(),
					pixelRatio: layout.pixelRatio
				});
				canvas.off('after:render', readyHandler);
			};
			if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
				window.requestAnimationFrame(finalize);
			} else {
				setTimeout(finalize, 0);
			}
		};
		const readyDelay = Math.max(testWindow.__ARCHIDRAW_FORCE_FABRIC_DELAY__ ?? 0, 0);
		if (readyDelay > 0) {
			setTimeout(scheduleFinalization, readyDelay);
		} else {
			scheduleFinalization();
		}
	};

	canvas.on('after:render', readyHandler);
	canvas.renderAll();

	function resize(state: WorkspaceLayoutState) {
		canvas.setDimensions({
			width: state.viewportWidth,
			height: state.viewportHeight
		});
		canvas.renderAll();
	}

	function setGrid(enabled: boolean) {
		const applyBackground = (background: Pattern | string) => {
			const fabricCanvas = canvas as FabricCanvas & {
				setBackgroundColor?: (value: Pattern | string, callback?: () => void) => void;
				backgroundColor?: Pattern | string;
			};
			if (typeof fabricCanvas.setBackgroundColor === 'function') {
				fabricCanvas.setBackgroundColor(background, () => canvas.requestRenderAll());
			} else {
				fabricCanvas.backgroundColor = background;
				canvas.requestRenderAll();
			}
		};

		if (enabled) {
			const pattern = createGridPattern(Fabric, window.devicePixelRatio || 1);
			applyBackground(pattern);
		} else {
			applyBackground(BACKGROUND_SOLID);
		}
	}

	function destroy() {
		canvas.dispose();
		fabricSceneStore.reset();
	}

	return {
		resize,
		setGrid,
		destroy
	};
}
