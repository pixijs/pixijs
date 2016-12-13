import Mesh from './Mesh';
import * as core from '../core';

/**
 * The rope allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let rope = new PIXI.Rope(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 *
 */
export default class Rope extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the rope.
     * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
     */
    constructor(texture, points)
    {
        super(texture);

        /**
         * Whether the rope is _vertical.
         *
         * @member {boolean}
         * @private
         */
        this._vertical = false;

        /**
         * The array of points that determine the rope
         *
         * @member {PIXI.Point[]}
         * @private
         */
        this._points = null;

        this.points = points;

        /*
         * @member {Float32Array} An array of vertices used to construct this rope.
         */
        this.vertices = new Float32Array(points.length * 4);

        /*
         * @member {Float32Array} The WebGL Uvs of the rope.
         */
        this.uvs = new Float32Array(points.length * 4);

        /*
         * @member {Float32Array} An array containing the color components
         */
        this.colors = new Float32Array(points.length * 2);

        /*
         * @member {Uint16Array} An array containing the indices of the vertices
         */
        this.indices = new Uint16Array(points.length * 2);

        /**
         * Tracker for if the rope is ready to be drawn. Needed because Mesh ctor can
         * call _onTextureUpdated which could call refresh too early.
         *
         * @member {boolean}
         * @private
         */
        this._ready = true;

        this.refresh();
    }

    /**
     * Refreshes
     *
     */
    refresh()
    {
        const points = this._points;

        // if too little points, or texture hasn't got UVs set yet just move on.
        if (points.length < 1 || !this._texture._uvs)
        {
            return;
        }

        // if the number of points has changed we will need to recreate the arraybuffers
        if (this.vertices.length / 4 !== points.length)
        {
            this.vertices = new Float32Array(points.length * 4);
            this.uvs = new Float32Array(points.length * 4);
            this.colors = new Float32Array(points.length * 2);
            this.indices = new Uint16Array(points.length * 2);
        }

        const uvs = this.uvs;

        const indices = this.indices;
        const colors = this.colors;

        const textureUvs = this._texture._uvs;
        const offset = new core.Point(textureUvs.x0, textureUvs.y0);
        const factor = new core.Point(textureUvs.x2 - textureUvs.x0, Number(textureUvs.y2 - textureUvs.y0));

        uvs[0] = 0 + offset.x;
        uvs[1] = 0 + offset.y;
        if (this._vertical)
        {
            uvs[2] = factor.x + offset.x;
            uvs[3] = 0 + offset.y;
        }
        else
        {
            uvs[2] = 0 + offset.x;
            uvs[3] = factor.y + offset.y;
        }

        colors[0] = 1;
        colors[1] = 1;

        indices[0] = 0;
        indices[1] = 1;

        const total = points.length;

        for (let i = 1; i < total; i++)
        {
            // time to do some smart drawing!
            let index = i * 4;
            const amount = i / (total - 1);

            if (this._vertical)
            {
                uvs[index + 0] = 0 + offset.x;
                uvs[index + 1] = (amount * factor.y) + offset.y;
                uvs[index + 2] = factor.x + offset.x;
                uvs[index + 3] = (amount * factor.y) + offset.y;
            }
            else
            {
                uvs[index + 0] = (amount * factor.x) + offset.x;
                uvs[index + 1] = 0 + offset.y;
                uvs[index + 2] = (amount * factor.x) + offset.x;
                uvs[index + 3] = factor.y + offset.y;
            }

            index = i * 2;
            colors[index] = 1;
            colors[index + 1] = 1;

            index = i * 2;
            indices[index] = index;
            indices[index + 1] = index + 1;
        }

        // ensure that the changes are uploaded
        this.dirty++;
        this.indexDirty++;
    }

    /**
     * Clear texture UVs when new texture is set
     *
     * @private
     */
    _onTextureUpdate()
    {
        super._onTextureUpdate();

        // wait for the Rope ctor to finish before calling refresh
        if (this._ready)
        {
            this.refresh();
        }
    }

    /**
     * Updates the object transform for rendering
     *
     * @private
     */
    updateTransform()
    {
        const points = this._points;

        if (points.length < 1)
        {
            return;
        }

        let lastPoint = points[0];
        let nextPoint;
        let perpX = 0;
        let perpY = 0;

        // this.count -= 0.2;

        const vertices = this.vertices;
        const total = points.length;

        const num = (this._vertical ? this._texture.frame.width : this._texture.frame.height) / 2;

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

            // let ratio = (1 - (i / (total - 1))) * 10;

            // if (ratio > 1)
            // {
            //     ratio = 1;
            // }

            // const num = (20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;

            const perpLength = Math.sqrt((perpX * perpX) + (perpY * perpY));

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

        this.containerUpdateTransform();
    }

    /**
     * Get the array of {@link PIXI.Point} objects to construct this rope.
     *
     * @member {PIXI.Point[]}
     */
    get points()
    {
        return this._points;
    }

    /**
     * Set the array of {@link PIXI.Point} objects to construct this rope.
     *
     * @param {PIXI.Point[]} value - The value to set to.
     */
    set points(value)
    {
        this._points = value;
        if (!value || value.length < 2)
        {
            this._vertical = false;
        }

        const first = value[0];
        const last = value[value.length - 1];
        const dx = last.x - first.x;
        const dy = last.y - first.y;

        this._vertical = dx === 0 || Math.abs(dy / dx) > 1;
    }
}
