const { RenderTexture, autoDetectRenderer } = require('../');

describe('RenderTexture', function ()
{
    it('should destroy the depth texture too', function ()
    {
        const renderer = autoDetectRenderer();

        const renderTexture = RenderTexture.create({ width: 32, height: 32 });
        const framebuffer = renderTexture.framebuffer;

        framebuffer.enableDepth();
        framebuffer.addDepthTexture();

        const depthTexture = framebuffer.depthTexture;

        renderer.renderTexture.bind(renderTexture);

        expect(depthTexture._glTextures[renderer.CONTEXT_UID]).to.not.equal(undefined);
        renderTexture.destroy(true);
        expect(depthTexture._glTextures[renderer.CONTEXT_UID]).to.equal(undefined);
    });
});
