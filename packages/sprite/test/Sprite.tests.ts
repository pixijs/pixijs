import path from 'path';
import { BaseTexture, Point, RenderTexture, Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';

describe('Sprite', () =>
{
    describe('width', () =>
    {
        it('should not be negative for negative scale.x', () =>
        {
            const sprite = new Sprite();

            sprite.width = 100;
            expect(sprite.width).toBeGreaterThanOrEqual(0);
            sprite.scale.x = -1;
            expect(sprite.width).toBeGreaterThanOrEqual(0);
        });

        it('should not change sign of scale.x', () =>
        {
            const texture = new Texture(new BaseTexture());
            const sprite = new Sprite();

            texture.orig.width = 100;
            sprite.scale.x = 1;
            sprite.width = 50;

            expect(sprite.scale.x).toBeGreaterThan(0);

            sprite.scale.x = -1;
            sprite.width = 75;

            expect(sprite.scale.x).toBeLessThan(0);
        });
    });

    describe('height', () =>
    {
        it('should not be negative for negative scale.y', () =>
        {
            const sprite = new Sprite();

            sprite.height = 100;
            expect(sprite.height).toBeGreaterThanOrEqual(0);
            sprite.scale.y = -1;
            expect(sprite.height).toBeGreaterThanOrEqual(0);
        });

        it('should not change sign of scale.y', () =>
        {
            const texture = new Texture(new BaseTexture());
            const sprite = new Sprite();

            texture.orig.height = 100;
            sprite.scale.y = 1;
            sprite.height = 50;

            expect(sprite.scale.y).toBeGreaterThan(0);

            sprite.scale.y = -1;
            sprite.height = 75;

            expect(sprite.scale.y).toBeLessThan(0);
        });
    });

    describe('getBounds', () =>
    {
        it('must have correct value according to texture size, width, height and anchor', () =>
        {
            const parent = new Container();
            const texture = RenderTexture.create({ width: 20, height: 30 });
            const sprite = new Sprite(texture);

            sprite.width = 200;
            sprite.height = 300;

            parent.addChild(sprite);

            sprite.scale.x *= 2;
            sprite.scale.y *= 2;
            sprite.anchor.set(0.5, 0.5);
            sprite.position.set(50, 40);

            const bounds = sprite.getBounds();

            expect(bounds.x).toEqual(-150);
            expect(bounds.y).toEqual(-260);
            expect(bounds.width).toEqual(400);
            expect(bounds.height).toEqual(600);
        });
    });

    describe('getLocalBounds', () =>
    {
        it('must have correct value according to texture size, width, height and anchor', () =>
        {
            const texture = RenderTexture.create({ width: 20, height: 30 });
            const sprite = new Sprite(texture);

            sprite.anchor.set(0.5, 0.5);

            const bounds = sprite.getLocalBounds();

            expect(bounds.x).toEqual(-10);
            expect(bounds.y).toEqual(-15);
            expect(bounds.width).toEqual(20);
            expect(bounds.height).toEqual(30);
        });

        it('should not corrupt bounds', () =>
        {
            const texture = RenderTexture.create({ width: 20, height: 30 });
            const sprite = new Sprite(texture);

            sprite.scale.x = 2;
            sprite.y = -5;

            let bounds = sprite.getBounds(false);

            expect(Math.abs(bounds.x)).toEqual(0);
            expect(bounds.y).toEqual(-5);
            expect(bounds.width).toEqual(40);
            expect(bounds.height).toEqual(30);

            bounds = sprite.getLocalBounds();

            expect(Math.abs(bounds.x)).toEqual(0);
            expect(Math.abs(bounds.y)).toEqual(0);
            expect(bounds.width).toEqual(20);
            expect(bounds.height).toEqual(30);

            bounds = sprite.getBounds(true);

            expect(Math.abs(bounds.x)).toEqual(0);
            expect(bounds.y).toEqual(-5);
            expect(bounds.width).toEqual(40);
            expect(bounds.height).toEqual(30);
        });
    });

    describe('containsPoint', () =>
    {
        const texture = RenderTexture.create({ width: 20, height: 30 });
        const sprite = new Sprite(texture);

        it('should return true when point inside', () =>
        {
            const point = new Point(10, 10);

            expect(sprite.containsPoint(point)).toBe(true);
        });

        it('should return true when point on left edge', () =>
        {
            const point = new Point(0, 15);

            expect(sprite.containsPoint(point)).toBe(true);
        });

        it('should return true when point on top edge', () =>
        {
            const point = new Point(10, 0);

            expect(sprite.containsPoint(point)).toBe(true);
        });

        it('should return false when point outside', () =>
        {
            const point = new Point(100, 100);

            expect(sprite.containsPoint(point)).toBe(false);
        });
    });

    interface EETexture extends Texture
    {
        _eventsCount: number; // missing in ee3 typings
    }

    describe('texture', () =>
    {
        it('should unsubscribe from old texture', () =>
        {
            const texture = new Texture(new BaseTexture()) as EETexture;
            const texture2 = new Texture(new BaseTexture()) as EETexture;

            const sprite = new Sprite(texture);

            expect(texture['_eventsCount']).toEqual(1);
            expect(texture2['_eventsCount']).toEqual(0);

            sprite.texture = texture2;

            expect(texture['_eventsCount']).toEqual(0);
            expect(texture2['_eventsCount']).toEqual(1);

            sprite.destroy();
            texture.destroy(true);
            texture2.destroy(true);
        });
    });

    describe('destroy', () =>
    {
        it('should destroy while BaseTexture is loading', () =>
        {
            const texture = Texture.from(path.resolve(__dirname, 'resources', 'building1.png')) as EETexture;
            const sprite = new Sprite(texture);

            expect(texture['_eventsCount']).toEqual(1);

            sprite.destroy();

            expect(texture['_eventsCount']).toEqual(0);

            texture.emit('update', texture);
            texture.destroy(true);
        });
    });

    describe('tint', () =>
    {
        it('should support ColorSource inputs', () =>
        {
            const sprite = new Sprite(Texture.WHITE);

            sprite.tint = 'red';

            expect(sprite.tint).toEqual('red');
            expect(sprite.tintValue).toEqual(0xff0000);

            sprite.destroy();
        });
    });
});
