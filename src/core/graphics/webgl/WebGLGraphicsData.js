/**
 * An object containing WebGL specific properties to be used by the WebGL renderer
 *
 * @class
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 * @private
 */
function WebGLGraphicsData(gl) {

    /*
     * @member {WebGLRenderingContext} the current WebGL drawing context
     */
    this.gl = gl;

    //TODO does this need to be split before uploding??
    /*
     * @member {Array} An array of color components (r,g,b)
     */
    this.color = [0,0,0]; // color split!

    /*
     * @member {Array} An array of points to draw
     */
    this.points = [];

    /*
     * @member {Array} The indices of the vertices
     */
    this.indices = [];
    /*
     * @member {WebGLBuffer} The main buffer
     */
    this.buffer = gl.createBuffer();

    /*
     * @member {WebGLBuffer} The index buffer
     */
    this.indexBuffer = gl.createBuffer();

    /*
     * @member {number} todo @alvin
     */
    this.mode = 1;

    /*
     * @member {number} The alpha of the graphics
     */
    this.alpha = 1;

    /*
     * @member {boolean} Whether this graphics is dirty or not
     */
    this.dirty = true;
}

WebGLGraphicsData.prototype.constructor = WebGLGraphicsData;
module.exports = WebGLGraphicsData;

/**
 * Resets the vertices and the indices
 */
WebGLGraphicsData.prototype.reset = function () {
    this.points = [];
    this.indices = [];
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

    this.glIndicies = new Uint16Array(this.indices);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.glIndicies, gl.STATIC_DRAW);

    this.dirty = false;
};
