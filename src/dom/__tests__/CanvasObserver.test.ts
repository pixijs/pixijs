import { CanvasObserver } from '../CanvasObserver';
import { getWebGLRenderer } from '@test-utils';
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
            const before = Ticker.shared.count;
            const observer = new CanvasObserver({ domElement: document.createElement('div'), renderer });

            expect(Ticker.shared.count).toBe(before + 1);

            observer.destroy();

            expect(Ticker.shared.count).toBe(before);
        }
        finally
        {
            globalThis.ResizeObserver = originalRO;
        }
    });

    it('does not measure a canvas that has no getBoundingClientRect', () =>
    {
        const originalRO = globalThis.ResizeObserver;

        delete globalThis.ResizeObserver;

        const renderer = { resolution: 1, canvas: { width: 100, height: 100 } } as unknown as Renderer;
        const before = Ticker.shared.count;
        const observer = new CanvasObserver({ domElement: document.createElement('div'), renderer });

        try
        {
            expect(() => observer.updateTranslation()).not.toThrow();
            expect(() => observer.ensureAttached()).not.toThrow();
            expect(Ticker.shared.count).toBe(before);
        }
        finally
        {
            observer.destroy();
            globalThis.ResizeObserver = originalRO;
        }
    });

    it('leaves no Ticker.shared listener after a renderer is destroyed', async () =>
    {
        const originalRO = globalThis.ResizeObserver;

        delete globalThis.ResizeObserver;

        try
        {
            const before = Ticker.shared.count;
            const renderer = await getWebGLRenderer();

            expect(Ticker.shared.count).toBe(before + 1);

            renderer.destroy();

            expect(Ticker.shared.count).toBe(before);
        }
        finally
        {
            globalThis.ResizeObserver = originalRO;
        }
    });
});
