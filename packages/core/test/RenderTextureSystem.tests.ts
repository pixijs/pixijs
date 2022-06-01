import { Renderer } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { expect } from 'chai';

describe('RenderTextureSystem', () =>
{
    let renderer: Renderer;

    before(() =>
    {
        renderer = new Renderer({ resolution: 4, width: 1024, height: 1024 });
    });

    after(() =>
    {
        renderer = null;
    });

    it('the default viewport should have a width/height equal to that of the renderer', () =>
    {
        renderer.renderTexture.bind();

        const viewport = renderer.framebuffer.viewport;

        expect(viewport.x).to.equal(0);
        expect(viewport.y).to.equal(0);
        expect(viewport.width).to.equal(renderer.width);
        expect(viewport.height).to.equal(renderer.height);

        const destinationFrame = renderer.renderTexture.destinationFrame;

        expect(destinationFrame.x).to.equal(0);
        expect(destinationFrame.y).to.equal(0);
        expect(destinationFrame.width).to.equal(renderer.width / renderer.resolution);
        expect(destinationFrame.height).to.equal(renderer.height / renderer.resolution);
    });

    it('rebinding with the same source & destination frame should change nothing', () =>
    {
        const sourceFrame = new Rectangle(16, 16, 512, 512);
        const destinationFrame = new Rectangle(24, 24, 64, 64);
        const renderTextureSystem = renderer.renderTexture;

        renderTextureSystem.bind(null, sourceFrame, destinationFrame);
        renderTextureSystem.bind(null, renderTextureSystem.sourceFrame, renderTextureSystem.destinationFrame);

        expect(destinationFrame.x).to.equal(renderTextureSystem.destinationFrame.x);
        expect(destinationFrame.y).to.equal(renderTextureSystem.destinationFrame.y);
        expect(destinationFrame.width).to.equal(renderTextureSystem.destinationFrame.width);
        expect(destinationFrame.height).to.equal(renderTextureSystem.destinationFrame.height);

        expect(sourceFrame.x).to.equal(renderTextureSystem.sourceFrame.x);
        expect(sourceFrame.y).to.equal(renderTextureSystem.sourceFrame.y);
        expect(sourceFrame.width).to.equal(renderTextureSystem.sourceFrame.width);
        expect(sourceFrame.height).to.equal(renderTextureSystem.sourceFrame.height);
    });
});
