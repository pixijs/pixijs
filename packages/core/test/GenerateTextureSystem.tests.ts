import { Renderer } from '@pixi/core';
import { Sprite } from '@pixi/sprite';

describe('GenerateTextureSystem', () =>
{
    it('should bind render texture', () =>
    {
        const renderer = new Renderer();
        const sprite = new Sprite();
        const renderTexture = renderer.generateTexture(sprite);

        expect(renderer.renderTexture.current).toBe(renderTexture);

        renderTexture.destroy(true);
        renderer.destroy();
    });
});
