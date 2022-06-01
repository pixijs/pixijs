import { Bounds, Container } from '@pixi/display';
import { Texture, BaseTexture } from '@pixi/core';
import { Point, Rectangle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { TilingSprite } from '@pixi/sprite-tiling';
import sinon from 'sinon';
import { expect } from 'chai';

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

            expect(bounds.x).to.equal(-150);
            expect(bounds.y).to.equal(-260);
            expect(bounds.width).to.equal(400);
            expect(bounds.height).to.equal(600);
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

        before(() =>
        {
            tileSprite = new TilingSprite(Texture.EMPTY, 1, 2);
            tileSprite.anchor.set(3, 4);
        });

        beforeEach(() =>
        {
            sinon.stub(Sprite.prototype, 'getLocalBounds');
            tileSprite['_bounds'] = { getRectangle: sinon.spy() } as unknown as Bounds;
        });

        afterEach(() =>
        {
            // @ts-expect-error ---
            Sprite.prototype.getLocalBounds.restore();
        });

        after(() =>
        {
            tileSprite.destroy();
            tileSprite = null;
        });

        it('should call parent method if there are children', () =>
        {
            tileSprite.children.length = 1;
            tileSprite.getLocalBounds();
            expect(Sprite.prototype.getLocalBounds).to.be.calledOnce;
            expect(tileSprite['_bounds'].getRectangle).to.not.be.called;
        });

        it('should make quick calc if no children', () =>
        {
            tileSprite.children.length = 0;
            // @ts-expect-error ---
            tileSprite.getLocalBounds('dummy');

            expect(tileSprite['_bounds'].getRectangle).to.be.calledOnce;
            // @ts-expect-error ---
            expect(tileSprite['_bounds'].getRectangle.args[0][0]).to.be.equal('dummy');
            expect(Sprite.prototype.getLocalBounds).to.not.be.called;

            expect(tileSprite['_bounds'].minX).to.be.equal(-3);
            expect(tileSprite['_bounds'].minY).to.be.equal(-8);
            expect(tileSprite['_bounds'].maxX).to.be.equal(-2);
            expect(tileSprite['_bounds'].maxY).to.be.equal(-6);
        });

        it('should assign default rect if rect is not specified', () =>
        {
            tileSprite.children.length = 0;
            // @ts-expect-error ---
            tileSprite['_localBoundsRect'] = 'localRect';
            tileSprite.getLocalBounds();

            expect(tileSprite['_bounds'].getRectangle).to.be.calledOnce;
            // @ts-expect-error ---
            expect(tileSprite['_bounds'].getRectangle.args[0][0]).to.be.equal('localRect');
            expect(Sprite.prototype.getLocalBounds).to.not.be.called;

            expect(tileSprite['_bounds'].minX).to.be.equal(-3);
            expect(tileSprite['_bounds'].minY).to.be.equal(-8);
            expect(tileSprite['_bounds'].maxX).to.be.equal(-2);
            expect(tileSprite['_bounds'].maxY).to.be.equal(-6);
        });

        it('should create and assign rect if default rect is not', () =>
        {
            tileSprite.children.length = 0;
            tileSprite['_localBoundsRect'] = null;
            tileSprite.getLocalBounds();

            expect(tileSprite['_bounds'].getRectangle).to.be.calledOnce;
            // @ts-expect-error ---
            expect(tileSprite['_bounds'].getRectangle.args[0][0]).to.be.instanceof(Rectangle);
            expect(Sprite.prototype.getLocalBounds).to.not.be.called;

            expect(tileSprite['_bounds'].minX).to.be.equal(-3);
            expect(tileSprite['_bounds'].minY).to.be.equal(-8);
            expect(tileSprite['_bounds'].maxX).to.be.equal(-2);
            expect(tileSprite['_bounds'].maxY).to.be.equal(-6);
        });
    });

    it('checks if tilingSprite contains a point', () =>
    {
        const texture = new Texture(new BaseTexture());
        const tilingSprite = new TilingSprite(texture, 200, 300);

        expect(tilingSprite.containsPoint(new Point(0, 0))).to.equal(true);
        expect(tilingSprite.containsPoint(new Point(10, 10))).to.equal(true);
        expect(tilingSprite.containsPoint(new Point(200, 300))).to.equal(false);
        expect(tilingSprite.containsPoint(new Point(300, 400))).to.equal(false);
    });

    it('gets and sets height and width correctly', () =>
    {
        const texture = new Texture(new BaseTexture());
        const tilingSprite = new TilingSprite(texture, 200, 300);

        tilingSprite.width = 400;
        tilingSprite.height = 600;

        expect(tilingSprite.width).to.equal(400);
        expect(tilingSprite.height).to.equal(600);
    });

    it('should create TilingSprite with nullable texture', () =>
    {
        const tilingSprite = new TilingSprite(null, 1, 1);

        expect(tilingSprite.texture).to.equal(Texture.EMPTY);
    });
});
