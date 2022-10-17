import { Renderer, Framebuffer } from '@pixi/core';
import { MSAA_QUALITY } from '@pixi/constants';
import { Rectangle } from '@pixi/math';

describe('FramebufferSystem', () =>
{
    let renderer: Renderer;

    beforeAll(() =>
    {
        renderer = new Renderer();
    });

    afterAll(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    it('should choose correct AA samples based on samples array', () =>
    {
        const { framebuffer } = renderer;

        // chrome, general
        framebuffer['msaaSamples'] = [8, 4, 1];
        expect(framebuffer['detectSamples'](1)).toEqual(0);
        expect(framebuffer['detectSamples'](4)).toEqual(4);
        expect(framebuffer['detectSamples'](8)).toEqual(8);
        // some mobile devices
        framebuffer['msaaSamples'] = [4, 1];
        expect(framebuffer['detectSamples'](8)).toEqual(4);
        // firefox on mac
        framebuffer['msaaSamples'] = [8, 4];
        expect(framebuffer['detectSamples'](1)).toEqual(0);
        // no MSAA
        framebuffer['msaaSamples'] = null;
        expect(framebuffer['detectSamples'](8)).toEqual(0);
    });

    it('should render to mip levels', () =>
    {
        const { gl, CONTEXT_UID } = renderer;

        const framebuffer = new Framebuffer(4, 4);

        renderer.framebuffer.bind(framebuffer, null, 1);

        expect(framebuffer.glFramebuffers[CONTEXT_UID].mipLevel).toEqual(1);

        expect(Array.from(gl.getParameter(gl.VIEWPORT))).toEqual([0, 0, 2, 2]);

        renderer.framebuffer.bind(framebuffer, null, 0);

        expect(framebuffer.glFramebuffers[CONTEXT_UID].mipLevel).toEqual(0);

        expect(Array.from(gl.getParameter(gl.VIEWPORT))).toEqual([0, 0, 4, 4]);
    });

    it('should render to with correct frame', () =>
    {
        const { gl } = renderer;

        const framebuffer = new Framebuffer(4, 4);

        const frame = new Rectangle(2, 2, 2, 2);

        renderer.framebuffer.bind(framebuffer, frame, 0);

        expect(Array.from(gl.getParameter(gl.VIEWPORT))).toEqual([2, 2, 2, 2]);
    });

    it('should create an incomplete framebuffer if it has no attachments', () =>
    {
        renderer.framebuffer['contextChange']();

        const { gl } = renderer;

        const framebuffer = new Framebuffer(4, 4);

        framebuffer.depth = false;
        framebuffer.stencil = false;
        framebuffer.multisample = MSAA_QUALITY.NONE;

        renderer.framebuffer.bind(framebuffer);

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT);
    });

    it('should create a complete framebuffer with a color texture attachment', () =>
    {
        renderer.framebuffer['contextChange']();

        const { gl, CONTEXT_UID } = renderer;

        const framebuffer = new Framebuffer(4, 4);

        framebuffer.depth = false;
        framebuffer.stencil = false;
        framebuffer.multisample = MSAA_QUALITY.NONE;
        framebuffer.addColorTexture(0);

        renderer.framebuffer.bind(framebuffer);

        const fbo = framebuffer.glFramebuffers[CONTEXT_UID];

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
        expect(fbo.multisample).toEqual(0);
        expect(fbo.msaaBuffer).toBeNull();
        expect(fbo.stencil).toBeNull();
    });

    // eslint-disable-next-line func-names
    it('should create a complete framebuffer with depth/stencil attachment', function ()
    {
        renderer.framebuffer['contextChange']();

        if (renderer.context.webGLVersion === 1
            || renderer.framebuffer['msaaSamples'] === null
            || renderer.framebuffer['msaaSamples'].every((x) => x <= 1))
        {
            return;
        }

        const { gl, CONTEXT_UID } = renderer;

        const framebuffer = new Framebuffer(4, 4);

        framebuffer.depth = true;
        framebuffer.stencil = true;
        framebuffer.multisample = MSAA_QUALITY.NONE;
        framebuffer.addColorTexture(0);

        renderer.framebuffer.bind(framebuffer);

        const fbo = framebuffer.glFramebuffers[CONTEXT_UID];

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
        expect(fbo.multisample).toEqual(0);
        expect(fbo.msaaBuffer).toBeNull();
        expect(fbo.stencil).not.toBeNull();

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
    });

    // eslint-disable-next-line func-names
    it('should create a complete multisampled framebuffer', function ()
    {
        renderer.framebuffer['contextChange']();

        if (renderer.context.webGLVersion === 1
            || renderer.framebuffer['msaaSamples'] === null
            || renderer.framebuffer['msaaSamples'].every((x) => x <= 1))
        {
            return;
        }
        const { gl, CONTEXT_UID } = renderer;

        const framebuffer = new Framebuffer(4, 4);

        framebuffer.depth = false;
        framebuffer.stencil = false;
        framebuffer.multisample = MSAA_QUALITY.HIGH;
        framebuffer.addColorTexture(0);

        renderer.framebuffer.bind(framebuffer);

        const fbo = framebuffer.glFramebuffers[CONTEXT_UID];

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
        expect(fbo.multisample).toBeGreaterThan(1);
        expect(fbo.msaaBuffer).not.toBeNull();
        expect(fbo.stencil).toBeNull();

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
    });

    // eslint-disable-next-line func-names
    it('should create a complete multisampled framebuffer with depth/stencil attachment', function ()
    {
        renderer.framebuffer['contextChange']();

        if (renderer.context.webGLVersion === 1
            || renderer.framebuffer['msaaSamples'] === null
            || renderer.framebuffer['msaaSamples'].every((x) => x <= 1))
        {
            return;
        }

        const { gl, CONTEXT_UID } = renderer;

        const framebuffer = new Framebuffer(4, 4);

        framebuffer.depth = true;
        framebuffer.stencil = true;
        framebuffer.multisample = MSAA_QUALITY.HIGH;
        framebuffer.addColorTexture(0);

        renderer.framebuffer.bind(framebuffer);

        const fbo = framebuffer.glFramebuffers[CONTEXT_UID];

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
        expect(fbo.multisample).toBeGreaterThan(1);
        expect(fbo.msaaBuffer).not.toBeNull();
        expect(fbo.stencil).not.toBeNull();

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
    });

    it('should not create an incomplete framebuffer if it has multiple color attachments and multisampling is requested',
        () =>
        {
            renderer.framebuffer['contextChange']();

            const { gl, CONTEXT_UID } = renderer;

            const framebuffer = new Framebuffer(4, 4);

            framebuffer.depth = false;
            framebuffer.stencil = false;
            framebuffer.multisample = MSAA_QUALITY.HIGH;
            framebuffer.addColorTexture(0);
            framebuffer.addColorTexture(1);

            renderer.framebuffer.bind(framebuffer);

            const fbo = framebuffer.glFramebuffers[CONTEXT_UID];

            expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
            expect(fbo.msaaBuffer).toBeNull();
            expect(fbo.stencil).toBeNull();
        });

    it('should not create an incomplete framebuffer if it has depth texture and multisampling is requested',
        // eslint-disable-next-line func-names
        function ()
        {
            renderer.framebuffer['contextChange']();

            if (!renderer.framebuffer.writeDepthTexture)
            {
                return;
            }

            const { gl, CONTEXT_UID } = renderer;

            const framebuffer = new Framebuffer(4, 4);

            framebuffer.depth = false;
            framebuffer.stencil = false;
            framebuffer.multisample = MSAA_QUALITY.HIGH;
            framebuffer.addDepthTexture();

            renderer.framebuffer.bind(framebuffer);

            const fbo = framebuffer.glFramebuffers[CONTEXT_UID];

            expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
            expect(fbo.msaaBuffer).toBeNull();
            expect(fbo.stencil).toBeNull();
        });

    it('should succeed to resize framebuffer', () =>
    {
        renderer.framebuffer['contextChange']();

        const { gl, CONTEXT_UID } = renderer;

        const framebuffer = new Framebuffer(4, 8);

        framebuffer.depth = true;
        framebuffer.stencil = true;
        framebuffer.multisample = MSAA_QUALITY.NONE;
        framebuffer.addColorTexture(0);

        renderer.framebuffer.bind(framebuffer);

        const fbo = framebuffer.glFramebuffers[CONTEXT_UID];

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
        expect(fbo.multisample).toEqual(0);
        expect(fbo.msaaBuffer).toBeNull();
        expect(fbo.stencil).not.toBeNull();

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_WIDTH)).toEqual(4);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_HEIGHT)).toEqual(8);

        framebuffer.resize(16, 32);

        renderer.framebuffer.bind(framebuffer);

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
        expect(fbo.multisample).toEqual(0);
        expect(fbo.msaaBuffer).toBeNull();
        expect(fbo.stencil).not.toBeNull();

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_WIDTH)).toEqual(16);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_HEIGHT)).toEqual(32);
    });

    // eslint-disable-next-line func-names
    it('should succeed to resize multisampled framebuffer', function ()
    {
        renderer.framebuffer['contextChange']();

        if (renderer.context.webGLVersion === 1
            || renderer.framebuffer['msaaSamples'] === null
            || renderer.framebuffer['msaaSamples'].every((x) => x <= 1))
        {
            return;
        }

        const { gl, CONTEXT_UID } = renderer;

        const framebuffer = new Framebuffer(4, 8);

        framebuffer.depth = true;
        framebuffer.stencil = true;
        framebuffer.multisample = MSAA_QUALITY.HIGH;
        framebuffer.addColorTexture(0);

        renderer.framebuffer.bind(framebuffer);

        const fbo = framebuffer.glFramebuffers[CONTEXT_UID];

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
        expect(fbo.multisample).toBeGreaterThan(1);
        expect(fbo.msaaBuffer).not.toBeNull();
        expect(fbo.stencil).not.toBeNull();

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_WIDTH)).toEqual(4);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_HEIGHT)).toEqual(8);

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_WIDTH)).toEqual(4);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_HEIGHT)).toEqual(8);

        framebuffer.resize(16, 32);

        renderer.framebuffer.bind(framebuffer);

        expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toEqual(gl.FRAMEBUFFER_COMPLETE);
        expect(fbo.multisample).toBeGreaterThan(1);
        expect(fbo.msaaBuffer).not.toBeNull();
        expect(fbo.stencil).not.toBeNull();

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_WIDTH)).toEqual(16);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_HEIGHT)).toEqual(32);

        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_SAMPLES)).toEqual(fbo.multisample);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_WIDTH)).toEqual(16);
        expect(gl.getRenderbufferParameter(gl.RENDERBUFFER, gl.RENDERBUFFER_HEIGHT)).toEqual(32);
    });
});
