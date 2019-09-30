const { Sprite } = require('../');
const { Texture, BaseTexture, RenderTexture } = require('@pixi/core');
const { Container } = require('@pixi/display');
const { Point } = require('@pixi/math');

const path = require('path');

describe('PIXI.Sprite', function ()
{
    describe('width', function ()
    {
        it('should not be negative for negative scale.x', function ()
        {
            const sprite = new Sprite();

            sprite.width = 100;
            expect(sprite.width).to.be.at.least(0);
            sprite.scale.x = -1;
            expect(sprite.width).to.be.at.least(0);
        });

        it('should not change sign of scale.x', function ()
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

    describe('height', function ()
    {
        it('should not be negative for negative scale.y', function ()
        {
            const sprite = new Sprite();

            sprite.height = 100;
            expect(sprite.height).to.be.at.least(0);
            sprite.scale.y = -1;
            expect(sprite.height).to.be.at.least(0);
        });

        it('should not change sign of scale.y', function ()
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

    describe('getBounds', function ()
    {
        it('must have correct value according to texture size, width, height and anchor', function ()
        {
            const parent = new Container();
            const texture = new RenderTexture.create(20, 30);
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

    describe('containsPoint', function ()
    {
        const texture = new RenderTexture.create(20, 30);
        const sprite = new Sprite(texture);

        it('should return true when point inside', function ()
        {
            const point = new Point(10, 10);

            expect(sprite.containsPoint(point)).to.be.true;
        });

        it('should return true when point on left edge', function ()
        {
            const point = new Point(0, 15);

            expect(sprite.containsPoint(point)).to.be.true;
        });

        it('should return true when point on top edge', function ()
        {
            const point = new Point(10, 0);

            expect(sprite.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside', function ()
        {
            const point = new Point(100, 100);

            expect(sprite.containsPoint(point)).to.be.false;
        });
    });

    describe('texture', function ()
    {
        it('should unsubscribe from old texture', function ()
        {
            const texture = new Texture(new BaseTexture());
            const texture2 = new Texture(new BaseTexture());

            const sprite = new Sprite(texture);

            expect(texture._eventsCount).to.equal(1);
            expect(texture2._eventsCount).to.equal(0);

            sprite.texture = texture2;

            expect(texture._eventsCount).to.equal(0);
            expect(texture2._eventsCount).to.equal(1);

            sprite.destroy();
            texture.destroy(true);
            texture2.destroy(true);
        });
    });

    describe('destroy', function ()
    {
        it('should destroy while BaseTexture is loading', function ()
        {
            const texture = Texture.from(path.resolve(__dirname, 'resources', 'building1.png'));
            const sprite = new Sprite(texture);

            expect(texture._eventsCount).to.equal(1);

            sprite.destroy();

            expect(texture._eventsCount).to.equal(0);

            texture.emit('update', texture);
            texture.destroy(true);
        });
    });
});
