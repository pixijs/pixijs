const { Renderer } = require('./..');
const { Rectangle } = require('@pixi/math');

describe('PIXI.RenderTextureSystem', function ()
{
    before(function ()
    {
        this.renderer = new Renderer({ resolution: 4, width: 1024, height: 1024 });
    });

    after(function ()
    {
        this.renderer = null;
    });

    it('the default viewport should have a width/height equal to that of the renderer', function ()
    {
        this.renderer.renderTexture.bind();

        const viewport = this.renderer.framebuffer.viewport;

        expect(viewport.x).to.equal(0);
        expect(viewport.y).to.equal(0);
        expect(viewport.width).to.equal(this.renderer.width);
        expect(viewport.height).to.equal(this.renderer.height);

        const destinationFrame = this.renderer.renderTexture.destinationFrame;

        expect(destinationFrame.x).to.equal(0);
        expect(destinationFrame.y).to.equal(0);
        expect(destinationFrame.width).to.equal(this.renderer.width / this.renderer.resolution);
        expect(destinationFrame.height).to.equal(this.renderer.height / this.renderer.resolution);
    });

    it('rebinding with the same source & destination frame should change nothing', function ()
    {
        const sourceFrame = new Rectangle(16, 16, 512, 512);
        const destinationFrame = new Rectangle(24, 24, 64, 64);
        const renderTextureSystem = this.renderer.renderTexture;

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
