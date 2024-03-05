import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { MeshGeometry } from '../mesh/shared/MeshGeometry';

import type { MeshGeometryOptions } from '../mesh/shared/MeshGeometry';

/**
 * Constructor options used for `PlaneGeometry` instances.
 * ```js
 * const planeGeometry = new PlaneGeometry({
 *    width: 100,
 *    height: 100,
 *    verticesX: 10,
 *    verticesY: 10,
 * });
 * ```
 * @see {@link scene.PlaneGeometry}
 * @memberof scene
 */
export interface PlaneGeometryOptions
{
    /** Width of plane */
    width?: number;
    /** Height of plane */
    height?: number;
    /** Number of vertices on x-axis */
    verticesX?: number;
    /** Number of vertices on y-axis */
    verticesY?: number;
}

/**
 * The PlaneGeometry allows you to draw a 2d plane
 * @memberof scene
 */
export class PlaneGeometry extends MeshGeometry
{
    public static defaultOptions: PlaneGeometryOptions & MeshGeometryOptions = {
        width: 100,
        height: 100,
        verticesX: 10,
        verticesY: 10,
    };

    /** The number of vertices on x-axis */
    public verticesX: number;
    /** The number of vertices on y-axis */
    public verticesY: number;
    /** The width of plane */
    public width: number;
    /** The height of plane */
    public height: number;

    /**
     * @param {PlaneGeometryOptions} options - Options to be applied to plane geometry
     */
    constructor(options: PlaneGeometryOptions);
    /** @deprecated since 8.0.0 */
    constructor(width?: number, height?: number, verticesX?: number, verticesY?: number);
    constructor(...args: [PlaneGeometryOptions?] | [number?, number?, number?, number?])
    {
        super({});

        let options = args[0] ?? {};

        if (typeof options === 'number')
        {
            // #if _DEBUG
            // eslint-disable-next-line max-len
            deprecation(v8_0_0, 'PlaneGeometry constructor changed please use { width, height, verticesX, verticesY } instead');
            // #endif

            options = {
                width: options,
                height: args[1],
                verticesX: args[2],
                verticesY: args[3],
            };
        }

        this.build(options);
    }

    /**
     * Refreshes plane coordinates
     * @param options - Options to be applied to plane geometry
     */
    public build(options: PlaneGeometryOptions): void
    {
        options = { ...PlaneGeometry.defaultOptions, ...options };

        this.verticesX = this.verticesX ?? options.verticesX;
        this.verticesY = this.verticesY ?? options.verticesY;

        this.width = this.width ?? options.width;
        this.height = this.height ?? options.height;

        const total = this.verticesX * this.verticesY;
        const verts = [];
        const uvs = [];
        const indices = [];

        const verticesX = this.verticesX - 1;
        const verticesY = this.verticesY - 1;

        const sizeX = (this.width) / verticesX;
        const sizeY = (this.height) / verticesY;

        for (let i = 0; i < total; i++)
        {
            const x = (i % this.verticesX);
            const y = ((i / this.verticesX) | 0);

            verts.push(x * sizeX, y * sizeY);
            uvs.push(x / verticesX, y / verticesY);
        }

        const totalSub = verticesX * verticesY;

        for (let i = 0; i < totalSub; i++)
        {
            const xpos = i % verticesX;
            const ypos = (i / verticesX) | 0;

            const value = (ypos * this.verticesX) + xpos;
            const value2 = (ypos * this.verticesX) + xpos + 1;
            const value3 = ((ypos + 1) * this.verticesX) + xpos;
            const value4 = ((ypos + 1) * this.verticesX) + xpos + 1;

            indices.push(value, value2, value3,
                value2, value4, value3);
        }

        this.buffers[0].data = new Float32Array(verts);
        this.buffers[1].data = new Float32Array(uvs);
        this.indexBuffer.data = new Uint32Array(indices);

        // ensure that the changes are uploaded
        this.buffers[0].update();
        this.buffers[1].update();
        this.indexBuffer.update();
    }
}
