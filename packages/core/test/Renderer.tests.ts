import { Renderer, Framebuffer, ObjectRenderer } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { settings } from '@pixi/settings';
import { ENV, MSAA_QUALITY } from '@pixi/constants';
import { skipHello } from '@pixi/utils';
import sinon from 'sinon';
import { expect } from 'chai';

skipHello();

describe('Renderer', () =>
{
    it('setting option legacy should disable VAOs and SPRITE_MAX_TEXTURES', () =>
    {
        settings.PREFER_ENV = ENV.WEBGL_LEGACY;
        const renderer = new Renderer({ width: 1, height: 1 });

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
        const spy = sinon.spy();

        renderer.on('resize', spy);
        renderer.resize(2, 4);

        expect(spy.calledOnce).to.be.true;
        expect(spy.firstCall.args[0]).to.equal(2);
        expect(spy.firstCall.args[1]).to.equal(4);

        renderer.destroy();
    });

    describe('.setObjectRenderer()', () =>
    {
        let renderer: Renderer;
        let curRenderer: ObjectRenderer;
        let objRenderer: ObjectRenderer;

        before(() =>
        {
            renderer = new Renderer();
        });

        beforeEach(() =>
        {
            curRenderer = {
                start: sinon.spy(),
                stop: sinon.spy(),
            } as unknown as ObjectRenderer;
            objRenderer = {
                start: sinon.spy(),
                stop: sinon.spy(),
            } as unknown as ObjectRenderer;
            renderer.batch.currentRenderer = curRenderer;
        });

        after(() =>
        {
            renderer.destroy();
            renderer = null;
            curRenderer = null;
            objRenderer = null;
        });

        it('should set objectRenderer as new current renderer', () =>
        {
            renderer.batch.setObjectRenderer(objRenderer);
            expect(curRenderer.stop).to.be.calledOnce;
            expect(renderer.batch.currentRenderer).to.be.equal(objRenderer);
            expect(objRenderer.start).to.be.calledOnce;
        });

        it('should do nothing if objectRenderer is already used as current', () =>
        {
            renderer.batch.setObjectRenderer(curRenderer);
            expect(renderer.batch.currentRenderer).to.be.equal(curRenderer);
            expect(curRenderer.stop).to.not.be.called;
            expect(curRenderer.start).to.not.be.called;
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

            expect(pixel[0]).to.equal(0xff);
            expect(pixel[1]).to.equal(0xff);
            expect(pixel[2]).to.equal(0xff);
            expect(pixel[3]).to.equal(0xff);
        });
    });
});
