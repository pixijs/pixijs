import { Color } from '../../../../color/Color';
import { DOMAdapter } from '../../../../environment/adapter';
import { canUseNewCanvasBlendModes } from './canUseNewCanvasBlendModes';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
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
    getCanvasSource: (texture: Texture): CanvasImageSource | null =>
    {
        const source = texture.source;
        const resource = source?.resource as unknown;

        if (!resource)
        {
            return null;
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

        const tintCanvas = canvasUtils.canvas!;

        canvasUtils.tintMethod(texture, color, tintCanvas);

        pattern = tintCanvas.getContext('2d')!.createPattern(
            tintCanvas as unknown as CanvasImageSource,
            'repeat'
        );

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

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.save();
        context.fillStyle = Color.shared.setValue(color).toHex();
        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'multiply';

        const source = canvasUtils.getCanvasSource(texture);

        if (!source)
        {
            context.restore();

            return;
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

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.save();
        context.globalCompositeOperation = 'copy';
        context.fillStyle = Color.shared.setValue(color).toHex();
        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'destination-atop';
        const source = canvasUtils.getCanvasSource(texture);

        if (!source)
        {
            context.restore();

            return;
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

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = Math.ceil(crop.width);
        canvas.height = Math.ceil(crop.height);

        context.save();
        context.globalCompositeOperation = 'copy';
        const source = canvasUtils.getCanvasSource(texture);

        if (!source)
        {
            context.restore();

            return;
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

        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        const imageData = context.getImageData(0, 0, crop.width, crop.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4)
        {
            data[i] = (data[i] * r) / 255;
            data[i + 1] = (data[i + 1] * g) / 255;
            data[i + 2] = (data[i + 2] * b) / 255;
        }

        context.putImageData(imageData, 0, 0);
        context.restore();
    },
};

canvasUtils.tintMethod = canvasUtils.canUseMultiply ? canvasUtils.tintWithMultiply : canvasUtils.tintWithPerPixel;
