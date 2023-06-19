import { BaseTexture, Point, Rectangle, Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { TilingSprite } from '@pixi/sprite-tiling';

import type { Bounds } from '@pixi/display';

describe('TilingSprite', () =>
{
    describe('getBounds()', () =>
    {
        it('must have correct value according to _width, _height and anchor', () =>
        {
            const parent = new Container();
            const texture = new Texture(new BaseTexture());
            const tilingSprite = new TilingSprite(texture, 200, 300);

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
            const sprite = TilingSprite.from(Texture.EMPTY, {
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

            const sprite = TilingSprite.from(canvas, {
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
            tileSprite = new TilingSprite(Texture.EMPTY, 1, 2);
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

        it('should call parent method if there are children', () =>
        {
            tileSprite.children.length = 1;
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
        const texture = new Texture(new BaseTexture());
        const tilingSprite = new TilingSprite(texture, 200, 300);

        expect(tilingSprite.containsPoint(new Point(0, 0))).toEqual(true);
        expect(tilingSprite.containsPoint(new Point(10, 10))).toEqual(true);
        expect(tilingSprite.containsPoint(new Point(200, 300))).toEqual(false);
        expect(tilingSprite.containsPoint(new Point(300, 400))).toEqual(false);
    });

    it('gets and sets height and width correctly', () =>
    {
        const texture = new Texture(new BaseTexture());
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
