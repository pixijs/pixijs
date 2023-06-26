import { Bounds } from '../../src/rendering/scene/bounds/Bounds';
import { getGlobalBounds } from '../../src/rendering/scene/bounds/getGlobalBounds';
import { Container } from '../../src/rendering/scene/Container';
import { TilingSprite } from '../../src/tiling-sprite/TilingSprite';
import { getRenderer } from '../utils/getRenderer';
import { getTexture } from '../utils/getTexture';

describe('TilingSprite', () =>
{
    it('should not throw when destroyed', () =>
    {
        const sprite = new TilingSprite();

        expect(() => sprite.destroy()).not.toThrow();
    });

    it('should clean up correctly on the pipe and system when destroyed using simple render', async () =>
    {
        const renderer = await getRenderer();

        const container = new Container();

        const sprite = new TilingSprite({
            texture: getTexture({ width: 256, height: 256 })
        });

        container.addChild(sprite);

        renderer.render(container);
        expect(renderer.renderPipes.tilingSprite['renderableHash'][sprite.uid]).not.toBeNull();

        expect(renderer.renderPipes.tilingSprite['gpuTilingSprite'][sprite.uid]).toBeUndefined();
        expect(renderer.renderPipes.tilingSprite['gpuBatchedTilingSprite'][sprite.uid]).not.toBeNull();

        sprite.texture = getTexture({ width: 10, height: 10 });

        renderer.render(container);

        expect(renderer.renderPipes.tilingSprite['gpuTilingSprite'][sprite.uid]).not.toBeNull();

        sprite.destroy();

        expect(renderer.renderPipes.tilingSprite['renderableHash'][sprite.uid]).toBeNull();
        expect(renderer.renderPipes.tilingSprite['gpuTilingSprite'][sprite.uid]).toBeNull();
        expect(renderer.renderPipes.tilingSprite['gpuBatchedTilingSprite'][sprite.uid]).toBeNull();

        expect(sprite.view.texture).toBeNull();
    });

    it('should global bounds to be correct', async () =>
    {
        const sprite = new TilingSprite({
            texture: getTexture({ width: 256, height: 256 })
        });

        const bounds = getGlobalBounds(sprite, true, new Bounds());

        expect(bounds.minX).toBe(0);
        expect(bounds.maxX).toBe(256);
        expect(bounds.minY).toBe(0);
        expect(bounds.maxY).toBe(256);
    });
});
