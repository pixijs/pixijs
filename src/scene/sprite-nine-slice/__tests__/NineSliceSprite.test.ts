import { Bounds } from '../../container/bounds/Bounds';
import { getGlobalBounds } from '../../container/bounds/getGlobalBounds';
import { NineSliceGeometry } from '../NineSliceGeometry';
import { NineSliceSprite } from '../NineSliceSprite';
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

    describe('Trimmed Texture', () =>
    {
        /** Helper to create a trimmed texture. orig = 100×100, trim = {x:10, y:10, w:80, h:80}, frame = 80×80. */
        const makeTrimmedTexture = () =>
        {
            const source = getTexture({ width: 80, height: 80 }).source;
            const frame = new Rectangle(0, 0, 80, 80);
            const orig = new Rectangle(0, 0, 100, 100);
            const trim = new Rectangle(10, 10, 80, 80);

            return new Texture({ source, frame, orig, trim });
        };

        it('should expose the texture trim via the trim getter', () =>
        {
            const texture = makeTrimmedTexture();
            const sprite = new NineSliceSprite({ texture, leftWidth: 5, topHeight: 5, rightWidth: 5, bottomHeight: 5 });

            expect(sprite.trim).not.toBeNull();
            expect(sprite.trim?.x).toBe(10);
            expect(sprite.trim?.y).toBe(10);
            expect(sprite.trim?.width).toBe(80);
            expect(sprite.trim?.height).toBe(80);
        });

        it('should return null for the trim getter when texture has no trim', () =>
        {
            const sprite = new NineSliceSprite({ texture: getTexture({ width: 100, height: 100 }) });

            expect(sprite.trim).toBeNull();
        });

        it('NineSliceGeometry UV edges should be within [0,1] for trimmed textures', () =>
        {
            // orig=100×100, trim={x:10,y:10,w:80,h:80}
            // Expected UV range:  u0 = 10/100 = 0.1, u1 = 90/100 = 0.9
            const geometry = new NineSliceGeometry({
                width: 200,
                height: 200,
                originalWidth: 100,
                originalHeight: 100,
                leftWidth: 10,
                topHeight: 10,
                rightWidth: 10,
                bottomHeight: 10,
                trim: { x: 10, y: 10, width: 80, height: 80 },
            });

            const uvs = geometry.uvs;

            // Left/right edge UVs (X axis)
            const u0 = uvs[0]; // left edge
            const u1 = uvs[6]; // right edge

            // Top/bottom edge UVs (Y axis)
            const v0 = uvs[1]; // top edge
            const v1 = uvs[25]; // bottom edge

            expect(u0).toBeCloseTo(0.1, 5); // trim.x / orig.w
            expect(u1).toBeCloseTo(0.9, 5); // (trim.x + trim.w) / orig.w
            expect(v0).toBeCloseTo(0.1, 5); // trim.y / orig.h
            expect(v1).toBeCloseTo(0.9, 5); // (trim.y + trim.h) / orig.h

            // Inner UV borders should also be correctly offset
            const uLeft = uvs[2]; // left border: u0 + leftWidth/origW = 0.1 + 0.1 = 0.2
            const uRight = uvs[4]; // right border: u1 - rightWidth/origW = 0.9 - 0.1 = 0.8
            const vTop = uvs[9]; // top border: v0 + topHeight/origH = 0.2
            const vBot = uvs[17]; // bottom border: v1 - bottomHeight/origH = 0.8

            expect(uLeft).toBeCloseTo(0.2, 5);
            expect(uRight).toBeCloseTo(0.8, 5);
            expect(vTop).toBeCloseTo(0.2, 5);
            expect(vBot).toBeCloseTo(0.8, 5);
        });

        it('NineSliceGeometry UV edges should remain [0,1] when texture has no trim', () =>
        {
            const geometry = new NineSliceGeometry({
                width: 200,
                height: 200,
                originalWidth: 100,
                originalHeight: 100,
                leftWidth: 10,
                topHeight: 10,
                rightWidth: 10,
                bottomHeight: 10,
            });

            const uvs = geometry.uvs;

            expect(uvs[0]).toBeCloseTo(0, 5); // left edge
            expect(uvs[6]).toBeCloseTo(1, 5); // right edge
            expect(uvs[1]).toBeCloseTo(0, 5); // top edge
            expect(uvs[25]).toBeCloseTo(1, 5); // bottom edge
        });

        it('NineSliceGeometry UV edges should re-sync when originalWidth changes without trim', () =>
        {
            const geometry = new NineSliceGeometry({
                width: 200,
                height: 200,
                originalWidth: 100,
                originalHeight: 100,
                leftWidth: 10,
                topHeight: 10,
                rightWidth: 10,
                bottomHeight: 10,
            });

            // Update originalWidth without passing trim
            geometry.update({ originalWidth: 200, originalHeight: 200 });

            const uvs = geometry.uvs;

            // UV edges should still span [0,1] not shrink to [0, 0.5]
            expect(uvs[0]).toBeCloseTo(0, 5);
            expect(uvs[6]).toBeCloseTo(1, 5);
            expect(uvs[1]).toBeCloseTo(0, 5);
            expect(uvs[25]).toBeCloseTo(1, 5);
        });

        it('NineSliceSprite with trimmed texture should expose correct trim metadata', () =>
        {
            const texture = makeTrimmedTexture();
            const sprite = new NineSliceSprite({
                texture,
                leftWidth: 10,
                topHeight: 10,
                rightWidth: 10,
                bottomHeight: 10,
                width: 200,
                height: 200,
            });

            // The sprite exposes the texture trim which should be forwarded to geometry
            expect(sprite.trim).toBeDefined();
            expect(sprite.trim?.x).toBe(10);
            expect(sprite.trim?.width).toBe(80);

            // original dimensions should be the full orig size (100×100)
            expect(sprite.originalWidth).toBe(100);
            expect(sprite.originalHeight).toBe(100);
        });
    });
});
