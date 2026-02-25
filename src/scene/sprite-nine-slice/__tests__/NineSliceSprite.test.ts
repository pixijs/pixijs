import { Bounds } from '../../container/bounds/Bounds';
import { getGlobalBounds } from '../../container/bounds/getGlobalBounds';
import { NineSliceSprite } from '../NineSliceSprite';
import { NineSliceGeometry } from '../NineSliceGeometry';
import '../../mesh/init';
import '../init';
import { getTexture } from '@test-utils';
import { Point, Rectangle } from '~/maths';
import { Texture } from '~/rendering';

import type { TextureSource } from '~/rendering';

describe('NineSliceSprite', () =>
{
    type SetupOptions = {
        texture: Texture;
        source: TextureSource;
        width: number;
        height: number;
        x: number;
        y: number;
        anchor: { x: number; y: number };
    };

    const setup = (options: Partial<SetupOptions> = {}) =>
    {
        const { texture, source, width = 256, height = 256, x = 0, y = 0, anchor = { x: 0, y: 0 } } = options;

        const sprite = new NineSliceSprite({
            texture: texture ?? new Texture({ source }),
            width,
            height,
            x,
            y,
            anchor,
        });

        return sprite;
    };

    describe('Lifecycle', () =>
    {
        it('should accept constructor arguments', () =>
        {
            const x = 10;
            const y = 20;
            const width = 100;
            const height = 200;
            const anchor = { x: 0.5, y: 0.5 };

            const sprite = setup({
                texture: getTexture({ width: 256, height: 256 }),
                x, y,
                width, height,
                anchor,
            });

            expect(sprite.x).toBe(x);
            expect(sprite.y).toBe(y);
            expect(sprite.width).toBe(width);
            expect(sprite.height).toBe(height);
            expect(sprite.anchor.x).toBe(anchor.x);
            expect(sprite.anchor.y).toBe(anchor.y);
        });

        it('should not throw when destroyed', () =>
        {
            const sprite = new NineSliceSprite({ texture: getTexture({ width: 256, height: 256 }) });

            expect(() => sprite.destroy()).not.toThrow();
        });

        it('should global bounds to be correct', async () =>
        {
            const sprite = new NineSliceSprite({
                texture: getTexture({ width: 256, height: 256 })
            });

            const bounds = getGlobalBounds(sprite, true, new Bounds());

            expect(bounds.minX).toBe(0);
            expect(bounds.maxX).toBe(256);
            expect(bounds.minY).toBe(0);
            expect(bounds.maxY).toBe(256);
        });
    });

    describe('Geometry', () =>
    {
        it('should have the correct bounds', async () =>
        {
            const sprite = new NineSliceSprite({
                texture: getTexture({ width: 256, height: 256 }),
                anchor: 0.5
            });

            expect(sprite.bounds.minX).toBe(-128);
            expect(sprite.bounds.maxX).toBe(128);
            expect(sprite.bounds.minY).toBe(-128);
            expect(sprite.bounds.maxY).toBe(128);
        });
        it('should calculate correct bounds when transformed', () =>
        {
            const sprite = setup({ width: 200, height: 300 });

            sprite.anchor.set(0.5, 0.5);
            sprite.scale.set(-2, 2);
            sprite.position.set(50, 40);

            const bounds = sprite.getBounds();

            expect(bounds.x).toEqual(-150);
            expect(bounds.y).toEqual(-260);
            expect(bounds.width).toEqual(400);
            expect(bounds.height).toEqual(600);
        });

        it('should check whether contains point correctly', () =>
        {
            const sprite = setup({ width: 200, height: 300 });

            // note: containsPoint works in local coords
            expect(sprite.containsPoint(new Point(0, 0))).toEqual(true);
            expect(sprite.containsPoint(new Point(100, 150))).toEqual(true);
            expect(sprite.containsPoint(new Point(200, 300))).toEqual(true);
            expect(sprite.containsPoint(new Point(201, 301))).toEqual(false);
            expect(sprite.containsPoint(new Point(-1, -1))).toEqual(false);
        });

        it('should check whether contains point correctly when anchor is set', () =>
        {
            const sprite = setup({ width: 200, height: 300, anchor: { x: 0.5, y: 0.5 } });

            // note: containsPoint works in local coords
            expect(sprite.containsPoint(new Point(0, 0))).toEqual(true);
            expect(sprite.containsPoint(new Point(100, 150))).toEqual(true);
            expect(sprite.containsPoint(new Point(200 / 2, 300 / 2))).toEqual(true);
            expect(sprite.containsPoint(new Point(201 / 2, 301 / 2))).toEqual(false);
            expect(sprite.containsPoint(new Point(-1, -1))).toEqual(true);
        });

        it('should get and set height & width correctly', () =>
        {
            const sprite = setup({ width: 200, height: 300 });

            expect(sprite.width).toEqual(200);
            expect(sprite.height).toEqual(300);

            sprite.width = 400;
            sprite.height = 600;

            expect(sprite.width).toEqual(400);
            expect(sprite.height).toEqual(600);
        });
    });

    describe('Texture Construction', () =>
    {
        it('should build from given texture', () =>
        {
            const texture = new Texture();
            const sprite = setup({ texture });

            expect(sprite.texture).toEqual(texture);
        });
    });

    describe('Anchor', () =>
    {
        it('should update anchor', () =>
        {
            const texture = new Texture();
            const sprite = setup({ texture });

            expect(sprite.texture).toEqual(texture);

            const spy = jest.spyOn((sprite as any), 'onViewUpdate');

            sprite.anchor.x = 0.5;

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Trimmed Texture Support', () =>
    {
        it('should compute UVs correctly when textureUvs are provided', () =>
        {
            const geometry = new NineSliceGeometry({
                width: 100,
                height: 100,
                originalWidth: 64,
                originalHeight: 64,
                leftWidth: 10,
                topHeight: 10,
                rightWidth: 10,
                bottomHeight: 10,
            });

            // Simulate a trimmed/atlas texture with frame at (0.25, 0.25) to (0.75, 0.75)
            // in source-normalized space (i.e., frame occupies the center quarter of the source)
            geometry._textureUvs = {
                x0: 0.25, y0: 0.25,
                x1: 0.75, y1: 0.25,
                x2: 0.75, y2: 0.75,
                x3: 0.25, y3: 0.75,
            };
            geometry.update({
                originalWidth: 64,
                originalHeight: 64,
                leftWidth: 10,
                topHeight: 10,
                rightWidth: 10,
                bottomHeight: 10,
            });

            const uvs = geometry.uvs;

            const frameW = 0.75 - 0.25; // 0.5
            const frameH = 0.75 - 0.25; // 0.5

            // UV boundaries should be within the frame UV range
            // Left edge
            expect(uvs[0]).toBeCloseTo(0.25);
            // Left cut: 0.25 + (0.5 / 64) * 10
            expect(uvs[2]).toBeCloseTo(0.25 + (frameW / 64) * 10);
            // Right cut: 0.75 - (0.5 / 64) * 10
            expect(uvs[4]).toBeCloseTo(0.75 - (frameW / 64) * 10);
            // Right edge
            expect(uvs[6]).toBeCloseTo(0.75);

            // Top edge
            expect(uvs[1]).toBeCloseTo(0.25);
            // Top cut: 0.25 + (0.5 / 64) * 10
            expect(uvs[9]).toBeCloseTo(0.25 + (frameH / 64) * 10);
            // Bottom cut: 0.75 - (0.5 / 64) * 10
            expect(uvs[17]).toBeCloseTo(0.75 - (frameH / 64) * 10);
            // Bottom edge
            expect(uvs[25]).toBeCloseTo(0.75);
        });

        it('should use 0-1 UV range when textureUvs are not provided', () =>
        {
            const geometry = new NineSliceGeometry({
                width: 100,
                height: 100,
                originalWidth: 64,
                originalHeight: 64,
                leftWidth: 10,
                topHeight: 10,
                rightWidth: 10,
                bottomHeight: 10,
            });

            const uvs = geometry.uvs;

            // Left edge = 0, right edge = 1
            expect(uvs[0]).toBeCloseTo(0);
            expect(uvs[6]).toBeCloseTo(1);

            // Top edge = 0, bottom edge = 1
            expect(uvs[1]).toBeCloseTo(0);
            expect(uvs[25]).toBeCloseTo(1);

            // Left cut = 10/64
            expect(uvs[2]).toBeCloseTo(10 / 64);
            // Right cut = 1 - 10/64
            expect(uvs[4]).toBeCloseTo(1 - (10 / 64));
        });
    });
});
