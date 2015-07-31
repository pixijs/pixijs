/**
 * An object containing WebGL specific properties to be used by the WebGL renderer
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 * @private
 */
function WebGLGraphicsData(gl) {

    /**
     * The current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    //TODO does this need to be split before uploding??
    /**
     * An array of color components (r,g,b)
     * @member {number[]}
     */
    this.color = [0,0,0]; // color split!

    /**
     * An array of points to draw
     * @member {PIXI.Point[]}
     */
    this.points = [];

    /**
     * The indices of the vertices
     * @member {number[]}
     */
    this.indices = [];
    /**
     * The main buffer
     * @member {WebGLBuffer}
     */
    this.buffer = gl.createBuffer();

    /**
     * The index buffer
     * @member {WebGLBuffer}
     */
    this.indexBuffer = gl.createBuffer();

    /**
     * todo @alvin
     * @member {number}
     */
    this.mode = 1;

    /**
     * The alpha of the graphics
     * @member {number}
     */
    this.alpha = 1;

    /**
     * Whether this graphics is dirty or not
     * @member {boolean}
     */
    this.dirty = true;

    this.glPoints = null;
    this.glIndices = null;
}

WebGLGraphicsData.prototype.constructor = WebGLGraphicsData;
module.exports = WebGLGraphicsData;

/**
 * Resets the vertices and the indices
 */
WebGLGraphicsData.prototype.reset = function () {
    this.points.length = 0;
    this.indices.length = 0;
};

/**
 * Binds the buffers and uploads the data
 */
WebGLGraphicsData.prototype.upload = function () {
    var gl = this.gl;

//    this.lastIndex = graphics.graphicsData.length;
    this.glPoints = new Float32Array(this.points);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.glPoints, gl.STATIC_DRAW);

    this.glIndices = new Uint16Array(this.indices);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.glIndices, gl.STATIC_DRAW);

    this.dirty = false;
};

WebGLGraphicsData.prototype.destroy = function () {
    this.color = null;
    this.points = null;
    this.indices = null;

    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteBuffer(this.indexBuffer);
    
    this.gl = null;

    this.buffer = null;
    this.indexBuffer = null;

    this.glPoints = null;
    this.glIndices = null;
};
