import { MeshGeometry } from '@pixi/mesh';
/**
 * RopeGeometry allows you to draw a geometry across several points and then manipulate these points.
 *
 * ```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * const rope = new PIXI.RopeGeometry(100, points);
 * ```
 *
 * @class
 * @extends PIXI.MeshGeometry
 * @memberof PIXI
 *
 */
export class RopeGeometry extends MeshGeometry
{
    /**
     * @param {number} [width=200] - The width (i.e., thickness) of the rope.
     * @param {PIXI.Point[]} [points] - An array of {@link PIXI.Point} objects to construct this rope.
     */
    constructor(width = 200, points)
    {
        super(new Float32Array(points.length * 4),
            new Float32Array(points.length * 4),
            new Uint16Array((points.length - 1) * 6));

        /**
         * An array of points that determine the rope
         * @member {PIXI.Point[]}
         */
        this.points = points;

        /**
         * The width (i.e., thickness) of the rope.
         * @member {number}
         * @readOnly
         */
        this.width = width;

        this.build();
    }
    /**
     * Refreshes Rope indices and uvs
     * @private
     */
    build()
    {
        const points = this.points;

        if (!points) return;

        const vertexBuffer = this.getBuffer('aVertexPosition');
        const uvBuffer = this.getBuffer('aTextureCoord');
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

        // indices[0] = 0;
        // indices[1] = 1;

        const total = points.length; // - 1;

        for (let i = 0; i < total; i++)
        {
            // time to do some smart drawing!
            const index = i * 4;
            const amount = i / (total - 1);

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

    /**
     * refreshes vertices of Rope mesh
     */
    updateVertices()
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

        // this.count -= 0.2;

        const vertices = this.buffers[0].data;
        const total = points.length;

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
            const num = this.width / 2; // (20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;

            perpX /= perpLength;
            perpY /= perpLength;

            perpX *= num;
            perpY *= num;

            vertices[index] = point.x + perpX;
            vertices[index + 1] = point.y + perpY;
            vertices[index + 2] = point.x - perpX;
            vertices[index + 3] = point.y - perpY;

            lastPoint = point;
        }

        this.buffers[0].update();
    }

    update()
    {
        this.updateVertices();
    }
}
