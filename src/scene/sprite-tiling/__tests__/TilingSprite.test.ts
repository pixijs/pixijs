import { Bounds } from '../../container/bounds/Bounds';
import { getGlobalBounds } from '../../container/bounds/getGlobalBounds';
import { Container } from '../../container/Container';
import { TilingSprite } from '../TilingSprite';
import { setUvs } from '../utils/setUvs';
import '../init';
import '../../mesh/init';
import { getTexture, getWebGLRenderer } from '@test-utils';
import { Point } from '~/maths';
import { CanvasRenderer, ImageSource, Texture } from '~/rendering';

import type { TextureSource } from '~/rendering';

describe('TilingSprite', () =>
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

        const sprite = new TilingSprite({
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
            const sprite = new TilingSprite();

            expect(() => sprite.destroy()).not.toThrow();
        });

        it('should clean up correctly on the pipe and system when destroyed using simple render', async () =>
        {
            const renderer = await getWebGLRenderer();

            const container = new Container();

            const sprite = new TilingSprite({
                texture: getTexture({ width: 256, height: 256 })
            });

            container.addChild(sprite);

            renderer.render({ container });

            const renderData = sprite._gpuData[renderer.uid];

            expect(renderData).not.toBeNull();

            expect(renderData.shader).toBeUndefined();
            expect(renderData.batchableMesh).not.toBeNull();

            sprite.texture = getTexture({ width: 10, height: 10 });

            renderer.render({ container });

            expect(renderData.shader).not.toBeNull();

            sprite.destroy();

            expect(sprite._gpuData).toBeEmptyObject();

            expect(sprite.texture).toBeNull();
        });

        it('should global bounds to be correct', async () =>
        {
            const sprite = new TilingSprite({
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
            const sprite = new TilingSprite({
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

        it('should use empty texture when no texture passed', () =>
        {
            const tilingSprite = new TilingSprite({
                width: 1,
                height: 1,
            });

            expect(tilingSprite.texture).toEqual(Texture.EMPTY);
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

    describe('tileRotation uvs', () =>
    {
        // For a TilingSprite with tile transform M, sprite size (sw, sh) and texture size
        // (tw, th), the UV applied to the [0..1] quad corners should be:
        //   T = D_texInv * M^-1 * D_sprite
        // so that sampling at sprite-local pos p yields texCoord = M^-1 * p / texSize.
        // Bug #12058: the previous implementation conflated sw/sh on the cross-terms,
        // shearing the pattern when the sprite was non-square.

        it('rotates the pattern cleanly on a non-square sprite', () =>
        {
            const texture = getTexture({ width: 26, height: 37 });
            const sprite = new TilingSprite({ texture, width: 200, height: 100 });

            sprite.tileRotation = Math.PI / 4;

            const uvs = new Float32Array(8);

            // Initial uvs are the [0..1] quad corners (anchor = 0)
            uvs.set([0, 0, 1, 0, 1, 1, 0, 1]);

            setUvs(sprite, uvs);

            const cos45 = Math.cos(Math.PI / 4);
            const sin45 = Math.sin(Math.PI / 4);
            const w = 200;
            const h = 100;
            const tw = 26;
            const th = 37;

            // top-left (0, 0)
            expect(uvs[0]).toBeCloseTo(0, 5);
            expect(uvs[1]).toBeCloseTo(0, 5);
            // top-right (1, 0) -> M^-1 * (w, 0) / (tw, th)
            expect(uvs[2]).toBeCloseTo((cos45 * w) / tw, 5);
            expect(uvs[3]).toBeCloseTo((-sin45 * w) / th, 5);
            // bottom-right (1, 1) -> M^-1 * (w, h) / (tw, th)
            expect(uvs[4]).toBeCloseTo(((cos45 * w) + (sin45 * h)) / tw, 5);
            expect(uvs[5]).toBeCloseTo(((-sin45 * w) + (cos45 * h)) / th, 5);
            // bottom-left (0, 1) -> M^-1 * (0, h) / (tw, th)
            expect(uvs[6]).toBeCloseTo((sin45 * h) / tw, 5);
            expect(uvs[7]).toBeCloseTo((cos45 * h) / th, 5);
        });

        it('produces a non-sheared rotation matrix for non-square sprites', () =>
        {
            const texture = getTexture({ width: 64, height: 64 });
            const sprite = new TilingSprite({ texture, width: 200, height: 100 });

            sprite.tileRotation = Math.PI / 4;

            const uvs = new Float32Array(8);

            uvs.set([0, 0, 1, 0, 1, 1, 0, 1]);
            setUvs(sprite, uvs);

            // Edge from top-left -> top-right is the +x basis of T (in texture-uv units).
            // Edge from top-left -> bottom-left is the +y basis. For a pure rotation in
            // tile space these basis vectors must be perpendicular regardless of sprite
            // aspect; a sheared matrix would lose that orthogonality.
            const ex = [uvs[2] - uvs[0], uvs[3] - uvs[1]];
            const ey = [uvs[6] - uvs[0], uvs[7] - uvs[1]];

            const dot = (ex[0] * ey[0]) + (ex[1] * ey[1]);

            expect(dot).toBeCloseTo(0, 5);
        });
    });

    describe('Canvas rendering', () =>
    {
        it('should respect tilePosition with resolution > 1', async () =>
        {
            const resolution = 2;
            const textureCssSize = 10;
            const texturePhysSize = textureCssSize * resolution;

            // Create a 10×10 CSS-pixel texture (20×20 physical) with left half RED, right half BLUE
            const texCanvas = document.createElement('canvas');

            texCanvas.width = texturePhysSize;
            texCanvas.height = texturePhysSize;

            const texCtx = texCanvas.getContext('2d') as CanvasRenderingContext2D;

            texCtx.fillStyle = '#ff0000';
            texCtx.fillRect(0, 0, texturePhysSize / 2, texturePhysSize);
            texCtx.fillStyle = '#0000ff';
            texCtx.fillRect(texturePhysSize / 2, 0, texturePhysSize / 2, texturePhysSize);

            const source = new ImageSource({ resource: texCanvas, resolution });
            const texture = new Texture({ source });

            const spriteSize = textureCssSize * 2;
            const renderer = new CanvasRenderer();

            await renderer.init({ width: spriteSize, height: spriteSize, resolution });

            const container = new Container();
            const sprite = new TilingSprite({
                texture,
                width: spriteSize,
                height: spriteSize,
                // Shift by half the texture width: the right (blue) half should now be first
                tilePosition: { x: textureCssSize / 2, y: 0 },
            });

            container.addChild(sprite);
            renderer.render({ container });

            // Physical canvas pixel (0, 0) corresponds to CSS pixel (0, 0).
            // After the half-period shift the leftmost pixel must be BLUE (right half of the texture).
            const ctx = renderer.canvas.getContext('2d') as CanvasRenderingContext2D;
            const pixelData = ctx.getImageData(0, 0, 1, 1).data;

            // R channel should be 0 (not red)
            expect(pixelData[0]).toBe(0);
            // B channel should be 255 (blue)
            expect(pixelData[2]).toBe(255);

            renderer.destroy();
        });
    });
});
