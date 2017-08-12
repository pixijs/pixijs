'use strict';

const withGL = require('../withGL');

describe('PIXI.extras.cacheAsBitmap', function ()
{
    function getScene(renderer, cacheAsBitmap)
    {
        const stage = new PIXI.Container();
        const container = new PIXI.Container();
        const g = new PIXI.Graphics();

        g.beginFill(0xFF0000);
        g.drawRect(0, 0, 20, 20);
        container.addChild(g);
        stage.addChild(container);

        container.cacheAsBitmap = cacheAsBitmap;
        stage.pivot.x -= 20;
        renderer.render(stage);

        return stage;
    }

    describe('parent pivot should not affect width', function ()
    {
        it('on canvas without cacheAsBitmap', function ()
        {
            const renderer = new PIXI.CanvasRenderer(150, 150);
            const stage = getScene(renderer, false);

            expect(stage.width).to.be.equal(20);
        });

        it('on canvas with cacheAsBitmap', function ()
        {
            const renderer = new PIXI.CanvasRenderer(150, 150);
            const stage = getScene(renderer, true);

            expect(stage.width).to.be.equal(20);
        });

        it('on webgl without cacheAsBitmap', withGL(function ()
        {
            const renderer = new PIXI.WebGLRenderer(150, 150);
            const stage = getScene(renderer, false);

            expect(stage.width).to.be.equal(20);
        }));

        it('on webgl with cacheAsBitmap', withGL(function ()
        {
            const renderer = new PIXI.WebGLRenderer(150, 150);
            const stage = getScene(renderer, true);

            expect(stage.width).to.be.equal(20);
        }));
    });
});
