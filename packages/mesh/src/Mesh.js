import RawMesh from './RawMesh';
import { Geometry, Program, Shader, Texture, TextureMatrix } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { BLEND_MODES } from '@pixi/constants';
import { hex2rgb, premultiplyRgba } from '@pixi/utils';
import vertex from './mesh.vert';
import fragment from './mesh.frag';

let meshProgram;

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export default class Mesh extends RawMesh
{
    /**
     * @param {PIXI.Texture} [texture=Texture.EMPTY] - The texture to use
     * @param {Float32Array} [vertices] - if you want to specify the vertices
     * @param {Float32Array} [uvs] - if you want to specify the uvs
     * @param {Uint16Array} [indices] - if you want to specify the indices
     * @param {number} [drawMode] - the drawMode, can be any of the Mesh.DRAW_MODES consts
     */
    constructor(texture = Texture.EMPTY, vertices, uvs, indices, drawMode)
    {
        const geometry = new Geometry();

        if (!meshProgram)
        {
            meshProgram = new Program(vertex, fragment);
        }

        geometry.addAttribute('aVertexPosition', vertices)
            .addAttribute('aTextureCoord', uvs)
            .addIndex(indices);

        geometry.getAttribute('aVertexPosition').static = false;

        const uniforms = {
            uSampler: texture,
            uTextureMatrix: Matrix.IDENTITY,
            alpha: 1,
            uColor: new Float32Array([1, 1, 1, 1]),
        };

        super(geometry, new Shader(meshProgram, uniforms), null, drawMode);

        /**
         * The Uvs of the Mesh
         *
         * @member {Float32Array}
         */
        this.uvs = geometry.getAttribute('aTextureCoord').data;

        /**
         * An array of vertices
         *
         * @member {Float32Array}
         */
        this.vertices = geometry.getAttribute('aVertexPosition').data;

        this.uniforms = uniforms;

        /**
         * The texture of the Mesh
         *
         * @member {PIXI.Texture}
         * @default PIXI.Texture.EMPTY
         * @private
         */
        this.texture = texture;

        /**
         * The tint applied to the mesh. This is a [r,g,b] value. A value of [1,1,1] will remove any
         * tint effect.
         *
         * @member {number}
         * @private
         */
        this._tintRGB = new Float32Array([1, 1, 1]);

        // Set default tint
        this.tint = 0xFFFFFF;

        this.blendMode = BLEND_MODES.NORMAL;

        /**
         * TextureMatrix instance for this Mesh, used to track Texture changes
         *
         * @member {PIXI.TextureMatrix}
         * @readonly
         */
        this.uvMatrix = new TextureMatrix(this._texture);

        /**
         * whether or not upload uvMatrix to shader
         * if its false, then uvs should be pre-multiplied
         * if you change it for generated mesh, please call 'refresh(true)'
         * @member {boolean}
         * @default false
         */
        this.uploadUvMatrix = false;

        /**
         * Uploads vertices buffer every frame, like in PixiJS V3 and V4.
         *
         * @member {boolean}
         * @default true
         */
        this.autoUpdate = true;
    }

    /**
     * The tint applied to the Rope. This is a hex value. A value of
     * 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     * @default 0xFFFFFF
     */
    get tint()
    {
        return this._tint;
    }

    /**
     * Sets the tint of the rope.
     *
     * @param {number} value - The value to set to.
     */
    set tint(value)
    {
        this._tint = value;

        hex2rgb(this._tint, this._tintRGB);
    }

    /**
     * The blend mode to be applied to the sprite. Set to `PIXI.BLEND_MODES.NORMAL` to remove any blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    get blendMode()
    {
        return this.state.blendMode;
    }

    set blendMode(value) // eslint-disable-line require-jsdoc
    {
        this.state.blendMode = value;
    }

    /**
     * The texture that the mesh uses.
     *
     * @member {PIXI.Texture}
     */
    get texture()
    {
        return this._texture;
    }

    set texture(value) // eslint-disable-line require-jsdoc
    {
        if (this._texture === value)
        {
            return;
        }

        this._texture = value;
        this.uniforms.uSampler = this.texture;

        if (value)
        {
            // wait for the texture to load
            if (value.baseTexture.valid)
            {
                this._onTextureUpdate();
            }
            else
            {
                value.once('update', this._onTextureUpdate, this);
            }
        }
    }

    _render(renderer)
    {
        const baseTex = this._texture.baseTexture;

        premultiplyRgba(this._tintRGB, this.worldAlpha, this.uniforms.uColor, baseTex.premultiplyAlpha);
        super._render(renderer);
    }
    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @private
     */
    _onTextureUpdate()
    {
        // constructor texture update stop
        if (!this.uvMatrix)
        {
            return;
        }
        this.uvMatrix.texture = this._texture;
        this.refresh();
    }

    /**
     * multiplies uvs only if uploadUvMatrix is false
     * call it after you change uvs manually
     * make sure that texture is valid
     */
    multiplyUvs()
    {
        if (!this.uploadUvMatrix)
        {
            this.uvMatrix.multiplyUvs(this.uvs);
        }
    }

    /**
     * Refreshes uvs for generated meshes (rope, plane)
     * sometimes refreshes vertices too
     *
     * @param {boolean} [forceUpdate=false] if true, matrices will be updated any case
     */
    refresh(forceUpdate)
    {
        if (this.uvMatrix.update(forceUpdate))
        {
            this._refresh();
        }
    }

    /**
     * Updates the object transform for rendering
     *
     * @private
     */
    updateTransform()
    {
        if (this.autoUpdate)
        {
            this.geometry.buffers[0].update();
        }
        this.containerUpdateTransform();
    }

    /**
     * re-calculates mesh coords
     * @private
     */
    _refresh()
    {
        /* empty */
    }
}
