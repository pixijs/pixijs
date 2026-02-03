import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { MeshGeometry } from '../mesh/shared/MeshGeometry';

import type { TypedArray } from '../../rendering/renderers/shared/buffer/Buffer';
import type { Topology } from '../../rendering/renderers/shared/geometry/const';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { MeshOptions } from '../mesh/shared/Mesh';

/**
 * Options for creating a SimpleMesh instance. Defines the texture, geometry data, and rendering topology
 * for a basic mesh with direct vertex manipulation capabilities.
 * @example
 * ```ts
 * // Create a basic textured triangle
 * const mesh = new MeshSimple({
 *     texture: Texture.from('sprite.png'),
 *     vertices: new Float32Array([
 *         0, 0,      // Vertex 1
 *         100, 0,    // Vertex 2
 *         50, 100    // Vertex 3
 *     ]),
 *     uvs: new Float32Array([
 *         0, 0,    // UV 1
 *         1, 0,    // UV 2
 *         0.5, 1   // UV 3
 *     ])
 * });
 *
 * // Create an indexed quad with custom topology
 * const quadMesh = new MeshSimple({
 *     texture: Texture.from('square.png'),
 *     vertices: new Float32Array([
 *         0, 0,     // Top-left
 *         100, 0,   // Top-right
 *         100, 100, // Bottom-right
 *         0, 100    // Bottom-left
 *     ]),
 *     uvs: new Float32Array([
 *         0, 0,  // Top-left
 *         1, 0,  // Top-right
 *         1, 1,  // Bottom-right
 *         0, 1   // Bottom-left
 *     ]),
 *     indices: new Uint32Array([
 *         0, 1, 2,  // Triangle 1
 *         0, 2, 3   // Triangle 2
 *     ]),
 *     topology: 'triangle-list'
 * });
 * ```
 * @category scene
 * @advanced
 * @noInheritDoc
 */
export interface SimpleMeshOptions extends Omit<MeshOptions, 'geometry'>
{
    /** The texture to use */
    texture: Texture,
    /** Array of vertex positions as x,y pairs. Each vertex is 2 floats - x, y */
    vertices?: Float32Array,
    /** Array of UV coordinates for texture mapping. Each UV is 2 floats - u, v */
    uvs?: Float32Array,
    /** Array of indices defining triangles. Each triangle is 3 indices into the vertices array. */
    indices?: Uint32Array,
    /**
     * How vertices are connected to form triangles.
     * - 'triangle-list': Individual triangles (default)
     * - 'triangle-strip': Connected triangle strip
     * - 'line-list': Lines between vertices
     * - 'line-strip': Connected line strip
     * - 'point-list': Points rendered individually
     * @default 'triangle-list'
     */
    topology?: Topology;
}

/**
 * A simplified mesh class that provides an easy way to create and manipulate textured meshes
 * with direct vertex control. Perfect for creating custom shapes, deformable sprites, and
 * simple 2D effects.
 * @example
 * ```ts
 * // Create a basic triangle mesh
 * const triangleMesh = new MeshSimple({
 *     texture: Texture.from('sprite.png'),
 *     vertices: new Float32Array([
 *         0, 0,      // Top-left
 *         100, 0,    // Top-right
 *         50, 100    // Bottom-center
 *     ]),
 *     uvs: new Float32Array([
 *         0, 0,    // Map top-left of texture
 *         1, 0,    // Map top-right of texture
 *         0.5, 1   // Map bottom-center of texture
 *     ])
 * });
 *
 * // Animate vertices
 * app.ticker.add(() => {
 *     const time = performance.now() / 1000;
 *     const vertices = triangleMesh.vertices;
 *
 *     // Move the top vertex up and down
 *     vertices[1] = Math.sin(time) * 20;
 *     triangleMesh.vertices = vertices; // Update vertices
 *
 *     // Auto-updates by default
 * });
 *
 * // Create a line strip
 * const lineMesh = new MeshSimple({
 *     texture: Texture.from('line.png'),
 *     vertices: new Float32Array([
 *         0, 0,
 *         50, 50,
 *         100, 0,
 *         150, 50
 *     ]),
 *     topology: 'line-strip'
 * });
 *
 * // Manual vertex updates
 * lineMesh.autoUpdate = false;
 * const vertices = lineMesh.vertices;
 * vertices[0] += 10;
 * lineMesh.vertices = vertices; // Update vertices manually
 * // Update the vertices buffer manually
 * lineMesh.geometry.getBuffer('aPosition').update();
 * ```
 * @category scene
 * @advanced
 * @see {@link Mesh} For more advanced mesh customization
 * @see {@link MeshGeometry} For direct geometry manipulation
 */
export class MeshSimple extends Mesh
{
    /**
     * Controls whether the mesh's vertex buffer is automatically updated each frame.
     * When true, vertex changes will be reflected immediately. When false, manual updates are required.
     * @example
     * ```ts
     * // Auto-update mode (default)
     * mesh.autoUpdate = true;
     * app.ticker.add(() => {
     *     // Vertices update automatically each frame
     *     const vertices = mesh.vertices;
     *     vertices[1] = Math.sin(performance.now() / 1000) * 20;
     *     mesh.vertices = vertices;
     * });
     *
     * // Manual update mode
     * mesh.autoUpdate = false;
     * app.ticker.add(() => {
     *     // Update vertices
     *     const vertices = mesh.vertices;
     *     vertices[1] = Math.sin(performance.now() / 1000) * 20;
     *     mesh.vertices = vertices;
     *
     *     // Manually trigger buffer update
     *     mesh.geometry.getBuffer('aPosition').update();
     * });
     * ```
     * @default true
     * @see {@link MeshGeometry#getBuffer} For manual buffer updates
     * @see {@link MeshSimple#vertices} For accessing vertex data
     */
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
     * The vertex positions of the mesh as a TypedArray. Each vertex is represented by two
     * consecutive values (x, y) in the array. Changes to these values will update the mesh's shape.
     * @example
     * ```ts
     * // Read vertex positions
     * const vertices = mesh.vertices;
     * console.log('First vertex:', vertices[0], vertices[1]);
     *
     * // Modify vertices directly
     * vertices[0] += 10;  // Move first vertex right
     * vertices[1] -= 20;  // Move first vertex up
     *
     * // Animate vertices
     * app.ticker.add(() => {
     *     const time = performance.now() / 1000;
     *     const vertices = mesh.vertices;
     *
     *     // Wave motion
     *     for (let i = 0; i < vertices.length; i += 2) {
     *         vertices[i + 1] = Math.sin(time + i * 0.5) * 20;
     *     }
     * });
     * ```
     * @see {@link MeshSimple#autoUpdate} For controlling vertex buffer updates
     * @see {@link MeshGeometry#getBuffer} For direct buffer access
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
