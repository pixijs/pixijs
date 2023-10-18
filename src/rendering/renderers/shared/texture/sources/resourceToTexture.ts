import { Cache } from '../../../../../assets/cache/Cache';
import { extensions, ExtensionType } from '../../../../../extensions/Extensions';
import { Texture } from '../Texture';

import type { TypedArray } from '../../buffer/Buffer';
import type { BufferSourceOptions } from './BufferSource';
import type { ImageResource } from './ImageSource';
import type { TextureSource, TextureSourceOptions } from './TextureSource';

interface TextureSourceConstructor<T extends TextureSource = TextureSource>
{
    new (options: TextureSourceOptions): T;
    test(options: ImageResource | TypedArray | ArrayBuffer): boolean;
}

const sources: TextureSourceConstructor[] = [];

extensions.handleByList(ExtensionType.TextureSource, sources);

export function autoDetectSource(options: TextureSourceOptions<ImageResource> | BufferSourceOptions = {}): TextureSource
{
    for (let i = 0; i < sources.length; i++)
    {
        const Source = sources[i];

        if (Source.test(options.resource))
        {
            return new Source(options);
        }
    }

    throw new Error(`Could not find a source type for resource: ${options.resource}`);
}

export function resourceToTexture(
    options: TextureSourceOptions<ImageResource> | BufferSourceOptions = {},
    skipCache = false
): Texture
{
    const { resource } = options;

    if (!skipCache && Cache.has(resource))
    {
        return Cache.get(resource);
    }

    const texture = new Texture({ source: autoDetectSource(options) });

    texture.on('destroy', () =>
    {
        if (Cache.has(resource))
        {
            Cache.remove(resource);
        }
    });

    if (!skipCache)
    {
        Cache.set(resource, texture);
    }

    return texture;
}
