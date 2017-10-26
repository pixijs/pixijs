'use strict';

describe('PIXI.CanvasRenderer', function ()
{
    it('should default context to rootContext', function ()
    {
        const renderer = new PIXI.CanvasRenderer(1, 1);

        try
        {
            expect(renderer.context).to.equal(renderer.rootContext);
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should allow clear() to work despite no containers added to the renderer', function ()
    {
        const renderer = new PIXI.CanvasRenderer(1, 1);

        try
        {
            renderer.clear();
        }
        finally
        {
            renderer.destroy();
        }
    });
});
