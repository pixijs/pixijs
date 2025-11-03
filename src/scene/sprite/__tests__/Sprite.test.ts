import { Container } from '../../container/Container';
import { NineSliceSprite } from '../../sprite-nine-slice/NineSliceSprite';
import { Sprite } from '../Sprite';
import { getTexture, getWebGLRenderer } from '@test-utils';
import { Point, Rectangle } from '~/maths';
import { RenderTexture, Texture, TextureSource } from '~/rendering';

describe('Sprite', () =>
{
    describe('constructor', () =>
    {
        it('should support no arguments', () =>
        {
            const sprite = new Sprite();

            expect(sprite).toBeDefined();
            expect(sprite.texture).toEqual(Texture.EMPTY);

            sprite.destroy();
        });

        it('should support options with no texture', () =>
        {
            const sprite = new Sprite({});

            expect(sprite).toBeDefined();
            expect(sprite.texture).toEqual(Texture.EMPTY);

            sprite.destroy();
        });
    });

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

        it('should not throw when destroyed (nineslice)', () =>
        {
            const sprite = new NineSliceSprite({ texture: Texture.WHITE });

            expect(() => sprite.destroy()).not.toThrow();
        });

        it('should not throw when destroying it context (nineslice)', () =>
        {
            const sprite = new NineSliceSprite({ texture: Texture.WHITE });

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

            expect(sprite._gpuData).toBeNull();
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

        it('should set scale sign based on width sign', () =>
        {
            const texture = RenderTexture.create({ width: 100, height: 100 });
            const sprite = new Sprite(texture);

            sprite.scale.x = 1;
            sprite.width = 50;

            expect(sprite.scale.x).toEqual(0.5);

            // Setting positive width should result in positive scale
            sprite.scale.x = -1;
            sprite.width = 75;

            expect(sprite.scale.x).toEqual(0.75);

            // Setting negative width should result in negative scale
            sprite.width = -75;

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

        it('should update scale sign when width sign changes', () =>
        {
            const texture = RenderTexture.create({ width: 100, height: 100 });
            const sprite = new Sprite(texture);

            const originWidth = sprite.width;

            // Setting negative width should make scale.x negative
            sprite.width = -originWidth;
            expect(sprite.scale.x).toBeLessThan(0);

            // Setting positive width should make scale.x positive
            sprite.width = originWidth;
            expect(sprite.scale.x).toBeGreaterThan(0);
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

        it('should set scale sign based on height sign', () =>
        {
            const texture = RenderTexture.create({ width: 100, height: 100 });
            const sprite = new Sprite(texture);

            sprite.scale.y = 1;
            sprite.height = 50;

            expect(sprite.scale.y).toEqual(0.5);

            // Setting positive height should result in positive scale
            sprite.scale.y = -1;
            sprite.height = 75;

            expect(sprite.scale.y).toEqual(0.75);

            // Setting negative height should result in negative scale
            sprite.height = -75;

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

        it('should update scale sign when height sign changes', () =>
        {
            const texture = RenderTexture.create({ width: 100, height: 100 });
            const sprite = new Sprite(texture);

            const originHeight = sprite.height;

            // Setting negative height should make scale.y negative
            sprite.height = -originHeight;
            expect(sprite.scale.y).toBeLessThan(0);

            // Setting positive height should make scale.y positive
            sprite.height = originHeight;
            expect(sprite.scale.y).toBeGreaterThan(0);
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

        it('should return correct bounds for trimmed texture', () =>
        {
            const texture = new Texture({
                source: new TextureSource({ width: 300, height: 300 }),
                frame: new Rectangle(196, 66, 58, 56),
                trim: new Rectangle(4, 4, 58, 56),
                orig: new Rectangle(0, 0, 64, 64),
                rotate: 2,
            });

            const sprite = new Sprite(texture);

            const visualBounds = sprite.visualBounds;
            const bounds = sprite.bounds;

            // for some reason jest treats -0 and 0 as different! but -0 === 0
            expect(bounds.minX || 0).toBe(0);
            expect(bounds.minY || 0).toBe(0);
            expect(bounds.maxX).toBe(64);
            expect(bounds.maxY).toBe(64);

            expect(visualBounds.minX).toBe(4);
            expect(visualBounds.minY).toBe(4);
            expect(visualBounds.maxX).toBe(62);
            expect(visualBounds.maxY).toBe(60);
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

    describe('texture', () =>
    {
        it('should be updated in the batch', async () =>
        {
            const renderer = await getWebGLRenderer();

            const container = new Container();

            const sprite = new Sprite(new Texture({
                dynamic: true,
            }));

            container.addChild(sprite);

            renderer.render({ container });

            const texture = getTexture();

            sprite.texture.source = texture.source;

            expect(renderer.renderPipes.sprite.validateRenderable(sprite)).toBe(true);
        });
    });
});
