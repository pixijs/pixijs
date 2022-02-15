import { RenderTexturePool } from '@pixi/core';
import { expect } from 'chai';

describe('RenderTexturePool', function ()
{
    it('should destroy screen-sized textures on resize', function ()
    {
        const renderTexturePool = new RenderTexturePool();

        renderTexturePool.setScreenSize({ width: 100, height: 100 });

        expect(renderTexturePool.enableFullScreen).to.be.true;

        const renderTexture = renderTexturePool.getOptimalTexture(100, 100);
        const baseRenderTexture = renderTexture.baseTexture;

        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).to.equal(0);

        renderTexturePool.returnTexture(renderTexture);

        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).to.equal(1);

        renderTexturePool.setScreenSize({ width: 50, height: 50 });

        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).to.equal(0);

        expect(renderTexture.baseTexture).to.be.null;
        expect(baseRenderTexture.destroyed).to.be.true;

        renderTexturePool.clear(true);
    });

    it('should create screen-sized texture with noninteger resolution', function ()
    {
        const resolution = 1.1;
        const viewWidth = 1419;
        const viewHeight = 983;
        const screenWidth = viewWidth / resolution;
        const screenHeight = viewHeight / resolution;

        expect(screenWidth * resolution).to.equal(1419.0000000000002);
        expect(screenHeight * resolution).to.equal(982.9999999999999);

        const renderTexturePool = new RenderTexturePool();

        renderTexturePool.setScreenSize({ width: viewWidth, height: viewHeight });

        expect(renderTexturePool.enableFullScreen).to.be.true;

        const renderTexture = renderTexturePool.getOptimalTexture(screenWidth, screenHeight, resolution);
        const baseRenderTexture = renderTexture.baseTexture;

        expect(baseRenderTexture.width).to.equal(screenWidth);
        expect(baseRenderTexture.height).to.equal(screenHeight);
        expect(baseRenderTexture.realWidth).to.equal(viewWidth);
        expect(baseRenderTexture.realHeight).to.equal(viewHeight);
        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).to.equal(0);

        renderTexturePool.returnTexture(renderTexture);

        expect(renderTexturePool.texturePool[RenderTexturePool.SCREEN_KEY]?.length ?? 0).to.equal(1);

        renderTexturePool.clear(true);
    });
});
