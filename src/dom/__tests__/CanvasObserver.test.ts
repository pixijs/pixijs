import { CanvasObserver } from '../CanvasObserver';
import { Ticker } from '~/ticker';

import type { Renderer } from '~/rendering';

describe('CanvasObserver', () =>
{
    it('removes the fallback ticker listener on destroy', () =>
    {
        const originalRO = globalThis.ResizeObserver;

        delete globalThis.ResizeObserver;

        try
        {
            const renderer = { resolution: 1, canvas: document.createElement('canvas') } as unknown as Renderer;
            const observer = new CanvasObserver({ domElement: document.createElement('div'), renderer });

            observer.ensureAttached();

            const listenerCount = Ticker.shared.count;

            expect(listenerCount).toBeGreaterThan(0);

            observer.destroy();

            expect(Ticker.shared.count).toBe(listenerCount - 1);
        }
        finally
        {
            globalThis.ResizeObserver = originalRO;
        }
    });

    it('does not add duplicate listeners across construction cycles', () =>
    {
        const originalRO = globalThis.ResizeObserver;

        delete globalThis.ResizeObserver;

        try
        {
            const renderer = { resolution: 1, canvas: document.createElement('canvas') } as unknown as Renderer;
            const before = Ticker.shared.count;
            const a = new CanvasObserver({ domElement: document.createElement('div'), renderer });

            a.ensureAttached();
            a.destroy();

            const b = new CanvasObserver({ domElement: document.createElement('div'), renderer });

            b.ensureAttached();
            b.destroy();

            expect(Ticker.shared.count).toBe(before);
        }
        finally
        {
            globalThis.ResizeObserver = originalRO;
        }
    });
});
