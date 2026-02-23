import { Color } from '../../../../color/Color';
import { DOMAdapter } from '../../../../environment/adapter';
import { groupD8 } from '../../../../maths/matrix/groupD8';
import { canUseNewCanvasBlendModes } from './canUseNewCanvasBlendModes';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { ICanvasRenderingContext2D } from '../../../../environment/canvas/ICanvasRenderingContext2D';
import type { ImageLike } from '../../../../environment/ImageLike';
import type { TextureSource } from '../../shared/texture/sources/TextureSource';
import type { Texture } from '../../shared/texture/Texture';

type TintCache = Record<string, (ICanvas & { tintId?: number }) | (ImageLike & { tintId?: number })>;
type CanvasSourceCache = {
    canvas: ICanvas;
    resourceId: number;
};

/**
 * Canvas helper utilities for tinting and pattern generation.
 * @internal
 */
export const canvasUtils = {
    canvas: null as ICanvas | null,
    convertTintToImage: false,
    cacheStepsPerColorChannel: 8,
    canUseMultiply: canUseNewCanvasBlendModes(),
    tintMethod: null as (texture: Texture, color: number, canvas: ICanvas) => void,
    _canvasSourceCache: new WeakMap<TextureSource, CanvasSourceCache>(),
    _unpremultipliedCache: new WeakMap<TextureSource, CanvasSourceCache>(),
    getCanvasSource: (texture: Texture): CanvasImageSource | null =>
    {
        const source = texture.source;
        const resource = source?.resource as unknown;

        if (!resource)
        {
            return null;
        }

        const isPMA = source.alphaMode === 'premultiplied-alpha';

        const resourceWidth = source.resourceWidth ?? source.pixelWidth;
        const resourceHeight = source.resourceHeight ?? source.pixelHeight;
        const needsResize = resourceWidth !== source.pixelWidth || resourceHeight !== source.pixelHeight;

        if (isPMA)
        {
            // If the resource is a canvas, we can assume it's already in a format that the context handles correctly
            if (resource instanceof HTMLCanvasElement
                || (typeof OffscreenCanvas !== 'undefined' && resource instanceof OffscreenCanvas))
            {
                if (!needsResize)
                {
                    return resource as CanvasImageSource;
                }
            }

            const cached = canvasUtils._unpremultipliedCache.get(source);

            if (cached?.resourceId === source._resourceId)
            {
                return cached.canvas as unknown as CanvasImageSource;
            }
        }

        if (resource instanceof Uint8Array
            || resource instanceof Uint8ClampedArray
            || resource instanceof Int8Array
            || resource instanceof Uint16Array
            || resource instanceof Int16Array
            || resource instanceof Uint32Array
            || resource instanceof Int32Array
            || resource instanceof Float32Array
            || resource instanceof ArrayBuffer)
        {
            const cached = canvasUtils._canvasSourceCache.get(source);

            if (cached?.resourceId === source._resourceId)
            {
                return cached.canvas as unknown as CanvasImageSource;
            }

            const canvas = DOMAdapter.get().createCanvas(source.pixelWidth, source.pixelHeight);
            const context = canvas.getContext('2d');
            const imageData = context.createImageData(source.pixelWidth, source.pixelHeight);
            const data = imageData.data;

            const bytes = resource instanceof ArrayBuffer
                ? new Uint8Array(resource)
                : new Uint8Array(resource.buffer, resource.byteOffset, resource.byteLength);

            if (source.format === 'bgra8unorm')
            {
                for (let i = 0; i < data.length && i + 3 < bytes.length; i += 4)
                {
                    data[i] = bytes[i + 2];
                    data[i + 1] = bytes[i + 1];
                    data[i + 2] = bytes[i];
                    data[i + 3] = bytes[i + 3];
                }
            }
            else
            {
                data.set(bytes.subarray(0, data.length));
            }

            context.putImageData(imageData, 0, 0);

            canvasUtils._canvasSourceCache.set(source, { canvas, resourceId: source._resourceId });

            return canvas as unknown as CanvasImageSource;
        }

        if (isPMA)
        {
            const canvas = DOMAdapter.get().createCanvas(source.pixelWidth, source.pixelHeight);
            const context = canvas.getContext('2d', { willReadFrequently: true });

            canvas.width = source.pixelWidth;
            canvas.height = source.pixelHeight;

            context.drawImage(resource as CanvasImageSource, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4)
            {
                const a = data[i + 3];

                if (a > 0)
                {
                    const alphaInv = 255 / a;

                    data[i] = Math.min(255, (data[i] * alphaInv) + 0.5);
                    data[i + 1] = Math.min(255, (data[i + 1] * alphaInv) + 0.5);
                    data[i + 2] = Math.min(255, (data[i + 2] * alphaInv) + 0.5);
                }
            }

            context.putImageData(imageData, 0, 0);

            canvasUtils._unpremultipliedCache.set(source, { canvas, resourceId: source._resourceId });

            return canvas as unknown as CanvasImageSource;
        }

        if (needsResize)
        {
            const cached = canvasUtils._canvasSourceCache.get(source);

            if (cached?.resourceId === source._resourceId)
            {
                return cached.canvas as unknown as CanvasImageSource;
            }

            const canvas = DOMAdapter.get().createCanvas(source.pixelWidth, source.pixelHeight);
            const context = canvas.getContext('2d');

            canvas.width = source.pixelWidth;
            canvas.height = source.pixelHeight;

            context.drawImage(resource as CanvasImageSource, 0, 0);

            canvasUtils._canvasSourceCache.set(source, { canvas, resourceId: source._resourceId });

            return canvas as unknown as CanvasImageSource;
        }

        return resource as CanvasImageSource;
    },

    getTintedCanvas: (sprite: { texture: Texture }, color: number): ICanvas | ImageLike =>
    {
        const texture = sprite.texture;
        const stringColor = Color.shared.setValue(color).toHex();
        const cache = (texture as any).tintCache as TintCache || ((texture as any).tintCache = {});

        const cachedCanvas = cache[stringColor];
        const resourceId = texture.source._resourceId;

        if (cachedCanvas?.tintId === resourceId)
        {
            return cachedCanvas;
        }

        const canvas = (cachedCanvas && 'getContext' in cachedCanvas)
            ? (cachedCanvas as ICanvas)
            : DOMAdapter.get().createCanvas();

        canvasUtils.tintMethod(texture, color, canvas);

        (canvas as any).tintId = resourceId;

        if (canvasUtils.convertTintToImage && canvas.toDataURL !== undefined)
        {
            const tintImage = DOMAdapter.get().createImage();

            tintImage.src = canvas.toDataURL();
            (tintImage as any).tintId = resourceId;

            cache[stringColor] = tintImage as any;
        }
        else
        {
            cache[stringColor] = canvas;
        }

        return cache[stringColor];
    },

    getTintedPattern: (texture: Texture, color: number): CanvasPattern =>
    {
        const stringColor = Color.shared.setValue(color).toHex();
        const cache = (texture as any).patternCache as Record<string, CanvasPattern & { tintId?: number }>
            || ((texture as any).patternCache = {});
        const resourceId = texture.source._resourceId;

        let pattern = cache[stringColor];

        if (pattern?.tintId === resourceId)
        {
            return pattern;
        }

        if (!canvasUtils.canvas)
        {
            canvasUtils.canvas = DOMAdapter.get().createCanvas();
        }

        // Always use tintMethod to handle frame cropping correctly (matching v7 approach)
        canvasUtils.tintMethod(texture, color, canvasUtils.canvas);

        const context = canvasUtils.canvas.getContext('2d');

        pattern = context.createPattern(canvasUtils.canvas, 'repeat');

        pattern.tintId = resourceId;
        cache[stringColor] = pattern;

        return pattern;
    },

    /**
     * Applies a transform to a CanvasPattern.
     * @param pattern - The pattern to apply the transform to.
     * @param matrix - The matrix to apply.
     * @param matrix.a
     * @param matrix.b
     * @param matrix.c
     * @param matrix.d
     * @param matrix.tx
     * @param matrix.ty
     * @param invert
     */
    applyPatternTransform: (
        pattern: CanvasPattern,
        matrix: {
            a: number,
            b: number,
            c: number,
            d: number,
            tx: number,
            ty: number
        },
        invert = true
    ): void =>
    {
        if (!matrix) return;

        const patternAny = pattern as unknown as { setTransform?: (value: DOMMatrix) => void };

        if (!patternAny.setTransform) return;

        const DOMMatrixCtor = (globalThis as { DOMMatrix?: typeof DOMMatrix }).DOMMatrix;

        if (!DOMMatrixCtor) return;

        const domMatrix = new DOMMatrixCtor([matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty]);

        patternAny.setTransform(invert ? domMatrix.inverse() : domMatrix);
    },

    tintWithMultiply: (texture: Texture, color: number, canvas: ICanvas): void =>
    {
        const context = canvas.getContext('2d');
        const crop = texture.frame.clone();
        const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;
        const rotate = texture.rotate;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        // When texture is rotated 90° or 270°, output dimensions are swapped
        const isVertical = groupD8.isVertical(rotate);
        const outWidth = isVertical ? crop.height : crop.width;
        const outHeight = isVertical ? crop.width : crop.height;

        canvas.width = Math.ceil(outWidth);
        canvas.height = Math.ceil(outHeight);

        context.save();
        context.fillStyle = Color.shared.setValue(color).toHex();
        context.fillRect(0, 0, outWidth, outHeight);

        context.globalCompositeOperation = 'multiply';

        const source = canvasUtils.getCanvasSource(texture);

        if (!source)
        {
            context.restore();

            return;
        }

        // Apply inverse rotation to compensate for spritesheet packing
        if (rotate)
        {
            canvasUtils._applyInverseRotation(context, rotate, crop.width, crop.height);
        }

        context.drawImage(
            source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(
            source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
        context.restore();
    },

    tintWithOverlay: (texture: Texture, color: number, canvas: ICanvas): void =>
    {
        const context = canvas.getContext('2d');
        const crop = texture.frame.clone();
        const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;
        const rotate = texture.rotate;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        // When texture is rotated 90° or 270°, output dimensions are swapped
        const isVertical = groupD8.isVertical(rotate);
        const outWidth = isVertical ? crop.height : crop.width;
        const outHeight = isVertical ? crop.width : crop.height;

        canvas.width = Math.ceil(outWidth);
        canvas.height = Math.ceil(outHeight);

        context.save();
        context.globalCompositeOperation = 'copy';
        context.fillStyle = Color.shared.setValue(color).toHex();
        context.fillRect(0, 0, outWidth, outHeight);

        context.globalCompositeOperation = 'destination-atop';
        const source = canvasUtils.getCanvasSource(texture);

        if (!source)
        {
            context.restore();

            return;
        }

        // Apply inverse rotation to compensate for spritesheet packing
        if (rotate)
        {
            canvasUtils._applyInverseRotation(context, rotate, crop.width, crop.height);
        }

        context.drawImage(
            source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
        context.restore();
    },

    tintWithPerPixel: (texture: Texture, color: number, canvas: ICanvas): void =>
    {
        const context = canvas.getContext('2d');
        const crop = texture.frame.clone();
        const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;
        const rotate = texture.rotate;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        // When texture is rotated 90° or 270°, output dimensions are swapped
        const isVertical = groupD8.isVertical(rotate);
        const outWidth = isVertical ? crop.height : crop.width;
        const outHeight = isVertical ? crop.width : crop.height;

        canvas.width = Math.ceil(outWidth);
        canvas.height = Math.ceil(outHeight);

        context.save();
        context.globalCompositeOperation = 'copy';
        const source = canvasUtils.getCanvasSource(texture);

        if (!source)
        {
            context.restore();

            return;
        }

        // Apply inverse rotation to compensate for spritesheet packing
        if (rotate)
        {
            canvasUtils._applyInverseRotation(context, rotate, crop.width, crop.height);
        }

        context.drawImage(
            source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        context.restore();

        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        const imageData = context.getImageData(0, 0, outWidth, outHeight);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4)
        {
            data[i] = (data[i] * r) / 255;
            data[i + 1] = (data[i + 1] * g) / 255;
            data[i + 2] = (data[i + 2] * b) / 255;
        }

        context.putImageData(imageData, 0, 0);
    },

    /**
     * Applies inverse rotation transform to context for texture packer rotation compensation.
     * Supports all 16 groupD8 symmetries (rotations and reflections).
     * @param context - Canvas 2D context
     * @param rotate - The groupD8 rotation value
     * @param srcWidth - Source crop width (before rotation)
     * @param srcHeight - Source crop height (before rotation)
     */
    _applyInverseRotation: (
        context: ICanvasRenderingContext2D,
        rotate: number,
        srcWidth: number,
        srcHeight: number
    ): void =>
    {
        // Get inverse rotation matrix components using groupD8 utilities
        const inv = groupD8.inv(rotate);
        const a = groupD8.uX(inv);
        const b = groupD8.uY(inv);
        const c = groupD8.vX(inv);
        const d = groupD8.vY(inv);

        // Calculate translation to keep content at origin after transform
        // Same approach as matrixAppendRotationInv
        const tx = -Math.min(0, a * srcWidth, c * srcHeight, (a * srcWidth) + (c * srcHeight));
        const ty = -Math.min(0, b * srcWidth, d * srcHeight, (b * srcWidth) + (d * srcHeight));

        context.transform(a, b, c, d, tx, ty);
    },
};

canvasUtils.tintMethod = canvasUtils.canUseMultiply ? canvasUtils.tintWithMultiply : canvasUtils.tintWithPerPixel;
