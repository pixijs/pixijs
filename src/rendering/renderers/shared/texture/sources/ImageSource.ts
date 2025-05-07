import { ExtensionType } from '../../../../../extensions/Extensions';
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
