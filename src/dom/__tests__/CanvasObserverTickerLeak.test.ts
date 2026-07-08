import { getWebGLRenderer } from '@test-utils';
import { CanvasObserver } from '~/dom/CanvasObserver';
import { Ticker } from '~/ticker/Ticker';

import type { Renderer } from '~/rendering';

describe('CanvasObserver ticker leak', () =>
{
    it('fallback attaches and detaches the ticker callback when ResizeObserver is unavailable', async () =>
    {
        const renderer = (await getWebGLRenderer()) as Renderer;
        const savedResizeObserver = globalThis.ResizeObserver;

        delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;

        try
        {
            const before = Ticker.shared.count;
            const observer = new CanvasObserver({ domElement: document.createElement('div'), renderer });

            expect(observer['_tickerAttached']).toBe(true);
            expect(Ticker.shared.count).toBe(before + 1);

            observer.destroy();
            expect(Ticker.shared.count).toBe(before);
        }
        finally
        {
            globalThis.ResizeObserver = savedResizeObserver;
            renderer.destroy();
        }
    });

    it('ResizeObserver path does not touch the ticker', async () =>
    {
        const renderer = (await getWebGLRenderer()) as Renderer;

        try
        {
            const before = Ticker.shared.count;
            const observer = new CanvasObserver({ domElement: document.createElement('div'), renderer });

            expect(observer['_tickerAttached']).toBe(false);
            expect(Ticker.shared.count).toBe(before);

            observer.destroy();
            expect(Ticker.shared.count).toBe(before);
        }
        finally
        {
            renderer.destroy();
        }
    });
});
