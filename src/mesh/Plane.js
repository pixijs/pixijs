import Mesh from './Mesh';
import * as core from '../core';

const Point = core.Point;

/**
 * The Plane allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * let plane = new PIXI.Plane(PIXI.Texture.fromImage("snake.png"), 8, 8);
 * let points = plane.points; // it's a 2D array with 8 * 8 .
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 *
 */
export default class Plane extends Mesh
{
    /**
     * @param {PIXI.Texture} texture - The texture to use on the Plane.
     * @param {number} verticesX - The number of vertices in the x-axis
     * @param {number} verticesY - The number of vertices in the y-axis
     */
    constructor(texture, verticesX, verticesY)
    {
        super(texture);

        /**
         * The anchor sets the origin point of the texture.
         * The default is 0,0 this means the texture's origin is the top left
         * Setting the anchor to 0.5,0.5 means the texture's origin is centered
         * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        this._anchor = new core.ObservablePoint(this._onAnchorUpdate, this);

        this.verticesX = verticesX || 10;
        this.verticesY = verticesY || 10;

        this.drawMode = Mesh.DRAW_MODES.TRIANGLES;

        this.initPoints();

        /**
         * Tracker for if the Plane is ready to be drawn. Needed because Mesh ctor can
         * call _onTextureUpdated which could call refresh too early.
         *
         * @member {boolean}
         * @private
         */
        this._ready = true;

        this.refresh();
    }

    /**
     * Initialize points
     *
     */
    initPoints()
    {
        /**
         * The points of mesh. It's a 2D array , this.verticesY rows , this.verticesX colums.
         * Users could change those points for mesh transforming.
         */
        this.points = [];

        for (let i = 0; i < this.verticesY; i++)
        {
            const row = [];

            this.points.push(row);
            for (let j = 0; j < this.verticesX; j++)
            {
                const point = new Point(j, i);

                point.originalX = point.x;
                point.originalY = point.y;
                row.push(point);
            }
        }
    }

    /**
     * Refreshes
     *
     */
    refresh()
    {
        const total = this.verticesX * this.verticesY;
        const verts = [];
        const colors = [];
        const uvs = [];
        const indices = [];

        const texture = this._texture;
        // const trim = texture.trim;
        const orig = texture.orig;
        const anchor = this._anchor;

        // calculate the space around pivot point.
        this._pivotX = orig.width * anchor.x;
        this._pivotY = orig.height * anchor.y;

        const segmentsX = this.verticesX - 1;
        const segmentsY = this.verticesY - 1;

        const sizeX = texture.width / segmentsX;
        const sizeY = texture.height / segmentsY;

        let sizeChanged = false;

        if (sizeX !== this._sizeX || sizeY !== this._sizeY)
        {
            this._sizeX = sizeX;
            this._sizeY = sizeY;
            sizeChanged = true;
        }

        for (let i = 0; i < total; i++)
        {
            if (texture._uvs)
            {
                const x = (i % this.verticesX);
                const y = ((i / this.verticesX) | 0);
                const point = this.points[y][x];

                if (sizeChanged)
                {
                    point.x = x * sizeX;
                    point.y = y * sizeY;
                    point.originalX = point.x;
                    point.originalY = point.y;
                }

                verts.push(point.x - this._pivotX, point.y - this._pivotY);

                // this works for rectangular textures.
                uvs.push(
                    texture._uvs.x0 + ((texture._uvs.x1 - texture._uvs.x0) * (x / segmentsX)),
                    texture._uvs.y0 + ((texture._uvs.y3 - texture._uvs.y0) * (y / segmentsY))
                );
            }
            else
            {
                uvs.push(0);
            }
        }

        const totalSub = segmentsX * segmentsY;

        for (let i = 0; i < totalSub; i++)
        {
            const xpos = i % segmentsX;
            const ypos = (i / segmentsX) | 0;

            const value = (ypos * this.verticesX) + xpos;
            const value2 = (ypos * this.verticesX) + xpos + 1;
            const value3 = ((ypos + 1) * this.verticesX) + xpos;
            const value4 = ((ypos + 1) * this.verticesX) + xpos + 1;

            indices.push(value, value2, value3);
            indices.push(value2, value4, value3);
        }

        // console.log(indices)
        this.vertices = new Float32Array(verts);
        this.uvs = new Float32Array(uvs);
        this.colors = new Float32Array(colors);
        this.indices = new Uint16Array(indices);

        this.dirty++;
        this.indexDirty++;
    }

    /**
     * Called when the anchor position updates.
     *
     * @private
     */
    _onAnchorUpdate()
    {
        this._transformID = -1;

        if (this._ready)
        {
            this.refresh();
        }
    }

    /**
     * Clear texture UVs when new texture is set
     *
     * @private
     */
    _onTextureUpdate()
    {
        super._onTextureUpdate();

        // wait for the Plane ctor to finish before calling refresh
        if (this._ready)
        {
            this.refresh();
        }
    }

    /**
     * The anchor sets the origin point of the texture.
     * The default is 0,0 this means the texture's origin is the top left
     * Setting the anchor to 0.5,0.5 means the texture's origin is centered
     * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
     *
     * @member {PIXI.ObservablePoint}
     * @memberof PIXI.Sprite#
     */
    get anchor()
    {
        return this._anchor;
    }

    /**
     * Copies the anchor to the plane.
     *
     * @param {number} value - The value to set to.
     */
    set anchor(value)
    {
        this._anchor.copy(value);
    }
}
