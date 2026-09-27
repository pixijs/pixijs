import { CanvasObserver } from '../CanvasObserver';
import { Ticker } from '../../ticker/Ticker';
import type { Renderer } from '../../rendering/renderers/types';

describe('CanvasObserver', () =>
{
    it('removes the fallback ticker listener on destroy', () =>
    {
        const originalRO = globalThis.ResizeObserver;
        (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = undefined;

        const canvas = document.createElement('canvas');
        const domElement = document.createElement('div');
        const renderer = { resolution: 1 } as unknown as Renderer;

        const observer = new CanvasObserver({ domElement, renderer });
        observer.ensureAttached();

        const listenerCount = Ticker.shared.count;
        expect(listenerCount).toBeGreaterThan(0);

        observer.destroy();

        expect(Ticker.shared.count).toBe(listenerCount - 1);

        (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = originalRO;
    });

    it('does not add duplicate listeners across construction cycles', () =>
    {
        const originalRO = globalThis.ResizeObserver;
        (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = undefined;

        const renderer = { resolution: 1 } as unknown as Renderer;
        const before = Ticker.shared.count;

        const a = new CanvasObserver({ domElement: document.createElement('div'), renderer });
        a.ensureAttached();
        a.destroy();

        const b = new CanvasObserver({ domElement: document.createElement('div'), renderer });
        b.ensureAttached();
        b.destroy();

        expect(Ticker.shared.count).toBe(before);

        (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = originalRO;
    });
});
