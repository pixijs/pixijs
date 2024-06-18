import { Cache } from '../../../../../assets/cache/Cache';
import { extensions, ExtensionType } from '../../../../../extensions/Extensions';
import { TextureSource } from '../sources/TextureSource';
import { Texture } from '../Texture';

import type { ICanvas } from '../../../../../environment/canvas/ICanvas';
import type { TypedArray } from '../../buffer/Buffer';
import type { BufferSourceOptions } from '../sources/BufferImageSource';
import type { CanvasSourceOptions } from '../sources/CanvasSource';
import type { ImageResource } from '../sources/ImageSource';
import type { TextureSourceOptions } from '../sources/TextureSource';
import type { TextureSourceLike } from '../Texture';

interface TextureSourceConstructor<T extends TextureSource = TextureSource>
{
    new (options: TextureSourceOptions): T;
    test(options: ImageResource | TypedArray | ArrayBuffer | ICanvas): boolean;
}

const sources: TextureSourceConstructor[] = [];

extensions.handleByList(ExtensionType.TextureSource, sources);

export type TextureResourceOrOptions =
  ImageResource
  | TextureSourceOptions<ImageResource>
  | BufferSourceOptions
  | CanvasSourceOptions;

/**
 * @param options
 * @deprecated since v8.2.0
 * @see TextureSource.from
 */
export function autoDetectSource(options: TextureResourceOrOptions = {}): TextureSource
{
    return textureSourceFrom(options);
}

/**
 * Creates a texture source from the options provided
 * @param options - The options to create the texture source from. This can be
 */
function textureSourceFrom(options: TextureResourceOrOptions = {}): TextureSource
{
    const hasResource = options && (options as TextureSourceOptions).resource;
    const res = hasResource ? (options as TextureSourceOptions).resource : options;
    const opts = hasResource ? options as TextureSourceOptions : { resource: options } as TextureSourceOptions;

    for (let i = 0; i < sources.length; i++)
    {
        const Source = sources[i];

        if (Source.test(res))
        {
            return new Source(opts);
        }
    }

    throw new Error(`Could not find a source type for resource: ${opts.resource}`);
}

export function resourceToTexture(
    options: TextureResourceOrOptions = {},
    skipCache = false
): Texture
{
    const hasResource = options && (options as TextureSourceOptions).resource;
    const resource = hasResource ? (options as TextureSourceOptions).resource : options;
    const opts = hasResource ? options as TextureSourceOptions : { resource: options } as TextureSourceOptions;

    if (!skipCache && Cache.has(resource))
    {
        return Cache.get(resource);
    }

    const texture = new Texture({ source: textureSourceFrom(opts) });

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

/**
 * Helper function that creates a returns Texture based on the source you provide.
 * The source should be loaded and ready to go. If not its best to grab the asset using Assets.
 * @param id - String or Source to create texture from
 * @param skipCache - Skip adding the texture to the cache
 * @returns The texture based on the Id provided
 */
export function textureFrom(id: TextureSourceLike, skipCache = false): Texture
{
    if (typeof id === 'string')
    {
        return Cache.get(id);
    }
    else if (id instanceof TextureSource)
    {
        return new Texture({ source: id });
    }

    // return a auto generated texture from resource
    return resourceToTexture(id, skipCache);
}

Texture.from = textureFrom;
TextureSource.from = textureSourceFrom;
