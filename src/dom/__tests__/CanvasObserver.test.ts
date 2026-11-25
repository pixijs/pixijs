import { CanvasObserver } from '../CanvasObserver';
import { DOMContainer } from '../DOMContainer';
import { getWebGLRenderer } from '@test-utils';
import { Container } from '~/scene';
import { Ticker } from '~/ticker';

import type { Renderer } from '~/rendering';

describe('CanvasObserver', () =>
{
    it('adds no Ticker.shared listener for a renderer that never renders a DOMContainer', async () =>
    {
        const originalRO = globalThis.ResizeObserver;

        delete globalThis.ResizeObserver;

        try
        {
            const before = Ticker.shared.count;
            const renderer = await getWebGLRenderer();

            renderer.render(new Container());

            expect(Ticker.shared.count).toBe(before);

            renderer.destroy();

            expect(Ticker.shared.count).toBe(before);
        }
        finally
        {
            globalThis.ResizeObserver = originalRO;
        }
    });

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

        const domContainer = new DOMContainer();

        try
        {
            const before = Ticker.shared.count;
            const renderer = await getWebGLRenderer();
            const stage = new Container();

            stage.addChild(domContainer);
            renderer.render(stage);

            expect(Ticker.shared.count).toBe(before + 1);

            renderer.destroy();

            expect(Ticker.shared.count).toBe(before);
        }
        finally
        {
            domContainer.destroy();
            globalThis.ResizeObserver = originalRO;
        }
    });
});
