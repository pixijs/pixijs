import { CanvasObserver } from '../CanvasObserver';
import '../init';
import { getWebGLRenderer } from '@test-utils';
import { CanvasSource } from '~/rendering';

import type { Renderer } from '~/rendering';

describe('CanvasObserver OffscreenCanvas', () =>
{
    it('does not throw from ensureAttached when the source is an OffscreenCanvas', async () =>
    {
        if (!globalThis.OffscreenCanvas) return;

        const renderer = (await getWebGLRenderer({ width: 64, height: 64 })) as Renderer;

        const offscreen = new OffscreenCanvas(64, 64);
        const source = new CanvasSource({ resource: offscreen });

        const domElement = document.createElement('div');

        const observer = new CanvasObserver({ domElement, renderer, source });

        // constructor returns early for an OffscreenCanvas, leaving _canvas undefined
        expect(observer['_canvas']).toBeUndefined();

        // before the guard this threw "Cannot read properties of undefined (reading 'parentNode')"
        expect(() => observer.ensureAttached()).not.toThrow();

        observer.destroy();
        source.destroy();
        renderer.destroy();
    });
});
