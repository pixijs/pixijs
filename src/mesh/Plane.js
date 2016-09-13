let Mesh = require('./Mesh');

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
 * @param {PIXI.Texture} texture - The texture to use on the Plane.
 * @param {number} verticesX - The number of vertices in the x-axis
 * @param {number} verticesY - The number of vertices in the y-axis
 *
 */
class Plane extends Mesh {
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
     * Refreshes
     *
     */
    refresh()
    {
        let total = this.verticesX * this.verticesY;
        let verts = [];
        let colors = [];
        let uvs = [];
        let indices = [];
        let texture = this.texture;

        let segmentsX = this.verticesX - 1;
        let segmentsY = this.verticesY - 1;
        let i = 0;

        let sizeX = texture.width / segmentsX;
        let sizeY = texture.height / segmentsY;

        for (i = 0; i < total; i++) {

            let x = (i % this.verticesX);
            let y = ( (i / this.verticesX ) | 0 );


            verts.push((x * sizeX),
                       (y * sizeY));

            // this works for rectangular textures.
            uvs.push(texture._uvs.x0 + (texture._uvs.x1 - texture._uvs.x0) * (x / (this.verticesX-1)), texture._uvs.y0 + (texture._uvs.y3-texture._uvs.y0) * (y/ (this.verticesY-1)));
          }

        //  cons

        let totalSub = segmentsX * segmentsY;

        for (i = 0; i < totalSub; i++) {

            let xpos = i % segmentsX;
            let ypos = (i / segmentsX ) | 0;


            let  value = (ypos * this.verticesX) + xpos;
            let  value2 = (ypos * this.verticesX) + xpos + 1;
            let  value3 = ((ypos+1) * this.verticesX) + xpos;
            let  value4 = ((ypos+1) * this.verticesX) + xpos + 1;

            indices.push(value, value2, value3);
            indices.push(value2, value4, value3);
        }


        //console.log(indices)
        this.vertices = new Float32Array(verts);
        this.uvs = new Float32Array(uvs);
        this.colors = new Float32Array(colors);
        this.indices = new Uint16Array(indices);

        this.indexDirty = true;
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
        if (this._ready) {
            this.refresh();
        }
    }

}

module.exports = Plane;
