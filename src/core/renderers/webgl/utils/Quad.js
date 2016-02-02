var glCore = require('pixi-gl-core'),
    createIndicesForQuads = require('../../../utils/createIndicesForQuads');

/**
 * Helper class to create a quad
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The gl context for this quad to use.
 */
function Quad(gl)
{
    /*
     * the current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

//    this.textures = new TextureUvs();

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = new Float32Array([
        -1,-1,
        1,-1,
        1,1,
        -1,1
    ]);

    /**
     * The Uvs of the quad
     *
     * @member {Float32Array}
     */
    this.uvs = new Float32Array([
        0,0,
        1,0,
        1,1,
        0,1
    ]);

    this.interleaved =  new Float32Array(8 * 2);

    for (var i = 0; i < 4; i++) {
        this.interleaved[i*4] = this.vertices[(i*2)];
        this.interleaved[(i*4)+1] = this.vertices[(i*2)+1];
        this.interleaved[(i*4)+2] = this.uvs[i*2];
        this.interleaved[(i*4)+3] = this.uvs[(i*2)+1];
    };

    console.log(this.interleaved )
    /*
     * @member {Uint16Array} An array containing the indices of the vertices
     */
    this.indices = createIndicesForQuads(1);

    /*
     * @member {WebGLBuffer} The vertex buffer
     */
    
    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.interleaved, gl.STATIC_DRAW);
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

    this.vao = new glCore.VertexArrayObject(gl)
    .addIndex(this.indexBuffer)
    .addAttribute(this.vertexBuffer, {type:'vec2', size:2, location:0}, gl.FLOAT, false, 4 * 4, 0)
    .addAttribute(this.vertexBuffer, {type:'vec2', size:2, location:1}, gl.FLOAT, false, 4 * 4, 2 * 4)

   
}

Quad.prototype.constructor = Quad;

/**
 * Maps two Rectangle to the quad
 * @param rect {PIXI.Rectangle} the first rectangle
 * @param rect2 {PIXI.Rectangle} the second rectangle
 */
Quad.prototype.map = function(targetTextureFrame, destinationFrame)
{
    var x = 0; //destinationFrame.x / targetTextureFrame.width;
    var y = 0; //destinationFrame.y / targetTextureFrame.height;

    this.uvs[0] = x;
    this.uvs[1] = y;

    this.uvs[2] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[3] = y;

    this.uvs[4] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[5] = y + destinationFrame.height / targetTextureFrame.height;

    this.uvs[6] = x;
    this.uvs[7] = y + destinationFrame.height / targetTextureFrame.height;

    /// -----
    x = destinationFrame.x;
    y = destinationFrame.y;

    this.vertices[0] = x;
    this.vertices[1] = y;

    this.vertices[2] = x + destinationFrame.width;
    this.vertices[3] = y;

    this.vertices[4] = x + destinationFrame.width;
    this.vertices[5] = y + destinationFrame.height;

    this.vertices[6] = x;
    this.vertices[7] = y + destinationFrame.height;

    return this;
};

Quad.prototype.draw = function()
{
    this.vao.bind()
    .draw(gl.TRIANGLES, 6, 0)
    .unbind();

    return this;
}

/**
 * Binds the buffer and uploads the data
 */
Quad.prototype.upload = function()
{
    var gl = this.gl;

    for (var i = 0; i < 4; i++) {
        this.interleaved[i*4] = this.vertices[(i*2)];
        this.interleaved[(i*4)+1] = this.vertices[(i*2)+1];
        this.interleaved[(i*4)+2] = this.uvs[i*2];
        this.interleaved[(i*4)+3] = this.uvs[(i*2)+1];
    };

    this.vertexBuffer.upload(this.interleaved);

    return this;
};

Quad.prototype.destroy = function()
{
    var gl = this.gl;
    
     gl.deleteBuffer(this.vertexBuffer);
     gl.deleteBuffer(this.indexBuffer);
};

module.exports = Quad;


