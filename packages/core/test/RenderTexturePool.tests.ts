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
});
