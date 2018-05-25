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

    describe('.getLocalBounds()', function ()
    {
        before(function ()
        {
            this.tileSprite = new PIXI.extras.TilingSprite(PIXI.Texture.EMPTY, 1, 2);
            this.tileSprite.anchor.set(3, 4);
        });

        beforeEach(function ()
        {
            sinon.stub(PIXI.Sprite.prototype, 'getLocalBounds');
            this.tileSprite._bounds = { getRectangle: sinon.spy() };
        });

        afterEach(function ()
        {
            PIXI.Sprite.prototype.getLocalBounds.restore();
        });

        after(function ()
        {
            this.tileSprite.destroy();
            this.tileSprite = null;
        });

        it('should call parent method if there are children', function ()
        {
            this.tileSprite.children.length = 1;
            this.tileSprite.getLocalBounds();
            expect(PIXI.Sprite.prototype.getLocalBounds).to.be.calledOnce;
            expect(this.tileSprite._bounds.getRectangle).to.not.be.called;
        });

        it('should make quick calc if no children', function ()
        {
            this.tileSprite.children.length = 0;
            this.tileSprite.getLocalBounds('dummy');

            expect(this.tileSprite._bounds.getRectangle).to.be.calledOnce;
            expect(this.tileSprite._bounds.getRectangle.args[0][0]).to.be.equal('dummy');
            expect(PIXI.Sprite.prototype.getLocalBounds).to.not.be.called;

            expect(this.tileSprite._bounds.minX).to.be.equal(-3);
            expect(this.tileSprite._bounds.minY).to.be.equal(-8);
            expect(this.tileSprite._bounds.maxX).to.be.equal(-2);
            expect(this.tileSprite._bounds.maxY).to.be.equal(-6);
        });

        it('should assign default rect if rect is not specified', function ()
        {
            this.tileSprite.children.length = 0;
            this.tileSprite._localBoundsRect = 'localRect';
            this.tileSprite.getLocalBounds();

            expect(this.tileSprite._bounds.getRectangle).to.be.calledOnce;
            expect(this.tileSprite._bounds.getRectangle.args[0][0]).to.be.equal('localRect');
            expect(PIXI.Sprite.prototype.getLocalBounds).to.not.be.called;

            expect(this.tileSprite._bounds.minX).to.be.equal(-3);
            expect(this.tileSprite._bounds.minY).to.be.equal(-8);
            expect(this.tileSprite._bounds.maxX).to.be.equal(-2);
            expect(this.tileSprite._bounds.maxY).to.be.equal(-6);
        });

        it('should create and assign rect if default rect is not', function ()
        {
            this.tileSprite.children.length = 0;
            this.tileSprite._localBoundsRect = null;
            this.tileSprite.getLocalBounds();

            expect(this.tileSprite._bounds.getRectangle).to.be.calledOnce;
            expect(this.tileSprite._bounds.getRectangle.args[0][0]).to.be.instanceof(PIXI.Rectangle);
            expect(PIXI.Sprite.prototype.getLocalBounds).to.not.be.called;

            expect(this.tileSprite._bounds.minX).to.be.equal(-3);
            expect(this.tileSprite._bounds.minY).to.be.equal(-8);
            expect(this.tileSprite._bounds.maxX).to.be.equal(-2);
            expect(this.tileSprite._bounds.maxY).to.be.equal(-6);
        });
    });

    it('checks if tilingSprite contains a point', function ()
    {
        const texture = new PIXI.Texture(new PIXI.BaseTexture());
        const tilingSprite = new PIXI.extras.TilingSprite(texture, 200, 300);

        expect(tilingSprite.containsPoint(new PIXI.Point(0, 0))).to.equal(true);
        expect(tilingSprite.containsPoint(new PIXI.Point(10, 10))).to.equal(true);
        expect(tilingSprite.containsPoint(new PIXI.Point(200, 300))).to.equal(false);
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
