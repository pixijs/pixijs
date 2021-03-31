const { WRAP_MODES, TYPES, FORMATS, SAMPLER_TYPES } = require('@pixi/constants');
const { Renderer, Texture, BaseTexture, BufferResource } = require('../');

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

        expect(glTex).to.exist;
        expect(glTex.wrapMode).to.equal(WRAP_MODES.REPEAT);
    });

    it('should not allow glTexture wrapMode=REPEAT for non-pow2 in webgl1', function ()
    {
        const baseTex = createTempTexture();

        baseTex.wrapMode = WRAP_MODES.REPEAT;
        this.renderer.texture.webGLVersion = 1;
        this.renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[this.renderer.CONTEXT_UID];

        expect(glTex).to.exist;
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

    function createIntegerTexture()
    {
        const baseTexture = BaseTexture.fromBuffer(new Uint32Array([0, 0, 0, 0]), 1, 1);
        const oldUpload = baseTexture.resource.upload.bind(baseTexture);

        baseTexture.resource.upload = (renderer, baseTexture, glTexture) =>
        {
            glTexture.samplerType = SAMPLER_TYPES.INT;
            if (renderer.context.webGLVersion === 2)
            {
                glTexture.internalFormat = renderer.context.gl.RGBA32I;
            }

            return oldUpload(renderer, baseTexture, glTexture);
        };

        return baseTexture;
    }

    it('should unbind textures with non-float samplerType for batching', function ()
    {
        const textureSystem = this.renderer.texture;
        const { boundTextures } = textureSystem;
        const sampleTex = createIntegerTexture();
        const sampleTex2 = createIntegerTexture();

        textureSystem.bind(Texture.WHITE.baseTexture, 0);
        textureSystem.bind(sampleTex, 1);
        textureSystem.bind(sampleTex2, 2);
        expect(textureSystem.hasIntegerTextures).to.be.true;
        textureSystem.ensureSamplerType(2);
        expect(boundTextures[0]).to.equal(Texture.WHITE.baseTexture);
        expect(boundTextures[1]).to.be.null;
        expect(boundTextures[2]).to.equal(sampleTex2);
    });
});
