'use strict';

describe('PIXI.TilingSprite', function ()
{
    describe('getBounds()', function ()
    {
        it('must have correct value according to _width, _height and anchor', function ()
        {
            const parent = new PIXI.Container();
            const texture = new PIXI.Texture(new PIXI.BaseTexture());
            const tilingSprite = new PIXI.extras.TilingSprite(texture, 200, 300);

            parent.addChild(tilingSprite);

            tilingSprite.anchor.set(0.5, 0.5);
            tilingSprite.scale.set(-2, 2);
            tilingSprite.position.set(50, 40);

            const bounds = tilingSprite.getBounds();

            expect(bounds.x).to.equal(-150);
            expect(bounds.y).to.equal(-260);
            expect(bounds.width).to.equal(400);
            expect(bounds.height).to.equal(600);
        });
    });

    it('checks if tilingSprite contains a point', function ()
    {
        const texture = new PIXI.Texture(new PIXI.BaseTexture());
        const tilingSprite = new PIXI.extras.TilingSprite(texture, 200, 300);

        expect(tilingSprite.containsPoint(new PIXI.Point(1, 1))).to.equal(true);
        expect(tilingSprite.containsPoint(new PIXI.Point(300, 400))).to.equal(false);
    });

    it('gets and sets height and width correctly', function ()
    {
        const texture = new PIXI.Texture(new PIXI.BaseTexture());
        const tilingSprite = new PIXI.extras.TilingSprite(texture, 200, 300);

        tilingSprite.width = 400;
        tilingSprite.height = 600;

        expect(tilingSprite.width).to.equal(400);
        expect(tilingSprite.height).to.equal(600);
    });
});
