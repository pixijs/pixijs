import { Bounds } from '../../container/bounds/Bounds';
import { getGlobalBounds } from '../../container/bounds/getGlobalBounds';
import { Container } from '../../container/Container';
import { TilingSprite } from '../TilingSprite';
import '../init';
import '../../mesh/init';
import { getTexture, getWebGLRenderer } from '@test-utils';
import { Point } from '~/maths';
import { Texture } from '~/rendering';

import type { TextureSource } from '~/rendering';

describe('TilingSprite', () =>
{
    type SetupOptions = {
        texture: Texture;
        source: TextureSource;
        width: number;
        height: number;
        x: number;
        y: number;
        anchor: { x: number; y: number };
    };

    const setup = (options: Partial<SetupOptions> = {}) =>
    {
        const { texture, source, width = 256, height = 256, x = 0, y = 0, anchor = { x: 0, y: 0 } } = options;

        const sprite = new TilingSprite({
            texture: texture ?? new Texture({ source }),
            width,
            height,
            x,
            y,
            anchor,
        });

        return sprite;
    };

    describe('Lifecycle', () =>
    {
        it('should accept constructor arguments', () =>
        {
            const x = 10;
            const y = 20;
            const width = 100;
            const height = 200;
            const anchor = { x: 0.5, y: 0.5 };

            const sprite = setup({
                texture: getTexture({ width: 256, height: 256 }),
                x, y,
                width, height,
                anchor,
            });

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
            const renderer = await getWebGLRenderer();

            const container = new Container();

            const sprite = new TilingSprite({
                texture: getTexture({ width: 256, height: 256 })
            });

            container.addChild(sprite);

            renderer.render({ container });

            const renderData = renderer.renderPipes.tilingSprite['_tilingSpriteDataHash'][sprite.uid];

            expect(renderData).not.toBeNull();

            expect(renderData.shader).toBeUndefined();
            expect(renderData.batchableMesh).not.toBeNull();

            sprite.texture = getTexture({ width: 10, height: 10 });

            renderer.render({ container });

            expect(renderData.shader).not.toBeNull();

            sprite.destroy();

            expect(renderer.renderPipes.tilingSprite['_tilingSpriteDataHash'][sprite.uid]).toBeNull();

            expect(sprite.texture).toBeNull();
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

    describe('Geometry', () =>
    {
        it('should calculate correct bounds when transformed', () =>
        {
            const sprite = setup({ width: 200, height: 300 });

            sprite.anchor.set(0.5, 0.5);
            sprite.scale.set(-2, 2);
            sprite.position.set(50, 40);

            const bounds = sprite.getBounds();

            expect(bounds.x).toEqual(-150);
            expect(bounds.y).toEqual(-260);
            expect(bounds.width).toEqual(400);
            expect(bounds.height).toEqual(600);
        });

        it('should check whether contains point correctly', () =>
        {
            const sprite = setup({ width: 200, height: 300 });

            // note: containsPoint works in local coords
            expect(sprite.containsPoint(new Point(0, 0))).toEqual(true);
            expect(sprite.containsPoint(new Point(100, 150))).toEqual(true);
            expect(sprite.containsPoint(new Point(200, 300))).toEqual(true);
            expect(sprite.containsPoint(new Point(201, 301))).toEqual(false);
            expect(sprite.containsPoint(new Point(-1, -1))).toEqual(false);
        });

        it('should check whether contains point correctly when anchor is set', () =>
        {
            const sprite = setup({ width: 200, height: 300, anchor: { x: 0.5, y: 0.5 } });

            // note: containsPoint works in local coords
            expect(sprite.containsPoint(new Point(0, 0))).toEqual(true);
            expect(sprite.containsPoint(new Point(100, 150))).toEqual(true);
            expect(sprite.containsPoint(new Point(200 / 2, 300 / 2))).toEqual(true);
            expect(sprite.containsPoint(new Point(201 / 2, 301 / 2))).toEqual(false);
            expect(sprite.containsPoint(new Point(-1, -1))).toEqual(true);
        });

        it('should get and set height & width correctly', () =>
        {
            const sprite = setup({ width: 200, height: 300 });

            expect(sprite.width).toEqual(200);
            expect(sprite.height).toEqual(300);

            sprite.width = 400;
            sprite.height = 600;

            expect(sprite.width).toEqual(400);
            expect(sprite.height).toEqual(600);
        });
    });

    describe('Texture Construction', () =>
    {
        it('should build from given texture', () =>
        {
            const texture = new Texture();
            const sprite = setup({ texture });

            expect(sprite.texture).toEqual(texture);
        });

        it('should use empty texture when no texture passed', () =>
        {
            const tilingSprite = new TilingSprite({
                width: 1,
                height: 1,
            });

            expect(tilingSprite.texture).toEqual(Texture.EMPTY);
        });
    });

    describe('Anchor', () =>
    {
        it('should update anchor', () =>
        {
            const texture = new Texture();
            const sprite = setup({ texture });

            expect(sprite.texture).toEqual(texture);

            const spy = jest.spyOn((sprite as any), 'onViewUpdate');

            sprite.anchor.x = 0.5;

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
