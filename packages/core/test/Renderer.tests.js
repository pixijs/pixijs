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

    it('should emit resize event', function ()
    {
        const renderer = new Renderer(1, 1);
        const spy = sinon.spy();

        renderer.on('resize', spy);
        renderer.resize(2, 4);

        expect(spy.calledOnce).to.be.true;
        expect(spy.firstCall.args[0]).to.equal(2);
        expect(spy.firstCall.args[1]).to.equal(4);

        renderer.destroy();
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
});
