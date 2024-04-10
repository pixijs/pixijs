import { Point } from '../../../src/maths/point/Point';
import { Rectangle } from '../../../src/maths/shapes/Rectangle';
import { RenderTexture } from '../../../src/rendering/renderers/shared/texture/RenderTexture';
import { TextureSource } from '../../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../../../src/rendering/renderers/shared/texture/Texture';
import { Container } from '../../../src/scene/container/Container';
import { Sprite } from '../../../src/scene/sprite/Sprite';
import { getWebGLRenderer } from '../../utils/getRenderer';
import { getTexture } from '../../utils/getTexture';

describe('Sprite', () =>
{
    describe('destroy', () =>
    {
        it('should not throw when destroyed', () =>
        {
            const sprite = new Sprite();

            expect(() => sprite.destroy()).not.toThrow();
        });

        it('should not throw when destroying it context', () =>
        {
            const sprite = new Sprite();

            expect(() => sprite.destroy(true)).not.toThrow();
        });

        it('should clean up correctly on the pipe and system when destroyed', async () =>
        {
            const renderer = await getWebGLRenderer();

            const container = new Container();

            const sprite = new Sprite(getTexture());

            container.addChild(sprite);

            renderer.render({ container });

            sprite.destroy();

            expect(renderer.renderPipes.sprite['_gpuSpriteHash'][sprite.uid]).toBeNull();
        });
    });

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
            const texture = RenderTexture.create({ width: 100, height: 100 });
            const sprite = new Sprite(texture);

            sprite.scale.x = 1;
            sprite.width = 50;

            expect(sprite.scale.x).toEqual(0.5);

            sprite.scale.x = -1;
            sprite.width = 75; // should this be -75, this is when the scale.x becomes negative

            expect(sprite.scale.x).toEqual(-0.75);
        });

        it('should set width on the constructor', () =>
        {
            const sprite = new Sprite({
                texture: Texture.WHITE,
                width: 50,
            });

            expect(sprite.width).toEqual(50);
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
            const texture = RenderTexture.create({ width: 100, height: 100 });
            const sprite = new Sprite(texture);

            sprite.scale.y = 1;
            sprite.height = 50;

            expect(sprite.scale.y).toEqual(0.5);

            sprite.scale.y = -1;
            sprite.height = 75;

            expect(sprite.scale.y).toEqual(-0.75);
        });

        it('should set width on the constructor', () =>
        {
            const sprite = new Sprite({
                texture: Texture.WHITE,
                height: 50,
            });

            expect(sprite.height).toEqual(50);
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

            let bounds = sprite.getBounds();

            expect(Math.abs(bounds.x)).toEqual(0);
            expect(bounds.y).toEqual(-5);
            expect(bounds.width).toEqual(40);
            expect(bounds.height).toEqual(30);

            bounds = sprite.getLocalBounds();

            expect(Math.abs(bounds.x)).toEqual(0);
            expect(Math.abs(bounds.y)).toEqual(0);
            expect(bounds.width).toEqual(20);
            expect(bounds.height).toEqual(30);

            bounds = sprite.getBounds();

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

        it('should return true when point inside a trimmed sprite', () =>
        {
            const textureSource = new TextureSource({
                width: 100,
                height: 100,
                resolution: 1,
            });

            const texture = new Texture({
                source: textureSource,

                trim: new Rectangle(
                    0.01652892561983471 * 100,
                    0.014598540145985401 * 100,
                    0.36496350364963503 * 100,
                    0.4132231404958678 * 100,
                ),
                frame: new Rectangle(
                    0.01652892561983471 * 100,
                    0.014598540145985401 * 100,
                    0.36496350364963503 * 100,
                    0.4132231404958678 * 100),
                orig: new Rectangle(
                    0,
                    0,
                    1.094890510948905 * 100,
                    1.094890510948905 * 100),
            });

            const sprite = new Sprite({ texture });

            expect(sprite.containsPoint(
                new Point(108, 108)
            )).toBe(true);

            expect(sprite.containsPoint(
                new Point(1, 1)
            )).toBe(true);
        });
    });

    describe('tint', () =>
    {
        it('should support ColorSource inputs', () =>
        {
            const sprite = new Sprite(Texture.WHITE);

            sprite.tint = 'red';

            expect(sprite.tint).toEqual(0xff0000);

            sprite.destroy();
        });
    });

    describe('init', () =>
    {
        it('should use defaultAnchor from Texture if available on the constructor', () =>
        {
            const texture = new Texture({
                source: new TextureSource({ width: 100, height: 100 }),
                defaultAnchor: { x: 0.5, y: 0.5 },
            });

            const sprite = new Sprite(texture);

            expect(sprite.anchor.x).toEqual(0.5);
            expect(sprite.anchor.y).toEqual(0.5);
        });
    });
});
