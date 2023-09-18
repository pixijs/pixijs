import { TextureSource } from './TextureSource';

import type { TypedArray } from '../../buffer/Buffer';
import type { TextureSourceOptions } from './TextureSource';

export interface BufferSourceOptions extends TextureSourceOptions<TypedArray | ArrayBuffer>
{
    width: number;
    height: number;
}

export class BufferImageSource extends TextureSource<TypedArray | ArrayBuffer>
{
    public type = 'buffer';

    public static from(options: BufferSourceOptions): BufferImageSource
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

        return new BufferImageSource({

            ...options,
            format,
        });
    }
}
