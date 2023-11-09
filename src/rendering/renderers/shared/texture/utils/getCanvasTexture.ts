import { CanvasSource } from '../sources/CanvasSource';
import { Texture } from '../Texture';

import type { ICanvas } from '../../../../../environment/canvas/ICanvas';
import type { CanvasSourceOptions } from '../sources/CanvasSource';

const canvasCache: Map<ICanvas, Texture> = new Map();

export function getCanvasTexture(canvas: ICanvas, options?: CanvasSourceOptions): Texture
{
    if (!canvasCache.has(canvas))
    {
        const texture = new Texture({
            source: new CanvasSource({
                resource: canvas,
                ...options,
            })
        });

        const onDestroy = () =>
        {
            if (canvasCache.get(canvas) === texture)
            {
                canvasCache.delete(canvas);
            }
        };

        texture.on('destroy', onDestroy);
        texture.source.on('destroy', onDestroy);

        canvasCache.set(canvas, texture);
    }

    return canvasCache.get(canvas);
}

export function hasCachedCanvasTexture(canvas: ICanvas): boolean
{
    return canvasCache.has(canvas);
}
