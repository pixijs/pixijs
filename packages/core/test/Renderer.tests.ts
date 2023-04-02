import { ENV, MSAA_QUALITY } from '@pixi/constants';
import { Framebuffer, Renderer, RenderTexture } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { settings } from '@pixi/settings';
import { Sprite } from '@pixi/sprite';

import type { ObjectRenderer } from '@pixi/core';

describe('Renderer', () =>
{
    it('setting option legacy should disable VAOs', () =>
    {
        settings.PREFER_ENV = ENV.WEBGL_LEGACY;
        const renderer = new Renderer({ width: 1, height: 1 });

        try
        {
            expect(renderer.geometry.hasVao).toEqual(false);
        }
        finally
        {
            renderer.destroy();
        }
        settings.PREFER_ENV = ENV.WEBGL2;
    });

    it('should allow clear() to work despite no containers added to the renderer', () =>
    {
        const renderer = new Renderer({ width: 1, height: 1 });

        try
        {
            renderer.clear();
        }
        finally
        {
            renderer.destroy();
        }
    });

    it('should emit resize event', () =>
    {
        const renderer = new Renderer({ width: 1, height: 1 });
        const spy = jest.fn();

        renderer.on('resize', spy);
        renderer.resize(2, 4);

        expect(spy).toBeCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(2, 4);

        renderer.destroy();
    });

    describe('.setObjectRenderer()', () =>
    {
        let renderer: Renderer;
        let curRenderer: ObjectRenderer;
        let objRenderer: ObjectRenderer;

        beforeAll(() =>
        {
            renderer = new Renderer();
        });

        beforeEach(() =>
        {
            curRenderer = {
                start: jest.fn(),
                stop: jest.fn(),
            } as unknown as ObjectRenderer;
            objRenderer = {
                start: jest.fn(),
                stop: jest.fn(),
            } as unknown as ObjectRenderer;
            renderer.batch.currentRenderer = curRenderer;
        });

        afterAll(() =>
        {
            renderer.destroy();
            renderer = null;
            curRenderer = null;
            objRenderer = null;
        });

        it('should set objectRenderer as new current renderer', () =>
        {
            renderer.batch.setObjectRenderer(objRenderer);
            expect(curRenderer.stop).toHaveBeenCalledOnce();
            expect(renderer.batch.currentRenderer).toEqual(objRenderer);
            expect(objRenderer.start).toHaveBeenCalledOnce();
        });

        it('should do nothing if objectRenderer is already used as current', () =>
        {
            renderer.batch.setObjectRenderer(curRenderer);
            expect(renderer.batch.currentRenderer).toEqual(curRenderer);
            expect(curRenderer.stop).not.toBeCalled();
            expect(curRenderer.start).not.toBeCalled();
        });

        it('should generate a multisampled texture', () =>
        {
            const { gl } = renderer;

            const graphics = new Graphics();

            graphics.beginFill(0xffffff).drawRect(0, 0, 1, 1).endFill();

            const renderTexture = renderer.generateTexture(graphics, { multisample: MSAA_QUALITY.HIGH });

            const framebuffer = renderTexture.framebuffer;

            const textureFramebuffer = new Framebuffer(framebuffer.width, framebuffer.height);

            textureFramebuffer.addColorTexture(0, framebuffer.colorTextures[0]);

            renderer.framebuffer.bind(textureFramebuffer);

            const pixel = new Uint8Array([0x80, 0x80, 0x80, 0x80]);

            gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

            expect(pixel[0]).toEqual(0xff);
            expect(pixel[1]).toEqual(0xff);
            expect(pixel[2]).toEqual(0xff);
            expect(pixel[3]).toEqual(0xff);
        });
    });

    it('should support OffscreenCanvas', () =>
    {
        const view = new OffscreenCanvas(1, 1);
        const renderer = new Renderer({ view, width: 1, height: 1 });

        expect(renderer.view).toBeInstanceOf(OffscreenCanvas);

        renderer.destroy();
    });

    it('should support natural language color names', () =>
    {
        const renderer = new Renderer({ background: 'white' });

        expect(renderer.background.color).toEqual('white');
        expect(renderer.background.backgroundColor.toHex()).toEqual('#ffffff');
        expect(renderer.background.backgroundColor.toArray()).toEqual([1, 1, 1, 1]);

        renderer.destroy();
    });

    it('should expose constructor options', () =>
    {
        const options = { width: 1, height: 2, antialias: true, resolution: 2 };
        const renderer = new Renderer(options);

        expect(renderer.options.width).toBe(1);
        expect(renderer.options.height).toBe(2);
        expect(renderer.options.antialias).toBe(true);
        expect(renderer.options.resolution).toBe(2);

        renderer.destroy();
    });

    it('should bind render texture and framebuffer', () =>
    {
        const renderer = new Renderer();
        const sprite = new Sprite();
        const renderTexture = RenderTexture.create();

        renderer.render(sprite);

        expect(renderer.renderTexture.current).toBeNull();
        expect(renderer.framebuffer.current).toBeNull();

        renderer.render(sprite, { renderTexture });

        expect(renderer.renderTexture.current).toBe(renderTexture);
        expect(renderer.framebuffer.current).toBe(renderTexture.framebuffer);

        renderTexture.destroy(true);
        renderer.destroy();
    });

    it('should bind blit framebuffer if multisample and blit', () =>
    {
        const renderer = new Renderer();

        if (renderer.context.webGLVersion === 1
            || renderer.framebuffer['msaaSamples'] === null
            || renderer.framebuffer['msaaSamples'].every((x) => x <= 1))
        {
            renderer.destroy();

            return;
        }

        const sprite = new Sprite();
        const renderTexture = RenderTexture.create({ multisample: MSAA_QUALITY.HIGH });

        renderer.render(sprite, { renderTexture, blit: false });

        expect(renderer.renderTexture.current).toBe(renderTexture);
        expect(renderer.framebuffer.current).toBe(renderTexture.framebuffer);

        renderer.render(sprite, { renderTexture, blit: true });

        expect(renderer.renderTexture.current).toBe(renderTexture);

        const framebuffer = renderTexture.framebuffer;
        const fbo = framebuffer.glFramebuffers[renderer.CONTEXT_UID];

        expect(fbo.blitFramebuffer).not.toBeNull();
        expect(renderer.framebuffer.current).toBe(fbo.blitFramebuffer);

        renderTexture.destroy(true);
        renderer.destroy();
    });
});
