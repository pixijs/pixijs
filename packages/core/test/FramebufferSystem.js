const { Renderer } = require('../');

describe('PIXI.systems.FramebufferSystem', function ()
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
});
