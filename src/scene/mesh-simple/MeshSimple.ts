import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { MeshGeometry } from '../mesh/shared/MeshGeometry';

import type { TypedArray } from '../../rendering/renderers/shared/buffer/Buffer';
import type { Topology } from '../../rendering/renderers/shared/geometry/const';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { MeshOptions } from '../mesh/shared/Mesh';

/**
 * Options for the simple mesh.
 * @memberof scene
 */
export interface SimpleMeshOptions extends Omit<MeshOptions, 'geometry'>
{
    /** The texture to use */
    texture: Texture,
    /** if you want to specify the vertices */
    vertices?: Float32Array,
    /** if you want to specify the uvs */
    uvs?: Float32Array,
    /** if you want to specify the indices */
    indices?: Uint32Array,
    /** the topology, can be any of the Topology values */
    topology?: Topology
}

/**
 * The Simple Mesh class mimics Mesh in PixiJS, providing easy-to-use constructor arguments.
 * For more robust customization, use {@link scene.Mesh}.
 * @memberof scene
 */
export class MeshSimple extends Mesh
{
    /** Upload vertices buffer each frame. */
    public autoUpdate: boolean;

    /**
     * @param options - Options to be used for construction
     */
    constructor(options: SimpleMeshOptions)
    {
        const { texture, vertices, uvs, indices, topology, ...rest } = options;
        const geometry = new MeshGeometry(definedProps({
            positions: vertices,
            uvs,
            indices,
            topology
        }));

        // geometry.getBuffer('aPosition').static = false;

        super(definedProps({
            ...rest,
            texture,
            geometry,
        }));

        this.autoUpdate = true;
        this.onRender = this._render;
    }

    /**
     * Collection of vertices data.
     * @type {Float32Array}
     */
    get vertices(): TypedArray
    {
        return this.geometry.getBuffer('aPosition').data;
    }
    set vertices(value: TypedArray)
    {
        this.geometry.getBuffer('aPosition').data = value;
    }

    private _render(): void
    {
        if (this.autoUpdate)
        {
            this.geometry.getBuffer('aPosition').update();
        }
    }
}
