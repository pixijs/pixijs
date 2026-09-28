import { ExtensionType } from '../../../../../extensions/Extensions';
import { isIntegerFormat } from '../utils/isIntegerFormat';
import { TextureSource } from './TextureSource';

import type { ExtensionMetadata } from '../../../../../extensions/Extensions';
import type { TypedArray } from '../../buffer/Buffer';
import type { TextureShapeOptions, TextureSourceOptions } from './TextureSource';

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
 *
 * Pass `depth` for a 3D texture, or `arrayLayerCount` for a 2D array. The buffer holds the slices (or layers)
 * one after another, each in row-major order, so texel `(x, y, z)` sits at index
 * `x + (y * width) + (z * width * height)`. These upload whole: {@link BufferImageSource#update} takes no range.
 * `rgba32float` can't be filtered on most devices, so smooth sampling wants a format such as
 * `rgba8unorm`, `r8unorm` or `rgba16float`.
 * @example
 * ```ts
 * const ids = new BufferImageSource({
 *     resource: new Uint32Array([1, 2, 3, 4]),
 *     width: 1,
 *     height: 1,
 *     scaleMode: 'nearest',
 * });
 * ```
 * @example
 * A 3D noise texture for volumetric effects, sampled with `sampler3D` (GLSL) or `texture_3d<f32>` (WGSL):
 *
 * ```ts
 * const size = 64;
 * const data = new Uint8Array(size * size * size * 4);
 *
 * for (let z = 0; z < size; z++)
 * {
 *     for (let y = 0; y < size; y++)
 *     {
 *         for (let x = 0; x < size; x++)
 *         {
 *             const i = (x + (y * size) + (z * size * size)) * 4;
 *
 *             data[i] = data[i + 1] = data[i + 2] = Math.random() * 255;
 *             data[i + 3] = 255;
 *         }
 *     }
 * }
 *
 * const noise = new BufferImageSource({
 *     resource: data,
 *     width: size,
 *     height: size,
 *     depth: size,
 *     format: 'rgba8unorm',
 *     addressMode: 'repeat',
 * });
 *
 * // a fullscreen quad that shows the middle slice
 * const quad = new Geometry({
 *     attributes: {
 *         aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
 *         aUV: [0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
 *     },
 * });
 *
 * const wgsl = `
 *     @group(0) @binding(0) var uNoise: texture_3d<f32>;
 *     @group(0) @binding(1) var uNoiseSampler: sampler;
 *
 *     struct VSOutput { @builtin(position) position: vec4f, @location(0) uv: vec2f };
 *
 *     @vertex fn mainVert(@location(0) aPosition: vec2f, @location(1) aUV: vec2f) -> VSOutput {
 *         return VSOutput(vec4f(aPosition, 0.0, 1.0), aUV);
 *     }
 *
 *     @fragment fn mainFrag(@location(0) uv: vec2f) -> @location(0) vec4f {
 *         return textureSample(uNoise, uNoiseSampler, vec3f(uv, 0.5));
 *     }
 * `;
 *
 * const mesh = new Mesh({
 *     geometry: quad,
 *     shader: Shader.from({
 *         gl: {
 *             vertex: `#version 300 es
 *                 in vec2 aPosition;
 *                 in vec2 aUV;
 *                 out vec2 vUV;
 *                 void main() { vUV = aUV; gl_Position = vec4(aPosition, 0.0, 1.0); }
 *             `,
 *             // no `precision ... sampler3D;` line needed: pixi adds it
 *             fragment: `#version 300 es
 *                 in vec2 vUV;
 *                 uniform sampler3D uNoise;
 *                 out vec4 fragColor;
 *                 void main() { fragColor = texture(uNoise, vec3(vUV, 0.5)); }
 *             `,
 *         },
 *         gpu: {
 *             vertex: { source: wgsl, entryPoint: 'mainVert' },
 *             fragment: { source: wgsl, entryPoint: 'mainFrag' },
 *         },
 *         resources: {
 *             uNoise: noise,
 *             uNoiseSampler: noise.style,
 *         },
 *     }),
 * });
 * ```
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

    constructor(options: BufferSourceOptions & TextureShapeOptions)
    {
        const layerCount = options.depth ?? options.arrayLayerCount ?? 1;
        const buffer = options.resource || new Float32Array(options.width * options.height * layerCount * 4);
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

        // uploads never premultiply integer data, and WebGL can't premultiply a 3D or array upload from a
        // buffer, so the default alphaMode must not say they did
        const noPremultiply = isIntegerFormat(format) || layerCount > 1;

        super({
            ...(noPremultiply && { alphaMode: 'no-premultiply-alpha' }),
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
     * Partial uploads assume the buffer holds exactly `width * height` texels. A 3D texture or 2D array
     * always uploads whole, so it takes no range.
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
        // #if _DEBUG
        if ((start > 0 || end < Infinity) && this.depthOrArrayLayers > 1)
        {
            throw new Error('[BufferImageSource] a 3D texture or 2D array uploads whole: call update() with no range.');
        }
        // #endif

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
