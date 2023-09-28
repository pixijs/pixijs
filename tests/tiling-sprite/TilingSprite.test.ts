import { Bounds } from '../../src/scene/container/bounds/Bounds';
import { getGlobalBounds } from '../../src/scene/container/bounds/getGlobalBounds';
import { Container } from '../../src/scene/container/Container';
import { TilingSprite } from '../../src/scene/sprite-tiling/TilingSprite';
import { getRenderer } from '../utils/getRenderer';
import { getTexture } from '../utils/getTexture';

describe('TilingSprite', () =>
{
    it('should accept constructor arguments', () =>
    {
        const x = 10;
        const y = 20;
        const width = 100;
        const height = 200;
        const anchor = { x: 0.5, y: 0.5 };

        const sprite = new TilingSprite({ texture: getTexture({ width: 256, height: 256 }), x, y, width, height, anchor });

        expect(sprite.x).toBe(x);
        expect(sprite.y).toBe(y);
        expect(sprite.width).toBe(width);
        expect(sprite.height).toBe(height);
        expect(sprite.anchor.x).toBe(anchor.x);
        expect(sprite.anchor.y).toBe(anchor.y);
    });

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

        renderer.render({ container });
        expect(renderer.renderPipes.tilingSprite['_renderableHash'][sprite.uid]).not.toBeNull();

        expect(renderer.renderPipes.tilingSprite['_gpuTilingSprite'][sprite.uid]).toBeUndefined();
        expect(renderer.renderPipes.tilingSprite['_gpuBatchedTilingSprite'][sprite.uid]).not.toBeNull();

        sprite.texture = getTexture({ width: 10, height: 10 });

        renderer.render({ container });

        expect(renderer.renderPipes.tilingSprite['_gpuTilingSprite'][sprite.uid]).not.toBeNull();

        sprite.destroy();

        expect(renderer.renderPipes.tilingSprite['_renderableHash'][sprite.uid]).toBeNull();
        expect(renderer.renderPipes.tilingSprite['_gpuTilingSprite'][sprite.uid]).toBeNull();
        expect(renderer.renderPipes.tilingSprite['_gpuBatchedTilingSprite'][sprite.uid]).toBeNull();

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
