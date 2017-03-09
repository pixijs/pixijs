import Mesh from './Mesh';

/**
 * The Plane allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * let Plane = new PIXI.Plane(PIXI.Texture.fromImage("snake.png"), points);
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
         * Tracker for if the Plane is ready to be drawn. Needed because Mesh ctor can
         * call _onTextureUpdated which could call refresh too early.
         *
         * @member {boolean}
         * @private
         */
        this._ready = true;

        this.verticesX = verticesX || 10;
        this.verticesY = verticesY || 10;

        this.drawMode = Mesh.DRAW_MODES.TRIANGLES;
        this.refresh();
    }

    /**
     * Refreshes plane coordinates
     *
     */
    _refresh()
    {
        const texture = this._texture;
        const total = this.verticesX * this.verticesY;
        const verts = [];
        const colors = [];
        const uvs = [];
        const indices = [];

        const segmentsX = this.verticesX - 1;
        const segmentsY = this.verticesY - 1;

        const sizeX = texture.width / segmentsX;
        const sizeY = texture.height / segmentsY;

        for (let i = 0; i < total; i++)
        {
            const x = (i % this.verticesX);
            const y = ((i / this.verticesX) | 0);

            verts.push(x * sizeX, y * sizeY);

            uvs.push(x / segmentsX, y / segmentsY);
        }

        //  cons

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
        this.indexDirty = true;

        this.multiplyUvs();
    }

    /**
     * Clear texture UVs when new texture is set
     *
     * @private
     */
    _onTextureUpdate()
    {
        Mesh.prototype._onTextureUpdate.call(this);

        // wait for the Plane ctor to finish before calling refresh
        if (this._ready)
        {
            this.refresh();
        }
    }

}
