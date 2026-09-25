import { ExtensionType } from '../../../../../extensions/Extensions';
import { isIntegerFormat } from '../utils/isIntegerFormat';
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
 * A texture source that uses a TypedArray or ArrayBuffer as its resource
 *
 * Without a `format`, the array type picks it: `Float32Array` gives `rgba32float`,
 * 32-bit integer arrays give `rgba32uint`, 16-bit integer arrays give `rgba16uint`, anything else `bgra8unorm`.
 * Integer formats default to `alphaMode: 'no-premultiply-alpha'`, since integer data can't be
 * premultiplied on upload; an explicit `alphaMode` still wins.
 * @example
 * ```ts
 * const ids = new BufferImageSource({
 *     resource: new Uint32Array([1, 2, 3, 4]),
 *     width: 1,
 *     height: 1,
 *     scaleMode: 'nearest',
 * });
 * ```
 * @category rendering
 * @advanced
 */
export class BufferImageSource extends TextureSource<TypedArray | ArrayBuffer>
{
    public static extension: ExtensionMetadata = ExtensionType.TextureSource;

    public uploadMethodId = 'buffer';

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

        // uploads never premultiply integer data, so the default alphaMode must not say they did
        const isInteger = isIntegerFormat(format);

        super({
            ...(isInteger && { alphaMode: 'no-premultiply-alpha' }),
            ...options,
            resource: buffer,
            format,
        });
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
