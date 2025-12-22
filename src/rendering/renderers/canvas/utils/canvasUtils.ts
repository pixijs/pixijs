import { Color } from '../../../../color/Color';
import { DOMAdapter } from '../../../../environment/adapter';
import { canUseNewCanvasBlendModes } from './canUseNewCanvasBlendModes';

import type { ICanvas } from '../../../../environment/canvas/ICanvas';
import type { Texture } from '../../shared/texture/Texture';

type TintCache = Record<string, (ICanvas & { tintId?: number }) | (HTMLImageElement & { tintId?: number })>;

export const canvasUtils = {
    canvas: null as ICanvas | null,
    convertTintToImage: false,
    cacheStepsPerColorChannel: 8,
    canUseMultiply: canUseNewCanvasBlendModes(),
    tintMethod: null as (texture: Texture, color: number, canvas: ICanvas) => void,

    getTintedCanvas: (sprite: { texture: Texture }, color: number): ICanvas | HTMLImageElement =>
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
            const tintImage = new Image();

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

        const source = texture.source.resource as CanvasImageSource;

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
        context.drawImage(
            texture.source.resource as CanvasImageSource,
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
        context.drawImage(
            texture.source.resource as CanvasImageSource,
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
