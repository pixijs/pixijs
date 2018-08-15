import { Shader, Program, TextureMatrix } from '@pixi/core';
import vertex from './shader/mesh.vert';
import fragment from './shader/mesh.frag';
import { Matrix } from '@pixi/math';
import { premultiplyTintToRgba } from '@pixi/utils';

export default class MeshMaterial extends Shader
{
    constructor(uSampler)
    {
        const program = Program.from(vertex, fragment);

        const uniforms = {
            uSampler,
            alpha: 1,
            uTextureMatrix: Matrix.IDENTITY,
            uColor: new Float32Array([1, 1, 1, 1]),
        };

        super(program, uniforms);

        this.colorDirty = false;

        this.tint = 0xFFFFFF;
        this.alpha = 1;

        /**
         * TextureMatrix instance for this Mesh, used to track Texture changes
         *
         * @member {PIXI.TextureMatrix}
         * @readonly
         */
        // TODO get this back in!
        this.uvMatrix = new TextureMatrix(this.uSampler);

        // this shader can batch with the main batcher..
        this.batchable = true;
    }

    get texture()
    {
        return this.uniforms.uSampler;
    }

    set texture(value)
    {
        this.uniforms.uSampler = value;
    }

    set alpha(value)
    {
        if (value === this._alpha) return;

        this._alpha = value;
        this.colorDirty = true;
    }

    get alpha()
    {
        return this._alpha;
    }

    set tint(value)
    {
        if (value === this._tint) return;

        this._tint = value;
        this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);

        this.colorDirty = true;
    }

    get tint()
    {
        return this._tint;
    }

    update()
    {
        if (this.colorDirty)
        {
            this.colorDirty = false;
            const baseTexture = this.texture.baseTexture;

            premultiplyTintToRgba(this._tintRGB, this._alpha, this.uniforms.uColor, baseTexture.premultiplyAlpha);
        }
    }
}
