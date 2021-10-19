'use strict';

const withGL = require('../withGL');

describe('PIXI.MaskSystem', function ()
{
    describe('stencil', function ()
    {
        it('should not affect filters', withGL(function ()
        {
            const renderer = new PIXI.WebGLRenderer(200, 200, {});

            try
            {
                const filter = new PIXI.filters.AlphaFilter();
                const container = new PIXI.Container();
                const topMask = new PIXI.Graphics();
                const gl = renderer.gl;

                topMask.beginFill(0xffffff, 1.0);
                topMask.drawRect(0, 0, 100, 100);
                topMask.closePath();

                renderer.maskManager.pushMask(null, topMask);
                expect(renderer.maskManager.scissor).to.be.true;
                expect(gl.isEnabled(gl.SCISSOR_TEST)).to.be.true;
                renderer.filterManager.pushFilter(container, [filter]);
                expect(renderer.maskManager.scissor).to.be.true;
                expect(gl.isEnabled(gl.SCISSOR_TEST)).to.be.false;
                renderer.filterManager.popFilter();
                expect(gl.isEnabled(gl.SCISSOR_TEST)).to.be.true;
                renderer.maskManager.popScissorMask();
                expect(gl.isEnabled(gl.SCISSOR_TEST)).to.be.false;
            }
            finally
            {
                renderer.destroy();
            }
        }));
        it('should disable colorMask if bounds are empty', withGL(function ()
        {
            const renderer = new PIXI.WebGLRenderer(200, 200, {});

            try
            {
                const filter = new PIXI.filters.AlphaFilter();
                const container = new PIXI.Container();
                const topMask = new PIXI.Graphics();
                const bottomMask = new PIXI.Graphics();
                const gl = renderer.gl;

                bottomMask.beginFill(0xffffff, 1.0);
                bottomMask.drawRect(0, 0, 100, 100);
                bottomMask.closePath();

                const spy = sinon.spy(renderer.plugins.graphics, 'render');

                renderer.maskManager.pushScissorMask(null, topMask);
                expect(renderer.maskManager.scissor).to.be.true;
                expect(renderer.maskManager.scissorEmpty).to.be.true;
                expect(gl.isEnabled(gl.SCISSOR_TEST)).to.be.false;
                expect(renderer.maskManager.colorMaskCounter).to.equal(1);
                renderer.maskManager.pushStencilMask(bottomMask);
                expect(gl.isEnabled(gl.SCISSOR_TEST)).to.be.false;
                expect(spy).to.have.been.notCalled;
                renderer.filterManager.pushFilter(container, [filter]);
                expect(renderer.maskManager.colorMaskCounter).to.equal(0);
                renderer.maskManager.pushStencilMask(bottomMask);
                expect(spy).to.have.been.calledOnce;
                renderer.maskManager.popStencilMask();
                renderer.filterManager.popFilter();
                expect(renderer.maskManager.colorMaskCounter).to.equal(1);
                renderer.maskManager.popStencilMask();
                expect(renderer.maskManager.colorMaskCounter).to.equal(1);
                renderer.maskManager.popScissorMask();
                expect(renderer.maskManager.colorMaskCounter).to.equal(0);
            }
            finally
            {
                renderer.destroy();
            }
        }));
    });
});
