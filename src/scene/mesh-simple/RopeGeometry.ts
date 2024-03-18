import { MeshGeometry } from '../mesh/shared/MeshGeometry';

import type { PointData } from '../../maths/point/PointData';
import type { MeshGeometryOptions } from '../mesh/shared/MeshGeometry';

/**
 * Constructor options used for `RopeGeometry` instances.
 * ```js
 * const ropeGeometry = new RopeGeometry({
 *    points: [new Point(0, 0), new Point(100, 0)],
 *    width: 10,
 *    textureScale: 0,
 * });
 * ```
 * @see {@link scene.RopeGeometry}
 * @memberof scene
 */
export interface RopeGeometryOptions
{
    /** The width (i.e., thickness) of the rope. */
    width?: number;
    /** An array of points that determine the rope. */
    points?: PointData[];
    /**
     * Rope texture scale, if zero then the rope texture is stretched.
     * By default the rope texture will be stretched to match
     * rope length. If textureScale is positive this value will be treated as a scaling
     * factor and the texture will preserve its aspect ratio instead. To create a tiling rope
     * set baseTexture.wrapMode to 'repeat' and use a power of two texture,
     * then set textureScale=1 to keep the original texture pixel size.
     * In order to reduce alpha channel artifacts provide a larger texture and downsample -
     * i.e. set textureScale=0.5 to scale it down twice.
     */
    textureScale?: number;
}

/**
 * RopeGeometry allows you to draw a geometry across several points and then manipulate these points.
 * @example
 * import { Point, RopeGeometry } from 'pixi.js';
 *
 * for (let i = 0; i < 20; i++) {
 *     points.push(new Point(i * 50, 0));
 * };
 * const rope = new RopeGeometry(100, points);
 * @memberof scene
 */
export class RopeGeometry extends MeshGeometry
{
    /** Default options for RopeGeometry constructor. */
    public static defaultOptions: RopeGeometryOptions & MeshGeometryOptions = {
        /** The width (i.e., thickness) of the rope. */
        width: 200,
        /** An array of points that determine the rope. */
        points: [],
        /** Rope texture scale, if zero then the rope texture is stretched. */
        textureScale: 0,
    };

    /** An array of points that determine the rope. */
    public points: PointData[];

    /** Rope texture scale, if zero then the rope texture is stretched. */
    public readonly textureScale: number;

    /**
     * The width (i.e., thickness) of the rope.
     * @readonly
     */
    public _width: number;

    /**
     * @param options - Options to be applied to rope geometry
     */
    constructor(options: RopeGeometryOptions)
    {
        const { width, points, textureScale } = { ...RopeGeometry.defaultOptions, ...options };

        super({
            positions: new Float32Array(points.length * 4),
            uvs: new Float32Array(points.length * 4),
            indices: new Uint32Array((points.length - 1) * 6),
        });

        this.points = points;
        this._width = width;
        this.textureScale = textureScale;

        this._build();
    }

    /**
     * The width (i.e., thickness) of the rope.
     * @readonly
     */
    get width(): number
    {
        return this._width;
    }

    /** Refreshes Rope indices and uvs */
    private _build(): void
    {
        const points = this.points;

        if (!points) return;

        const vertexBuffer = this.getBuffer('aPosition');
        const uvBuffer = this.getBuffer('aUV');
        const indexBuffer = this.getIndex();

        // if too little points, or texture hasn't got UVs set yet just move on.
        if (points.length < 1)
        {
            return;
        }

        // if the number of points has changed we will need to recreate the arraybuffers
        if (vertexBuffer.data.length / 4 !== points.length)
        {
            vertexBuffer.data = new Float32Array(points.length * 4);
            uvBuffer.data = new Float32Array(points.length * 4);
            indexBuffer.data = new Uint16Array((points.length - 1) * 6);
        }

        const uvs = uvBuffer.data;
        const indices = indexBuffer.data;

        uvs[0] = 0;
        uvs[1] = 0;
        uvs[2] = 0;
        uvs[3] = 1;

        let amount = 0;
        let prev = points[0];
        const textureWidth = this._width * this.textureScale;
        const total = points.length; // - 1;

        for (let i = 0; i < total; i++)
        {
            // time to do some smart drawing!
            const index = i * 4;

            if (this.textureScale > 0)
            {
                // calculate pixel distance from previous point
                const dx = prev.x - points[i].x;
                const dy = prev.y - points[i].y;
                const distance = Math.sqrt((dx * dx) + (dy * dy));

                prev = points[i];
                amount += distance / textureWidth;
            }
            else
            {
                // stretch texture
                amount = i / (total - 1);
            }

            uvs[index] = amount;
            uvs[index + 1] = 0;

            uvs[index + 2] = amount;
            uvs[index + 3] = 1;
        }

        let indexCount = 0;

        for (let i = 0; i < total - 1; i++)
        {
            const index = i * 2;

            indices[indexCount++] = index;
            indices[indexCount++] = index + 1;
            indices[indexCount++] = index + 2;

            indices[indexCount++] = index + 2;
            indices[indexCount++] = index + 1;
            indices[indexCount++] = index + 3;
        }

        // ensure that the changes are uploaded
        uvBuffer.update();
        indexBuffer.update();

        this.updateVertices();
    }

    /** refreshes vertices of Rope mesh */
    public updateVertices(): void
    {
        const points = this.points;

        if (points.length < 1)
        {
            return;
        }

        let lastPoint = points[0];
        let nextPoint;
        let perpX = 0;
        let perpY = 0;

        const vertices = this.buffers[0].data;
        const total = points.length;
        const halfWidth = this.textureScale > 0 ? this.textureScale * this._width / 2 : this._width / 2;

        for (let i = 0; i < total; i++)
        {
            const point = points[i];
            const index = i * 4;

            if (i < points.length - 1)
            {
                nextPoint = points[i + 1];
            }
            else
            {
                nextPoint = point;
            }

            perpY = -(nextPoint.x - lastPoint.x);
            perpX = nextPoint.y - lastPoint.y;

            let ratio = (1 - (i / (total - 1))) * 10;

            if (ratio > 1)
            {
                ratio = 1;
            }

            const perpLength = Math.sqrt((perpX * perpX) + (perpY * perpY));

            if (perpLength < 1e-6)
            {
                perpX = 0;
                perpY = 0;
            }
            else
            {
                perpX /= perpLength;
                perpY /= perpLength;

                perpX *= halfWidth;
                perpY *= halfWidth;
            }

            vertices[index] = point.x + perpX;
            vertices[index + 1] = point.y + perpY;
            vertices[index + 2] = point.x - perpX;
            vertices[index + 3] = point.y - perpY;

            lastPoint = point;
        }

        this.buffers[0].update();
    }

    /** Refreshes Rope indices and uvs */
    public update(): void
    {
        if (this.textureScale > 0)
        {
            this._build(); // we need to update UVs
        }
        else
        {
            this.updateVertices();
        }
    }
}
