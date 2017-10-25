import RawMesh from './RawMesh';
import Geometry from '../core/geometry/Geometry';
import * as core from '../core';
import vertex from './webgl/mesh.vert';
import fragment from './webgl/mesh.frag';

let meshProgram;

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 */
export default class Mesh extends RawMesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use
     * @param {Float32Array} [vertices] - if you want to specify the vertices
     * @param {Float32Array} [uvs] - if you want to specify the uvs
     * @param {Uint16Array} [indices] - if you want to specify the indices
     * @param {number} [drawMode] - the drawMode, can be any of the Mesh.DRAW_MODES consts
     */
    constructor(texture, vertices, uvs, indices, drawMode)
    {
        const geometry = new Geometry();

        if (!meshProgram)
        {
            meshProgram = new core.Program(vertex, fragment);
        }

        geometry.addAttribute('aVertexPosition', vertices)
            .addAttribute('aTextureCoord', uvs)
            .addIndex(indices);

        geometry.getAttribute('aVertexPosition').static = false;

        const uniforms = {
            uSampler2: texture,
            alpha: 1,
            tint: new Float32Array([1, 1, 1]),
        };

        super(geometry, new core.Shader(meshProgram, uniforms), null, drawMode);

        this.uvs = geometry.getAttribute('aTextureCoord').data;
        this.vertices = geometry.getAttribute('aVertexPosition').data;

        this.uniforms = uniforms;
        this.texture = texture;

        this._tint = 0xFFFFFF;
        this.tint = 0xFFFFFF;

        this.blendMode = core.BLEND_MODES.NORMAL;
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
        core.utils.hex2rgb(this._tint, this.uniforms.tint);
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
        this.uniforms.uSampler2 = this.texture;

        if (value)
        {
            // wait for the texture to load
            if (value.baseTexture.hasLoaded)
            {
                this._onTextureUpdate();
            }
            else
            {
                value.once('update', this._onTextureUpdate, this);
            }
        }
    }

    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @private
     */
    _onTextureUpdate()
    {
        /* empty */
    }
}
