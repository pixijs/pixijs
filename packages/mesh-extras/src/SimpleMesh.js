import { Mesh, MeshGeometry, MeshMaterial } from '@pixi/mesh';
import { Texture } from '@pixi/core';

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
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

        this.autoUpdate = true;
    }

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
