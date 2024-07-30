import { PlaneGeometry } from '../mesh-plane/PlaneGeometry';
import { applyProjectiveTransformationToPlane } from './utils/applyProjectiveTransformationToPlane';
import { compute2DProjection } from './utils/compute2DProjections';

import type { Matrix3x3 } from './utils/compute2DProjections';

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
    private readonly _projectionMatrix: Matrix3x3 = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    /**
     * @param options - Options to be applied to MeshPlane
     * @param options.width
     * @param options.height
     * @param options.verticesX
     * @param options.verticesY
     */
    constructor(options: {width: number, height: number, verticesX?: number, verticesY?: number})
    {
        super(options);

        const { width, height } = options;

        this.corners = [0, 0, width, 0, width, height, 0, height];
    }

    /**
     * Will set the corners of the quad to the given coordinates
     * Calculating the perspective so it looks correct!
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
        const corners = this.corners;

        corners[0] = x1;
        corners[1] = y1;
        corners[2] = x2;
        corners[3] = y2;
        corners[4] = x3;
        corners[5] = y3;
        corners[6] = x4;
        corners[7] = y4;

        this.updateProjection();
    }

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

