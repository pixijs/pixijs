import { ExtensionType } from '../../../../../extensions/Extensions';
import { type PixiGl2DImageSource } from '../../../../../gl2d/extensions/resources';
import { type ToGl2DOptions } from '../../../../../gl2d/serialize/serialize';
import { TextureSource } from './TextureSource';

import type { ICanvas } from '../../../../../environment/canvas/ICanvas';
import type { ExtensionMetadata } from '../../../../../extensions/Extensions';
import type { TextureSourceOptions } from './TextureSource';

/**
 * The type of image-like resource that can be used as a texture source.
 *
 * - `ImageBitmap` is used for bitmap images.
 * - `HTMLCanvasElement` and `OffscreenCanvas` are used for canvas elements.
 * - `ICanvas` is an interface for canvas-like objects.
 * - `VideoFrame` is used for video frames.
 * - `HTMLImageElement` is used for HTML image elements.
 * - `HTMLVideoElement` is used for HTML video elements.
 * @category rendering
 * @advanced
 */
export type ImageResource =
ImageBitmap
| HTMLCanvasElement
| OffscreenCanvas
| ICanvas
| VideoFrame
| HTMLImageElement
| HTMLVideoElement;

/**
 * A texture source that uses an image-like resource as its resource.
 * It can handle HTMLImageElement, ImageBitmap, VideoFrame, and HTMLVideoElement.
 * It is used for textures that can be uploaded to the GPU.
 * @category rendering
 * @advanced
 */
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

    /**
     * Serializes the texture source to a format suitable for the GL2D renderer.
     * @param options - The options to use for serialization.
     * @returns The serialized texture source.
     */
    public override async serialize(options: ToGl2DOptions): Promise<ToGl2DOptions>
    {
        await super.serialize(options);
        const { gl2D } = options;

        // find the resource
        const source = gl2D.resources.find(
            (texture) => texture.uid === `texture_source_${this.uid}`) as PixiGl2DImageSource;

        if (!source)
        {
            throw new Error(`ImageSource: Texture source with uid ${this.uid} not found.`);
        }

        source.type = 'image_source';

        return options;
    }
}
