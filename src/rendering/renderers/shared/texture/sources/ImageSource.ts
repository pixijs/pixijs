import { DOMAdapter } from '../../../../../environment/adapter';
import { ExtensionType } from '../../../../../extensions/Extensions';
import { warn } from '../../../../../utils/logging/warn';
import { TextureSource } from './TextureSource';

import type { ICanvas } from '../../../../../environment/canvas/ICanvas';
import type { ExtensionMetadata } from '../../../../../extensions/Extensions';
import type { TextureSourceOptions } from './TextureSource';

export type ImageResource =
ImageBitmap
| HTMLCanvasElement
| OffscreenCanvas
| ICanvas
| VideoFrame
| HTMLImageElement
| HTMLVideoElement;

export class ImageSource extends TextureSource<ImageResource>
{
    public static extension: ExtensionMetadata = ExtensionType.TextureSource;
    public uploadMethodId = 'image';

    constructor(options: TextureSourceOptions<ImageResource>)
    {
        if (options.resource && (globalThis.HTMLImageElement && options.resource instanceof HTMLImageElement))
        {
            const canvas = DOMAdapter.get().createCanvas(options.resource.width, options.resource.height);
            const context = canvas.getContext('2d');

            context.drawImage(options.resource, 0, 0, options.resource.width, options.resource.height);
            options.resource = canvas;

            // #if _DEBUG
            warn('ImageSource: Image element passed, converting to canvas. Use CanvasSource instead.');
            // #endif
        }

        super(options);

        this.autoGarbageCollect = true;
    }

    public static test(resource: any): resource is ImageResource
    {
        return (globalThis.HTMLImageElement && resource instanceof HTMLImageElement)
        || (typeof ImageBitmap !== 'undefined' && resource instanceof ImageBitmap)
        || (globalThis.VideoFrame && resource instanceof VideoFrame);
    }
}
