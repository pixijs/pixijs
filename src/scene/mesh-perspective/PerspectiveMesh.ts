import { Texture } from '../../rendering/renderers/shared/texture/Texture';
import { definedProps } from '../container/utils/definedProps';
import { Mesh } from '../mesh/shared/Mesh';
import { PerspectivePlaneGeometry } from './PerspectivePlaneGeometry';

import type { MeshPlaneOptions } from '../mesh-plane/MeshPlane';
/**
 *
 * Constructor options used for `PerspectiveMesh` instances.
 * ```js
 * const meshPlane = new PerspectiveMesh({
 *  texture: Texture.from('snake.png'),
 *  verticesX: 20,
 *  verticesY: 20,
 *  x0: 0,
 *  y0: 0,
 *  x1: 100,
 *  y1: 0,
 *  x2: 100,
 *  y2: 100,
 *  x3: 0,
 *  y3: 100
 * });
 * @see {@link scene.PerspectiveMesh}
 * @memberof scene
 */
export interface PerspectivePlaneOptions extends MeshPlaneOptions
{
    /** top left corner x value */
    x0?: number,
    /** top left corner y value */
    y0?: number,
    /** top right corner x value */
    x1?: number,
    /** top right corner y value */
    y1?: number,
    /** bottom right corner x value */
    x2?: number,
    /** bottom right corner y value */
    y2?: number,
    /** bottom left corner x value */
    x3?: number,
    /** bottom left corner y value */
    y3?: number
}

/**
 * A perspective mesh that allows you to draw a 2d plane with perspective. Where ever you move the corners
 * the texture will be projected to look like it is in 3d space. Great for mapping a 2D mesh into a 3D scene.
 *
 * The calculations is done at the uv level. This means that the more vertices you have the more smooth
 * the perspective will be. If you have a low amount of vertices you may see the texture stretch. Too many vertices
 * could be slower. It is a balance between performance and quality! We leave that to you to decide.
 *
 * IMPORTANT: This is not a full 3D mesh, it is a 2D mesh with a perspective projection applied to it :)
 * @example
 * ```js
 * const meshPlane = new PerspectiveMesh({
 *  texture: Texture.from('snake.png'),
 *  verticesX: 20,
 *  verticesY: 20,
 *  x0: 0,
 *  y0: 0,
 *  x1: 100,
 *  y1: 0,
 *  x2: 100,
 *  y2: 100,
 *  x3: 0,
 *  y3: 100
 * });
 * @see {@link scene.PerspectiveMesh}
 * @memberof scene
 */
export class PerspectiveMesh extends Mesh<PerspectivePlaneGeometry>
{
    /** default options for the mesh */
    public static defaultOptions: PerspectivePlaneOptions = {
        texture: Texture.WHITE,
        verticesX: 10,
        verticesY: 10,
        x0: 0,
        y0: 0,
        x1: 100,
        y1: 0,
        x2: 100,
        y2: 100,
        x3: 0,
        y3: 100
    };

    /**
     * @param options - Options to be applied to PerspectiveMesh
     */
    constructor(options: PerspectivePlaneOptions)
    {
        options = { ...PerspectiveMesh.defaultOptions, ...options };

        const { texture, verticesX, verticesY, ...rest } = options;
        const planeGeometry = new PerspectivePlaneGeometry(definedProps({
            width: texture.width,
            height: texture.height,
            verticesX,
            verticesY,
        }));

        super(definedProps({ ...rest, geometry: planeGeometry }));

        this._texture = texture;

        this.geometry.setCorners(
            options.x0, options.y0,
            options.x1, options.y1,
            options.x2, options.y2,
            options.x3, options.y3
        );
    }

    /** Update the geometry when the texture is updated */
    protected textureUpdated(): void
    {
        const geometry: PerspectivePlaneGeometry = this.geometry as any;

        if (!geometry) return;

        const { width, height } = this.texture;

        if (geometry.width !== width || geometry.height !== height)
        {
            geometry.width = width;
            geometry.height = height;
            geometry.updateProjection();
        }
    }

    set texture(value: Texture)
    {
        if (this._texture === value) return;

        super.texture = value;

        this.textureUpdated();
    }

    /** The texture that the mesh uses */
    get texture(): Texture
    {
        return this._texture;
    }

    /**
     * Set the corners of the quad to the given coordinates
     * The mesh will then calculate the perspective so it looks correct!
     * @param x0 - x coordinate of the first corner
     * @param y0 - y coordinate of the first corner
     * @param x1 - x coordinate of the second corner
     * @param y1 - y coordinate of the second corner
     * @param x2 - x coordinate of the third corner
     * @param y2 - y coordinate of the third corner
     * @param x3 - x coordinate of the fourth corner
     * @param y3 - y coordinate of the fourth corner
     */
    public setCorners(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number)
    {
        this.geometry.setCorners(x0, y0, x1, y1, x2, y2, x3, y3);
    }
}
