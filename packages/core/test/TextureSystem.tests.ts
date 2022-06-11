import { WRAP_MODES, TYPES, FORMATS, SAMPLER_TYPES } from '@pixi/constants';
import { Renderer, Texture, BaseTexture } from '@pixi/core';
import { expect } from 'chai';

describe('TextureSystem', () =>
{
    let renderer: Renderer;

    function createTempTexture(options?: Parameters<typeof BaseTexture.from>[1])
    {
        const canvas = document.createElement('canvas');

        canvas.width = 10;
        canvas.height = 10;

        return BaseTexture.from(canvas, options);
    }

    beforeEach(() =>
    {
        renderer = new Renderer();
        renderer.mask.enableScissor = true;
    });

    afterEach(() =>
    {
        renderer.destroy();
        renderer = null;
    });

    it('should allow glTexture wrapMode=REPEAT for non-pow2 in webgl2', () =>
    {
        const baseTex = createTempTexture();

        baseTex.wrapMode = WRAP_MODES.REPEAT;
        renderer.texture['webGLVersion'] = 2;
        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).to.exist;
        expect(glTex.wrapMode).to.equal(WRAP_MODES.REPEAT);
    });

    it('should not allow glTexture wrapMode=REPEAT for non-pow2 in webgl1', () =>
    {
        const baseTex = createTempTexture();

        baseTex.wrapMode = WRAP_MODES.REPEAT;
        renderer.texture['webGLVersion'] = 1;
        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).to.exist;
        expect(glTex.wrapMode).to.equal(WRAP_MODES.CLAMP);
    });

    it('should set internalFormat correctly for RGBA float textures', () =>
    {
        const baseTex = createTempTexture({ type: TYPES.FLOAT, format: FORMATS.RGBA });

        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).to.not.be.null;
        expect(glTex.internalFormat).to.equal(renderer.gl.RGBA32F);
    });

    it('should set internalFormat correctly for red-channel float textures', () =>
    {
        const baseTex = createTempTexture({ type: TYPES.FLOAT, format: FORMATS.RED });

        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).to.not.be.null;
        expect(glTex.internalFormat).to.equal(renderer.gl.R32F);
    });

    it('should set internalFormat correctly for RGB FLOAT textures', () =>
    {
        const baseTex = createTempTexture({ type: TYPES.FLOAT, format: FORMATS.RGB });

        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).to.not.be.null;
        expect(glTex.internalFormat).to.equal(renderer.gl.RGB32F);
    });

    function createIntegerTexture()
    {
        // @ts-expect-error ---
        const baseTexture = BaseTexture.fromBuffer(new Uint32Array([0, 0, 0, 0]), 1, 1);
        const oldUpload = baseTexture.resource.upload.bind(baseTexture);

        baseTexture.resource.upload = (renderer, baseTexture, glTexture) =>
        {
            glTexture.samplerType = SAMPLER_TYPES.INT;
            if (renderer.context.webGLVersion === 2)
            {
                glTexture.internalFormat = renderer.context['gl'].RGBA32I;
            }

            return oldUpload(renderer, baseTexture, glTexture);
        };

        return baseTexture;
    }

    it('should unbind textures with non-float samplerType for batching', () =>
    {
        const textureSystem = renderer.texture;
        const { boundTextures } = textureSystem;
        const sampleTex = createIntegerTexture();
        const sampleTex2 = createIntegerTexture();

        textureSystem.bind(Texture.WHITE.baseTexture, 0);
        textureSystem.bind(sampleTex, 1);
        textureSystem.bind(sampleTex2, 2);
        expect(textureSystem['hasIntegerTextures']).to.be.true;
        textureSystem.ensureSamplerType(2);
        expect(boundTextures[0]).to.equal(Texture.WHITE.baseTexture);
        expect(boundTextures[1]).to.be.null;
        expect(boundTextures[2]).to.equal(sampleTex2);
    });

    it('should bind empty texture if texture is invalid', () =>
    {
        const textureSystem = renderer.texture;

        expect(Texture.WHITE.baseTexture.valid).to.be.true;

        textureSystem.bind(Texture.WHITE.baseTexture, 0);

        expect(textureSystem.boundTextures[0]).to.equal(Texture.WHITE.baseTexture);
        expect(Texture.EMPTY.baseTexture.valid).to.be.false;

        textureSystem.bind(Texture.EMPTY.baseTexture, 0);

        expect(textureSystem.boundTextures[0]).to.equal(null);
    });
});
