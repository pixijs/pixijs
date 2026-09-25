import { ExtensionType } from '../../../../../extensions/Extensions';
import { TextureSource } from './TextureSource';

import type { ExtensionMetadata } from '../../../../../extensions/Extensions';
import type { TypedArray } from '../../buffer/Buffer';
import type { TextureSourceOptions } from './TextureSource';

/**
 * Options for creating a BufferImageSource.
 * @category rendering
 * @advanced
 */
export interface BufferSourceOptions extends TextureSourceOptions<TypedArray | ArrayBuffer>
{
    width: number;
    height: number;
}

/**
 * A texture source that uses a TypedArray or ArrayBuffer as its resource.
 * It automatically determines the format based on the type of TypedArray provided.
 * @category rendering
 * @advanced
 */
export class BufferImageSource extends TextureSource<TypedArray | ArrayBuffer>
{
    public static extension: ExtensionMetadata = ExtensionType.TextureSource;

    public uploadMethodId = 'buffer';

    /**
     * First texel of the range being uploaded by the current {@link BufferImageSource#update} call.
     * @internal
     */
    public _updateStart = 0;

    /**
     * One past the last texel of the range being uploaded by the current
     * {@link BufferImageSource#update} call. `Infinity` means the whole texture.
     * @internal
     */
    public _updateEnd = Infinity;

    constructor(options: BufferSourceOptions)
    {
        const buffer = options.resource || new Float32Array(options.width * options.height * 4);
        let format = options.format;

        if (!format)
        {
            if (buffer instanceof Float32Array)
            {
                format = 'rgba32float';
            }
            else if (buffer instanceof Int32Array)
            {
                format = 'rgba32uint';
            }
            else if (buffer instanceof Uint32Array)
            {
                format = 'rgba32uint';
            }
            else if (buffer instanceof Int16Array)
            {
                format = 'rgba16uint';
            }
            else if (buffer instanceof Uint16Array)
            {
                format = 'rgba16uint';
            }
            else if (buffer instanceof Int8Array)
            {
                format = 'bgra8unorm';
            }
            else
            {
                format = 'bgra8unorm';
            }
        }

        super({
            ...options,
            resource: buffer,
            format,
        });
    }

    /**
     * Uploads the buffer to the GPU. Call this after changing the data in {@link TextureSource#resource}.
     *
     * The buffer is a flat list of texels in row-major order, so texel `i` sits at
     * `x = i % width`, `y = floor(i / width)`. Pass a texel range to upload only that part of
     * the texture; leave it out to upload everything.
     *
     * The upload happens immediately for every renderer that already holds the texture, and the
     * range applies to this call only. If you change several parts of the buffer, track the dirty
     * span yourself and call `update` once with the combined range. Each call has a fixed cost on
     * top of the bytes it moves, which reaches tens of microseconds on some mobile GPUs. One span
     * usually beats many small calls.
     *
     * Partial uploads assume the buffer holds exactly `width * height` texels.
     * @example
     * ```ts
     * const data = new Float32Array(4096 * 64 * 4);
     * const source = new BufferImageSource({ resource: data, width: 4096, height: 64 });
     *
     * // change texels 100 to 115 (4 floats per rgba32float texel)
     * data.fill(1, 100 * 4, 116 * 4);
     *
     * // upload only those 16 texels
     * source.update(100, 116);
     * ```
     * @param start - index of the first texel to upload
     * @param end - index one past the last texel to upload (exclusive, like `TypedArray.subarray`)
     */
    public override update(start = 0, end = Infinity): void
    {
        this._updateStart = start;
        this._updateEnd = end;

        super.update();

        this._updateStart = 0;
        this._updateEnd = Infinity;
    }

    public static test(resource: any): resource is TypedArray | ArrayBuffer
    {
        return resource instanceof Int8Array
        || resource instanceof Uint8Array
        || resource instanceof Uint8ClampedArray
        || resource instanceof Int16Array
        || resource instanceof Uint16Array
        || resource instanceof Int32Array
        || resource instanceof Uint32Array
        || resource instanceof Float32Array;
    }
}
