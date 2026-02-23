import EventEmitter from 'eventemitter3';
import { Cache } from '../../../../assets/cache/Cache';
import { uid } from '../../../../utils/data/uid';
import { CubeTextureSource } from './sources/CubeTextureSource';
import { type TextureSource } from './sources/TextureSource';
import { Texture } from './Texture';

import type { CubeTextureFaces, CubeTextureSourceOptions } from './sources/CubeTextureSource';
import type { BindableTexture, TextureSourceLike } from './Texture';

type CubeTextureFaceInputs = {
    left: TextureSourceLike | BindableTexture;
    right: TextureSourceLike | BindableTexture;
    top: TextureSourceLike | BindableTexture;
    bottom: TextureSourceLike | BindableTexture;
    front: TextureSourceLike | BindableTexture;
    back: TextureSourceLike | BindableTexture;
};

type CubeTextureFromOptions = Omit<CubeTextureSourceOptions, 'faces'> & { faces: CubeTextureFaceInputs };

const faceKeys = ['left', 'right', 'top', 'bottom', 'front', 'back'] as const;

function getCubeCacheKey(faceIds: CubeTextureFaces<string>, options: Omit<CubeTextureSourceOptions, 'faces'>): string
{
    const opts = options ? { ...(options as any) } : {};

    // Don't include label in the cache key.
    delete opts.label;

    const optKeys = Object.keys(opts).sort();
    const optPart = optKeys.length
        ? `|${optKeys.map((k) => `${k}=${String(opts[k])}`).join('&')}`
        : '';

    // Note: Order is explicit and stable.
    const facesPart = faceKeys.map((k) => faceIds[k]).join(',');

    return `cube:${facesPart}${optPart}`;
}

/**
 * The options that can be passed to a new {@link CubeTexture}.
 * @category rendering
 * @advanced
 */
export interface CubeTextureOptions
{
    /** The underlying cube texture source. */
    source: CubeTextureSource;
    /** Optional label, for debugging. */
    label?: string;
}

/**
 * A cube texture that can be bound to shaders (samplerCube / texture_cube).
 *
 * This is a lightweight wrapper around a {@link CubeTextureSource}.
 * @example
 * Load 6 images and create a cube texture (paths are just examples):
 *
 * ```ts
 * import { Assets, CubeTexture } from 'pixi.js';
 *
 * await Assets.load([
 *   'px.png', 'nx.png',
 *   'py.png', 'ny.png',
 *   'pz.png', 'nz.png',
 * ]);
 *
 * // IMPORTANT: string ids must already be in the cache (e.g. after Assets.load)
 * const cube = CubeTexture.from({
 *   faces: {
 *     right: 'px.png',  // +X
 *     left: 'nx.png',   // -X
 *     top: 'py.png',    // +Y
 *     bottom: 'ny.png', // -Y
 *     front: 'pz.png',  // +Z
 *     back: 'nz.png',   // -Z
 *   },
 *   label: 'skybox',
 * });
 * ```
 * @example
 * Bind to a shader (resources differ between WebGL and WebGPU, but the cube texture binding stays the same):
 *
 * ```ts
 * const shader = Shader.from({
 *   gl: { fragment: `uniform samplerCube uCube;` },
 *   gpu: { fragment: { source: `@group(0) @binding(0) var uCube : texture_cube<f32>;` } },
 *   resources: {
 *     uCube: cube.source,
 *     uSampler: cube.source.style,
 *   },
 * });
 * ```
 * @category rendering
 * @advanced
 */
export class CubeTexture extends EventEmitter<{ destroy: CubeTexture }> implements BindableTexture
{
    /** unique id for this cube texture */
    public readonly uid: number = uid('cubeTexture');

    /** Has the texture been destroyed? */
    public destroyed = false;

    /** The underlying cube texture source. */
    public readonly source: CubeTextureSource;

    /** Optional label for debugging. */
    public label?: string;

    constructor(options: CubeTextureOptions)
    {
        super();

        const { label, source } = options;

        this.label = label;

        this.source = source;

        this.source.label = this.label ?? this.source.label;
    }

    /**
     * Convenience factory for creating a cube texture from a {@link CubeTextureSource}.
     * @param options - A cube texture source.
     * @param skipCache - Unused for this overload.
     */
    public static from(options: CubeTextureSource, skipCache?: boolean): CubeTexture;
    /**
     * Convenience factory for creating a cube texture from 6 face inputs.
     *
     * Face inputs are converted to {@link Texture} via {@link Texture.from}. This does **not** load resources;
     * string ids must already be present in the cache (e.g. after `Assets.load`).
     * @example
     * ```ts
     * const cube = CubeTexture.from({
     *   faces: {
     *     right: 'px.png',
     *     left: 'nx.png',
     *     top: 'py.png',
     *     bottom: 'ny.png',
     *     front: 'pz.png',
     *     back: 'nz.png',
     *   },
     * });
     * ```
     * @param options - Options including the 6 face inputs.
     * @param skipCache - Skip caching the resulting {@link CubeTexture} when all faces are string ids.
     */
    public static from(options: CubeTextureFromOptions, skipCache?: boolean): CubeTexture;
    public static from(options: CubeTextureSource | CubeTextureFromOptions, skipCache = false): CubeTexture
    {
        if (options instanceof CubeTextureSource)
        {
            return new CubeTexture({ source: options });
        }

        const { faces, ...sourceOptions } = options;

        // Cache only when faces are string ids (matches Texture.from string semantics).
        let cacheKey: string = null;

        const isFaceIds = faceKeys.every((key) => typeof faces[key] === 'string');

        if (!skipCache && isFaceIds)
        {
            cacheKey = getCubeCacheKey(faces as unknown as CubeTextureFaces<string>, sourceOptions);

            if (Cache.has(cacheKey))
            {
                return Cache.get(cacheKey);
            }
        }

        const toTexture = (input: TextureSourceLike | BindableTexture): Texture =>
        {
            if ((input as any).isTexture) return input as Texture;

            return Texture.from(input as TextureSourceLike);
        };

        const faceSources = {} as CubeTextureFaces<TextureSource>;

        for (const key of faceKeys)
        {
            faceSources[key] = toTexture(faces[key]).source;
        }

        const cubeTexture = new CubeTexture({
            source: new CubeTextureSource({
                ...(sourceOptions as Omit<CubeTextureSourceOptions, 'faces'>),
                faces: faceSources,
            }),
            label: sourceOptions.label,
        });

        if (cacheKey)
        {
            Cache.set(cacheKey, cubeTexture);

            cubeTexture.once('destroy', () =>
            {
                if (Cache.has(cacheKey))
                {
                    Cache.remove(cacheKey);
                }
            });
        }

        return cubeTexture;
    }

    /**
     * Destroy this CubeTexture.
     * @param destroySource - If true, destroys the underlying {@link CubeTextureSource}.
     */
    public destroy(destroySource = false): void
    {
        if (this.destroyed) return;

        this.destroyed = true;

        if (destroySource)
        {
            this.source.destroy();
        }

        this.emit('destroy', this);
        this.removeAllListeners();
    }
}

