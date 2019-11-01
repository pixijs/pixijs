const { WRAP_MODES } = require('@pixi/constants');
const { Renderer, BaseTexture } = require('../');

describe('PIXI.systems.TextureSystem', function ()
{
    function createTempTexture()
    {
        const canvas = document.createElement('canvas');

        canvas.width = 10;
        canvas.height = 10;

        return BaseTexture.from(canvas);
    }

    before(function ()
    {
        this.renderer = new Renderer();
        this.renderer.mask.enableScissor = true;
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
    });

    it('should allow glTexture wrapMode=REPEAT for non-pow2 in webgl2', function ()
    {
        const baseTex = createTempTexture();

        baseTex.wrapMode = WRAP_MODES.REPEAT;
        this.renderer.texture.webGLVersion = 2;
        this.renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[this.renderer.CONTEXT_UID];

        expect(glTex).to.be.notnull;
        expect(glTex.wrapMode).to.equal(WRAP_MODES.REPEAT);
    });

    it('should not allow glTexture wrapMode=REPEAT for non-pow2 in webgl1', function ()
    {
        const baseTex = createTempTexture();

        baseTex.wrapMode = WRAP_MODES.REPEAT;
        this.renderer.texture.webGLVersion = 1;
        this.renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[this.renderer.CONTEXT_UID];

        expect(glTex).to.be.notnull;
        expect(glTex.wrapMode).to.equal(WRAP_MODES.CLAMP);
    });
});
