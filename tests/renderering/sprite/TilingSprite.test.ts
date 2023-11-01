import { Point } from '../../../src/maths/point/Point';
import { TextureSource } from '../../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { Bounds } from '../../../src/scene/container/bounds/Bounds';
import { getGlobalBounds } from '../../../src/scene/container/bounds/getGlobalBounds';
import { Container } from '../../../src/scene/container/Container';
import { Sprite } from '../../../src/scene/sprite/Sprite';
import { TilingSprite } from '../../../src/scene/sprite-tiling/TilingSprite';
import { getRenderer } from '../../utils/getRenderer';
import { getTexture } from '../../utils/getTexture';

describe('TilingSprite', () =>
{
    describe.skip('Lifecycle', () =>
    {
        it('should accept constructor arguments', () =>
        {
            const x = 10;
            const y = 20;
            const width = 100;
            const height = 200;
            const anchor = { x: 0.5, y: 0.5 };

            const sprite = new TilingSprite(
                {
                    texture: getTexture({ width: 256, height: 256 }),
                    x, y,
                    width, height,
                    anchor
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

    describe('getBounds()', () =>
    {
        it('must have correct value according to _width, _height and anchor', () =>
        {
            const parent = new Container();
            const texture = new Texture();
            const tilingSprite = new TilingSprite({
                texture,
                width: 200,
                height: 300,
            });

            parent.addChild(tilingSprite);

            tilingSprite.anchor.set(0.5, 0.5);
            tilingSprite.scale.set(-2, 2);
            tilingSprite.position.set(50, 40);

            const bounds = tilingSprite.getBounds();

            expect(bounds.x).toEqual(-150);
            expect(bounds.y).toEqual(-260);
            expect(bounds.width).toEqual(400);
            expect(bounds.height).toEqual(600);
        });
    });

    describe('.from()', () =>
    {
        it('should build from texture', () =>
        {
            const sprite = new TilingSprite({
                texture: Texture.EMPTY,
                width: 1,
                height: 2,
            });

            sprite.destroy();
        });

        it('should build a texture from source', () =>
        {
            const canvas = document.createElement('canvas');

            canvas.width = 10;
            canvas.height = 10;

            const texture = new Texture({ source: new TextureSource({ resource: canvas }) });
            const sprite = new TilingSprite({
                texture,
                width: 10,
                height: 10,
            });

            sprite.destroy(true);
        });
    });

    describe('.getLocalBounds()', () =>
    {
        let tileSprite: TilingSprite;
        let spy: jest.SpyInstance;

        beforeEach(() =>
        {
            tileSprite = new TilingSprite({
                texture: Texture.EMPTY,
                width: 1,
                height: 2,
            });
            tileSprite.anchor.set(3, 4);
            spy = jest.spyOn(Sprite.prototype, 'getLocalBounds');
            spy.mockReset();
            tileSprite['_bounds'] = { getRectangle: jest.fn() } as unknown as Bounds;
        });

        afterEach(() =>
        {
            // @ts-expect-error ---
            Sprite.prototype.getLocalBounds.mockClear();
        });

        afterAll(() =>
        {
            tileSprite.destroy();
            tileSprite = null;
        });

        it.only('should call parent method if there are children', () =>
        {
            // tileSprite.children.length = 1;
            tileSprite.addChild(new Sprite());
            tileSprite.getLocalBounds();
            expect(Sprite.prototype.getLocalBounds).toHaveBeenCalledOnce();
            expect(tileSprite['_bounds'].getRectangle).not.toBeCalled();
        });

        it('should make quick calc if no children', () =>
        {
            tileSprite.children.length = 0;
            // @ts-expect-error ---
            tileSprite.getLocalBounds('dummy');

            expect(tileSprite['_bounds'].getRectangle).toHaveBeenCalledOnce();
            // @ts-expect-error ---
            expect(tileSprite['_bounds'].getRectangle.mock.calls[0][0]).toEqual('dummy');
            expect(Sprite.prototype.getLocalBounds).not.toBeCalled();

            expect(tileSprite['_bounds'].minX).toEqual(-3);
            expect(tileSprite['_bounds'].minY).toEqual(-8);
            expect(tileSprite['_bounds'].maxX).toEqual(-2);
            expect(tileSprite['_bounds'].maxY).toEqual(-6);
        });

        it('should assign default rect if rect is not specified', () =>
        {
            tileSprite.children.length = 0;
            // @ts-expect-error ---
            tileSprite['_localBoundsRect'] = 'localRect';
            tileSprite.getLocalBounds();

            expect(tileSprite['_bounds'].getRectangle).toHaveBeenCalledOnce();
            // @ts-expect-error ---
            expect(tileSprite['_bounds'].getRectangle.mock.calls[0][0]).toEqual('localRect');
            expect(Sprite.prototype.getLocalBounds).not.toBeCalled();

            expect(tileSprite['_bounds'].minX).toEqual(-3);
            expect(tileSprite['_bounds'].minY).toEqual(-8);
            expect(tileSprite['_bounds'].maxX).toEqual(-2);
            expect(tileSprite['_bounds'].maxY).toEqual(-6);
        });

        it('should create and assign rect if default rect is not', () =>
        {
            tileSprite.children.length = 0;
            tileSprite['_localBoundsRect'] = null;
            tileSprite.getLocalBounds();

            expect(tileSprite['_bounds'].getRectangle).toHaveBeenCalledOnce();
            // @ts-expect-error ---
            expect(tileSprite['_bounds'].getRectangle.mock.calls[0][0]).toBeInstanceOf(Rectangle);
            expect(Sprite.prototype.getLocalBounds).not.toBeCalled();

            expect(tileSprite['_bounds'].minX).toEqual(-3);
            expect(tileSprite['_bounds'].minY).toEqual(-8);
            expect(tileSprite['_bounds'].maxX).toEqual(-2);
            expect(tileSprite['_bounds'].maxY).toEqual(-6);
        });
    });

    it('checks if tilingSprite contains a point', () =>
    {
        const texture = new Texture();
        const tilingSprite = new TilingSprite(texture, 200, 300);

        expect(tilingSprite.containsPoint(new Point(0, 0))).toEqual(true);
        expect(tilingSprite.containsPoint(new Point(10, 10))).toEqual(true);
        expect(tilingSprite.containsPoint(new Point(200, 300))).toEqual(false);
        expect(tilingSprite.containsPoint(new Point(300, 400))).toEqual(false);
    });

    it('gets and sets height and width correctly', () =>
    {
        const texture = new Texture();
        const tilingSprite = new TilingSprite(texture, 200, 300);

        tilingSprite.width = 400;
        tilingSprite.height = 600;

        expect(tilingSprite.width).toEqual(400);
        expect(tilingSprite.height).toEqual(600);
    });

    it('should create TilingSprite with nullable texture', () =>
    {
        const tilingSprite = new TilingSprite(null, 1, 1);

        expect(tilingSprite.texture).toEqual(Texture.EMPTY);
    });
});
