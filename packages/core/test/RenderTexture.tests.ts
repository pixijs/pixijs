import { FORMATS, MSAA_QUALITY, TYPES } from '@pixi/constants';
import { autoDetectRenderer, Framebuffer, Renderer, RenderTexture } from '@pixi/core';
import { Container } from '@pixi/display';
import { AlphaFilter } from '@pixi/filter-alpha';
import { Graphics } from '@pixi/graphics';

function hasColorBufferFloat()
{
    const temporaryRenderer = new Renderer();
    const colorBufferFloat = temporaryRenderer.context.webGLVersion >= 2
        && !!temporaryRenderer.context.extensions.colorBufferFloat;

    temporaryRenderer.destroy();

    return colorBufferFloat;
}

describe('RenderTexture', () =>
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

    it('should destroy the depth texture too', () =>
    {
        const renderer = autoDetectRenderer() as Renderer;

        const renderTexture = RenderTexture.create({ width: 32, height: 32 });
        const framebuffer = renderTexture.framebuffer;

        framebuffer.enableDepth();
        framebuffer.addDepthTexture();

        const depthTexture = framebuffer.depthTexture;

        renderer.renderTexture.bind(renderTexture);

        expect(depthTexture._glTextures[renderer.CONTEXT_UID]).not.toEqual(undefined);
        renderTexture.destroy(true);
        expect(depthTexture._glTextures[renderer.CONTEXT_UID]).toEqual(undefined);
    });

    it('should render correctly with empty mask', () =>
    {
        const { gl } = renderer;

        const renderTexture = RenderTexture.create({ width: 1, height: 1 });

        renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.2];

        const framebuffer = renderTexture.framebuffer;

        framebuffer.multisample = MSAA_QUALITY.NONE;

        const graphics = new Graphics();

        graphics.beginFill(0xffffff).drawRect(0, 0, 1, 1).endFill();

        const container = new Container();

        container.addChild(graphics);
        container.mask = container.addChild(new Graphics());

        renderer.render(container, { renderTexture, clear: true });

        renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(51);
        expect(pixel[1]).toEqual(51);
        expect(pixel[2]).toEqual(51);
        expect(pixel[3]).toEqual(51);
    });

    it('should render correctly with empty mask and multisampling', () =>
    {
        const { gl } = renderer;

        const renderTexture = RenderTexture.create({ width: 1, height: 1 });

        renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.2];

        const framebuffer = renderTexture.framebuffer;

        framebuffer.multisample = MSAA_QUALITY.HIGH;

        const graphics = new Graphics();

        graphics.beginFill(0xffffff).drawRect(0, 0, 1, 1).endFill();

        const container = new Container();

        container.addChild(graphics);
        container.mask = container.addChild(new Graphics());

        renderer.render(container, { renderTexture, clear: true });
        renderer.framebuffer.blit();

        const textureFramebuffer = new Framebuffer(framebuffer.width, framebuffer.height);

        textureFramebuffer.addColorTexture(0, framebuffer.colorTextures[0]);

        renderer.framebuffer.bind(textureFramebuffer);

        const pixel = new Uint8Array([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(51);
        expect(pixel[1]).toEqual(51);
        expect(pixel[2]).toEqual(51);
        expect(pixel[3]).toEqual(51);
    });

    it('should render correctly with mask', () =>
    {
        const { gl } = renderer;

        const renderTexture = RenderTexture.create({ width: 2, height: 2 });

        renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.2];

        const framebuffer = renderTexture.framebuffer;

        framebuffer.multisample = MSAA_QUALITY.NONE;

        const graphics = new Graphics();

        graphics.beginFill(0xffffff).drawRect(0, 0, 2, 2).endFill();

        const container = new Container();

        container.addChild(graphics);
        container.mask = container.addChild(
            new Graphics()
                .beginFill(0xffffff)
                .drawRect(0, 0, 1, 1)
                .endFill()
        );

        renderer.render(container, { renderTexture, clear: true });

        renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(0xff);
        expect(pixel[1]).toEqual(0xff);
        expect(pixel[2]).toEqual(0xff);
        expect(pixel[3]).toEqual(0xff);

        pixel.set([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(51);
        expect(pixel[1]).toEqual(51);
        expect(pixel[2]).toEqual(51);
        expect(pixel[3]).toEqual(51);
    });

    it('should render correctly with stencil mask and filter', () =>
    {
        const { gl } = renderer;

        const renderTexture = RenderTexture.create({ width: 1, height: 1 });

        renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.2];

        const framebuffer = renderTexture.framebuffer;

        framebuffer.multisample = MSAA_QUALITY.NONE;

        const graphics = new Graphics();

        graphics.beginFill(0xffffff).drawRect(0, 0, 1, 1).endFill();

        graphics.filters = [new AlphaFilter()];

        const container = new Container();

        container.addChild(graphics);
        container.mask = container.addChild(
            new Graphics()
                .beginFill(0xffffff)
                .drawCircle(0, 0, 4)
                .endFill()
        );

        renderer.render(container, { renderTexture, clear: true });

        renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(0xff);
        expect(pixel[1]).toEqual(0xff);
        expect(pixel[2]).toEqual(0xff);
        expect(pixel[3]).toEqual(0xff);
    });

    it('should render correctly with mask and multisampling', () =>
    {
        const { gl } = renderer;

        const renderTexture = RenderTexture.create({ width: 2, height: 2 });

        renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.2];

        const framebuffer = renderTexture.framebuffer;

        framebuffer.multisample = MSAA_QUALITY.HIGH;

        const graphics = new Graphics();

        graphics.beginFill(0xffffff).drawRect(0, 0, 2, 2).endFill();

        const container = new Container();

        container.addChild(graphics);
        container.mask = container.addChild(
            new Graphics()
                .beginFill(0xffffff)
                .drawRect(0, 0, 1, 1)
                .endFill()
        );

        renderer.render(container, { renderTexture, clear: true });
        renderer.framebuffer.blit();

        const textureFramebuffer = new Framebuffer(framebuffer.width, framebuffer.height);

        textureFramebuffer.addColorTexture(0, framebuffer.colorTextures[0]);

        renderer.framebuffer.bind(textureFramebuffer);

        const pixel = new Uint8Array([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(0xff);
        expect(pixel[1]).toEqual(0xff);
        expect(pixel[2]).toEqual(0xff);
        expect(pixel[3]).toEqual(0xff);

        pixel.set([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(51);
        expect(pixel[1]).toEqual(51);
        expect(pixel[2]).toEqual(51);
        expect(pixel[3]).toEqual(51);
    });

    it('should resize framebuffer', () =>
    {
        const { gl } = renderer;

        const renderTexture = RenderTexture.create({ width: 1, height: 1 });

        renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.2];

        const framebuffer = renderTexture.framebuffer;

        framebuffer.multisample = MSAA_QUALITY.NONE;

        const graphics = new Graphics();

        graphics.beginFill(0xffffff).drawRect(0, 0, 2, 2).endFill();

        renderer.render(graphics, { renderTexture, clear: true });

        renderTexture.resize(2, 2);

        renderer.render(graphics, { renderTexture, clear: true });

        renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(0xff);
        expect(pixel[1]).toEqual(0xff);
        expect(pixel[2]).toEqual(0xff);
        expect(pixel[3]).toEqual(0xff);
    });

    it('should resize multisampled framebuffer', () =>
    {
        const { gl } = renderer;

        const renderTexture = RenderTexture.create({ width: 1, height: 1 });

        renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.2];

        const framebuffer = renderTexture.framebuffer;

        framebuffer.multisample = MSAA_QUALITY.HIGH;

        const graphics = new Graphics();

        graphics.beginFill(0xffffff).drawRect(0, 0, 2, 2).endFill();

        renderer.render(graphics, { renderTexture, clear: true });
        renderer.framebuffer.blit();

        renderTexture.resize(2, 2);

        renderer.render(graphics, { renderTexture, clear: true });
        renderer.framebuffer.blit();

        const textureFramebuffer = new Framebuffer(framebuffer.width, framebuffer.height);

        textureFramebuffer.addColorTexture(0, framebuffer.colorTextures[0]);

        renderer.framebuffer.bind(textureFramebuffer);

        const pixel = new Uint8Array([0x80, 0x80, 0x80, 0x80]);

        gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        expect(pixel[0]).toEqual(0xff);
        expect(pixel[1]).toEqual(0xff);
        expect(pixel[2]).toEqual(0xff);
        expect(pixel[3]).toEqual(0xff);
    });

    describe('FloatRenderTexture', () =>
    {
        const itif = hasColorBufferFloat() ? it : it.skip;

        itif('should render correctly with mask, multisampling, and format RED / type FLOAT', () =>
        {
            const { gl } = renderer;

            const renderTexture = RenderTexture.create({ width: 2, height: 2, format: FORMATS.RED, type: TYPES.FLOAT });

            renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.5];

            const framebuffer = renderTexture.framebuffer;

            framebuffer.multisample = MSAA_QUALITY.HIGH;

            const graphics = new Graphics();

            graphics.beginFill(0xffffff).drawRect(0, 0, 2, 2).endFill();

            const container = new Container();

            container.addChild(graphics);
            container.mask = container.addChild(
                new Graphics()
                    .beginFill(0xffffff)
                    .drawRect(0, 0, 1, 1)
                    .endFill()
            );

            renderer.render(container, { renderTexture, clear: true });
            renderer.framebuffer.blit();

            const textureFramebuffer = new Framebuffer(framebuffer.width, framebuffer.height);

            textureFramebuffer.addColorTexture(0, framebuffer.colorTextures[0]);

            renderer.framebuffer.bind(textureFramebuffer);

            const pixel = new Float32Array([0.1, 0.2, 0.3, 0.4]);

            gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixel);

            expect(pixel).toEqual(new Float32Array([1.0, 0.0, 0.0, 1.0]));

            pixel.set([0.1, 0.2, 0.3, 0.4]);

            gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.FLOAT, pixel);

            expect(pixel).toEqual(new Float32Array([0.5, 0.0, 0.0, 1.0]));
        });

        itif('should resize multisampled framebuffer with format RED / type FLOAT', () =>
        {
            const { gl } = renderer;

            const renderTexture = RenderTexture.create({ width: 1, height: 1, format: FORMATS.RED, type: TYPES.FLOAT });

            renderTexture.baseTexture.clearColor = [1.0, 1.0, 1.0, 0.5];

            const framebuffer = renderTexture.framebuffer;

            framebuffer.multisample = MSAA_QUALITY.HIGH;

            const graphics = new Graphics();

            graphics.beginFill(0xffffff).drawRect(0, 0, 2, 2).endFill();

            renderer.render(graphics, { renderTexture, clear: true });
            renderer.framebuffer.blit();

            renderTexture.resize(2, 2);

            renderer.render(graphics, { renderTexture, clear: true });
            renderer.framebuffer.blit();

            const textureFramebuffer = new Framebuffer(framebuffer.width, framebuffer.height);

            textureFramebuffer.addColorTexture(0, framebuffer.colorTextures[0]);

            renderer.framebuffer.bind(textureFramebuffer);

            const pixel = new Float32Array([0.1, 0.2, 0.3, 0.4]);

            gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.FLOAT, pixel);

            expect(pixel).toEqual(new Float32Array([1.0, 0.0, 0.0, 1.0]));
        });
    });

    it('should throw error if created with (almost) 0 width or height', () =>
    {
        expect(() => RenderTexture.create()).not.toThrow();
        expect(() => RenderTexture.create({ width: 0, height: 0 })).toThrow();
        expect(() => RenderTexture.create({ width: 0, height: 1 })).toThrow();
        expect(() => RenderTexture.create({ width: 1, height: 0 })).toThrow();
        expect(() => RenderTexture.create({ width: 0.1, height: 0.1 })).toThrow();
        expect(() => RenderTexture.create({ width: 1, height: 1 })).not.toThrow();
        expect(() => RenderTexture.create({ width: 1, height: 1 }).resize(0, 0)).toThrow();
        expect(() => RenderTexture.create({ width: 1, height: 1 }).resize(0, 1)).toThrow();
        expect(() => RenderTexture.create({ width: 1, height: 1 }).resize(1, 0)).toThrow();
        expect(() => RenderTexture.create({ width: 1, height: 1 }).resize(0.1, 0.1)).toThrow();
    });
});
