import { Mesh, MeshGeometry, MeshMaterial } from '@pixi/mesh';
import { Texture } from '@pixi/core';

import type { ITypedArray, IArrayBuffer, Renderer } from '@pixi/core';
import type { DRAW_MODES } from '@pixi/constants';

/**
 * The Simple Mesh class mimics Mesh in PixiJS v4, providing easy-to-use constructor arguments.
 * For more robust customization, use {@link PIXI.Mesh}.
 * @memberof PIXI
 */
export class SimpleMesh extends Mesh
{
    /** Upload vertices buffer each frame. */
    public autoUpdate: boolean;

    /**
     * @param texture - The texture to use
     * @param {Float32Array} [vertices] - if you want to specify the vertices
     * @param {Float32Array} [uvs] - if you want to specify the uvs
     * @param {Uint16Array} [indices] - if you want to specify the indices
     * @param drawMode - the drawMode, can be any of the Mesh.DRAW_MODES consts
     */
    constructor(
        texture: Texture = Texture.EMPTY,
        vertices?: IArrayBuffer,
        uvs?: IArrayBuffer,
        indices?: IArrayBuffer,
        drawMode?: DRAW_MODES
    )
    {
        const geometry = new MeshGeometry(vertices, uvs, indices);

        geometry.getBuffer('aVertexPosition').static = false;

        const meshMaterial = new MeshMaterial(texture);

        super(geometry, meshMaterial, null, drawMode);

        this.autoUpdate = true;
    }

    /**
     * Collection of vertices data.
     * @type {Float32Array}
     */
    get vertices(): ITypedArray
    {
        return this.geometry.getBuffer('aVertexPosition').data;
    }
    set vertices(value: ITypedArray)
    {
        this.geometry.getBuffer('aVertexPosition').data = value;
    }

    _render(renderer: Renderer): void
    {
        if (this.autoUpdate)
        {
            this.geometry.getBuffer('aVertexPosition').update();
        }

        super._render(renderer);
    }
}
