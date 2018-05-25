'use strict';

const withGL = require('../withGL');

describe('PIXI.WebGLRenderer', function ()
{
    describe('instance', function ()
    {
        if (withGL())
        {
            afterEach(function ()
            {
                this.renderer.destroy();
            });

            after(function ()
            {
                this.renderer = null;
            });
        }

        it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', withGL(function ()
        {
            this.renderer = new PIXI.WebGLRenderer(1, 1, { legacy: true });

            expect(PIXI.glCore.VertexArrayObject.FORCE_NATIVE).to.equal(true);
            expect(this.renderer.plugins.sprite.MAX_TEXTURES).to.equal(1);
        }));

        it('should allow clear() to work despite no containers added to the renderer', withGL(function ()
        {
            this.renderer = new PIXI.WebGLRenderer(1, 1);
            this.renderer.clear();
        }));
    });

    describe('.setObjectRenderer()', function ()
    {
        if (withGL())
        {
            before(function ()
            {
                this.renderer = new PIXI.WebGLRenderer();
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
                this.renderer.currentRenderer = this.curRenderer;
            });

            after(function ()
            {
                this.renderer.destroy();
                this.renderer = null;
                this.curRenderer = null;
                this.objRenderer = null;
            });
        }

        it('should set objectRenderer as new current renderer', withGL(function ()
        {
            this.renderer.setObjectRenderer(this.objRenderer);
            expect(this.curRenderer.stop).to.be.calledOnce;
            expect(this.renderer.currentRenderer).to.be.equal(this.objRenderer);
            expect(this.objRenderer.start).to.be.calledOnce;
        }));

        it('should do nothing if objectRenderer is already used as current', withGL(function ()
        {
            this.renderer.setObjectRenderer(this.curRenderer);
            expect(this.renderer.currentRenderer).to.be.equal(this.curRenderer);
            expect(this.curRenderer.stop).to.not.be.called;
            expect(this.curRenderer.start).to.not.be.called;
        }));
    });
});
