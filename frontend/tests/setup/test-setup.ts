import '@testing-library/jest-dom/vitest';

class MockResizeObserver {
	callback: ResizeObserverCallback;

	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
	}

	observe() {
		// noop
	}

	unobserve() {
		// noop
	}

	disconnect() {
		// noop
	}
}

if (!globalThis.ResizeObserver) {
	globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}

if (!window.matchMedia) {
	window.matchMedia = (query: string): MediaQueryList => {
		return {
			matches: false,
			media: query,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			dispatchEvent: () => false,
			addListener: () => undefined,
			removeListener: () => undefined,
			onchange: null
		};
	};
}

const rafTimers = new Map<number, ReturnType<typeof setTimeout>>();
let rafId = 0;

if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
		const id = ++rafId;
		const timer = setTimeout(() => {
			callback(performance.now());
			rafTimers.delete(id);
		}, 0);
		rafTimers.set(id, timer);
		return id;
	};
}

if (!window.cancelAnimationFrame) {
	window.cancelAnimationFrame = (handle: number) => {
		const timer = rafTimers.get(handle);
		if (timer) {
			clearTimeout(timer);
			rafTimers.delete(handle);
		}
	};
}
