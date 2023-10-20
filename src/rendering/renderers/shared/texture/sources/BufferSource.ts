import { ExtensionType } from '../../../../../extensions/Extensions';
import { TextureSource } from './TextureSource';

import type { ExtensionMetadata } from '../../../../../extensions/Extensions';
import type { TypedArray } from '../../buffer/Buffer';
import type { TextureSourceOptions } from './TextureSource';

export interface BufferSourceOptions extends TextureSourceOptions<TypedArray | ArrayBuffer>
{
    width: number;
    height: number;
}

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

        super({
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
