import { Renderer, Framebuffer } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { expect } from 'chai';

describe('FramebufferSystem', function ()
{
    before(function ()
    {
        this.renderer = new Renderer();
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
    });

    it('should choose correct AA samples based on samples array', function ()
    {
        const { framebuffer } = this.renderer;

        // chrome, general
        framebuffer.msaaSamples = [8, 4, 1];
        expect(framebuffer.detectSamples(1)).to.equal(0);
        expect(framebuffer.detectSamples(4)).to.equal(4);
        expect(framebuffer.detectSamples(8)).to.equal(8);
        // some mobile devices
        framebuffer.msaaSamples = [4, 1];
        expect(framebuffer.detectSamples(8)).to.equal(4);
        // firefox on mac
        framebuffer.msaaSamples = [8, 4];
        expect(framebuffer.detectSamples(1)).to.equal(0);
        // no MSAA
        framebuffer.msaaSamples = null;
        expect(framebuffer.detectSamples(8)).to.equal(0);
    });

    it('should render to mip levels', function ()
    {
        const { gl, CONTEXT_UID } = this.renderer;

        const framebuffer = new Framebuffer(4, 4);

        this.renderer.framebuffer.bind(framebuffer, null, 1);

        expect(framebuffer.glFramebuffers[CONTEXT_UID].mipLevel).to.equal(1);

        expect(Array.from(gl.getParameter(gl.VIEWPORT))).to.deep.equal([0, 0, 2, 2]);

        this.renderer.framebuffer.bind(framebuffer, null, 0);

        expect(framebuffer.glFramebuffers[CONTEXT_UID].mipLevel).to.equal(0);

        expect(Array.from(gl.getParameter(gl.VIEWPORT))).to.deep.equal([0, 0, 4, 4]);
    });

    it('should render to with correct frame', function ()
    {
        const { gl, CONTEXT_UID } = this.renderer;

        const framebuffer = new Framebuffer(4, 4);

        const frame = new Rectangle(2, 2, 2, 2);

        this.renderer.framebuffer.bind(framebuffer, frame, 0);

        expect(Array.from(gl.getParameter(gl.VIEWPORT))).to.deep.equal([2, 2, 2, 2]);
    });
});
