import { FORMATS, TYPES, WRAP_MODES } from '@pixi/constants';
import { BaseTexture, Renderer, Texture } from '@pixi/core';

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

        expect(glTex).toBeDefined();
        expect(glTex.wrapMode).toEqual(WRAP_MODES.REPEAT);
    });

    it('should not allow glTexture wrapMode=REPEAT for non-pow2 in webgl1', () =>
    {
        const baseTex = createTempTexture();

        baseTex.wrapMode = WRAP_MODES.REPEAT;
        renderer.texture['webGLVersion'] = 1;
        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).toBeDefined();
        expect(glTex.wrapMode).toEqual(WRAP_MODES.CLAMP);
    });

    it('should set internalFormat correctly for RGBA float textures', () =>
    {
        const baseTex = createTempTexture({ type: TYPES.FLOAT, format: FORMATS.RGBA });

        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).not.toBeNull();
        expect(glTex.internalFormat).toEqual(renderer.gl.RGBA32F);
    });

    it('should set internalFormat correctly for red-channel float textures', () =>
    {
        const baseTex = createTempTexture({ type: TYPES.FLOAT, format: FORMATS.RED });

        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).not.toBeNull();
        expect(glTex.internalFormat).toEqual(renderer.gl.R32F);
    });

    it('should set internalFormat correctly for RGB FLOAT textures', () =>
    {
        const baseTex = createTempTexture({ type: TYPES.FLOAT, format: FORMATS.RGB });

        renderer.texture.bind(baseTex);

        const glTex = baseTex._glTextures[renderer.CONTEXT_UID];

        expect(glTex).not.toBeNull();
        expect(glTex.internalFormat).toEqual(renderer.gl.RGB32F);
    });

    it('should unbind textures with non-float samplerType for batching', () =>
    {
        if (renderer.context.webGLVersion === 1)
        {
            return;
        }

        const textureSystem = renderer.texture;
        const { boundTextures } = textureSystem;
        const sampleTex = BaseTexture.fromBuffer(new Int32Array(4), 1, 1);
        const sampleTex2 = BaseTexture.fromBuffer(new Int32Array(4), 1, 1);

        expect(sampleTex.format).toBe(FORMATS.RGBA_INTEGER);
        expect(sampleTex2.format).toBe(FORMATS.RGBA_INTEGER);
        expect(sampleTex.type).toBe(TYPES.INT);
        expect(sampleTex2.type).toBe(TYPES.INT);

        textureSystem.bind(Texture.WHITE.baseTexture, 0);
        textureSystem.bind(sampleTex, 1);
        textureSystem.bind(sampleTex2, 2);
        expect(textureSystem['hasIntegerTextures']).toBe(true);
        textureSystem.ensureSamplerType(2);
        expect(boundTextures[0]).toEqual(Texture.WHITE.baseTexture);
        expect(boundTextures[1]).toBeNull();
        expect(boundTextures[2]).toEqual(sampleTex2);
    });

    it('should bind empty texture if texture is invalid', () =>
    {
        const textureSystem = renderer.texture;

        expect(Texture.WHITE.baseTexture.valid).toBe(true);

        textureSystem.bind(Texture.WHITE.baseTexture, 0);

        expect(textureSystem.boundTextures[0]).toEqual(Texture.WHITE.baseTexture);
        expect(Texture.EMPTY.baseTexture.valid).toBe(false);

        textureSystem.bind(Texture.EMPTY.baseTexture, 0);

        expect(textureSystem.boundTextures[0]).toEqual(null);

        const baseTexture = createTempTexture();

        expect(baseTexture.valid).toBe(true);

        textureSystem.bind(baseTexture, 0);

        expect(textureSystem.boundTextures[0]).toEqual(baseTexture);

        baseTexture.destroy();

        expect(baseTexture.valid).toBe(false);

        textureSystem.bind(baseTexture, 0);

        expect(textureSystem.boundTextures[0]).toEqual(null);
    });
});
