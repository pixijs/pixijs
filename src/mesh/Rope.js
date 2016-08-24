var Mesh = require('./Mesh');
var core = require('../core');

/**
 * The rope allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (var i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * var rope = new PIXI.Rope(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.mesh
 * @param {PIXI.Texture} texture - The texture to use on the rope.
 * @param {PIXI.Point[]} points - An array of {@link PIXI.Point} objects to construct this rope.
 *
 */
function Rope(texture, points)
{
    Mesh.call(this, texture);

    /*
     * @member {PIXI.Point[]} An array of points that determine the rope
     */
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


// constructor
Rope.prototype = Object.create(Mesh.prototype);
Rope.prototype.constructor = Rope;
module.exports = Rope;

/**
 * Refreshes
 *
 */
Rope.prototype.refresh = function ()
{
    var points = this.points;

    // if too little points, or texture hasn't got UVs set yet just move on.
    if (points.length < 1 || !this._texture._uvs)
    {
        return;
    }

    var uvs = this.uvs;

    var indices = this.indices;
    var colors = this.colors;

    var textureUvs = this._texture._uvs;
    var offset = new core.Point(textureUvs.x0, textureUvs.y0);
    var factor = new core.Point(textureUvs.x2 - textureUvs.x0, textureUvs.y2 - textureUvs.y0);

    uvs[0] = 0 + offset.x;
    uvs[1] = 0 + offset.y;
    uvs[2] = 0 + offset.x;
    uvs[3] = 1 * factor.y + offset.y;

    colors[0] = 1;
    colors[1] = 1;

    indices[0] = 0;
    indices[1] = 1;

    var total = points.length,
        point, index, amount;

    for (var i = 1; i < total; i++)
    {
        point = points[i];
        index = i * 4;
        // time to do some smart drawing!
        amount = i / (total-1);

        uvs[index] = amount * factor.x + offset.x;
        uvs[index+1] = 0 + offset.y;

        uvs[index+2] = amount * factor.x + offset.x;
        uvs[index+3] = 1 * factor.y + offset.y;

        index = i * 2;
        colors[index] = 1;
        colors[index+1] = 1;

        index = i * 2;
        indices[index] = index;
        indices[index + 1] = index + 1;
    }

    this.dirty = true;
    this.indexDirty = true;
};

/**
 * Clear texture UVs when new texture is set
 *
 * @private
 */
Rope.prototype._onTextureUpdate = function ()
{

    Mesh.prototype._onTextureUpdate.call(this);

    // wait for the Rope ctor to finish before calling refresh
    if (this._ready) {
        this.refresh();
    }
};

/**
 * Updates the object transform for rendering
 *
 * @private
 */
Rope.prototype.updateTransform = function ()
{
    var points = this.points;

    if (points.length < 1)
    {
        return;
    }

    var lastPoint = points[0];
    var nextPoint;
    var perpX = 0;
    var perpY = 0;

    // this.count -= 0.2;

    var vertices = this.vertices;
    var total = points.length,
        point, index, ratio, perpLength, num;

    for (var i = 0; i < total; i++)
    {
        point = points[i];
        index = i * 4;

        if (i < points.length-1)
        {
            nextPoint = points[i+1];
        }
        else
        {
            nextPoint = point;
        }

        perpY = -(nextPoint.x - lastPoint.x);
        perpX = nextPoint.y - lastPoint.y;

        ratio = (1 - (i / (total-1))) * 10;

        if (ratio > 1)
        {
            ratio = 1;
        }

        perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        num = this._texture.height / 2; //(20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;
        perpX /= perpLength;
        perpY /= perpLength;

        perpX *= num;
        perpY *= num;

        vertices[index] = point.x + perpX;
        vertices[index+1] = point.y + perpY;
        vertices[index+2] = point.x - perpX;
        vertices[index+3] = point.y - perpY;

        lastPoint = point;
    }

    this.containerUpdateTransform();
};
