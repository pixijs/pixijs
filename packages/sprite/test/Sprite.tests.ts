import { Sprite } from '@pixi/sprite';
import { Texture, BaseTexture, RenderTexture } from '@pixi/core';
import { Container } from '@pixi/display';
import { Point } from '@pixi/math';
import { expect } from 'chai';

import path from 'path';

describe('Sprite', () =>
{
    describe('width', () =>
    {
        it('should not be negative for negative scale.x', () =>
        {
            const sprite = new Sprite();

            sprite.width = 100;
            expect(sprite.width).to.be.at.least(0);
            sprite.scale.x = -1;
            expect(sprite.width).to.be.at.least(0);
        });

        it('should not change sign of scale.x', () =>
        {
            const texture = new Texture(new BaseTexture());
            const sprite = new Sprite();

            texture.orig.width = 100;
            sprite.scale.x = 1;
            sprite.width = 50;

            expect(sprite.scale.x).to.be.above(0);

            sprite.scale.x = -1;
            sprite.width = 75;

            expect(sprite.scale.x).to.be.below(0);
        });
    });

    describe('height', () =>
    {
        it('should not be negative for negative scale.y', () =>
        {
            const sprite = new Sprite();

            sprite.height = 100;
            expect(sprite.height).to.be.at.least(0);
            sprite.scale.y = -1;
            expect(sprite.height).to.be.at.least(0);
        });

        it('should not change sign of scale.y', () =>
        {
            const texture = new Texture(new BaseTexture());
            const sprite = new Sprite();

            texture.orig.height = 100;
            sprite.scale.y = 1;
            sprite.height = 50;

            expect(sprite.scale.y).to.be.above(0);

            sprite.scale.y = -1;
            sprite.height = 75;

            expect(sprite.scale.y).to.be.below(0);
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

            expect(bounds.x).to.equal(-150);
            expect(bounds.y).to.equal(-260);
            expect(bounds.width).to.equal(400);
            expect(bounds.height).to.equal(600);
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

            expect(bounds.x).to.equal(-10);
            expect(bounds.y).to.equal(-15);
            expect(bounds.width).to.equal(20);
            expect(bounds.height).to.equal(30);
        });

        it('should not corrupt bounds', () =>
        {
            const texture = RenderTexture.create({ width: 20, height: 30 });
            const sprite = new Sprite(texture);

            sprite.scale.x = 2;
            sprite.y = -5;

            let bounds = sprite.getBounds(false);

            expect(bounds.x).to.equal(0);
            expect(bounds.y).to.equal(-5);
            expect(bounds.width).to.equal(40);
            expect(bounds.height).to.equal(30);

            bounds = sprite.getLocalBounds();

            expect(bounds.x).to.equal(0);
            expect(bounds.y).to.equal(0);
            expect(bounds.width).to.equal(20);
            expect(bounds.height).to.equal(30);

            bounds = sprite.getBounds(true);

            expect(bounds.x).to.equal(0);
            expect(bounds.y).to.equal(-5);
            expect(bounds.width).to.equal(40);
            expect(bounds.height).to.equal(30);
        });
    });

    describe('containsPoint', () =>
    {
        const texture = RenderTexture.create({ width: 20, height: 30 });
        const sprite = new Sprite(texture);

        it('should return true when point inside', () =>
        {
            const point = new Point(10, 10);

            expect(sprite.containsPoint(point)).to.be.true;
        });

        it('should return true when point on left edge', () =>
        {
            const point = new Point(0, 15);

            expect(sprite.containsPoint(point)).to.be.true;
        });

        it('should return true when point on top edge', () =>
        {
            const point = new Point(10, 0);

            expect(sprite.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside', () =>
        {
            const point = new Point(100, 100);

            expect(sprite.containsPoint(point)).to.be.false;
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

            expect(texture['_eventsCount']).to.equal(1);
            expect(texture2['_eventsCount']).to.equal(0);

            sprite.texture = texture2;

            expect(texture['_eventsCount']).to.equal(0);
            expect(texture2['_eventsCount']).to.equal(1);

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

            expect(texture['_eventsCount']).to.equal(1);

            sprite.destroy();

            expect(texture['_eventsCount']).to.equal(0);

            texture.emit('update', texture);
            texture.destroy(true);
        });
    });
});
