const { Renderer } = require('../');
const { settings } = require('@pixi/settings');
const { ENV } = require('@pixi/constants');
const { skipHello } = require('@pixi/utils');

skipHello();

describe('PIXI.Renderer', function ()
{
    it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', function ()
    {
        settings.PREFER_ENV = ENV.WEBGL_LEGACY;
        const renderer = new Renderer(1, 1);

        try
        {
            expect(renderer.geometry.hasVao).to.equal(false);
            // expect(renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);
        }
        finally
        {
            renderer.destroy();
        }
        settings.PREFER_ENV = ENV.WEBGL2;
    });

    it('should allow clear() to work despite no containers added to the renderer', function ()
    {
        const renderer = new Renderer(1, 1);

        try
        {
            renderer.clear();
        }
        finally
        {
            renderer.destroy();
        }
    });

    describe('.setObjectRenderer()', function ()
    {
        before(function ()
        {
            this.renderer = new Renderer();
        });

        beforeEach(function ()
        {
            this.curRenderer = {
                start: sinon.spy(),
                stop: sinon.spy(),
            };
            this.objRenderer = {
                start: sinon.spy(),
                stop: sinon.spy(),
            };
            this.renderer.batch.currentRenderer = this.curRenderer;
        });

        after(function ()
        {
            this.renderer.destroy();
            this.renderer = null;
            this.curRenderer = null;
            this.objRenderer = null;
        });

        it('should set objectRenderer as new current renderer', function ()
        {
            this.renderer.batch.setObjectRenderer(this.objRenderer);
            expect(this.curRenderer.stop).to.be.calledOnce;
            expect(this.renderer.batch.currentRenderer).to.be.equal(this.objRenderer);
            expect(this.objRenderer.start).to.be.calledOnce;
        });

        it('should do nothing if objectRenderer is already used as current', function ()
        {
            this.renderer.batch.setObjectRenderer(this.curRenderer);
            expect(this.renderer.batch.currentRenderer).to.be.equal(this.curRenderer);
            expect(this.curRenderer.stop).to.not.be.called;
            expect(this.curRenderer.start).to.not.be.called;
        });
    });

    describe('Masks', function() {
        before(function ()
        {
            this.renderer = new Renderer();
        });

        after(function ()
        {
            this.renderer.destroy();
            this.renderer = null;
        });

        it('should have scissor-masks enabled', function() {
            expect(this.renderer.mask.enableScissor).to.equal(true)
        });

        it('should use scissor masks whith axis aligned squares', function() {
            const context = {}
            const maskData = {
                isFastRect() { return true; },
                worldTransform: { a: 0, b: 0 },
                getBounds() { return { x: 0, y: 0, width: 0, height: 0 }; },
            };

            this.renderer.mask.push(context, maskData);

            expect(this.renderer.mask.scissor).to.equal(true);

            this.renderer.mask.pop(context, maskData);

            expect(this.renderer.mask.scissor).to.equal(false);
        });

        it('should not use scissor masks with non axis aligned sqares', function() {
            const context = {}
            const maskData = {
                isFastRect() { return true; },
                worldTransform: { a: 0.1, b: 2 },
                render() { return; },
            };

            this.renderer.mask.push(context, maskData);

            expect(this.renderer.mask.scissor).to.equal(false);

            this.renderer.mask.pop(context, maskData);
        });
    })
});
