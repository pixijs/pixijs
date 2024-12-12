import { PlaneGeometry } from '../mesh-plane/PlaneGeometry';
import { applyProjectiveTransformationToPlane } from './utils/applyProjectiveTransformationToPlane';
import { compute2DProjection } from './utils/compute2DProjections';

import type { ArrayFixed } from '../../utils/types';
import type { PlaneGeometryOptions } from '../mesh-plane/PlaneGeometry';

/**
 * Constructor options used for `PerspectivePlaneGeometry` instances.
 * @memberof scene
 */
export interface PerspectivePlaneGeometryOptions extends PlaneGeometryOptions
{
    /** The width of the plane */
    width: number;
    /** The height of the plane */
    height: number;
}

/**
 * A PerspectivePlaneGeometry allows you to draw a 2d plane with perspective. Where ever you move the corners
 * the texture will be projected to look like it is in 3d space. Great for mapping a 2D mesh into a 3D scene.
 *
 * IMPORTANT: This is not a full 3D mesh, it is a 2D mesh with a perspective projection applied to it :)
 *
 * ```js
 * const perspectivePlaneGeometry = new PerspectivePlaneGeometry({
 *  width: 100,
 *  height: 100,
 *  verticesX: 10,
 *  verticesY: 10,
 * });
 * ```
 * @see {@link scene.PerspectivePlaneGeometry}
 * @memberof scene
 */
export class PerspectivePlaneGeometry extends PlaneGeometry
{
    /** The corner points of the quad you can modify these directly, if you do make sure to call `updateProjection` */
    public corners: [number, number, number, number, number, number, number, number];
    private readonly _projectionMatrix: ArrayFixed<number, 9> = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    /**
     * @param options - Options to be applied to MeshPlane
     * @param options.width - The width of the plane
     * @param options.height - The height of the plane
     * @param options.verticesX - The amount of vertices on the x axis
     * @param options.verticesY - The amount of vertices on the y axis
     */
    constructor(options: PerspectivePlaneGeometryOptions)
    {
        super(options);

        const { width, height } = options;

        this.corners = [0, 0, width, 0, width, height, 0, height];
    }

    /**
     * Will set the corners of the quad to the given coordinates
     * Calculating the perspective so it looks correct!
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
        const corners = this.corners;

        corners[0] = x0;
        corners[1] = y0;
        corners[2] = x1;
        corners[3] = y1;
        corners[4] = x2;
        corners[5] = y2;
        corners[6] = x3;
        corners[7] = y3;

        this.updateProjection();
    }

    /** Update the projection matrix based on the corners */
    public updateProjection()
    {
        const { width, height } = this;
        const corners = this.corners;

        const projectionMatrix = compute2DProjection(
            this._projectionMatrix,
            0, 0, // top-left source
            corners[0], corners[1], // top-left dest
            width, 0, // top-right source
            corners[2], corners[3], // top-right dest
            width, height, // bottom-right source
            corners[4], corners[5], // bottom-right dest
            0, height, // bottom-left source
            corners[6], corners[7] // bottom-left dest
        );

        applyProjectiveTransformationToPlane(
            width,
            height,
            this,
            projectionMatrix
        );
    }
}

