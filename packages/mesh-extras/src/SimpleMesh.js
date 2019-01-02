import { Mesh, MeshGeometry, MeshMaterial } from '@pixi/mesh';
import { Texture } from '@pixi/core';

/**
 * Simple Mesh class mimics mesh in PixiJS v4, provides
 * easy-to-use constructor arguments. For more robust
 * customization, use {@link PIXI.Mesh}.
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 */
export default class SimpleMesh extends Mesh
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
        const geometry = new MeshGeometry(vertices, uvs, indices);

        geometry.getAttribute('aVertexPosition').static = false;

        const meshMaterial = new MeshMaterial(texture);

        super(geometry, meshMaterial, null, drawMode);

        /**
         * upload vertices buffer each frame
         * @member {boolean}
         */
        this.autoUpdate = true;
    }

    /**
     * Collection of vertices data.
     * @member {Float32Array}
     */
    get vertices()
    {
        return this.geometry.getAttribute('aVertexPosition').data;
    }
    set vertices(value)
    {
        this.geometry.getAttribute('aVertexPosition').data = value;
    }

    _render(renderer)
    {
        if (this.autoUpdate)
        {
            this.geometry.getAttribute('aVertexPosition').update();
        }

        super._render(renderer);
    }
}
