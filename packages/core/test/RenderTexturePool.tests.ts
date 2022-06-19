import { RenderTexturePool } from '@pixi/core';

describe('RenderTexturePool', () =>
{
    it('should destroy screen-sized textures on resize', () =>
    {
        const renderTexturePool = new RenderTexturePool();

        renderTexturePool.setScreenSize({ width: 100, height: 100 });

        expect(renderTexturePool.enableFullScreen).toBe(true);

        const renderTexture = renderTexturePool.getOptimalTexture(100, 100);
        const baseRenderTexture = renderTexture.baseTexture;

        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).toEqual(0);

        renderTexturePool.returnTexture(renderTexture);

        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).toEqual(1);

        renderTexturePool.setScreenSize({ width: 50, height: 50 });

        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).toEqual(0);

        expect(renderTexture.baseTexture).toBeNull();
        expect(baseRenderTexture.destroyed).toBe(true);

        renderTexturePool.clear(true);
    });

    it('should create screen-sized texture with noninteger resolution', () =>
    {
        const resolution = 1.1;
        const viewWidth = 1419;
        const viewHeight = 983;
        const screenWidth = viewWidth / resolution;
        const screenHeight = viewHeight / resolution;

        expect(screenWidth * resolution).toEqual(1419.0000000000002);
        expect(screenHeight * resolution).toEqual(982.9999999999999);

        const renderTexturePool = new RenderTexturePool();

        renderTexturePool.setScreenSize({ width: viewWidth, height: viewHeight });

        expect(renderTexturePool.enableFullScreen).toBe(true);

        const renderTexture = renderTexturePool.getOptimalTexture(screenWidth, screenHeight, resolution);
        const baseRenderTexture = renderTexture.baseTexture;

        expect(baseRenderTexture.width).toEqual(screenWidth);
        expect(baseRenderTexture.height).toEqual(screenHeight);
        expect(baseRenderTexture.realWidth).toEqual(viewWidth);
        expect(baseRenderTexture.realHeight).toEqual(viewHeight);
        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).toEqual(0);

        renderTexturePool.returnTexture(renderTexture);

        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).toEqual(1);

        renderTexturePool.clear(true);
    });
});
