const { WRAP_MODES, TYPES, FORMATS } = require('@pixi/constants');
const { Renderer, BaseTexture } = require('../');

describe('PIXI.TextureSystem', function ()
{
    function createTempTexture(options)
    {
        const canvas = document.createElement('canvas');

        canvas.width = 10;
        canvas.height = 10;

        return BaseTexture.from(canvas, options);
    }

    beforeEach(function ()
    {
        this.renderer = new Renderer();
        this.renderer.mask.enableScissor = true;
    });

    afterEach(function ()
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

    it('should set internalFormat correctly for RGBA float textures', function ()
    {
        const baseTex = createTempTexture({ type: TYPES.FLOAT, format: FORMATS.RGBA });

        this.renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[this.renderer.CONTEXT_UID];

        expect(glTex).to.be.notnull;
        expect(glTex.internalFormat).to.equal(this.renderer.gl.RGBA32F);
    });

    it('should set internalFormat correctly for red-channel float textures', function ()
    {
        const baseTex = createTempTexture({ type: TYPES.FLOAT, format: FORMATS.RED });

        this.renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[this.renderer.CONTEXT_UID];

        expect(glTex).to.be.notnull;
        expect(glTex.internalFormat).to.equal(this.renderer.gl.R32F);
    });
});
