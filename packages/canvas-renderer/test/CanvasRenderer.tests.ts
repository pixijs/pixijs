import { CanvasRenderer } from '@pixi/canvas-renderer';
import { Matrix } from '@pixi/core';
import { Container } from '@pixi/display';
import '@pixi/canvas-display';

describe('CanvasRenderer', () =>
{
    it('should default context to rootContext', () =>
    {
        const renderer = new CanvasRenderer({ width: 1, height: 1 });

        try
        {
            expect(renderer.canvasContext.activeContext).toEqual(renderer.canvasContext.rootContext);
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should allow clear() to work despite no containers added to the renderer', () =>
    {
        const renderer = new CanvasRenderer({ width: 1, height: 1 });

        try
        {
            renderer.clear();
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should update transform in case of temp parent', () =>
    {
        // this test works only for CanvasRenderer, WebGLRenderer behaviour is different
        const renderer = new CanvasRenderer({ width: 1, height: 1 });
        const cont = new Container();
        const par = new Container();

        par.position.set(5, 10);
        par.addChild(cont);

        renderer.render(cont, { transform: new Matrix().translate(10, 20) });
        expect(cont.worldTransform.tx).toEqual(0);
        expect(cont.worldTransform.ty).toEqual(0);

        renderer.render(par);
        expect(cont.worldTransform.tx).toEqual(5);
        expect(cont.worldTransform.ty).toEqual(10);

        renderer.render(cont, { transform: new Matrix().translate(-20, 30) });
        expect(cont.worldTransform.tx).toEqual(0);
        expect(cont.worldTransform.ty).toEqual(0);
    });

    it('should expose constructor options', () =>
    {
        const options = { width: 1, height: 2, antialias: true, resolution: 2 };
        const renderer = new CanvasRenderer(options);

        expect(renderer.options.width).toBe(1);
        expect(renderer.options.height).toBe(2);
        expect(renderer.options.antialias).toBe(true);
        expect(renderer.options.resolution).toBe(2);

        renderer.destroy();
    });
});
