import Plane from './Plane';
import * as core from '../core';

/**
 * The rope sprite allows you to hack a rope that behaves like a sprite
 *
 * let rope = new PIXI.mesh.Rope(PIXI.Texture.fromImage("snake.png"), 5, 2, vertical ? 2 : 0);
 * rope.anchor.set(0.5, 0.5);
 * rope.clearPoints(); // set them according to anchor
 * rope.points[1].y = 15; // middle Y goes down
 * rope.pointShift[2] = 15; // shift is better
 * rope.pointScale[3] = 1.2; // scale a bit
 *
 *  ```
 *
 * @class
 * @extends PIXI.mesh.RopeSprite
 * @memberof PIXI.mesh
 *
 */
export default class RopeSprite extends Plane
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the rope.
     * @param {number} [verticesX=2] - How many vertices on diameter of the rope
     * @param {number} [verticesY=2] - How many vertices on meridian of the rope, make it 2 or 3
     * @param {number} [direction=0] - Direction of the rope. See {@link PIXI.GroupD8} for explanation
     */
    constructor(texture, verticesX, verticesY, direction)
    {
        super(texture, verticesX, verticesY, direction);

        /*
         * @member {PIXI.Point[]} An array of points that determine the rope
         */
        this.points = [];

        /*
         * @member {number[]} Extra shift of normals in pixels
         */
        this.pointShift = [];

        /*
         * @member {number[]} Extra scale of normals in pixels
         */
        this.pointScale = [];

        this._checkPointsLen();

        /**
         * invalidates points on every updateTransform
         * @member {boolean}
         * @default true
         */
        this.autoUpdate = true;

        this.refresh();
    }

    /**
     * Updates the object transform for rendering
     */
    updateTransform()
    {
        if (this.autoUpdate)
        {
            this._verticesID++;
        }
        this.refresh();
        this.containerUpdateTransform();
    }

    /**
     * updates everything when anchor was changed
     *
     * @private
     */
    _onAnchorUpdate()
    {
        this.reset();
    }

    /**
     * sets default points coordinates
     *
     */
    _checkPointsLen()
    {
        const len = this._verticesX;
        const points = this.points;

        if (points.length > len)
        {
            points.length = len;
        }

        while (points.length < len)
        {
            points.push(new core.Point(0, 0));
        }

        const shift = this.pointShift;

        if (shift.length > len)
        {
            shift.length = len;
        }

        while (shift.length < len)
        {
            shift.push(0);
        }

        const scale = this.pointScale;

        if (scale.length > len)
        {
            scale.length = len;
        }

        while (scale.length < len)
        {
            scale.push(1.0);
        }
    }

    /**
     * Refreshes the rope sprite mesh
     *
     * @param {boolean} [forceUpdate=false] if true, everything will be updated in any case
     */
    refresh(forceUpdate)
    {
        // using "this.points" instead of old "ready" hack

        if (!this.points || this._texture.noFrame)
        {
            return;
        }

        if (this._lastWidth !== this.width
            && this._lastHeight !== this.height)
        {
            this._lastWidth = this.width;
            this._lastHeight = this.height;
            this.resetPoints();
        }

        super.refresh(forceUpdate);
    }

    /**
     * sets default points coordinates
     */
    resetPoints()
    {
        const len = this._verticesX;
        const points = this.points;

        const dir = this._direction;

        const width = this.width;
        const height = this.height;

        const dx = core.GroupD8.uX(dir);
        const dy = core.GroupD8.uY(dir);

        const offsetX = dx !== 0 ? 0.5 - this._anchor._x : 0;
        const offsetY = dy !== 0 ? 0.5 - this._anchor._y : 0;

        for (let i = 0; i < len; i++)
        {
            const t = (i - ((len - 1) * 0.5)) / (len - 1);

            points[i].x = ((t * dx) + offsetX) * width;
            points[i].y = ((t * dy) + offsetY) * height;
        }
    }

    /**
     * sets default shift - zero
     */
    resetShift()
    {
        const shift = this.pointShift;
        const scale = this.pointScale;
        const len = shift.length;

        for (let i = 0; i < len; i++)
        {
            shift[i] = 0.0;
        }

        for (let i = 0; i < len; i++)
        {
            scale[i] = 1.0;
        }
    }

    /**
     * clears rope points
     */
    reset()
    {
        this._checkPointsLen();
        this.resetPoints();
        this.resetShift();

        super.reset();
    }

    /**
     * Refreshes vertices of rope sprite
     *
     * @private
     */
    _refreshVertices()
    {
        const points = this.points;
        const shift = this.pointShift;
        const scale = this.pointScale;

        let lastPoint = points[0];
        let nextPoint;
        let normalX = 0;
        let normalY = 0;

        const width = this.width;
        const height = this.height;
        const vertices = this.vertices;
        const verticesX = this.verticesX;
        const verticesY = this.verticesY;
        const direction = this._direction;

        const vx = core.GroupD8.vX(direction);
        const vy = core.GroupD8.vY(direction);

        const wide = (vx * width) + (vy * height);

        const normalOffset = wide * ((this._anchor._x * vx) + (this._anchor._y * vy));
        const normalFactor = -Math.abs(wide) / (verticesY - 1);

        for (let i = 0; i < verticesX; i++)
        {
            const point = points[i];

            if (i < points.length - 1)
            {
                nextPoint = points[i + 1];
            }
            else
            {
                nextPoint = point;
            }

            normalY = -(nextPoint.x - lastPoint.x);
            normalX = nextPoint.y - lastPoint.y;

            const perpLength = Math.sqrt((normalX * normalX) + (normalY * normalY));

            normalX /= perpLength;
            normalY /= perpLength;

            for (let j = 0; j < verticesY; j++)
            {
                const ind = (i + (j * verticesX)) * 2;

                vertices[ind] = point.x + (normalX * (shift[i] + (scale[i] * (normalOffset + (normalFactor * j)))));
                vertices[ind + 1] = point.y + (normalY * (shift[i] + (scale[i] * (normalOffset + (normalFactor * j)))));
            }

            lastPoint = point;
        }
    }
}
