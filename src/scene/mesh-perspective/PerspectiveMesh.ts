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
 *  x1: 0,
 *  y1: 0,
 *  x2: 100,
 *  y2: 0,
 *  x3: 100,
 *  y3: 100,
 *  x4: 0,
 *  y4: 100
 * });
 * @see {@link scene.PerspectiveMesh}
 * @memberof scene
 */
export interface PerspectivePlaneOptions extends MeshPlaneOptions
{
    /** top left corner x value */
    x1?: number,
    /** top left corner y value */
    y1?: number,
    /** top right corner x value */
    x2?: number,
    /** top right corner y value */
    y2?: number,
    /** bottom right corner x value */
    x3?: number,
    /** bottom right corner y value */
    y3?: number,
    /** bottom left corner x value */
    x4?: number,
    /** bottom left corner y value */
    y4?: number
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
 *  x1: 0,
 *  y1: 0,
 *  x2: 100,
 *  y2: 0,
 *  x3: 100,
 *  y3: 100,
 *  x4: 0,
 *  y4: 100
 * });
 * @see {@link scene.PerspectiveMesh}
 * @memberof scene
 */
export class PerspectiveMesh extends Mesh<PerspectivePlaneGeometry>
{
    public static defaultOptions: PerspectivePlaneOptions = {
        texture: Texture.WHITE,
        verticesX: 10,
        verticesY: 10,
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
        x3: 100,
        y3: 100,
        x4: 0,
        y4: 100
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
            options.x1, options.y1,
            options.x2, options.y2,
            options.x3, options.y3,
            options.x4, options.y4
        );
    }

    public textureUpdated(): void
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

    get texture(): Texture
    {
        return this._texture;
    }

    /**
     * Set the corners of the quad to the given coordinates
     * The mesh will then calculate the perspective so it looks correct!
     * @param x1 - x coordinate of the first corner
     * @param y1 - y coordinate of the first corner
     * @param x2 - x coordinate of the second corner
     * @param y2 - y coordinate of the second corner
     * @param x3 - x coordinate of the third corner
     * @param y3 - y coordinate of the third corner
     * @param x4 - x coordinate of the fourth corner
     * @param y4 - y coordinate of the fourth corner
     */
    public setCorners(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number)
    {
        this.geometry.setCorners(x1, y1, x2, y2, x3, y3, x4, y4);
    }
}
