import { Program, Shader, TextureMatrix } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { premultiplyTintToRgba } from '@pixi/utils';
import fragment from './shader/mesh.frag';
import vertex from './shader/mesh.vert';

import type { Texture } from '@pixi/core';
import type { Dict } from '@pixi/utils';

export interface IMeshMaterialOptions {
    alpha?: number;
    tint?: number;
    pluginName?: string;
    program?: Program;
    uniforms?: Dict<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MeshMaterial extends GlobalMixins.MeshMaterial {}

/**
 * Slightly opinionated default shader for PixiJS 2D objects.
 *
 * @memberof PIXI
 */
export class MeshMaterial extends Shader
{
    /**
     * TextureMatrix instance for this Mesh, used to track Texture changes.
     *
     * @readonly
     */
    public readonly uvMatrix: TextureMatrix;

    /**
     * `true` if shader can be batch with the renderer's batch system.
     *
     * @default true
     */
    public batchable: boolean;

    /**
     * Renderer plugin for batching.
     *
     * @default 'batch'
     */
    public pluginName: string;

    // Internal-only properties
    _tintRGB: number;

    /**
     * Only do update if tint or alpha changes.
     *
     * @private
     * @default false
     */
    private _colorDirty: boolean;
    private _alpha: number;
    private _tint: number;

    /**
     * @param uSampler - Texture that material uses to render.
     * @param options - Additional options
     * @param {number} [options.alpha=1] - Default alpha.
     * @param {number} [options.tint=0xFFFFFF] - Default tint.
     * @param {string} [options.pluginName='batch'] - Renderer plugin for batching.
     * @param {PIXI.Program} [options.program=0xFFFFFF] - Custom program.
     * @param {object} [options.uniforms] - Custom uniforms.
     */
    constructor(uSampler: Texture, options?: IMeshMaterialOptions)
    {
        const uniforms = {
            uSampler,
            alpha: 1,
            uTextureMatrix: Matrix.IDENTITY,
            uColor: new Float32Array([1, 1, 1, 1]),
        };

        // Set defaults
        options = Object.assign({
            tint: 0xFFFFFF,
            alpha: 1,
            pluginName: 'batch',
        }, options);

        if (options.uniforms)
        {
            Object.assign(uniforms, options.uniforms);
        }

        super(options.program || Program.from(vertex, fragment), uniforms);

        this._colorDirty = false;

        this.uvMatrix = new TextureMatrix(uSampler);
        this.batchable = options.program === undefined;
        this.pluginName = options.pluginName;

        this.tint = options.tint;
        this.alpha = options.alpha;
    }

    /** Reference to the texture being rendered. */
    get texture(): Texture
    {
        return this.uniforms.uSampler;
    }
    set texture(value: Texture)
    {
        if (this.uniforms.uSampler !== value)
        {
            if (!this.uniforms.uSampler.baseTexture.alphaMode !== !value.baseTexture.alphaMode)
            {
                this._colorDirty = true;
            }

            this.uniforms.uSampler = value;
            this.uvMatrix.texture = value;
        }
    }

    /**
     * This gets automatically set by the object using this.
     *
     * @default 1
     */
    set alpha(value: number)
    {
        if (value === this._alpha) return;

        this._alpha = value;
        this._colorDirty = true;
    }
    get alpha(): number
    {
        return this._alpha;
    }

    /**
     * Multiply tint for the material.
     *
     * @default 0xFFFFFF
     */
    set tint(value: number)
    {
        if (value === this._tint) return;

        this._tint = value;
        this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
        this._colorDirty = true;
    }
    get tint(): number
    {
        return this._tint;
    }

    /**
     * Gets called automatically by the Mesh. Intended to be overridden for custom
     * {@link MeshMaterial} objects.
     */
    public update(): void
    {
        if (this._colorDirty)
        {
            this._colorDirty = false;
            const baseTexture = this.texture.baseTexture;

            premultiplyTintToRgba(
                this._tint, this._alpha, this.uniforms.uColor, (baseTexture.alphaMode as unknown as boolean)
            );
        }
        if (this.uvMatrix.update())
        {
            this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
        }
    }
}
