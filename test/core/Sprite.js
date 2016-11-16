'use strict';

describe('PIXI.Sprite', function ()
{
    describe('width', function ()
    {
        it('should not be negative for negative scale.x', function ()
        {
            const sprite = new PIXI.Sprite();

            sprite.width = 100;
            expect(sprite.width).to.be.at.least(0);
            sprite.scale.x = -1;
            expect(sprite.width).to.be.at.least(0);
        });

        it('should not change sign of scale.x', function ()
        {
            const texture = new PIXI.Texture(new PIXI.BaseTexture());
            const sprite = new PIXI.Sprite();

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
            const sprite = new PIXI.Sprite();

            sprite.height = 100;
            expect(sprite.height).to.be.at.least(0);
            sprite.scale.y = -1;
            expect(sprite.height).to.be.at.least(0);
        });

        it('should not change sign of scale.y', function ()
        {
            const texture = new PIXI.Texture(new PIXI.BaseTexture());
            const sprite = new PIXI.Sprite();

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
            const parent = new PIXI.Container();
            const texture = new PIXI.RenderTexture.create(20, 30);
            const sprite = new PIXI.Sprite(texture);

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
        it('should return true when point inside', function ()
        {
            const point = new PIXI.Point(10, 10);
            const texture = new PIXI.RenderTexture.create(20, 30);
            const sprite = new PIXI.Sprite(texture);

            expect(sprite.containsPoint(point)).to.be.true;
        });

        it('should return false when point outside', function ()
        {
            const point = new PIXI.Point(100, 100);
            const texture = new PIXI.RenderTexture.create(20, 30);
            const sprite = new PIXI.Sprite(texture);

            expect(sprite.containsPoint(point)).to.be.false;
        });
    });
});
