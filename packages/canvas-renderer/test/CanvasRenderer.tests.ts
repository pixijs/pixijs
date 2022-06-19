import { Container } from '@pixi/display';
import { Matrix } from '@pixi/math';
import { CanvasRenderer } from '@pixi/canvas-renderer';

describe('CanvasRenderer', () =>
{
    it('should default context to rootContext', () =>
    {
        const renderer = new CanvasRenderer({ width: 1, height: 1 });

        try
        {
            expect(renderer.context).toEqual(renderer.rootContext);
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
});
