const { Renderer } = require('./..');

describe('PIXI.systems.RenderTextureSystem', function ()
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
        // TODO:
    });
});
