import { Renderer } from '@pixi/core';
import { Rectangle } from '@pixi/math';

describe('RenderTextureSystem', () =>
{
    let renderer: Renderer;

    beforeAll(() =>
    {
        renderer = new Renderer({ resolution: 4, width: 1024, height: 1024 });
    });

    afterAll(() =>
    {
        renderer = null;
    });

    it('the default viewport should have a width/height equal to that of the renderer', () =>
    {
        renderer.renderTexture.bind();

        const viewport = renderer.framebuffer.viewport;

        expect(viewport.x).toEqual(0);
        expect(viewport.y).toEqual(0);
        expect(viewport.width).toEqual(renderer.width);
        expect(viewport.height).toEqual(renderer.height);

        const destinationFrame = renderer.renderTexture.destinationFrame;

        expect(destinationFrame.x).toEqual(0);
        expect(destinationFrame.y).toEqual(0);
        expect(destinationFrame.width).toEqual(renderer.width / renderer.resolution);
        expect(destinationFrame.height).toEqual(renderer.height / renderer.resolution);
    });

    it('rebinding with the same source & destination frame should change nothing', () =>
    {
        const sourceFrame = new Rectangle(16, 16, 512, 512);
        const destinationFrame = new Rectangle(24, 24, 64, 64);
        const renderTextureSystem = renderer.renderTexture;

        renderTextureSystem.bind(null, sourceFrame, destinationFrame);
        renderTextureSystem.bind(null, renderTextureSystem.sourceFrame, renderTextureSystem.destinationFrame);

        expect(destinationFrame.x).toEqual(renderTextureSystem.destinationFrame.x);
        expect(destinationFrame.y).toEqual(renderTextureSystem.destinationFrame.y);
        expect(destinationFrame.width).toEqual(renderTextureSystem.destinationFrame.width);
        expect(destinationFrame.height).toEqual(renderTextureSystem.destinationFrame.height);

        expect(sourceFrame.x).toEqual(renderTextureSystem.sourceFrame.x);
        expect(sourceFrame.y).toEqual(renderTextureSystem.sourceFrame.y);
        expect(sourceFrame.width).toEqual(renderTextureSystem.sourceFrame.width);
        expect(sourceFrame.height).toEqual(renderTextureSystem.sourceFrame.height);
    });
});
