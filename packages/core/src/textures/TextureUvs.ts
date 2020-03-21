import { groupD8 } from '@pixi/math';

import type { Rectangle, ISize } from '@pixi/math';

/**
 * Stores a texture's frame in UV coordinates, in
 * which everything lies in the rectangle `[(0,0), (1,0),
 * (1,1), (0,1)]`.
 *
 * | Corner       | Coordinates |
 * |--------------|-------------|
 * | Top-Left     | `(x0,y0)`   |
 * | Top-Right    | `(x1,y1)`   |
 * | Bottom-Right | `(x2,y2)`   |
 * | Bottom-Left  | `(x3,y3)`   |
 *
 * @class
 * @protected
 * @memberof PIXI
 */
export class TextureUvs
{
    public x0: number;
    public y0: number;
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    public x3: number;
    public y3: number;
    public uvsFloat32: Float32Array;

    constructor()
    {
        /**
         * X-component of top-left corner `(x0,y0)`.
         *
         * @member {number}
         */
        this.x0 = 0;

        /**
         * Y-component of top-left corner `(x0,y0)`.
         *
         * @member {number}
         */
        this.y0 = 0;

        /**
         * X-component of top-right corner `(x1,y1)`.
         *
         * @member {number}
         */
        this.x1 = 1;

        /**
         * Y-component of top-right corner `(x1,y1)`.
         *
         * @member {number}
         */
        this.y1 = 0;

        /**
         * X-component of bottom-right corner `(x2,y2)`.
         *
         * @member {number}
         */
        this.x2 = 1;

        /**
         * Y-component of bottom-right corner `(x2,y2)`.
         *
         * @member {number}
         */
        this.y2 = 1;

        /**
         * X-component of bottom-left corner `(x3,y3)`.
         *
         * @member {number}
         */
        this.x3 = 0;

        /**
         * Y-component of bottom-right corner `(x3,y3)`.
         *
         * @member {number}
         */
        this.y3 = 1;

        this.uvsFloat32 = new Float32Array(8);
    }

    /**
     * Sets the texture Uvs based on the given frame information.
     *
     * @protected
     * @param {PIXI.Rectangle} frame - The frame of the texture
     * @param {PIXI.Rectangle} baseFrame - The base frame of the texture
     * @param {number} rotate - Rotation of frame, see {@link PIXI.groupD8}
     */
    set(frame: Rectangle, baseFrame: ISize, rotate: number): void
    {
        const tw = baseFrame.width;
        const th = baseFrame.height;

        if (rotate)
        {
            // width and height div 2 div baseFrame size
            const w2 = frame.width / 2 / tw;
            const h2 = frame.height / 2 / th;

            // coordinates of center
            const cX = (frame.x / tw) + w2;
            const cY = (frame.y / th) + h2;

            rotate = groupD8.add(rotate, groupD8.NW); // NW is top-left corner
            this.x0 = cX + (w2 * groupD8.uX(rotate));
            this.y0 = cY + (h2 * groupD8.uY(rotate));

            rotate = groupD8.add(rotate, 2); // rotate 90 degrees clockwise
            this.x1 = cX + (w2 * groupD8.uX(rotate));
            this.y1 = cY + (h2 * groupD8.uY(rotate));

            rotate = groupD8.add(rotate, 2);
            this.x2 = cX + (w2 * groupD8.uX(rotate));
            this.y2 = cY + (h2 * groupD8.uY(rotate));

            rotate = groupD8.add(rotate, 2);
            this.x3 = cX + (w2 * groupD8.uX(rotate));
            this.y3 = cY + (h2 * groupD8.uY(rotate));
        }
        else
        {
            this.x0 = frame.x / tw;
            this.y0 = frame.y / th;

            this.x1 = (frame.x + frame.width) / tw;
            this.y1 = frame.y / th;

            this.x2 = (frame.x + frame.width) / tw;
            this.y2 = (frame.y + frame.height) / th;

            this.x3 = frame.x / tw;
            this.y3 = (frame.y + frame.height) / th;
        }

        this.uvsFloat32[0] = this.x0;
        this.uvsFloat32[1] = this.y0;
        this.uvsFloat32[2] = this.x1;
        this.uvsFloat32[3] = this.y1;
        this.uvsFloat32[4] = this.x2;
        this.uvsFloat32[5] = this.y2;
        this.uvsFloat32[6] = this.x3;
        this.uvsFloat32[7] = this.y3;
    }
}
