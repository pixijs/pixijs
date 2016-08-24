/*!
 * pixi.js - v4.0.0
 * Compiled Wed Aug 24 2016 13:18:58 GMT+0100 (BST)
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PIXI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var EMPTY_ARRAY_BUFFER = new ArrayBuffer(0);

/**
 * Helper class to create a webGL buffer
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param type {gl.ARRAY_BUFFER | gl.ELEMENT_ARRAY_BUFFER} @mat
 * @param data {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} an array of data
 * @param drawType {gl.STATIC_DRAW|gl.DYNAMIC_DRAW|gl.STREAM_DRAW}
 */
var Buffer = function(gl, type, data, drawType)
{

	/**
     * The current WebGL rendering context
     *
     * @member {WebGLRenderingContext}
     */
	this.gl = gl;

	/**
     * The WebGL buffer, created upon instantiation
     *
     * @member {WebGLBuffer}
     */
	this.buffer = gl.createBuffer(); 

	/**
     * The type of the buffer
     *
     * @member {gl.ARRAY_BUFFER|gl.ELEMENT_ARRAY_BUFFER}
     */
	this.type = type || gl.ARRAY_BUFFER;

	/**
     * The draw type of the buffer
     *
     * @member {gl.STATIC_DRAW|gl.DYNAMIC_DRAW|gl.STREAM_DRAW}
     */
	this.drawType = drawType || gl.STATIC_DRAW;

	/**
     * The data in the buffer, as a typed array
     *
     * @member {ArrayBuffer| SharedArrayBuffer|ArrayBufferView}
     */
	this.data = EMPTY_ARRAY_BUFFER;

	if(data)
	{
		this.upload(data);
	}
};

/**
 * Uploads the buffer to the GPU
 * @param data {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} an array of data to upload
 * @param offset {Number} if only a subset of the data should be uploaded, this is the amount of data to subtract
 * @param dontBind {Boolean} whether to bind the buffer before uploading it
 */
Buffer.prototype.upload = function(data, offset, dontBind)
{
	// todo - needed?
	if(!dontBind) this.bind();

	var gl = this.gl;

	data = data || this.data;
	offset = offset || 0;

	if(this.data.byteLength >= data.byteLength)
	{
		gl.bufferSubData(this.type, offset, data);
	}
	else
	{
		gl.bufferData(this.type, data, this.drawType);
	}

	this.data = data;
};
/**
 * Binds the buffer
 *
 */
Buffer.prototype.bind = function()
{
	var gl = this.gl;
	gl.bindBuffer(this.type, this.buffer);
};

Buffer.createVertexBuffer = function(gl, data, drawType)
{
	return new Buffer(gl, gl.ARRAY_BUFFER, data, drawType);
};

Buffer.createIndexBuffer = function(gl, data, drawType)
{
	return new Buffer(gl, gl.ELEMENT_ARRAY_BUFFER, data, drawType);
};

Buffer.create = function(gl, type, data, drawType)
{
	return new Buffer(gl, type, data, drawType);
};

/**
 * Destroys the buffer
 *
 */
Buffer.prototype.destroy = function(){
	this.gl.deleteBuffer(this.buffer);
};

module.exports = Buffer;

},{}],2:[function(require,module,exports){

var Texture = require('./GLTexture');

/**
 * Helper class to create a webGL Framebuffer
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param width {Number} the width of the drawing area of the frame buffer
 * @param height {Number} the height of the drawing area of the frame buffer
 */
var Framebuffer = function(gl, width, height)
{
    /**
     * The current WebGL rendering context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    /**
     * The frame buffer
     *
     * @member {WebGLFramebuffer}
     */
    this.framebuffer = gl.createFramebuffer();

    /**
     * The stencil buffer
     *
     * @member {WebGLRenderbuffer}
     */
    this.stencil = null;

    /**
     * The stencil buffer
     *
     * @member {PIXI.glCore.GLTexture}
     */
    this.texture = null;

    /**
     * The width of the drawing area of the buffer
     *
     * @member {Number}
     */
    this.width = width || 100;
    /**
     * The height of the drawing area of the buffer
     *
     * @member {Number}
     */
    this.height = height || 100;
};

/**
 * Adds a texture to the frame buffer
 * @param texture {PIXI.glCore.GLTexture}
 */
Framebuffer.prototype.enableTexture = function(texture)
{
    var gl = this.gl;

    this.texture = texture || new Texture(gl);

    this.texture.bind();

    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    this.bind();

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.texture, 0);
};

/**
 * Initialises the stencil buffer
 */
Framebuffer.prototype.enableStencil = function()
{
    if(this.stencil)return;

    var gl = this.gl;

    this.stencil = gl.createRenderbuffer();

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencil);

    // TODO.. this is depth AND stencil?
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencil);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL,  this.width  , this.height );
};

/**
 * Erases the drawing area and fills it with a colour
 * @param  r {Number} the red value of the clearing colour
 * @param  g {Number} the green value of the clearing colour
 * @param  b {Number} the blue value of the clearing colour
 * @param  a {Number} the alpha value of the clearing colour
 */
Framebuffer.prototype.clear = function( r, g, b, a )
{
    this.bind();

    var gl = this.gl;

    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

/**
 * Binds the frame buffer to the WebGL context
 */
Framebuffer.prototype.bind = function()
{
    var gl = this.gl;

    if(this.texture)
    {
        this.texture.unbind();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer );
};

/**
 * Unbinds the frame buffer to the WebGL context
 */
Framebuffer.prototype.unbind = function()
{
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null );
};
/**
 * Resizes the drawing area of the buffer to the given width and height
 * @param  width  {Number} the new width
 * @param  height {Number} the new height
 */
Framebuffer.prototype.resize = function(width, height)
{
    var gl = this.gl;

    this.width = width;
    this.height = height;

    if ( this.texture )
    {
        this.texture.uploadData(null, width, height);
    }

    if ( this.stencil )
    {
        // update the stencil buffer width and height
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencil);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
    }
};

/**
 * Destroys this buffer
 */
Framebuffer.prototype.destroy = function()
{
    var gl = this.gl;

    //TODO
    if(this.texture)
    {
        this.texture.destroy();
    }

    gl.deleteFramebuffer(this.framebuffer);

    this.gl = null;

    this.stencil = null;
    this.texture = null;
};

/**
 * Creates a frame buffer with a texture containing the given data
 * @static
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param width {Number} the width of the drawing area of the frame buffer
 * @param height {Number} the height of the drawing area of the frame buffer
 * @param data {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} an array of data
 */
Framebuffer.createRGBA = function(gl, width, height, data)
{
    var texture = Texture.fromData(gl, null, width, height);
    texture.enableNearestScaling();
    texture.enableWrapClamp();

    //now create the framebuffer object and attach the texture to it.
    var fbo = new Framebuffer(gl, width, height);
    fbo.enableTexture(texture);

    fbo.unbind();

    return fbo;
};

/**
 * Creates a frame buffer with a texture containing the given data
 * @static
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param width {Number} the width of the drawing area of the frame buffer
 * @param height {Number} the height of the drawing area of the frame buffer
 * @param data {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} an array of data
 */
Framebuffer.createFloat32 = function(gl, width, height, data)
{
    // create a new texture..
    var texture = new Texture.fromData(gl, data, width, height);
    texture.enableNearestScaling();
    texture.enableWrapClamp();

    //now create the framebuffer object and attach the texture to it.
    var fbo = new Framebuffer(gl, width, height);
    fbo.enableTexture(texture);

    fbo.unbind();

    return fbo;
};

module.exports = Framebuffer;

},{"./GLTexture":4}],3:[function(require,module,exports){

var compileProgram = require('./shader/compileProgram'),
	extractAttributes = require('./shader/extractAttributes'),
	extractUniforms = require('./shader/extractUniforms'),
	generateUniformAccessObject = require('./shader/generateUniformAccessObject');

/**
 * Helper class to create a webGL Shader
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext}
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 */
var Shader = function(gl, vertexSrc, fragmentSrc)
{
	/**
	 * The current WebGL rendering context
	 *
	 * @member {WebGLRenderingContext}
	 */
	this.gl = gl;

	/**
	 * The shader program
	 *
	 * @member {WebGLProgram}
	 */
	// First compile the program..
	this.program = compileProgram(gl, vertexSrc, fragmentSrc);


	/**
	 * The attributes of the shader as an object containing the following properties
	 * {
	 * 	type,
	 * 	size,
	 * 	location,
	 * 	pointer
	 * }
	 * @member {Object}
	 */
	// next extract the attributes
	this.attributes = extractAttributes(gl, this.program);

    var uniformData = extractUniforms(gl, this.program);

	/**
	 * The uniforms of the shader as an object containing the following properties
	 * {
	 * 	gl,
	 * 	data
	 * }
	 * @member {Object}
	 */
    this.uniforms = generateUniformAccessObject( gl, uniformData );
};
/**
 * Uses this shader
 */
Shader.prototype.bind = function()
{
	this.gl.useProgram(this.program);
};

/**
 * Destroys this shader
 * TODO
 */
Shader.prototype.destroy = function()
{
	// var gl = this.gl;
};

module.exports = Shader;

},{"./shader/compileProgram":9,"./shader/extractAttributes":11,"./shader/extractUniforms":12,"./shader/generateUniformAccessObject":13}],4:[function(require,module,exports){

/**
 * Helper class to create a WebGL Texture
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext} The current WebGL context
 * @param width {number} the width of the texture
 * @param height {number} the height of the texture
 * @param format {number} the pixel format of the texture. defaults to gl.RGBA
 * @param type {number} the gl type of the texture. defaults to gl.UNSIGNED_BYTE
 */
var Texture = function(gl, width, height, format, type)
{
	/**
	 * The current WebGL rendering context
	 *
	 * @member {WebGLRenderingContext}
	 */
	this.gl = gl;


	/**
	 * The WebGL texture
	 *
	 * @member {WebGLTexture}
	 */
	this.texture = gl.createTexture();

	/**
	 * If mipmapping was used for this texture, enable and disable with enableMipmap()
	 *
	 * @member {Boolean}
	 */
	// some settings..
	this.mipmap = false;


	/**
	 * Set to true to enable pre-multiplied alpha
	 *
	 * @member {Boolean}
	 */
	this.premultiplyAlpha = false;

	/**
	 * The width of texture
	 *
	 * @member {Number}
	 */
	this.width = width || -1;
	/**
	 * The height of texture
	 *
	 * @member {Number}
	 */
	this.height = height || -1;

	/**
	 * The pixel format of the texture. defaults to gl.RGBA
	 *
	 * @member {Number}
	 */
	this.format = format || gl.RGBA;

	/**
	 * The gl type of the texture. defaults to gl.UNSIGNED_BYTE
	 *
	 * @member {Number}
	 */
	this.type = type || gl.UNSIGNED_BYTE;


};

/**
 * Uploads this texture to the GPU
 * @param source {HTMLImageElement|ImageData|HTMLVideoElement} the source image of the texture
 */
Texture.prototype.upload = function(source)
{
	this.bind();

	var gl = this.gl;


	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);

	var newWidth = source.videoWidth || source.width;
	var newHeight = source.videoHeight || source.height;

	if(newHeight !== this.height || newWidth !== this.width)
	{
    	gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, this.type, source);
	}
	else
	{
    	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.format, this.type, source);
	}

	// if the source is a video, we need to use the videoWidth / videoHeight properties as width / height will be incorrect.
	this.width = newWidth;
	this.height = newHeight;

};

var FLOATING_POINT_AVAILABLE = false;

/**
 * Use a data source and uploads this texture to the GPU
 * @param data {TypedArray} the data to upload to the texture
 * @param width {number} the new width of the texture
 * @param height {number} the new height of the texture
 */
Texture.prototype.uploadData = function(data, width, height)
{
	this.bind();

	var gl = this.gl;


	if(data instanceof Float32Array)
	{
		if(!FLOATING_POINT_AVAILABLE)
		{
			var ext = gl.getExtension("OES_texture_float");

			if(ext)
			{
				FLOATING_POINT_AVAILABLE = true;
			}
			else
			{
				throw new Error('floating point textures not available');
			}
		}

		this.type = gl.FLOAT;
	}
	else
	{
		// TODO support for other types
		this.type = gl.UNSIGNED_BYTE;
	}

	// what type of data?
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);


	if(width !== this.width || height !== this.height)
	{
		gl.texImage2D(gl.TEXTURE_2D, 0, this.format,  width, height, 0, this.format, this.type, data || null);
	}
	else
	{
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, this.format, this.type, data || null);
	}

	this.width = width;
	this.height = height;


//	texSubImage2D
};

/**
 * Binds the texture
 * @param  location
 */
Texture.prototype.bind = function(location)
{
	var gl = this.gl;

	if(location !== undefined)
	{
		gl.activeTexture(gl.TEXTURE0 + location);
	}

	gl.bindTexture(gl.TEXTURE_2D, this.texture);
};

/**
 * Unbinds the texture
 */
Texture.prototype.unbind = function()
{
	var gl = this.gl;
	gl.bindTexture(gl.TEXTURE_2D, null);
};

/**
 * @param linear {Boolean} if we want to use linear filtering or nearest neighbour interpolation
 */
Texture.prototype.minFilter = function( linear )
{
	var gl = this.gl;

	this.bind();

	if(this.mipmap)
	{
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
	}
	else
	{
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
	}
};

/**
 * @param linear {Boolean} if we want to use linear filtering or nearest neighbour interpolation
 */
Texture.prototype.magFilter = function( linear )
{
	var gl = this.gl;

	this.bind();

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
};

/**
 * Enables mipmapping
 */
Texture.prototype.enableMipmap = function()
{
	var gl = this.gl;

	this.bind();

	this.mipmap = true;

	gl.generateMipmap(gl.TEXTURE_2D);
};

/**
 * Enables linear filtering
 */
Texture.prototype.enableLinearScaling = function()
{
	this.minFilter(true);
	this.magFilter(true);
};

/**
 * Enables nearest neighbour interpolation
 */
Texture.prototype.enableNearestScaling = function()
{
	this.minFilter(false);
	this.magFilter(false);
};

/**
 * Enables clamping on the texture so WebGL will not repeat it
 */
Texture.prototype.enableWrapClamp = function()
{
	var gl = this.gl;

	this.bind();

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
};

/**
 * Enable tiling on the texture
 */
Texture.prototype.enableWrapRepeat = function()
{
	var gl = this.gl;

	this.bind();

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
};

Texture.prototype.enableWrapMirrorRepeat = function()
{
	var gl = this.gl;

	this.bind();

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
};


/**
 * Destroys this texture
 */
Texture.prototype.destroy = function()
{
	var gl = this.gl;
	//TODO
	gl.deleteTexture(this.texture);
};

/**
 * @static
 * @param gl {WebGLRenderingContext} The current WebGL context
 * @param source {HTMLImageElement|ImageData} the source image of the texture
 * @param premultiplyAlpha {Boolean} If we want to use pre-multiplied alpha
 */
Texture.fromSource = function(gl, source, premultiplyAlpha)
{
	var texture = new Texture(gl);
	texture.premultiplyAlpha = premultiplyAlpha || false;
	texture.upload(source);

	return texture;
};

/**
 * @static
 * @param gl {WebGLRenderingContext} The current WebGL context
 * @param data {TypedArray} the data to upload to the texture
 * @param width {number} the new width of the texture
 * @param height {number} the new height of the texture
 */
Texture.fromData = function(gl, data, width, height)
{
	//console.log(data, width, height);
	var texture = new Texture(gl);
	texture.uploadData(data, width, height);

	return texture;
};


module.exports = Texture;

},{}],5:[function(require,module,exports){

// state object//
var setVertexAttribArrays = require( './setVertexAttribArrays' );

/**
 * Helper class to work with WebGL VertexArrayObjects (vaos)
 * Only works if WebGL extensions are enabled (they usually are)
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 */
function VertexArrayObject(gl, state)
{
    this.nativeVaoExtension = null;

    if(!VertexArrayObject.FORCE_NATIVE)
    {
        this.nativeVaoExtension = gl.getExtension('OES_vertex_array_object') ||
                                  gl.getExtension('MOZ_OES_vertex_array_object') ||
                                  gl.getExtension('WEBKIT_OES_vertex_array_object');
    }

    this.nativeState = state;

    if(this.nativeVaoExtension)
    {
        this.nativeVao = this.nativeVaoExtension.createVertexArrayOES();

        var maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

        // VAO - overwrite the state..
        this.nativeState = {
            tempAttribState: new Array(maxAttribs),
            attribState: new Array(maxAttribs)
        };
    }

    /**
     * The current WebGL rendering context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    /**
     * An array of attributes
     *
     * @member {Array}
     */
    this.attributes = [];

    /**
     * @member {PIXI.glCore.GLBuffer}
     */
    this.indexBuffer = null;

    /**
     * A boolean flag
     *
     * @member {Boolean}
     */
    this.dirty = false;
}

VertexArrayObject.prototype.constructor = VertexArrayObject;
module.exports = VertexArrayObject;

/**
* Some devices behave a bit funny when using the newer extensions (im looking at you ipad 2!)
* If you find on older devices that things have gone a bit weird then set this to true.
*/
/**
 * Lets the VAO know if you should use the WebGL extension or the native methods.
 * Some devices behave a bit funny when using the newer extensions (im looking at you ipad 2!)
 * If you find on older devices that things have gone a bit weird then set this to true.
 * @static
 * @property {Boolean} FORCE_NATIVE
 */
VertexArrayObject.FORCE_NATIVE = false;

/**
 * Binds the buffer
 */
VertexArrayObject.prototype.bind = function()
{
    if(this.nativeVao)
    {
        this.nativeVaoExtension.bindVertexArrayOES(this.nativeVao);

        if(this.dirty)
        {
            this.dirty = false;
            this.activate();
        }
    }
    else
    {

        this.activate();
    }

    return this;
};

/**
 * Unbinds the buffer
 */
VertexArrayObject.prototype.unbind = function()
{
    if(this.nativeVao)
    {
        this.nativeVaoExtension.bindVertexArrayOES(null);
    }

    return this;
};

/**
 * Uses this vao
 */
VertexArrayObject.prototype.activate = function()
{

    var gl = this.gl;
    var lastBuffer = null;

    for (var i = 0; i < this.attributes.length; i++)
    {
        var attrib = this.attributes[i];

        if(lastBuffer !== attrib.buffer)
        {
            attrib.buffer.bind();
            lastBuffer = attrib.buffer;
        }

        //attrib.attribute.pointer(attrib.type, attrib.normalized, attrib.stride, attrib.start);
        gl.vertexAttribPointer(attrib.attribute.location,
                               attrib.attribute.size, attrib.type || gl.FLOAT,
                               attrib.normalized || false,
                               attrib.stride || 0,
                               attrib.start || 0);


    }

    setVertexAttribArrays(gl, this.attributes, this.nativeState);

    this.indexBuffer.bind();

    return this;
};

/**
 *
 * @param buffer     {PIXI.gl.GLBuffer}
 * @param attribute  {*}
 * @param type       {String}
 * @param normalized {Boolean}
 * @param stride     {Number}
 * @param start      {Number}
 */
VertexArrayObject.prototype.addAttribute = function(buffer, attribute, type, normalized, stride, start)
{
    this.attributes.push({
        buffer:     buffer,
        attribute:  attribute,

        location:   attribute.location,
        type:       type || this.gl.FLOAT,
        normalized: normalized || false,
        stride:     stride || 0,
        start:      start || 0
    });

    this.dirty = true;

    return this;
};

/**
 *
 * @param buffer   {PIXI.gl.GLBuffer}
 */
VertexArrayObject.prototype.addIndex = function(buffer/*, options*/)
{
    this.indexBuffer = buffer;

    this.dirty = true;

    return this;
};

/**
 * Unbinds this vao and disables it
 */
VertexArrayObject.prototype.clear = function()
{
    // var gl = this.gl;

    // TODO - should this function unbind after clear?
    // for now, no but lets see what happens in the real world!
    if(this.nativeVao)
    {
        this.nativeVaoExtension.bindVertexArrayOES(this.nativeVao);
    }

    this.attributes.length = 0;
    this.indexBuffer = null;

    return this;
};

/**
 * @param type  {Number}
 * @param size  {Number}
 * @param start {Number}
 */
VertexArrayObject.prototype.draw = function(type, size, start)
{
    var gl = this.gl;
    gl.drawElements(type, size, gl.UNSIGNED_SHORT, start || 0);

    return this;
};

/**
 * Destroy this vao
 */
VertexArrayObject.prototype.destroy = function()
{
    // lose references
    this.gl = null;
    this.indexBuffer = null;
    this.attributes = null;
    this.nativeState = null;

    if(this.nativeVao)
    {
        this.nativeVaoExtension.deleteVertexArrayOES(this.nativeVao);
    }

    this.nativeVaoExtension = null;
    this.nativeVao = null;
};

},{"./setVertexAttribArrays":8}],6:[function(require,module,exports){

/**
 * Helper class to create a webGL Context
 *
 * @class
 * @memberof PIXI.glCore
 * @param canvas {HTMLCanvasElement} the canvas element that we will get the context from
 * @param options {Object} An options object that gets passed in to the canvas element containing the context attributes,
 *                         see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext for the options available
 * @return {WebGLRenderingContext} the WebGL context
 */
var createContext = function(canvas, options)
{
    var gl = canvas.getContext('webgl', options) || 
         canvas.getContext('experimental-webgl', options);

    if (!gl)
    {
        // fail, not able to get a context
        throw new Error('This browser does not support webGL. Try using the canvas renderer');
    }

    return gl;
};

module.exports = createContext;

},{}],7:[function(require,module,exports){
var gl = {
    createContext:          require('./createContext'),
    setVertexAttribArrays:  require('./setVertexAttribArrays'),
    GLBuffer:               require('./GLBuffer'),
    GLFramebuffer:          require('./GLFramebuffer'),
    GLShader:               require('./GLShader'),
    GLTexture:              require('./GLTexture'),
    VertexArrayObject:      require('./VertexArrayObject'),
    shader:                 require('./shader')
};

// Export for Node-compatible environments
if (typeof module !== 'undefined' && module.exports)
{
    // Export the module
    module.exports = gl;
}

// Add to the browser window pixi.gl
if (typeof window !== 'undefined')
{
    // add the window object
    window.PIXI = window.PIXI || {};
    window.PIXI.glCore = gl;
}

},{"./GLBuffer":1,"./GLFramebuffer":2,"./GLShader":3,"./GLTexture":4,"./VertexArrayObject":5,"./createContext":6,"./setVertexAttribArrays":8,"./shader":14}],8:[function(require,module,exports){
// var GL_MAP = {};

/**
 * @param gl {WebGLRenderingContext} The current WebGL context
 * @param attribs {*}
 * @param state {*}
 */
var setVertexAttribArrays = function (gl, attribs, state)
{
    var i;
    if(state)
    {
        var tempAttribState = state.tempAttribState,
            attribState = state.attribState;

        for (i = 0; i < tempAttribState.length; i++)
        {
            tempAttribState[i] = false;
        }

        // set the new attribs
        for (i = 0; i < attribs.length; i++)
        {
            tempAttribState[attribs[i].attribute.location] = true;
        }

        for (i = 0; i < attribState.length; i++)
        {
            if (attribState[i] !== tempAttribState[i])
            {
                attribState[i] = tempAttribState[i];

                if (state.attribState[i])
                {
                    gl.enableVertexAttribArray(i);
                }
                else
                {
                    gl.disableVertexAttribArray(i);
                }
            }
        }

    }
    else
    {
        for (i = 0; i < attribs.length; i++)
        {
            var attrib = attribs[i];
            gl.enableVertexAttribArray(attrib.attribute.location);
        }
    }
};

module.exports = setVertexAttribArrays;

},{}],9:[function(require,module,exports){

/**
 * @class
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL context {WebGLProgram}
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 * @return {WebGLProgram} the shader program
 */
var compileProgram = function(gl, vertexSrc, fragmentSrc)
{
    var glVertShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    var glFragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

    var program = gl.createProgram();

    gl.attachShader(program, glVertShader);
    gl.attachShader(program, glFragShader);
    gl.linkProgram(program);

    // if linking fails, then log and cleanup
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error('Pixi.js Error: Could not initialize shader.');
        console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS));
        console.error('gl.getError()', gl.getError());

        // if there is a program info log, log it
        if (gl.getProgramInfoLog(program) !== '')
        {
            console.warn('Pixi.js Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
        }

        gl.deleteProgram(program);
        program = null;
    }

    // clean up some shaders
    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    return program;
};

/**
 * @private
 * @param gl {WebGLRenderingContext} The current WebGL context {WebGLProgram}
 * @param type {Number} the type, can be either VERTEX_SHADER or FRAGMENT_SHADER
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @return {WebGLShader} the shader
 */
var compileShader = function (gl, type, src)
{
    var shader = gl.createShader(type);

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

module.exports = compileProgram;

},{}],10:[function(require,module,exports){
/**
 * @class
 * @memberof PIXI.glCore.shader
 * @param type {String} Type of value
 * @param size {Number}
 */
var defaultValue = function(type, size) 
{
    switch (type)
    {
        case 'float':
            return 0;

        case 'vec2': 
            return new Float32Array(2 * size);

        case 'vec3':
            return new Float32Array(3 * size);

        case 'vec4':     
            return new Float32Array(4 * size);
            
        case 'int':
        case 'sampler2D':
            return 0;

        case 'ivec2':   
            return new Int32Array(2 * size);

        case 'ivec3':
            return new Int32Array(3 * size);

        case 'ivec4': 
            return new Int32Array(4 * size);

        case 'bool':     
            return false;

        case 'bvec2':

            return booleanArray( 2 * size);

        case 'bvec3':
            return booleanArray(3 * size);

        case 'bvec4':
            return booleanArray(4 * size);

        case 'mat2':
            return new Float32Array([1, 0,
                                     0, 1]);

        case 'mat3': 
            return new Float32Array([1, 0, 0,
                                     0, 1, 0,
                                     0, 0, 1]);

        case 'mat4':
            return new Float32Array([1, 0, 0, 0,
                                     0, 1, 0, 0,
                                     0, 0, 1, 0,
                                     0, 0, 0, 1]);
    }
};

var booleanArray = function(size)
{
    var array = new Array(size);

    for (var i = 0; i < array.length; i++) 
    {
        array[i] = false;
    }

    return array;
};

module.exports = defaultValue;

},{}],11:[function(require,module,exports){

var mapType = require('./mapType');
var mapSize = require('./mapSize');

/**
 * Extracts the attributes
 * @class
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param program {WebGLProgram} The shader program to get the attributes from
 * @return attributes {Object}
 */
var extractAttributes = function(gl, program)
{
    var attributes = {};

    var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (var i = 0; i < totalAttributes; i++)
    {
        var attribData = gl.getActiveAttrib(program, i);
        var type = mapType(gl, attribData.type);

        attributes[attribData.name] = {
            type:type,
            size:mapSize(type),
            location:gl.getAttribLocation(program, attribData.name),
            //TODO - make an attribute object
            pointer: pointer
        };
    }

    return attributes;
};

var pointer = function(type, normalized, stride, start){
    // console.log(this.location)
    gl.vertexAttribPointer(this.location,this.size, type || gl.FLOAT, normalized || false, stride || 0, start || 0);
};

module.exports = extractAttributes;

},{"./mapSize":15,"./mapType":16}],12:[function(require,module,exports){
var mapType = require('./mapType');
var defaultValue = require('./defaultValue');

/**
 * Extracts the uniforms
 * @class
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param program {WebGLProgram} The shader program to get the uniforms from
 * @return uniforms {Object}
 */
var extractUniforms = function(gl, program)
{
	var uniforms = {};

    var totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (var i = 0; i < totalUniforms; i++)
    {
    	var uniformData = gl.getActiveUniform(program, i);
    	var name = uniformData.name.replace(/\[.*?\]/, "");
        var type = mapType(gl, uniformData.type );

    	uniforms[name] = {
    		type:type,
    		size:uniformData.size,
    		location:gl.getUniformLocation(program, name),
    		value:defaultValue(type, uniformData.size)
    	};
    }

	return uniforms;
};

module.exports = extractUniforms;

},{"./defaultValue":10,"./mapType":16}],13:[function(require,module,exports){
/**
 * Extracts the attributes
 * @class
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param uniforms {Array} @mat ?
 * @return attributes {Object}
 */
var generateUniformAccessObject = function(gl, uniformData)
{
    // this is the object we will be sending back.
    // an object hierachy will be created for structs
    var uniforms = {data:{}};

    uniforms.gl = gl;

    var uniformKeys= Object.keys(uniformData);

    for (var i = 0; i < uniformKeys.length; i++)
    {
        var fullName = uniformKeys[i];

        var nameTokens = fullName.split('.');
        var name = nameTokens[nameTokens.length - 1];

        var uniformGroup = getUniformGroup(nameTokens, uniforms);

        var uniform =  uniformData[fullName];
        uniformGroup.data[name] = uniform;

        uniformGroup.gl = gl;

        Object.defineProperty(uniformGroup, name, {
            get: generateGetter(name),
            set: generateSetter(name, uniform)
        });
    }

    return uniforms;
};

var generateGetter = function(name)
{
	var template = getterTemplate.replace('%%', name);
	return new Function(template); // jshint ignore:line
};

var generateSetter = function(name, uniform)
{
    var template = setterTemplate.replace(/%%/g, name);
    var setTemplate;

    if(uniform.size === 1)
    {
        setTemplate = GLSL_TO_SINGLE_SETTERS[uniform.type];
    }
    else
    {
        setTemplate = GLSL_TO_ARRAY_SETTERS[uniform.type];
    }

    if(setTemplate)
    {
        template += "\nthis.gl." + setTemplate + ";";
    }

  	return new Function('value', template); // jshint ignore:line
};

var getUniformGroup = function(nameTokens, uniform)
{
    var cur = uniform;

    for (var i = 0; i < nameTokens.length - 1; i++)
    {
        var o = cur[nameTokens[i]] || {data:{}};
        cur[nameTokens[i]] = o;
        cur = o;
    }

    return cur;
};

var getterTemplate = [
    'return this.data.%%.value;',
].join('\n');

var setterTemplate = [
    'this.data.%%.value = value;',
    'var location = this.data.%%.location;'
].join('\n');


var GLSL_TO_SINGLE_SETTERS = {

    'float':    'uniform1f(location, value)',

    'vec2':     'uniform2f(location, value[0], value[1])',
    'vec3':     'uniform3f(location, value[0], value[1], value[2])',
    'vec4':     'uniform4f(location, value[0], value[1], value[2], value[3])',

    'int':      'uniform1i(location, value)',
    'ivec2':    'uniform2i(location, value[0], value[1])',
    'ivec3':    'uniform3i(location, value[0], value[1], value[2])',
    'ivec4':    'uniform4i(location, value[0], value[1], value[2], value[3])',

    'bool':     'uniform1i(location, value)',
    'bvec2':    'uniform2i(location, value[0], value[1])',
    'bvec3':    'uniform3i(location, value[0], value[1], value[2])',
    'bvec4':    'uniform4i(location, value[0], value[1], value[2], value[3])',

    'mat2':     'uniformMatrix2fv(location, false, value)',
    'mat3':     'uniformMatrix3fv(location, false, value)',
    'mat4':     'uniformMatrix4fv(location, false, value)',

    'sampler2D':'uniform1i(location, value)'
};

var GLSL_TO_ARRAY_SETTERS = {

    'float':    'uniform1fv(location, value)',

    'vec2':     'uniform2fv(location, value)',
    'vec3':     'uniform3fv(location, value)',
    'vec4':     'uniform4fv(location, value)',

    'int':      'uniform1iv(location, value)',
    'ivec2':    'uniform2iv(location, value)',
    'ivec3':    'uniform3iv(location, value)',
    'ivec4':    'uniform4iv(location, value)',

    'bool':     'uniform1iv(location, value)',
    'bvec2':    'uniform2iv(location, value)',
    'bvec3':    'uniform3iv(location, value)',
    'bvec4':    'uniform4iv(location, value)',

    'sampler2D':'uniform1iv(location, value)'
};

module.exports = generateUniformAccessObject;

},{}],14:[function(require,module,exports){
module.exports = {
    compileProgram: require('./compileProgram'),
    defaultValue: require('./defaultValue'),
    extractAttributes: require('./extractAttributes'),
    extractUniforms: require('./extractUniforms'),
    generateUniformAccessObject: require('./generateUniformAccessObject'),
    mapSize: require('./mapSize'),
    mapType: require('./mapType')  
};
},{"./compileProgram":9,"./defaultValue":10,"./extractAttributes":11,"./extractUniforms":12,"./generateUniformAccessObject":13,"./mapSize":15,"./mapType":16}],15:[function(require,module,exports){
/**
 * @class
 * @memberof PIXI.glCore.shader
 * @param type {String}
 * @return {Number}
 */
var mapSize = function(type) 
{ 
    return GLSL_TO_SIZE[type];
};


var GLSL_TO_SIZE = {
    'float':    1,
    'vec2':     2,
    'vec3':     3,
    'vec4':     4,

    'int':      1,
    'ivec2':    2,
    'ivec3':    3,
    'ivec4':    4,

    'bool':     1,
    'bvec2':    2,
    'bvec3':    3,
    'bvec4':    4,

    'mat2':     4,
    'mat3':     9,
    'mat4':     16,

    'sampler2D':  1
};

module.exports = mapSize;

},{}],16:[function(require,module,exports){


var mapSize = function(gl, type) 
{
    if(!GL_TABLE) 
    {
        var typeNames = Object.keys(GL_TO_GLSL_TYPES);

        GL_TABLE = {};

        for(var i = 0; i < typeNames.length; ++i) 
        {
            var tn = typeNames[i];
            GL_TABLE[ gl[tn] ] = GL_TO_GLSL_TYPES[tn];
        }
    }

  return GL_TABLE[type];
};

var GL_TABLE = null;

var GL_TO_GLSL_TYPES = {
  'FLOAT':       'float',
  'FLOAT_VEC2':  'vec2',
  'FLOAT_VEC3':  'vec3',
  'FLOAT_VEC4':  'vec4',

  'INT':         'int',
  'INT_VEC2':    'ivec2',
  'INT_VEC3':    'ivec3',
  'INT_VEC4':    'ivec4',
  
  'BOOL':        'bool',
  'BOOL_VEC2':   'bvec2',
  'BOOL_VEC3':   'bvec3',
  'BOOL_VEC4':   'bvec4',
  
  'FLOAT_MAT2':  'mat2',
  'FLOAT_MAT3':  'mat3',
  'FLOAT_MAT4':  'mat4',
  
  'SAMPLER_2D':  'sampler2D'  
};

module.exports = mapSize;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = eachLimit;

var _eachOfLimit = require('./internal/eachOfLimit');

var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);

var _withoutIndex = require('./internal/withoutIndex');

var _withoutIndex2 = _interopRequireDefault(_withoutIndex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A colleciton to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each item in `coll`. The
 * iteratee is passed a `callback(err)` which must be called once it has
 * completed. If no error has occurred, the `callback` should be run without
 * arguments or with an explicit `null` argument. The array index is not passed
 * to the iteratee. Invoked with (item, callback). If you need the index, use
 * `eachOfLimit`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachLimit(coll, limit, iteratee, callback) {
  (0, _eachOfLimit2.default)(limit)(coll, (0, _withoutIndex2.default)(iteratee), callback);
}
module.exports = exports['default'];
},{"./internal/eachOfLimit":21,"./internal/withoutIndex":28}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eachLimit = require('./eachLimit');

var _eachLimit2 = _interopRequireDefault(_eachLimit);

var _doLimit = require('./internal/doLimit');

var _doLimit2 = _interopRequireDefault(_doLimit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The iteratee is passed a `callback(err)` which must be called
 * once it has completed. If no error has occurred, the `callback` should be run
 * without arguments or with an explicit `null` argument. The array index is
 * not passed to the iteratee. Invoked with (item, callback). If you need the
 * index, use `eachOfSeries`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
exports.default = (0, _doLimit2.default)(_eachLimit2.default, 1);
module.exports = exports['default'];
},{"./eachLimit":17,"./internal/doLimit":20}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = DLL;
// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
function DLL() {
    this.head = this.tail = null;
    this.length = 0;
}

function setInitial(dll, node) {
    dll.length = 1;
    dll.head = dll.tail = node;
}

DLL.prototype.removeLink = function (node) {
    if (node.prev) node.prev.next = node.next;else this.head = node.next;
    if (node.next) node.next.prev = node.prev;else this.tail = node.prev;

    node.prev = node.next = null;
    this.length -= 1;
    return node;
};

DLL.prototype.empty = DLL;

DLL.prototype.insertAfter = function (node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next) node.next.prev = newNode;else this.tail = newNode;
    node.next = newNode;
    this.length += 1;
};

DLL.prototype.insertBefore = function (node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev) node.prev.next = newNode;else this.head = newNode;
    node.prev = newNode;
    this.length += 1;
};

DLL.prototype.unshift = function (node) {
    if (this.head) this.insertBefore(this.head, node);else setInitial(this, node);
};

DLL.prototype.push = function (node) {
    if (this.tail) this.insertAfter(this.tail, node);else setInitial(this, node);
};

DLL.prototype.shift = function () {
    return this.head && this.removeLink(this.head);
};

DLL.prototype.pop = function () {
    return this.tail && this.removeLink(this.tail);
};
module.exports = exports['default'];
},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = doLimit;
function doLimit(fn, limit) {
    return function (iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
    };
}
module.exports = exports['default'];
},{}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _eachOfLimit;

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _once = require('./once');

var _once2 = _interopRequireDefault(_once);

var _iterator = require('./iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _onlyOnce = require('./onlyOnce');

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = (0, _once2.default)(callback || _noop2.default);
        if (limit <= 0 || !obj) {
            return callback(null);
        }
        var nextElem = (0, _iterator2.default)(obj);
        var done = false;
        var running = 0;

        function iterateeCallback(err) {
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            } else if (done && running <= 0) {
                return callback(null);
            } else {
                replenish();
            }
        }

        function replenish() {
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, (0, _onlyOnce2.default)(iterateeCallback));
            }
        }

        replenish();
    };
}
module.exports = exports['default'];
},{"./iterator":23,"./once":24,"./onlyOnce":25,"lodash/noop":54}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
};

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

module.exports = exports['default'];
},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = iterator;

var _isArrayLike = require('lodash/isArrayLike');

var _isArrayLike2 = _interopRequireDefault(_isArrayLike);

var _getIterator = require('./getIterator');

var _getIterator2 = _interopRequireDefault(_getIterator);

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
        return ++i < len ? { value: coll[i], key: i } : null;
    };
}

function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
        var item = iterator.next();
        if (item.done) return null;
        i++;
        return { value: item.value, key: i };
    };
}

function createObjectIterator(obj) {
    var okeys = (0, _keys2.default)(obj);
    var i = -1;
    var len = okeys.length;
    return function next() {
        var key = okeys[++i];
        return i < len ? { value: obj[key], key: key } : null;
    };
}

function iterator(coll) {
    if ((0, _isArrayLike2.default)(coll)) {
        return createArrayIterator(coll);
    }

    var iterator = (0, _getIterator2.default)(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}
module.exports = exports['default'];
},{"./getIterator":22,"lodash/isArrayLike":46,"lodash/keys":53}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = once;
function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}
module.exports = exports['default'];
},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onlyOnce;
function onlyOnce(fn) {
    return function () {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}
module.exports = exports['default'];
},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = queue;

var _arrayEach = require('lodash/_arrayEach');

var _arrayEach2 = _interopRequireDefault(_arrayEach);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _rest = require('lodash/rest');

var _rest2 = _interopRequireDefault(_rest);

var _onlyOnce = require('./onlyOnce');

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

var _setImmediate = require('./setImmediate');

var _setImmediate2 = _interopRequireDefault(_setImmediate);

var _DoublyLinkedList = require('./DoublyLinkedList');

var _DoublyLinkedList2 = _interopRequireDefault(_DoublyLinkedList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    } else if (concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!(0, _isArray2.default)(data)) {
            data = [data];
        }
        if (data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return (0, _setImmediate2.default)(function () {
                q.drain();
            });
        }
        (0, _arrayEach2.default)(data, function (task) {
            var item = {
                data: task,
                callback: callback || _noop2.default
            };

            if (insertAtFront) {
                q._tasks.unshift(item);
            } else {
                q._tasks.push(item);
            }
        });
        (0, _setImmediate2.default)(q.process);
    }

    function _next(tasks) {
        return (0, _rest2.default)(function (args) {
            workers -= 1;

            (0, _arrayEach2.default)(tasks, function (task) {
                (0, _arrayEach2.default)(workersList, function (worker, index) {
                    if (worker === task) {
                        workersList.splice(index, 1);
                        return false;
                    }
                });

                task.callback.apply(task, args);

                if (args[0] != null) {
                    q.error(args[0], task.data);
                }
            });

            if (workers <= q.concurrency - q.buffer) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }
            q.process();
        });
    }

    var workers = 0;
    var workersList = [];
    var q = {
        _tasks: new _DoublyLinkedList2.default(),
        concurrency: concurrency,
        payload: payload,
        saturated: _noop2.default,
        unsaturated: _noop2.default,
        buffer: concurrency / 4,
        empty: _noop2.default,
        drain: _noop2.default,
        error: _noop2.default,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(data, false, callback);
        },
        kill: function () {
            q.drain = _noop2.default;
            q._tasks.empty();
        },
        unshift: function (data, callback) {
            _insert(data, true, callback);
        },
        process: function () {
            while (!q.paused && workers < q.concurrency && q._tasks.length) {
                var tasks = [],
                    data = [];
                var l = q._tasks.length;
                if (q.payload) l = Math.min(l, q.payload);
                for (var i = 0; i < l; i++) {
                    var node = q._tasks.shift();
                    tasks.push(node);
                    data.push(node.data);
                }

                if (q._tasks.length === 0) {
                    q.empty();
                }
                workers += 1;
                workersList.push(tasks[0]);

                if (workers === q.concurrency) {
                    q.saturated();
                }

                var cb = (0, _onlyOnce2.default)(_next(tasks));
                worker(data, cb);
            }
        },
        length: function () {
            return q._tasks.length;
        },
        running: function () {
            return workers;
        },
        workersList: function () {
            return workersList;
        },
        idle: function () {
            return q._tasks.length + workers === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) {
                return;
            }
            q.paused = false;
            var resumeCount = Math.min(q.concurrency, q._tasks.length);
            // Need to call q.process once per concurrent
            // worker to preserve full concurrency after pause
            for (var w = 1; w <= resumeCount; w++) {
                (0, _setImmediate2.default)(q.process);
            }
        }
    };
    return q;
}
module.exports = exports['default'];
},{"./DoublyLinkedList":19,"./onlyOnce":25,"./setImmediate":27,"lodash/_arrayEach":35,"lodash/isArray":45,"lodash/noop":54,"lodash/rest":55}],27:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasNextTick = exports.hasSetImmediate = undefined;
exports.fallback = fallback;
exports.wrap = wrap;

var _rest = require('lodash/rest');

var _rest2 = _interopRequireDefault(_rest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasSetImmediate = exports.hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
var hasNextTick = exports.hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

function fallback(fn) {
    setTimeout(fn, 0);
}

function wrap(defer) {
    return (0, _rest2.default)(function (fn, args) {
        defer(function () {
            fn.apply(null, args);
        });
    });
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

exports.default = wrap(_defer);
}).call(this,require('_process'))

},{"_process":61,"lodash/rest":55}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _withoutIndex;
function _withoutIndex(iteratee) {
    return function (value, index, callback) {
        return iteratee(value, callback);
    };
}
module.exports = exports['default'];
},{}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (worker, concurrency) {
  return (0, _queue2.default)(function (items, cb) {
    worker(items[0], cb);
  }, concurrency, 1);
};

var _queue = require('./internal/queue');

var _queue2 = _interopRequireDefault(_queue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];

/**
 * A queue of tasks for the worker function to complete.
 * @typedef {Object} QueueObject
 * @memberOf module:ControlFlow
 * @property {Function} length - a function returning the number of items
 * waiting to be processed. Invoke with `queue.length()`.
 * @property {boolean} started - a boolean indicating whether or not any
 * items have been pushed and processed by the queue.
 * @property {Function} running - a function returning the number of items
 * currently being processed. Invoke with `queue.running()`.
 * @property {Function} workersList - a function returning the array of items
 * currently being processed. Invoke with `queue.workersList()`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke with `queue.idle()`.
 * @property {number} concurrency - an integer for determining how many `worker`
 * functions should be run in parallel. This property can be changed after a
 * `queue` is created to alter the concurrency on-the-fly.
 * @property {Function} push - add a new task to the `queue`. Calls `callback`
 * once the `worker` has finished processing the task. Instead of a single task,
 * a `tasks` array can be submitted. The respective callback is used for every
 * task in the list. Invoke with `queue.push(task, [callback])`,
 * @property {Function} unshift - add a new task to the front of the `queue`.
 * Invoke with `queue.unshift(task, [callback])`.
 * @property {Function} saturated - a callback that is called when the number of
 * running workers hits the `concurrency` limit, and further tasks will be
 * queued.
 * @property {Function} unsaturated - a callback that is called when the number
 * of running workers is less than the `concurrency` & `buffer` limits, and
 * further tasks will not be queued.
 * @property {number} buffer - A minimum threshold buffer in order to say that
 * the `queue` is `unsaturated`.
 * @property {Function} empty - a callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - a callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} error - a callback that is called when a task errors.
 * Has the signature `function(error, task)`.
 * @property {boolean} paused - a boolean for determining whether the queue is
 * in a paused state.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke with `queue.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke with `queue.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke with `queue.kill()`.
 */

/**
 * Creates a `queue` object with the specified `concurrency`. Tasks added to the
 * `queue` are processed in parallel (up to the `concurrency` limit). If all
 * `worker`s are in progress, the task is queued until one becomes available.
 * Once a `worker` completes a `task`, that `task`'s callback is called.
 *
 * @name queue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} worker - An asynchronous function for processing a queued
 * task, which must call its `callback(err)` argument when finished, with an
 * optional `error` as an argument.  If you want to handle errors from an
 * individual task, pass a callback to `q.push()`. Invoked with
 * (task, callback).
 * @param {number} [concurrency=1] - An `integer` for determining how many
 * `worker` functions should be run in parallel.  If omitted, the concurrency
 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the queue.
 * @example
 *
 * // create a queue object with concurrency 2
 * var q = async.queue(function(task, callback) {
 *     console.log('hello ' + task.name);
 *     callback();
 * }, 2);
 *
 * // assign a callback
 * q.drain = function() {
 *     console.log('all items have been processed');
 * };
 *
 * // add some items to the queue
 * q.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * q.push({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 *
 * // add some items to the queue (batch-wise)
 * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
 *     console.log('finished processing item');
 * });
 *
 * // add some items to the front of the queue
 * q.unshift({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 */
},{"./internal/queue":26}],30:[function(require,module,exports){
/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

"use strict"; "use restrict";

//Number of bits in an integer
var INT_BITS = 32;

//Constants
exports.INT_BITS  = INT_BITS;
exports.INT_MAX   =  0x7fffffff;
exports.INT_MIN   = -1<<(INT_BITS-1);

//Returns -1, 0, +1 depending on sign of x
exports.sign = function(v) {
  return (v > 0) - (v < 0);
}

//Computes absolute value of integer
exports.abs = function(v) {
  var mask = v >> (INT_BITS-1);
  return (v ^ mask) - mask;
}

//Computes minimum of integers x and y
exports.min = function(x, y) {
  return y ^ ((x ^ y) & -(x < y));
}

//Computes maximum of integers x and y
exports.max = function(x, y) {
  return x ^ ((x ^ y) & -(x < y));
}

//Checks if a number is a power of two
exports.isPow2 = function(v) {
  return !(v & (v-1)) && (!!v);
}

//Computes log base 2 of v
exports.log2 = function(v) {
  var r, shift;
  r =     (v > 0xFFFF) << 4; v >>>= r;
  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
  return r | (v >> 1);
}

//Computes log base 10 of v
exports.log10 = function(v) {
  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
}

//Counts number of bits
exports.popCount = function(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}

//Counts number of trailing zeros
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000FFFF) c -= 16;
  if (v & 0x00FF00FF) c -= 8;
  if (v & 0x0F0F0F0F) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
exports.countTrailingZeros = countTrailingZeros;

//Rounds to next power of 2
exports.nextPow2 = function(v) {
  v += v === 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}

//Rounds down to previous power of 2
exports.prevPow2 = function(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v>>>1);
}

//Computes parity of word
exports.parity = function(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return (0x6996 >>> v) & 1;
}

var REVERSE_TABLE = new Array(256);

(function(tab) {
  for(var i=0; i<256; ++i) {
    var v = i, r = i, s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = (r << s) & 0xff;
  }
})(REVERSE_TABLE);

//Reverse bits in a 32 bit word
exports.reverse = function(v) {
  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
           REVERSE_TABLE[(v >>> 24) & 0xff];
}

//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
exports.interleave2 = function(x, y) {
  x &= 0xFFFF;
  x = (x | (x << 8)) & 0x00FF00FF;
  x = (x | (x << 4)) & 0x0F0F0F0F;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;

  y &= 0xFFFF;
  y = (y | (y << 8)) & 0x00FF00FF;
  y = (y | (y << 4)) & 0x0F0F0F0F;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;

  return x | (y << 1);
}

//Extracts the nth interleaved component
exports.deinterleave2 = function(v, n) {
  v = (v >>> n) & 0x55555555;
  v = (v | (v >>> 1))  & 0x33333333;
  v = (v | (v >>> 2))  & 0x0F0F0F0F;
  v = (v | (v >>> 4))  & 0x00FF00FF;
  v = (v | (v >>> 16)) & 0x000FFFF;
  return (v << 16) >> 16;
}


//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
exports.interleave3 = function(x, y, z) {
  x &= 0x3FF;
  x  = (x | (x<<16)) & 4278190335;
  x  = (x | (x<<8))  & 251719695;
  x  = (x | (x<<4))  & 3272356035;
  x  = (x | (x<<2))  & 1227133513;

  y &= 0x3FF;
  y  = (y | (y<<16)) & 4278190335;
  y  = (y | (y<<8))  & 251719695;
  y  = (y | (y<<4))  & 3272356035;
  y  = (y | (y<<2))  & 1227133513;
  x |= (y << 1);
  
  z &= 0x3FF;
  z  = (z | (z<<16)) & 4278190335;
  z  = (z | (z<<8))  & 251719695;
  z  = (z | (z<<4))  & 3272356035;
  z  = (z | (z<<2))  & 1227133513;
  
  return x | (z << 2);
}

//Extracts nth interleaved component of a 3-tuple
exports.deinterleave3 = function(v, n) {
  v = (v >>> n)       & 1227133513;
  v = (v | (v>>>2))   & 3272356035;
  v = (v | (v>>>4))   & 251719695;
  v = (v | (v>>>8))   & 4278190335;
  v = (v | (v>>>16))  & 0x3FF;
  return (v<<22)>>22;
}

//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
exports.nextCombination = function(v) {
  var t = v | (v - 1);
  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
}


},{}],31:[function(require,module,exports){
'use strict';

module.exports = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode) return triangles;

    var minX, minY, maxX, maxY, x, y, size;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and size are later used to transform coords into integers for z-order calculation
        size = Math.max(maxX - minX, maxY - minY);
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, size);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) return null;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, size, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && size) indexCurve(ear, minX, minY, size);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (size ? isEarHashed(ear, minX, minY, size) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, size, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(ear, triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, size, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, size);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, size) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, size),
        maxZ = zOrder(maxTX, maxTY, minX, minY, size);

    // first look for points inside the triangle in increasing z-order
    var p = ear.nextZ;

    while (p && p.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.nextZ;
    }

    // then look for points in decreasing z-order
    p = ear.prevZ;

    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return p;
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, size);
                earcutLinked(c, triangles, dim, minX, minY, size);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m.prev; // hole touches outer segment; pick lower endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m.next;

    while (p !== stop) {
        if (hx >= p.x && p.x >= mx &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && locallyInside(p, hole)) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    }

    return m;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, size) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, size);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }

            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize === 0) {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                } else if (qSize === 0 || !q) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else if (p.z <= q.z) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and size of the data bounding box
function zOrder(x, y, minX, minY, size) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) / size;
    y = 32767 * (y - minY) / size;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
           locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    if ((equals(p1, q1) && equals(p2, q2)) ||
        (equals(p1, q2) && equals(p2, q1))) return true;
    return area(p1, q1, p2) > 0 !== area(p1, q1, q2) > 0 &&
           area(p2, q2, p1) > 0 !== area(p2, q2, q1) > 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertice index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};

},{}],32:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} [once=false] Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Hold the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var events = this._events
    , names = []
    , name;

  if (!events) return names;

  for (name in events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],33:[function(require,module,exports){
/**
 * isMobile.js v0.4.0
 *
 * A simple library to detect Apple phones and tablets,
 * Android phones and tablets, other mobile devices (like blackberry, mini-opera and windows phone),
 * and any kind of seven inch device, via user agent sniffing.
 *
 * @author: Kai Mallea (kmallea@gmail.com)
 *
 * @license: http://creativecommons.org/publicdomain/zero/1.0/
 */
(function (global) {

    var apple_phone         = /iPhone/i,
        apple_ipod          = /iPod/i,
        apple_tablet        = /iPad/i,
        android_phone       = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, // Match 'Android' AND 'Mobile'
        android_tablet      = /Android/i,
        amazon_phone        = /(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i,
        amazon_tablet       = /(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i,
        windows_phone       = /IEMobile/i,
        windows_tablet      = /(?=.*\bWindows\b)(?=.*\bARM\b)/i, // Match 'Windows' AND 'ARM'
        other_blackberry    = /BlackBerry/i,
        other_blackberry_10 = /BB10/i,
        other_opera         = /Opera Mini/i,
        other_chrome        = /(CriOS|Chrome)(?=.*\bMobile\b)/i,
        other_firefox       = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i, // Match 'Firefox' AND 'Mobile'
        seven_inch = new RegExp(
            '(?:' +         // Non-capturing group

            'Nexus 7' +     // Nexus 7

            '|' +           // OR

            'BNTV250' +     // B&N Nook Tablet 7 inch

            '|' +           // OR

            'Kindle Fire' + // Kindle Fire

            '|' +           // OR

            'Silk' +        // Kindle Fire, Silk Accelerated

            '|' +           // OR

            'GT-P1000' +    // Galaxy Tab 7 inch

            ')',            // End non-capturing group

            'i');           // Case-insensitive matching

    var match = function(regex, userAgent) {
        return regex.test(userAgent);
    };

    var IsMobileClass = function(userAgent) {
        var ua = userAgent || navigator.userAgent;

        // Facebook mobile app's integrated browser adds a bunch of strings that
        // match everything. Strip it out if it exists.
        var tmp = ua.split('[FBAN');
        if (typeof tmp[1] !== 'undefined') {
            ua = tmp[0];
        }

        // Twitter mobile app's integrated browser on iPad adds a "Twitter for
        // iPhone" string. Same probable happens on other tablet platforms.
        // This will confuse detection so strip it out if it exists.
        tmp = ua.split('Twitter');
        if (typeof tmp[1] !== 'undefined') {
            ua = tmp[0];
        }

        this.apple = {
            phone:  match(apple_phone, ua),
            ipod:   match(apple_ipod, ua),
            tablet: !match(apple_phone, ua) && match(apple_tablet, ua),
            device: match(apple_phone, ua) || match(apple_ipod, ua) || match(apple_tablet, ua)
        };
        this.amazon = {
            phone:  match(amazon_phone, ua),
            tablet: !match(amazon_phone, ua) && match(amazon_tablet, ua),
            device: match(amazon_phone, ua) || match(amazon_tablet, ua)
        };
        this.android = {
            phone:  match(amazon_phone, ua) || match(android_phone, ua),
            tablet: !match(amazon_phone, ua) && !match(android_phone, ua) && (match(amazon_tablet, ua) || match(android_tablet, ua)),
            device: match(amazon_phone, ua) || match(amazon_tablet, ua) || match(android_phone, ua) || match(android_tablet, ua)
        };
        this.windows = {
            phone:  match(windows_phone, ua),
            tablet: match(windows_tablet, ua),
            device: match(windows_phone, ua) || match(windows_tablet, ua)
        };
        this.other = {
            blackberry:   match(other_blackberry, ua),
            blackberry10: match(other_blackberry_10, ua),
            opera:        match(other_opera, ua),
            firefox:      match(other_firefox, ua),
            chrome:       match(other_chrome, ua),
            device:       match(other_blackberry, ua) || match(other_blackberry_10, ua) || match(other_opera, ua) || match(other_firefox, ua) || match(other_chrome, ua)
        };
        this.seven_inch = match(seven_inch, ua);
        this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch;

        // excludes 'other' devices and ipods, targeting touchscreen phones
        this.phone = this.apple.phone || this.android.phone || this.windows.phone;

        // excludes 7 inch devices, classifying as phone or tablet is left to the user
        this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;

        if (typeof window === 'undefined') {
            return this;
        }
    };

    var instantiate = function() {
        var IM = new IsMobileClass();
        IM.Class = IsMobileClass;
        return IM;
    };

    if (typeof module !== 'undefined' && module.exports && typeof window === 'undefined') {
        //node
        module.exports = IsMobileClass;
    } else if (typeof module !== 'undefined' && module.exports && typeof window !== 'undefined') {
        //browserify
        module.exports = instantiate();
    } else if (typeof define === 'function' && define.amd) {
        //AMD
        define('isMobile', [], global.isMobile = instantiate());
    } else {
        global.isMobile = instantiate();
    }

})(this);

},{}],34:[function(require,module,exports){
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;

},{}],35:[function(require,module,exports){
/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],36:[function(require,module,exports){
var baseTimes = require('./_baseTimes'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isIndex = require('./_isIndex');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;

},{"./_baseTimes":39,"./_isIndex":40,"./isArguments":44,"./isArray":45}],37:[function(require,module,exports){
var isPrototype = require('./_isPrototype'),
    nativeKeys = require('./_nativeKeys');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;

},{"./_isPrototype":41,"./_nativeKeys":42}],38:[function(require,module,exports){
var apply = require('./_apply');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

module.exports = baseRest;

},{"./_apply":34}],39:[function(require,module,exports){
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;

},{}],40:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;

},{}],41:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;

},{}],42:[function(require,module,exports){
var overArg = require('./_overArg');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;

},{"./_overArg":43}],43:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],44:[function(require,module,exports){
var isArrayLikeObject = require('./isArrayLikeObject');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

module.exports = isArguments;

},{"./isArrayLikeObject":47}],45:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],46:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;

},{"./isFunction":48,"./isLength":49}],47:[function(require,module,exports){
var isArrayLike = require('./isArrayLike'),
    isObjectLike = require('./isObjectLike');

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;

},{"./isArrayLike":46,"./isObjectLike":51}],48:[function(require,module,exports){
var isObject = require('./isObject');

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

module.exports = isFunction;

},{"./isObject":50}],49:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],50:[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],51:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],52:[function(require,module,exports){
var isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

module.exports = isSymbol;

},{"./isObjectLike":51}],53:[function(require,module,exports){
var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeys = require('./_baseKeys'),
    isArrayLike = require('./isArrayLike');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;

},{"./_arrayLikeKeys":36,"./_baseKeys":37,"./isArrayLike":46}],54:[function(require,module,exports){
/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = noop;

},{}],55:[function(require,module,exports){
var baseRest = require('./_baseRest'),
    toInteger = require('./toInteger');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as
 * an array.
 *
 * **Note:** This method is based on the
 * [rest parameter](https://mdn.io/rest_parameters).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.rest(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function rest(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = start === undefined ? start : toInteger(start);
  return baseRest(func, start);
}

module.exports = rest;

},{"./_baseRest":38,"./toInteger":57}],56:[function(require,module,exports){
var toNumber = require('./toNumber');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

module.exports = toFinite;

},{"./toNumber":58}],57:[function(require,module,exports){
var toFinite = require('./toFinite');

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

module.exports = toInteger;

},{"./toFinite":56}],58:[function(require,module,exports){
var isObject = require('./isObject'),
    isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;

},{"./isObject":50,"./isSymbol":52}],59:[function(require,module,exports){
'use strict';
/* eslint-disable no-unused-vars */
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (e) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],60:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":61}],61:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
    try {
        cachedSetTimeout = setTimeout;
    } catch (e) {
        cachedSetTimeout = function () {
            throw new Error('setTimeout is not defined');
        }
    }
    try {
        cachedClearTimeout = clearTimeout;
    } catch (e) {
        cachedClearTimeout = function () {
            throw new Error('clearTimeout is not defined');
        }
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],62:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],63:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],64:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],65:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":63,"./encode":64}],66:[function(require,module,exports){
'use strict';

var asyncQueue      = require('async/queue');
var asyncEachSeries = require('async/eachSeries');
var urlParser       = require('url');
var Resource        = require('./Resource');
var EventEmitter    = require('eventemitter3');

// some constants
var DEFAULT_CONCURRENCY = 10;
var MAX_PROGRESS = 100;

/**
 * Manages the state and loading of multiple resources to load.
 *
 * @class
 * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
 * @param {number} [concurrency=10] - The number of resources to load concurrently.
 */
function Loader(baseUrl, concurrency) {
    EventEmitter.call(this);

    concurrency = concurrency || DEFAULT_CONCURRENCY;

    /**
     * The base url for all resources loaded by this loader.
     *
     * @member {string}
     */
    this.baseUrl = baseUrl || '';

    /**
     * The progress percent of the loader going through the queue.
     *
     * @member {number}
     */
    this.progress = 0;

    /**
     * Loading state of the loader, true if it is currently loading resources.
     *
     * @member {boolean}
     */
    this.loading = false;

    /**
     * The percentage of total progress that a single resource represents.
     *
     * @member {number}
     */
    this._progressChunk = 0;

    /**
     * The middleware to run before loading each resource.
     *
     * @member {function[]}
     */
    this._beforeMiddleware = [];

    /**
     * The middleware to run after loading each resource.
     *
     * @member {function[]}
     */
    this._afterMiddleware = [];

    /**
     * The `_loadResource` function bound with this object context.
     *
     * @private
     * @member {function}
     */
    this._boundLoadResource = this._loadResource.bind(this);

    /**
     * The resource buffer that fills until `load` is called to start loading resources.
     *
     * @private
     * @member {Resource[]}
     */
    this._buffer = [];

    /**
     * Used to track load completion.
     *
     * @private
     * @member {number}
     */
    this._numToLoad = 0;

    /**
     * The resources waiting to be loaded.
     *
     * @private
     * @member {Resource[]}
     */
    this._queue = asyncQueue(this._boundLoadResource, concurrency);

    /**
     * All the resources for this loader keyed by name.
     *
     * @member {object<string, Resource>}
     */
    this.resources = {};

    /**
     * Emitted once per loaded or errored resource.
     *
     * @event progress
     * @memberof Loader#
     */

    /**
     * Emitted once per errored resource.
     *
     * @event error
     * @memberof Loader#
     */

    /**
     * Emitted once per loaded resource.
     *
     * @event load
     * @memberof Loader#
     */

    /**
     * Emitted when the loader begins to process the queue.
     *
     * @event start
     * @memberof Loader#
     */

    /**
     * Emitted when the queued resources all load.
     *
     * @event complete
     * @memberof Loader#
     */
}

Loader.prototype = Object.create(EventEmitter.prototype);
Loader.prototype.constructor = Loader;
module.exports = Loader;

/**
 * Adds a resource (or multiple resources) to the loader queue.
 *
 * This function can take a wide variety of different parameters. The only thing that is always
 * required the url to load. All the following will work:
 *
 * ```js
 * loader
 *     // normal param syntax
 *     .add('key', 'http://...', function () {})
 *     .add('http://...', function () {})
 *     .add('http://...')
 *
 *     // object syntax
 *     .add({
 *         name: 'key2',
 *         url: 'http://...'
 *     }, function () {})
 *     .add({
 *         url: 'http://...'
 *     }, function () {})
 *     .add({
 *         name: 'key3',
 *         url: 'http://...'
 *         onComplete: function () {}
 *     })
 *     .add({
 *         url: 'https://...',
 *         onComplete: function () {},
 *         crossOrigin: true
 *     })
 *
 *     // you can also pass an array of objects or urls or both
 *     .add([
 *         { name: 'key4', url: 'http://...', onComplete: function () {} },
 *         { url: 'http://...', onComplete: function () {} },
 *         'http://...'
 *     ])
 *
 *     // and you can use both params and options
 *     .add('key', 'http://...', { crossOrigin: true }, function () {})
 *     .add('http://...', { crossOrigin: true }, function () {});
 * ```
 *
 * @alias enqueue
 * @param {string} [name] - The name of the resource to load, if not passed the url is used.
 * @param {string} [url] - The url for this resource, relative to the baseUrl of this loader.
 * @param {object} [options] - The options for the load.
 * @param {boolean} [options.crossOrigin] - Is this request cross-origin? Default is to determine automatically.
 * @param {Resource.XHR_LOAD_TYPE} [options.loadType=Resource.LOAD_TYPE.XHR] - How should this resource be loaded?
 * @param {Resource.XHR_RESPONSE_TYPE} [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] - How should the data being
 *      loaded be interpreted when using XHR?
 * @param {function} [cb] - Function to call when this specific resource completes loading.
 * @return {Loader} Returns itself.
 */
Loader.prototype.add = Loader.prototype.enqueue = function (name, url, options, cb) {
    // special case of an array of objects or urls
    if (Array.isArray(name)) {
        for (var i = 0; i < name.length; ++i) {
            this.add(name[i]);
        }

        return this;
    }

    // if an object is passed instead of params
    if (typeof name === 'object') {
        cb = url || name.callback || name.onComplete;
        options = name;
        url = name.url;
        name = name.name || name.key || name.url;
    }

    // case where no name is passed shift all args over by one.
    if (typeof url !== 'string') {
        cb = options;
        options = url;
        url = name;
    }

    // now that we shifted make sure we have a proper url.
    if (typeof url !== 'string') {
        throw new Error('No url passed to add resource to loader.');
    }

    // options are optional so people might pass a function and no options
    if (typeof options === 'function') {
        cb = options;
        options = null;
    }

    // check if resource already exists.
    if (this.resources[name]) {
        throw new Error('Resource with name "' + name + '" already exists.');
    }

    // add base url if this isn't an absolute url
    url = this._prepareUrl(url);

    // create the store the resource
    this.resources[name] = new Resource(name, url, options);

    if (typeof cb === 'function') {
        this.resources[name].once('afterMiddleware', cb);
    }

    this._numToLoad++;

    // if already loading add it to the worker queue
    if (this._queue.started) {
        this._queue.push(this.resources[name]);
        this._progressChunk = (MAX_PROGRESS - this.progress) / (this._queue.length() + this._queue.running());
    }
    // otherwise buffer it to be added to the queue later
    else {
        this._buffer.push(this.resources[name]);
        this._progressChunk = MAX_PROGRESS / this._buffer.length;
    }

    return this;
};

/**
 * Sets up a middleware function that will run *before* the
 * resource is loaded.
 *
 * @alias pre
 * @method before
 * @param {function} fn - The middleware function to register.
 * @return {Loader} Returns itself.
 */
Loader.prototype.before = Loader.prototype.pre = function (fn) {
    this._beforeMiddleware.push(fn);

    return this;
};

/**
 * Sets up a middleware function that will run *after* the
 * resource is loaded.
 *
 * @alias use
 * @method after
 * @param {function} fn - The middleware function to register.
 * @return {Loader} Returns itself.
 */
Loader.prototype.after = Loader.prototype.use = function (fn) {
    this._afterMiddleware.push(fn);

    return this;
};

/**
 * Resets the queue of the loader to prepare for a new load.
 *
 * @return {Loader} Returns itself.
 */
Loader.prototype.reset = function () {
    // this.baseUrl = baseUrl || '';

    this.progress = 0;

    this.loading = false;

    this._progressChunk = 0;

    // this._beforeMiddleware.length = 0;
    // this._afterMiddleware.length = 0;

    this._buffer.length = 0;

    this._numToLoad = 0;

    this._queue.kill();
    this._queue.started = false;

    // abort all resource loads
    for (var k in this.resources) {
        var res = this.resources[k];

        res.off('complete', this._onLoad, this);

        if (res.isLoading) {
            res.abort();
        }
    }

    this.resources = {};

    return this;
};

/**
 * Starts loading the queued resources.
 *
 * @fires start
 * @param {function} [cb] - Optional callback that will be bound to the `complete` event.
 * @return {Loader} Returns itself.
 */
Loader.prototype.load = function (cb) {
    // register complete callback if they pass one
    if (typeof cb === 'function') {
        this.once('complete', cb);
    }

    // if the queue has already started we are done here
    if (this._queue.started) {
        return this;
    }

    // notify of start
    this.emit('start', this);

    // update loading state
    this.loading = true;

    // start the internal queue
    for (var i = 0; i < this._buffer.length; ++i) {
        this._queue.push(this._buffer[i]);
    }

    // empty the buffer
    this._buffer.length = 0;

    return this;
};

/**
 * Prepares a url for usage based on the configuration of this object
 *
 * @private
 * @param {string} url - The url to prepare.
 * @return {string} The prepared url.
 */
Loader.prototype._prepareUrl = function (url) {
    var parsedUrl = urlParser.parse(url);

    // absolute url, just use it as is.
    if (parsedUrl.protocol || !parsedUrl.pathname || parsedUrl.pathname.indexOf('//') === 0) {
        return url;
    }

    // if baseUrl doesn't end in slash and url doesn't start with slash, then add a slash inbetween
    if (this.baseUrl.length
        && this.baseUrl.lastIndexOf('/') !== this.baseUrl.length - 1
        && url.charAt(0) !== '/'
    ) {
        return this.baseUrl + '/' + url;
    }

    return this.baseUrl + url;
};

/**
 * Loads a single resource.
 *
 * @private
 * @param {Resource} resource - The resource to load.
 * @param {function} dequeue - The function to call when we need to dequeue this item.
 */
Loader.prototype._loadResource = function (resource, dequeue) {
    var self = this;

    resource._dequeue = dequeue;

    // run before middleware
    asyncEachSeries(
        this._beforeMiddleware,
        function (fn, next) {
            fn.call(self, resource, function () {
                // if the before middleware marks the resource as complete,
                // break and don't process any more before middleware
                next(resource.isComplete ? {} : null);
            });
        },
        function () {
            // resource.on('progress', self.emit.bind(self, 'progress'));

            if (resource.isComplete) {
                self._onLoad(resource);
            }
            else {
                resource.once('complete', self._onLoad, self);
                resource.load();
            }
        }
    );
};

/**
 * Called once each resource has loaded.
 *
 * @fires complete
 * @private
 */
Loader.prototype._onComplete = function () {
    this.loading = false;

    this.emit('complete', this, this.resources);
};

/**
 * Called each time a resources is loaded.
 *
 * @fires progress
 * @fires error
 * @fires load
 * @private
 * @param {Resource} resource - The resource that was loaded
 */
Loader.prototype._onLoad = function (resource) {
    var self = this;

    // run middleware, this *must* happen before dequeue so sub-assets get added properly
    asyncEachSeries(
        this._afterMiddleware,
        function (fn, next) {
            fn.call(self, resource, next);
        },
        function () {
            resource.emit('afterMiddleware', resource);

            self._numToLoad--;

            self.progress += self._progressChunk;
            self.emit('progress', self, resource);

            if (resource.error) {
                self.emit('error', resource.error, self, resource);
            }
            else {
                self.emit('load', self, resource);
            }

            // do completion check
            if (self._numToLoad === 0) {
                self.progress = 100;
                self._onComplete();
            }
        }
    );

    // remove this resource from the async queue
    resource._dequeue();
};

Loader.LOAD_TYPE = Resource.LOAD_TYPE;
Loader.XHR_RESPONSE_TYPE = Resource.XHR_RESPONSE_TYPE;

},{"./Resource":67,"async/eachSeries":18,"async/queue":29,"eventemitter3":32,"url":72}],67:[function(require,module,exports){
'use strict';

var EventEmitter    = require('eventemitter3');
var _url            = require('url');

// tests is CORS is supported in XHR, if not we need to use XDR
var useXdr = !!(window.XDomainRequest && !('withCredentials' in (new XMLHttpRequest())));
var tempAnchor = null;

// some status constants
var STATUS_NONE = 0;
var STATUS_OK = 200;
var STATUS_EMPTY = 204;

/**
 * Manages the state and loading of a single resource represented by
 * a single URL.
 *
 * @class
 * @param {string} name - The name of the resource to load.
 * @param {string|string[]} url - The url for this resource, for audio/video loads you can pass an array of sources.
 * @param {object} [options] - The options for the load.
 * @param {string|boolean} [options.crossOrigin] - Is this request cross-origin? Default is to determine automatically.
 * @param {Resource.LOAD_TYPE} [options.loadType=Resource.LOAD_TYPE.XHR] - How should this resource be loaded?
 * @param {Resource.XHR_RESPONSE_TYPE} [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] - How should the data being
 *      loaded be interpreted when using XHR?
 * @param {object} [options.metadata] - Extra info for middleware.
 */
function Resource(name, url, options) {
    EventEmitter.call(this);

    options = options || {};

    if (typeof name !== 'string' || typeof url !== 'string') {
        throw new Error('Both name and url are required for constructing a resource.');
    }

    /**
     * The name of this resource.
     *
     * @member {string}
     * @readonly
     */
    this.name = name;

    /**
     * The url used to load this resource.
     *
     * @member {string}
     * @readonly
     */
    this.url = url;

    /**
     * Stores whether or not this url is a data url.
     *
     * @member {boolean}
     * @readonly
     */
    this.isDataUrl = this.url.indexOf('data:') === 0;

    /**
     * The data that was loaded by the resource.
     *
     * @member {any}
     */
    this.data = null;

    /**
     * Is this request cross-origin? If unset, determined automatically.
     *
     * @member {string}
     */
    this.crossOrigin = options.crossOrigin === true ? 'anonymous' : options.crossOrigin;

    /**
     * The method of loading to use for this resource.
     *
     * @member {Resource.LOAD_TYPE}
     */
    this.loadType = options.loadType || this._determineLoadType();

    /**
     * The type used to load the resource via XHR. If unset, determined automatically.
     *
     * @member {string}
     */
    this.xhrType = options.xhrType;

    /**
     * Extra info for middleware, and controlling specifics about how the resource loads.
     *
     * Note that if you pass in a `loadElement`, the Resource class takes ownership of it.
     * Meaning it will modify it as it sees fit.
     *
     * @member {object}
     * @property {HTMLImageElement|HTMLAudioElement|HTMLVideoElement} [loadElement=null] - The
     *  element to use for loading, instead of creating one.
     * @property {boolean} [skipSource=false] - Skips adding source(s) to the load element. This
     *  is useful if you want to pass in a `loadElement` that you already added load sources
     *  to.
     */
    this.metadata = options.metadata || {};

    /**
     * The error that occurred while loading (if any).
     *
     * @member {Error}
     * @readonly
     */
    this.error = null;

    /**
     * The XHR object that was used to load this resource. This is only set
     * when `loadType` is `Resource.LOAD_TYPE.XHR`.
     *
     * @member {XMLHttpRequest}
     */
    this.xhr = null;

    /**
     * Describes if this resource was loaded as json. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isJson = false;

    /**
     * Describes if this resource was loaded as xml. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isXml = false;

    /**
     * Describes if this resource was loaded as an image tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isImage = false;

    /**
     * Describes if this resource was loaded as an audio tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isAudio = false;

    /**
     * Describes if this resource was loaded as a video tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isVideo = false;

    /**
     * Describes if this resource has finished loading. Is true when the resource has completely
     * loaded.
     *
     * @member {boolean}
     */
    this.isComplete = false;

    /**
     * Describes if this resource is currently loading. Is true when the resource starts loading,
     * and is false again when complete.
     *
     * @member {boolean}
     */
    this.isLoading = false;

    /**
     * The `dequeue` method that will be used a storage place for the async queue dequeue method
     * used privately by the loader.
     *
     * @private
     * @member {function}
     */
    this._dequeue = null;

    /**
     * The `complete` function bound to this resource's context.
     *
     * @private
     * @member {function}
     */
    this._boundComplete = this.complete.bind(this);

    /**
     * The `_onError` function bound to this resource's context.
     *
     * @private
     * @member {function}
     */
    this._boundOnError = this._onError.bind(this);

    /**
     * The `_onProgress` function bound to this resource's context.
     *
     * @private
     * @member {function}
     */
    this._boundOnProgress = this._onProgress.bind(this);

    // xhr callbacks
    this._boundXhrOnError = this._xhrOnError.bind(this);
    this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
    this._boundXhrOnLoad = this._xhrOnLoad.bind(this);
    this._boundXdrOnTimeout = this._xdrOnTimeout.bind(this);

    /**
     * Emitted when the resource beings to load.
     *
     * @event start
     * @memberof Resource#
     */

    /**
     * Emitted each time progress of this resource load updates.
     * Not all resources types and loader systems can support this event
     * so sometimes it may not be available. If the resource
     * is being loaded on a modern browser, using XHR, and the remote server
     * properly sets Content-Length headers, then this will be available.
     *
     * @event progress
     * @memberof Resource#
     */

    /**
     * Emitted once this resource has loaded, if there was an error it will
     * be in the `error` property.
     *
     * @event complete
     * @memberof Resource#
     */
}

Resource.prototype = Object.create(EventEmitter.prototype);
Resource.prototype.constructor = Resource;
module.exports = Resource;

/**
 * Marks the resource as complete.
 *
 * @fires complete
 */
Resource.prototype.complete = function () {
    // TODO: Clean this up in a wrapper or something...gross....
    if (this.data && this.data.removeEventListener) {
        this.data.removeEventListener('error', this._boundOnError, false);
        this.data.removeEventListener('load', this._boundComplete, false);
        this.data.removeEventListener('progress', this._boundOnProgress, false);
        this.data.removeEventListener('canplaythrough', this._boundComplete, false);
    }

    if (this.xhr) {
        if (this.xhr.removeEventListener) {
            this.xhr.removeEventListener('error', this._boundXhrOnError, false);
            this.xhr.removeEventListener('abort', this._boundXhrOnAbort, false);
            this.xhr.removeEventListener('progress', this._boundOnProgress, false);
            this.xhr.removeEventListener('load', this._boundXhrOnLoad, false);
        }
        else {
            this.xhr.onerror = null;
            this.xhr.ontimeout = null;
            this.xhr.onprogress = null;
            this.xhr.onload = null;
        }
    }

    if (this.isComplete) {
        throw new Error('Complete called again for an already completed resource.');
    }

    this.isComplete = true;
    this.isLoading = false;

    this.emit('complete', this);
};

/**
 * Aborts the loading of this resource, with an optional message.
 *
 * @param {string} message - The message to use for the error
 */
Resource.prototype.abort = function (message) {
    // abort can be called multiple times, ignore subsequent calls.
    if (this.error) {
        return;
    }

    // store error
    this.error = new Error(message);

    // abort the actual loading
    if (this.xhr) {
        this.xhr.abort();
    }
    else if (this.xdr) {
        this.xdr.abort();
    }
    else if (this.data) {
        // single source
        if (typeof this.data.src !== 'undefined') {
            this.data.src = '';
        }
        // multi-source
        else {
            while (this.data.firstChild) {
                this.data.removeChild(this.data.firstChild);
            }
        }
    }

    // done now.
    this.complete();
};

/**
 * Kicks off loading of this resource. This method is asynchronous.
 *
 * @fires start
 * @param {function} [cb] - Optional callback to call once the resource is loaded.
 */
Resource.prototype.load = function (cb) {
    if (this.isLoading) {
        return;
    }

    if (this.isComplete) {
        if (cb) {
            var self = this;

            setTimeout(function () {
                cb(self);
            }, 1);
        }

        return;
    }
    else if (cb) {
        this.once('complete', cb);
    }

    this.isLoading = true;

    this.emit('start', this);

    // if unset, determine the value
    if (this.crossOrigin === false || typeof this.crossOrigin !== 'string') {
        this.crossOrigin = this._determineCrossOrigin(this.url);
    }

    switch (this.loadType) {
        case Resource.LOAD_TYPE.IMAGE:
            this._loadElement('image');
            break;

        case Resource.LOAD_TYPE.AUDIO:
            this._loadSourceElement('audio');
            break;

        case Resource.LOAD_TYPE.VIDEO:
            this._loadSourceElement('video');
            break;

        case Resource.LOAD_TYPE.XHR:
            /* falls through */
        default:
            if (useXdr && this.crossOrigin) {
                this._loadXdr();
            }
            else {
                this._loadXhr();
            }
            break;
    }
};

/**
 * Loads this resources using an element that has a single source,
 * like an HTMLImageElement.
 *
 * @private
 * @param {string} type - The type of element to use.
 */
Resource.prototype._loadElement = function (type) {
    if (this.metadata.loadElement) {
        this.data = this.metadata.loadElement;
    }
    else if (type === 'image' && typeof window.Image !== 'undefined') {
        this.data = new Image();
    }
    else {
        this.data = document.createElement(type);
    }

    if (this.crossOrigin) {
        this.data.crossOrigin = this.crossOrigin;
    }

    if (!this.metadata.skipSource) {
        this.data.src = this.url;
    }

    var typeName = 'is' + type[0].toUpperCase() + type.substring(1);

    if (this[typeName] === false) {
        this[typeName] = true;
    }

    this.data.addEventListener('error', this._boundOnError, false);
    this.data.addEventListener('load', this._boundComplete, false);
    this.data.addEventListener('progress', this._boundOnProgress, false);
};

/**
 * Loads this resources using an element that has multiple sources,
 * like an HTMLAudioElement or HTMLVideoElement.
 *
 * @private
 * @param {string} type - The type of element to use.
 */
Resource.prototype._loadSourceElement = function (type) {
    if (this.metadata.loadElement) {
        this.data = this.metadata.loadElement;
    }
    else if (type === 'audio' && typeof window.Audio !== 'undefined') {
        this.data = new Audio();
    }
    else {
        this.data = document.createElement(type);
    }

    if (this.data === null) {
        this.abort('Unsupported element ' + type);

        return;
    }

    if (!this.metadata.skipSource) {
        // support for CocoonJS Canvas+ runtime, lacks document.createElement('source')
        if (navigator.isCocoonJS) {
            this.data.src = Array.isArray(this.url) ? this.url[0] : this.url;
        }
        else if (Array.isArray(this.url)) {
            for (var i = 0; i < this.url.length; ++i) {
                this.data.appendChild(this._createSource(type, this.url[i]));
            }
        }
        else {
            this.data.appendChild(this._createSource(type, this.url));
        }
    }

    this['is' + type[0].toUpperCase() + type.substring(1)] = true;

    this.data.addEventListener('error', this._boundOnError, false);
    this.data.addEventListener('load', this._boundComplete, false);
    this.data.addEventListener('progress', this._boundOnProgress, false);
    this.data.addEventListener('canplaythrough', this._boundComplete, false);

    this.data.load();
};

/**
 * Loads this resources using an XMLHttpRequest.
 *
 * @private
 */
Resource.prototype._loadXhr = function () {
    // if unset, determine the value
    if (typeof this.xhrType !== 'string') {
        this.xhrType = this._determineXhrType();
    }

    var xhr = this.xhr = new XMLHttpRequest();

    // set the request type and url
    xhr.open('GET', this.url, true);

    // load json as text and parse it ourselves. We do this because some browsers
    // *cough* safari *cough* can't deal with it.
    if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON || this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
        xhr.responseType = Resource.XHR_RESPONSE_TYPE.TEXT;
    }
    else {
        xhr.responseType = this.xhrType;
    }

    xhr.addEventListener('error', this._boundXhrOnError, false);
    xhr.addEventListener('abort', this._boundXhrOnAbort, false);
    xhr.addEventListener('progress', this._boundOnProgress, false);
    xhr.addEventListener('load', this._boundXhrOnLoad, false);

    xhr.send();
};

/**
 * Loads this resources using an XDomainRequest. This is here because we need to support IE9 (gross).
 *
 * @private
 */
Resource.prototype._loadXdr = function () {
    // if unset, determine the value
    if (typeof this.xhrType !== 'string') {
        this.xhrType = this._determineXhrType();
    }

    var xdr = this.xhr = new XDomainRequest();

    // XDomainRequest has a few quirks. Occasionally it will abort requests
    // A way to avoid this is to make sure ALL callbacks are set even if not used
    // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
    xdr.timeout = 5000;

    xdr.onerror = this._boundXhrOnError;
    xdr.ontimeout = this._boundXdrOnTimeout;
    xdr.onprogress = this._boundOnProgress;
    xdr.onload = this._boundXhrOnLoad;

    xdr.open('GET', this.url, true);

    // Note: The xdr.send() call is wrapped in a timeout to prevent an
    // issue with the interface where some requests are lost if multiple
    // XDomainRequests are being sent at the same time.
    // Some info here: https://github.com/photonstorm/phaser/issues/1248
    setTimeout(function () {
        xdr.send();
    }, 0);
};

/**
 * Creates a source used in loading via an element.
 *
 * @private
 * @param {string} type - The element type (video or audio).
 * @param {string} url - The source URL to load from.
 * @param {string} [mime] - The mime type of the video
 * @return {HTMLSourceElement} The source element.
 */
Resource.prototype._createSource = function (type, url, mime) {
    if (!mime) {
        mime = type + '/' + url.substr(url.lastIndexOf('.') + 1);
    }

    var source = document.createElement('source');

    source.src = url;
    source.type = mime;

    return source;
};

/**
 * Called if a load errors out.
 *
 * @param {Event} event - The error event from the element that emits it.
 * @private
 */
Resource.prototype._onError = function (event) {
    this.abort('Failed to load element using ' + event.target.nodeName);
};

/**
 * Called if a load progress event fires for xhr/xdr.
 *
 * @fires progress
 * @private
 * @param {XMLHttpRequestProgressEvent|Event} event - Progress event.
 */
Resource.prototype._onProgress = function (event) {
    if (event && event.lengthComputable) {
        this.emit('progress', this, event.loaded / event.total);
    }
};

/**
 * Called if an error event fires for xhr/xdr.
 *
 * @private
 * @param {XMLHttpRequestErrorEvent|Event} event - Error event.
 */
Resource.prototype._xhrOnError = function () {
    var xhr = this.xhr;

    this.abort(reqType(xhr) + ' Request failed. Status: ' + xhr.status + ', text: "' + xhr.statusText + '"');
};

/**
 * Called if an abort event fires for xhr.
 *
 * @private
 * @param {XMLHttpRequestAbortEvent} event - Abort Event
 */
Resource.prototype._xhrOnAbort = function () {
    this.abort(reqType(this.xhr) + ' Request was aborted by the user.');
};

/**
 * Called if a timeout event fires for xdr.
 *
 * @private
 * @param {Event} event - Timeout event.
 */
Resource.prototype._xdrOnTimeout = function () {
    this.abort(reqType(this.xhr) + ' Request timed out.');
};

/**
 * Called when data successfully loads from an xhr/xdr request.
 *
 * @private
 * @param {XMLHttpRequestLoadEvent|Event} event - Load event
 */
Resource.prototype._xhrOnLoad = function () {
    var xhr = this.xhr;
    var status = typeof xhr.status === 'undefined' ? xhr.status : STATUS_OK; // XDR has no `.status`, assume 200.

    // status can be 0 when using the file:// protocol, also check if a response was found
    if (status === STATUS_OK || status === STATUS_EMPTY || (status === STATUS_NONE && xhr.responseText.length > 0)) {
        // if text, just return it
        if (this.xhrType === Resource.XHR_RESPONSE_TYPE.TEXT) {
            this.data = xhr.responseText;
        }
        // if json, parse into json object
        else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON) {
            try {
                this.data = JSON.parse(xhr.responseText);
                this.isJson = true;
            }
            catch (e) {
                this.abort('Error trying to parse loaded json:', e);

                return;
            }
        }
        // if xml, parse into an xml document or div element
        else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
            try {
                if (window.DOMParser) {
                    var domparser = new DOMParser();

                    this.data = domparser.parseFromString(xhr.responseText, 'text/xml');
                }
                else {
                    var div = document.createElement('div');

                    div.innerHTML = xhr.responseText;
                    this.data = div;
                }
                this.isXml = true;
            }
            catch (e) {
                this.abort('Error trying to parse loaded xml:', e);

                return;
            }
        }
        // other types just return the response
        else {
            this.data = xhr.response || xhr.responseText;
        }
    }
    else {
        this.abort('[' + xhr.status + ']' + xhr.statusText + ':' + xhr.responseURL);

        return;
    }

    this.complete();
};

/**
 * Sets the `crossOrigin` property for this resource based on if the url
 * for this resource is cross-origin. If crossOrigin was manually set, this
 * function does nothing.
 *
 * @private
 * @param {string} url - The url to test.
 * @param {object} [loc=window.location] - The location object to test against.
 * @return {string} The crossOrigin value to use (or empty string for none).
 */
Resource.prototype._determineCrossOrigin = function (url, loc) {
    // data: and javascript: urls are considered same-origin
    if (url.indexOf('data:') === 0) {
        return '';
    }

    // default is window.location
    loc = loc || window.location;

    if (!tempAnchor) {
        tempAnchor = document.createElement('a');
    }

    // let the browser determine the full href for the url of this resource and then
    // parse with the node url lib, we can't use the properties of the anchor element
    // because they don't work in IE9 :(
    tempAnchor.href = url;
    url = _url.parse(tempAnchor.href);

    var samePort = (!url.port && loc.port === '') || (url.port === loc.port);

    // if cross origin
    if (url.hostname !== loc.hostname || !samePort || url.protocol !== loc.protocol) {
        return 'anonymous';
    }

    return '';
};

/**
 * Determines the responseType of an XHR request based on the extension of the
 * resource being loaded.
 *
 * @private
 * @return {Resource.XHR_RESPONSE_TYPE} The responseType to use.
 */
Resource.prototype._determineXhrType = function () {
    return Resource._xhrTypeMap[this._getExtension()] || Resource.XHR_RESPONSE_TYPE.TEXT;
};

Resource.prototype._determineLoadType = function () {
    return Resource._loadTypeMap[this._getExtension()] || Resource.LOAD_TYPE.XHR;
};

Resource.prototype._getExtension = function () {
    var url = this.url;
    var ext = '';

    if (this.isDataUrl) {
        var slashIndex = url.indexOf('/');

        ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
    }
    else {
        var queryStart = url.indexOf('?');

        if (queryStart !== -1) {
            url = url.substring(0, queryStart);
        }

        ext = url.substring(url.lastIndexOf('.') + 1);
    }

    return ext.toLowerCase();
};

/**
 * Determines the mime type of an XHR request based on the responseType of
 * resource being loaded.
 *
 * @private
 * @param {Resource.XHR_RESPONSE_TYPE} type - The type to get a mime type for.
 * @return {string} The mime type to use.
 */
Resource.prototype._getMimeFromXhrType = function (type) {
    switch (type) {
        case Resource.XHR_RESPONSE_TYPE.BUFFER:
            return 'application/octet-binary';

        case Resource.XHR_RESPONSE_TYPE.BLOB:
            return 'application/blob';

        case Resource.XHR_RESPONSE_TYPE.DOCUMENT:
            return 'application/xml';

        case Resource.XHR_RESPONSE_TYPE.JSON:
            return 'application/json';

        case Resource.XHR_RESPONSE_TYPE.DEFAULT:
        case Resource.XHR_RESPONSE_TYPE.TEXT:
            /* falls through */
        default:
            return 'text/plain';

    }
};

/**
 * Quick helper to get string xhr type.
 *
 * @ignore
 * @param {XMLHttpRequest|XDomainRequest} xhr - The request to check.
 * @return {string} The type.
 */
function reqType(xhr) {
    return xhr.toString().replace('object ', '');
}

/**
 * The types of loading a resource can use.
 *
 * @static
 * @readonly
 * @enum {number}
 */
Resource.LOAD_TYPE = {
    /** Uses XMLHttpRequest to load the resource. */
    XHR:    1,
    /** Uses an `Image` object to load the resource. */
    IMAGE:  2,
    /** Uses an `Audio` object to load the resource. */
    AUDIO:  3,
    /** Uses a `Video` object to load the resource. */
    VIDEO:  4
};

/**
 * The XHR ready states, used internally.
 *
 * @static
 * @readonly
 * @enum {string}
 */
Resource.XHR_RESPONSE_TYPE = {
    /** defaults to text */
    DEFAULT:    'text',
    /** ArrayBuffer */
    BUFFER:     'arraybuffer',
    /** Blob */
    BLOB:       'blob',
    /** Document */
    DOCUMENT:   'document',
    /** Object */
    JSON:       'json',
    /** String */
    TEXT:       'text'
};

Resource._loadTypeMap = {
    gif:      Resource.LOAD_TYPE.IMAGE,
    png:      Resource.LOAD_TYPE.IMAGE,
    bmp:      Resource.LOAD_TYPE.IMAGE,
    jpg:      Resource.LOAD_TYPE.IMAGE,
    jpeg:     Resource.LOAD_TYPE.IMAGE,
    tif:      Resource.LOAD_TYPE.IMAGE,
    tiff:     Resource.LOAD_TYPE.IMAGE,
    webp:     Resource.LOAD_TYPE.IMAGE,
    tga:      Resource.LOAD_TYPE.IMAGE,
    'svg+xml':  Resource.LOAD_TYPE.IMAGE
};

Resource._xhrTypeMap = {
    // xml
    xhtml:    Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    html:     Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    htm:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    xml:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    tmx:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    tsx:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    svg:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,

    // images
    gif:      Resource.XHR_RESPONSE_TYPE.BLOB,
    png:      Resource.XHR_RESPONSE_TYPE.BLOB,
    bmp:      Resource.XHR_RESPONSE_TYPE.BLOB,
    jpg:      Resource.XHR_RESPONSE_TYPE.BLOB,
    jpeg:     Resource.XHR_RESPONSE_TYPE.BLOB,
    tif:      Resource.XHR_RESPONSE_TYPE.BLOB,
    tiff:     Resource.XHR_RESPONSE_TYPE.BLOB,
    webp:     Resource.XHR_RESPONSE_TYPE.BLOB,
    tga:      Resource.XHR_RESPONSE_TYPE.BLOB,

    // json
    json:     Resource.XHR_RESPONSE_TYPE.JSON,

    // text
    text:     Resource.XHR_RESPONSE_TYPE.TEXT,
    txt:      Resource.XHR_RESPONSE_TYPE.TEXT
};

/**
 * Sets the load type to be used for a specific extension.
 *
 * @static
 * @param {string} extname - The extension to set the type for, e.g. "png" or "fnt"
 * @param {Resource.LOAD_TYPE} loadType - The load type to set it to.
 */
Resource.setExtensionLoadType = function (extname, loadType) {
    setExtMap(Resource._loadTypeMap, extname, loadType);
};

/**
 * Sets the load type to be used for a specific extension.
 *
 * @static
 * @param {string} extname - The extension to set the type for, e.g. "png" or "fnt"
 * @param {Resource.XHR_RESPONSE_TYPE} xhrType - The xhr type to set it to.
 */
Resource.setExtensionXhrType = function (extname, xhrType) {
    setExtMap(Resource._xhrTypeMap, extname, xhrType);
};

function setExtMap(map, extname, val) {
    if (extname && extname.indexOf('.') === 0) {
        extname = extname.substring(1);
    }

    if (!extname) {
        return;
    }

    map[extname] = val;
}

},{"eventemitter3":32,"url":72}],68:[function(require,module,exports){
/* eslint no-magic-numbers: 0 */
'use strict';

module.exports = {
    // private property
    _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encodeBinary: function (input) {
        var output = '';
        var bytebuffer;
        var encodedCharIndexes = new Array(4);
        var inx = 0;
        var jnx = 0;
        var paddingBytes = 0;

        while (inx < input.length) {
            // Fill byte buffer array
            bytebuffer = new Array(3);

            for (jnx = 0; jnx < bytebuffer.length; jnx++) {
                if (inx < input.length) {
                    // throw away high-order byte, as documented at:
                    // https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
                    bytebuffer[jnx] = input.charCodeAt(inx++) & 0xff;
                }
                else {
                    bytebuffer[jnx] = 0;
                }
            }

            // Get each encoded character, 6 bits at a time
            // index 1: first 6 bits
            encodedCharIndexes[0] = bytebuffer[0] >> 2;
            // index 2: second 6 bits (2 least significant bits from input byte 1 + 4 most significant bits from byte 2)
            encodedCharIndexes[1] = ((bytebuffer[0] & 0x3) << 4) | (bytebuffer[1] >> 4);
            // index 3: third 6 bits (4 least significant bits from input byte 2 + 2 most significant bits from byte 3)
            encodedCharIndexes[2] = ((bytebuffer[1] & 0x0f) << 2) | (bytebuffer[2] >> 6);
            // index 3: forth 6 bits (6 least significant bits from input byte 3)
            encodedCharIndexes[3] = bytebuffer[2] & 0x3f;

            // Determine whether padding happened, and adjust accordingly
            paddingBytes = inx - (input.length - 1);
            switch (paddingBytes) {
                case 2:
                    // Set last 2 characters to padding char
                    encodedCharIndexes[3] = 64;
                    encodedCharIndexes[2] = 64;
                    break;

                case 1:
                    // Set last character to padding char
                    encodedCharIndexes[3] = 64;
                    break;

                default:
                    break; // No padding - proceed
            }

            // Now we will grab each appropriate character out of our keystring
            // based on our index array and append it to the output string
            for (jnx = 0; jnx < encodedCharIndexes.length; jnx++) {
                output += this._keyStr.charAt(encodedCharIndexes[jnx]);
            }
        }

        return output;
    }
};

},{}],69:[function(require,module,exports){
/* eslint global-require: 0 */
'use strict';

module.exports = require('./Loader');
module.exports.Resource = require('./Resource');
module.exports.middleware = {
    caching: {
        memory: require('./middlewares/caching/memory')
    },
    parsing: {
        blob: require('./middlewares/parsing/blob')
    }
};


},{"./Loader":66,"./Resource":67,"./middlewares/caching/memory":70,"./middlewares/parsing/blob":71}],70:[function(require,module,exports){
'use strict';

// a simple in-memory cache for resources
var cache = {};

module.exports = function () {
    return function (resource, next) {
        // if cached, then set data and complete the resource
        if (cache[resource.url]) {
            resource.data = cache[resource.url];
            resource.complete(); // marks resource load complete and stops processing before middlewares
        }
        // if not cached, wait for complete and store it in the cache.
        else {
            resource.once('complete', function () {
                cache[this.url] = this.data;
            });
        }

        next();
    };
};

},{}],71:[function(require,module,exports){
'use strict';

var Resource = require('../../Resource');
var b64 = require('../../b64');

var Url = window.URL || window.webkitURL;

// a middleware for transforming XHR loaded Blobs into more useful objects

module.exports = function () {
    return function (resource, next) {
        if (!resource.data) {
            next();

            return;
        }

        // if this was an XHR load of a blob
        if (resource.xhr && resource.xhrType === Resource.XHR_RESPONSE_TYPE.BLOB) {
            // if there is no blob support we probably got a binary string back
            if (!window.Blob || typeof resource.data === 'string') {
                var type = resource.xhr.getResponseHeader('content-type');

                // this is an image, convert the binary string into a data url
                if (type && type.indexOf('image') === 0) {
                    resource.data = new Image();
                    resource.data.src = 'data:' + type + ';base64,' + b64.encodeBinary(resource.xhr.responseText);

                    resource.isImage = true;

                    // wait until the image loads and then callback
                    resource.data.onload = function () {
                        resource.data.onload = null;

                        next();
                    };

                    // next will be called on load
                    return;
                }
            }
            // if content type says this is an image, then we should transform the blob into an Image object
            else if (resource.data.type.indexOf('image') === 0) {
                var src = Url.createObjectURL(resource.data);

                resource.blob = resource.data;
                resource.data = new Image();
                resource.data.src = src;

                resource.isImage = true;

                // cleanup the no longer used blob after the image loads
                resource.data.onload = function () {
                    Url.revokeObjectURL(src);
                    resource.data.onload = null;

                    next();
                };

                // next will be called on load.
                return;
            }
        }

        next();
    };
};

},{"../../Resource":67,"../../b64":68}],72:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":73,"punycode":62,"querystring":65}],73:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],74:[function(require,module,exports){
var core = require('../core');
var  Device = require('ismobilejs');

// add some extra variables to the container..
Object.assign(
    core.DisplayObject.prototype,
    require('./accessibleTarget')
);


/**
 * The Accessibility manager reacreates the ability to tab and and have content read by screen readers. This is very important as it can possibly help people with disabilities access pixi content.
 * Much like interaction any DisplayObject can be made accessible. This manager will map the events as if the mouse was being used, minimizing the efferot required to implement.
 *
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} A reference to the current renderer
 */
function AccessibilityManager(renderer)
{
	if(Device.tablet || Device.phone)
	{
		this.createTouchHook();
	}

	// first we create a div that will sit over the pixi element. This is where the div overlays will go.
    var div = document.createElement('div');

    div.style.width = 100 + 'px';
    div.style.height = 100 + 'px';
    div.style.position = 'absolute';
    div.style.top = 0;
    div.style.left = 0;
   //
    div.style.zIndex = 2;

   	/**
   	 * This is the dom element that will sit over the pixi element. This is where the div overlays will go.
   	 *
   	 * @type {HTMLElement}
   	 * @private
   	 */
   	this.div = div;

   	/**
   	 * A simple pool for storing divs.
   	 *
   	 * @type {*}
   	 * @private
   	 */
 	this.pool = [];

 	/**
 	 * This is a tick used to check if an object is no longer being rendered.
 	 *
 	 * @type {Number}
 	 * @private
 	 */
   	this.renderId = 0;

   	/**
   	 * Setting this to true will visually show the divs
   	 *
   	 * @type {boolean}
   	 */
   	this.debug = false;

  	/**
     * The renderer this accessibility manager works for.
     *
     * @member {PIXI.SystemRenderer}
     */
   	this.renderer = renderer;

   	/**
     * The array of currently active accessible items.
     *
     * @member {Array<*>}
     * @private
     */
   	this.children = [];

   	/**
     * pre-bind the functions
	 *
 	 * @private
     */
   	this._onKeyDown = this._onKeyDown.bind(this);
   	this._onMouseMove = this._onMouseMove.bind(this);

   	/**
     * stores the state of the manager. If there are no accessible objects or the mouse is moving the will be false.
     *
     * @member {Array<*>}
     * @private
     */
   	this.isActive = false;
   	this.isMobileAccessabillity = false;

   	// let listen for tab.. once pressed we can fire up and show the accessibility layer
   	window.addEventListener('keydown', this._onKeyDown, false);
}


AccessibilityManager.prototype.constructor = AccessibilityManager;
module.exports = AccessibilityManager;

AccessibilityManager.prototype.createTouchHook = function()
{
	var hookDiv = document.createElement('button');
	hookDiv.style.width = 1 + 'px';
    hookDiv.style.height = 1 + 'px';
    hookDiv.style.position = 'absolute';
    hookDiv.style.top = -1000+'px';
    hookDiv.style.left = -1000+'px';
    hookDiv.style.zIndex = 2;
    hookDiv.style.backgroundColor = '#FF0000';
    hookDiv.title = 'HOOK DIV';

    hookDiv.addEventListener('focus', function(){

    	this.isMobileAccessabillity = true;
    	this.activate();
    	document.body.removeChild(hookDiv);

    }.bind(this));

    document.body.appendChild(hookDiv);

};

/**
 * Activating will cause the Accessibility layer to be shown. This is called when a user preses the tab key
 * @private
 */
AccessibilityManager.prototype.activate = function()
{
	if(this.isActive )
	{
		return;
	}

	this.isActive = true;

	window.document.addEventListener('mousemove', this._onMouseMove, true);
	window.removeEventListener('keydown', this._onKeyDown, false);

	this.renderer.on('postrender', this.update, this);

	if(this.renderer.view.parentNode)
	{
		this.renderer.view.parentNode.appendChild(this.div);
	}
};

/**
 * Deactivating will cause the Accessibility layer to be hidden. This is called when a user moves the mouse
 * @private
 */
AccessibilityManager.prototype.deactivate = function()
{

	if(!this.isActive || this.isMobileAccessabillity)
	{
		return;
	}

	this.isActive = false;

	window.document.removeEventListener('mousemove', this._onMouseMove);
	window.addEventListener('keydown', this._onKeyDown, false);

	this.renderer.off('postrender', this.update);

	if(this.div.parentNode)
	{
		this.div.parentNode.removeChild(this.div);
	}

};

/**
 * This recursive function will run throught he scene graph and add any new accessible objects to the DOM layer.
 * @param displayObject {PIXI.Container} the DisplayObject to check.
 * @private
 */
AccessibilityManager.prototype.updateAccessibleObjects = function(displayObject)
{
	if(!displayObject.visible)
	{
		return;
	}

	if(displayObject.accessible && displayObject.interactive)
	{
		if(!displayObject._accessibleActive)
		{
			this.addChild(displayObject);
		}

	   	displayObject.renderId = this.renderId;
	}

	var children = displayObject.children;

	for (var i = children.length - 1; i >= 0; i--) {

		this.updateAccessibleObjects(children[i]);
	}
};


/**
 * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects
 * @private
 */
AccessibilityManager.prototype.update = function()
{
	if(!this.renderer.renderingToScreen) {
    	return;
  	}

	// update children...
	this.updateAccessibleObjects(this.renderer._lastObjectRendered);

	var rect = this.renderer.view.getBoundingClientRect();
	var sx = rect.width  / this.renderer.width;
	var sy = rect.height / this.renderer.height;

	var div = this.div;

	div.style.left = rect.left + 'px';
	div.style.top = rect.top + 'px';
	div.style.width = this.renderer.width + 'px';
	div.style.height = this.renderer.height + 'px';

	for (var i = 0; i < this.children.length; i++)
	{

		var child = this.children[i];

		if(child.renderId !== this.renderId)
		{
			child._accessibleActive = false;

            core.utils.removeItems(this.children, i, 1);
			this.div.removeChild( child._accessibleDiv );
			this.pool.push(child._accessibleDiv);
			child._accessibleDiv = null;

			i--;

			if(this.children.length === 0)
			{
				this.deactivate();
			}
		}
		else
		{
			// map div to display..
			div = child._accessibleDiv;
			var hitArea = child.hitArea;
			var wt = child.worldTransform;

			if(child.hitArea)
			{
				div.style.left = ((wt.tx + (hitArea.x * wt.a)) * sx) + 'px';
				div.style.top =  ((wt.ty + (hitArea.y * wt.d)) * sy) +  'px';

				div.style.width = (hitArea.width * wt.a * sx) + 'px';
				div.style.height = (hitArea.height * wt.d * sy) + 'px';

			}
			else
			{
				hitArea = child.getBounds();

				this.capHitArea(hitArea);

				div.style.left = (hitArea.x * sx) + 'px';
				div.style.top =  (hitArea.y * sy) +  'px';

				div.style.width = (hitArea.width * sx) + 'px';
				div.style.height = (hitArea.height * sy) + 'px';
			}
		}
	}

	// increment the render id..
	this.renderId++;
};

AccessibilityManager.prototype.capHitArea = function (hitArea)
{
    if (hitArea.x < 0)
    {
        hitArea.width += hitArea.x;
        hitArea.x = 0;
    }

    if (hitArea.y < 0)
    {
        hitArea.height += hitArea.y;
        hitArea.y = 0;
    }

    if ( hitArea.x + hitArea.width > this.renderer.width )
    {
        hitArea.width = this.renderer.width - hitArea.x;
    }

    if ( hitArea.y + hitArea.height > this.renderer.height )
    {
        hitArea.height = this.renderer.height - hitArea.y;
    }
};


/**
 * Adds a DisplayObject to the accessibility manager
 * @private
 */
AccessibilityManager.prototype.addChild = function(displayObject)
{
//	this.activate();

	var div = this.pool.pop();

	if(!div)
	{
		div = document.createElement('button');

	    div.style.width = 100 + 'px';
	    div.style.height = 100 + 'px';
	    div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent';
	    div.style.position = 'absolute';
	    div.style.zIndex = 2;
	    div.style.borderStyle = 'none';


	    div.addEventListener('click', this._onClick.bind(this));
	    div.addEventListener('focus', this._onFocus.bind(this));
	    div.addEventListener('focusout', this._onFocusOut.bind(this));
	}


	if(displayObject.accessibleTitle)
	{
		div.title = displayObject.accessibleTitle;
	}
	else if (!displayObject.accessibleTitle && !displayObject.accessibleHint)
	{
		div.title = 'displayObject ' + this.tabIndex;
	}

	if(displayObject.accessibleHint)
	{
		div.setAttribute('aria-label', displayObject.accessibleHint);
	}


	//

	displayObject._accessibleActive = true;
	displayObject._accessibleDiv = div;
	div.displayObject = displayObject;


	this.children.push(displayObject);
	this.div.appendChild( displayObject._accessibleDiv );
	displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
};


/**
 * Maps the div button press to pixi's InteractionManager (click)
 * @private
 */
AccessibilityManager.prototype._onClick = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'click', interactionManager.eventData);
};

/**
 * Maps the div focus events to pixis InteractionManager (mouseover)
 * @private
 */
AccessibilityManager.prototype._onFocus = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'mouseover', interactionManager.eventData);
};

/**
 * Maps the div focus events to pixis InteractionManager (mouseout)
 * @private
 */
AccessibilityManager.prototype._onFocusOut = function(e)
{
	var interactionManager = this.renderer.plugins.interaction;
	interactionManager.dispatchEvent(e.target.displayObject, 'mouseout', interactionManager.eventData);
};

/**
 * Is called when a key is pressed
 *
 * @private
 */
AccessibilityManager.prototype._onKeyDown = function(e)
{
	if(e.keyCode !== 9)
	{
		return;
	}

	this.activate();
};

/**
 * Is called when the mouse moves across the renderer element
 *
 * @private
 */
AccessibilityManager.prototype._onMouseMove = function()
{
	this.deactivate();
};


/**
 * Destroys the accessibility manager
 *
 */
AccessibilityManager.prototype.destroy = function ()
{
	this.div = null;

	for (var i = 0; i < this.children.length; i++)
	{
		this.children[i].div = null;
	}


	window.document.removeEventListener('mousemove', this._onMouseMove);
	window.removeEventListener('keydown', this._onKeyDown);

	this.pool = null;
	this.children = null;
	this.renderer = null;

};

core.WebGLRenderer.registerPlugin('accessibility', AccessibilityManager);
core.CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);

},{"../core":97,"./accessibleTarget":75,"ismobilejs":33}],75:[function(require,module,exports){
/**
 * Default property values of accessible objects
 * used by {@link PIXI.accessibility.AccessibilityManager}.
 *
 * @mixin
 * @memberof PIXI
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          MyObject.prototype,
 *          PIXI.accessibility.accessibleTarget
 *      );
 */
var accessibleTarget = {

    /**
     *  Flag for if the object is accessible. If true AccessibilityManager will overlay a
     *   shadow div with attributes set
     *
     * @member {boolean}
     */
    accessible:false,

    /**
     * Sets the title attribute of the shadow div
     * If accessibleTitle AND accessibleHint has not been this will default to 'displayObject [tabIndex]'
     *
     * @member {string}
     */
    accessibleTitle:null,

    /**
     * Sets the aria-label attribute of the shadow div
     *
     * @member {string}
     */
    accessibleHint:null,

    /**
     * @todo Needs docs.
     */
    tabIndex:0,

    /**
     * @todo Needs docs.
     */
    _accessibleActive:false,

    /**
     * @todo Needs docs.
     */
    _accessibleDiv:false

};

module.exports = accessibleTarget;

},{}],76:[function(require,module,exports){
/**
 * @file        Main export of the PIXI accessibility library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.AccessibilityManager
 */
module.exports = {
    accessibleTarget:     require('./accessibleTarget'),
    AccessibilityManager: require('./AccessibilityManager')
};

},{"./AccessibilityManager":74,"./accessibleTarget":75}],77:[function(require,module,exports){
var GLShader = require('pixi-gl-core').GLShader;
var Const = require('./const');

function checkPrecision(src) {
    if (src instanceof Array) {
        if (src[0].substring(0,9) !== 'precision') {
            var copy = src.slice(0);
            copy.unshift('precision ' + Const.PRECISION.DEFAULT + ' float;');
            return copy;
        }
    } else {
        if (src.substring(0,9) !== 'precision') {
            return 'precision ' + Const.PRECISION.DEFAULT + ' float;\n' + src;
        }
    }
    return src;
}

/**
 * Wrapper class, webGL Shader for Pixi.
 * Adds precision string if vertexSrc or fragmentSrc have no mention of it.
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
 */
var Shader = function(gl, vertexSrc, fragmentSrc) {
    GLShader.call(this, gl, checkPrecision(vertexSrc), checkPrecision(fragmentSrc));
};

Shader.prototype = Object.create(GLShader.prototype);
Shader.prototype.constructor = Shader;
module.exports = Shader;

},{"./const":78,"pixi-gl-core":7}],78:[function(require,module,exports){

/**
 * Constant values used in pixi
 *
 * @lends PIXI
 */
var CONST = {
    /**
     * String of the current PIXI version.
     *
     * @static
     * @constant
     * @type {string}
     */
    VERSION: '4.0.0',

    /**
     * Two Pi.
     *
     * @static
     * @constant
     * @type {number}
     */
    PI_2: Math.PI * 2,

    /**
     * Conversion factor for converting radians to degrees.
     *
     * @static
     * @constant
     * @type {number}
     */
    RAD_TO_DEG: 180 / Math.PI,

    /**
     * Conversion factor for converting degrees to radians.
     *
     * @static
     * @constant
     * @type {number}
     */
    DEG_TO_RAD: Math.PI / 180,

    /**
     * Target frames per millisecond.
     *
     * @static
     * @constant
     * @type {number}
     * @default 0.06
     */
    TARGET_FPMS: 0.06,

    /**
     * Constant to identify the Renderer Type.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} UNKNOWN - Unknown render type.
     * @property {number} WEBGL - WebGL render type.
     * @property {number} CANVAS - Canvas render type.
     */
    RENDERER_TYPE: {
        UNKNOWN:    0,
        WEBGL:      1,
        CANVAS:     2
    },

    /**
     * Various blend modes supported by PIXI.
     *
     * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
     * Anything else will silently act like NORMAL.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} NORMAL
     * @property {number} ADD
     * @property {number} MULTIPLY
     * @property {number} SCREEN
     * @property {number} OVERLAY
     * @property {number} DARKEN
     * @property {number} LIGHTEN
     * @property {number} COLOR_DODGE
     * @property {number} COLOR_BURN
     * @property {number} HARD_LIGHT
     * @property {number} SOFT_LIGHT
     * @property {number} DIFFERENCE
     * @property {number} EXCLUSION
     * @property {number} HUE
     * @property {number} SATURATION
     * @property {number} COLOR
     * @property {number} LUMINOSITY
     */
    BLEND_MODES: {
        NORMAL:         0,
        ADD:            1,
        MULTIPLY:       2,
        SCREEN:         3,
        OVERLAY:        4,
        DARKEN:         5,
        LIGHTEN:        6,
        COLOR_DODGE:    7,
        COLOR_BURN:     8,
        HARD_LIGHT:     9,
        SOFT_LIGHT:     10,
        DIFFERENCE:     11,
        EXCLUSION:      12,
        HUE:            13,
        SATURATION:     14,
        COLOR:          15,
        LUMINOSITY:     16
    },

    /**
     * Various webgl draw modes. These can be used to specify which GL drawMode to use
     * under certain situations and renderers.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} POINTS
     * @property {number} LINES
     * @property {number} LINE_LOOP
     * @property {number} LINE_STRIP
     * @property {number} TRIANGLES
     * @property {number} TRIANGLE_STRIP
     * @property {number} TRIANGLE_FAN
     */
    DRAW_MODES: {
        POINTS:         0,
        LINES:          1,
        LINE_LOOP:      2,
        LINE_STRIP:     3,
        TRIANGLES:      4,
        TRIANGLE_STRIP: 5,
        TRIANGLE_FAN:   6
    },

    /**
     * The scale modes that are supported by pixi.
     *
     * The DEFAULT scale mode affects the default scaling mode of future operations.
     * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} DEFAULT=LINEAR
     * @property {number} LINEAR Smooth scaling
     * @property {number} NEAREST Pixelating scaling
     */
    SCALE_MODES: {
        DEFAULT:    0,
        LINEAR:     0,
        NEAREST:    1
    },

    /**
     * The wrap modes that are supported by pixi.
     *
     * The DEFAULT wrap mode affects the default wraping mode of future operations.
     * It can be re-assigned to either CLAMP or REPEAT, depending upon suitability.
     * If the texture is non power of two then clamp will be used regardless as webGL can only use REPEAT if the texture is po2.
     * This property only affects WebGL.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} DEFAULT=CLAMP
     * @property {number} CLAMP - The textures uvs are clamped
     * @property {number} REPEAT - The texture uvs tile and repeat
     * @property {number} MIRRORED_REPEAT - The texture uvs tile and repeat with mirroring
     */
    WRAP_MODES: {
        DEFAULT:        0,
        CLAMP:          0,
        REPEAT:         1,
        MIRRORED_REPEAT:2
    },

    /**
     * The gc modes that are supported by pixi.
     *
     * The DEFAULT Garbage Collection mode for pixi textures is MANUAL
     * If set to DEFAULT, the renderer will occasianally check textures usage. If they are not used for a specified period of time they will be removed from the GPU.
     * They will of corse be uploaded again when they are required. This is a silent behind the scenes process that should ensure that the GPU does not  get filled up.
     * Handy for mobile devices!
     * This property only affects WebGL.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} DEFAULT=MANUAL
     * @property {number} AUTO - Garbage collection will happen periodically automatically
     * @property {number} MANUAL - Garbage collection will need to be called manually
     */
    GC_MODES: {
        DEFAULT:        1,
        AUTO:           0,
        MANUAL:         1,
    },

    /**
     * If set to true WebGL will attempt make textures mimpaped by default.
     * Mipmapping will only succeed if the base texture uploaded has power of two dimensions.
     *
     * @static
     * @constant
     * @type {boolean}
     */
    MIPMAP_TEXTURES: true,

    /**
     * The prefix that denotes a URL is for a retina asset.
     *
     * @static
     * @constant
     * @type {RegExp|string}
     * @example `@2x`
     */
    RETINA_PREFIX: /@(.+)x/,

    /**
     * Default resolution / device pixel ratio of the renderer.
     *
     * @static
     * @constant
     * @type {number}
     */
    RESOLUTION: 1,

    /**
     * Default filter resolution.
     *
     * @static
     * @constant
     * @type {number}
     */
    FILTER_RESOLUTION:1,

    /**
     * The default render options if none are supplied to {@link PIXI.WebGLRenderer}
     * or {@link PIXI.CanvasRenderer}.
     *
     * @static
     * @constant
     * @type {object}
     * @property {HTMLCanvasElement} view=null
     * @property {number} resolution=1
     * @property {boolean} antialias=false
     * @property {boolean} forceFXAA=false
     * @property {boolean} autoResize=false
     * @property {boolean} transparent=false
     * @property {number} backgroundColor=0x000000
     * @property {boolean} clearBeforeRender=true
     * @property {boolean} preserveDrawingBuffer=false
     * @property {boolean} roundPixels=false
     */
    DEFAULT_RENDER_OPTIONS: {
        view: null,
        resolution: 1,
        antialias: false,
        forceFXAA: false,
        autoResize: false,
        transparent: false,
        backgroundColor: 0x000000,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        roundPixels: false
    },

    /**
     * Constants that identify shapes, mainly to prevent `instanceof` calls.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} POLY
     * @property {number} RECT
     * @property {number} CIRC
     * @property {number} ELIP
     * @property {number} RREC
     */
    SHAPES: {
        POLY: 0,
        RECT: 1,
        CIRC: 2,
        ELIP: 3,
        RREC: 4
    },

    /**
     * Constants that specify float precision in shaders.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} DEFAULT='mediump'
     * @property {number} LOW='lowp'
     * @property {number} MEDIUM='mediump'
     * @property {number} HIGH='highp'
     */
    PRECISION: {
        DEFAULT: 'mediump',
        LOW: 'lowp',
        MEDIUM: 'mediump',
        HIGH: 'highp'
    },

    /**
     * Constants that specify the transform type.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} DEFAULT=STATIC
     * @property {number} STATIC
     * @property {number} DYNAMIC
     */
    TRANSFORM_MODE:{
        DEFAULT:    0,
        STATIC:     0,
        DYNAMIC:    1
    },

    /**
     * Constants that define the type of gradient on text.
     *
     * @static
     * @constant
     * @type {object}
     * @property {number} LINEAR_VERTICAL
     * @property {number} LINEAR_HORIZONTAL
     */
    TEXT_GRADIENT: {
        LINEAR_VERTICAL: 0,
        LINEAR_HORIZONTAL: 1
    },

    // TODO: maybe change to SPRITE.BATCH_SIZE: 2000
    // TODO: maybe add PARTICLE.BATCH_SIZE: 15000

    /**
     * The default sprite batch size.
     *
     * The default aims to balance desktop and mobile devices.
     *
     * @static
     * @constant
     * @type {number}
     * @default 4096
     */
    SPRITE_BATCH_SIZE: 4096,

    /**
     * The maximum textures that this device supports.
     *
     * @static
     * @constant
     * @type {number}
     */
    SPRITE_MAX_TEXTURES: require('./utils/maxRecommendedTextures')(32)
};

module.exports = CONST;

},{"./utils/maxRecommendedTextures":152}],79:[function(require,module,exports){
var math = require('../math'),
    Rectangle = math.Rectangle;

/**
 * 'Builder' pattern for bounds rectangles
 * Axis-Aligned Bounding Box
 * It is not a shape! Its mutable thing, no 'EMPTY' or that kind of problems
 *
 * @class
 * @memberof PIXI
 */
function Bounds()
{
    /**
     * @member {number}
     * @default 0
     */
    this.minX = Infinity;

    /**
     * @member {number}
     * @default 0
     */
    this.minY = Infinity;

    /**
     * @member {number}
     * @default 0
     */
    this.maxX = -Infinity;

    /**
     * @member {number}
     * @default 0
     */
    this.maxY = -Infinity;

    this.rect = null;
}

Bounds.prototype.constructor = Bounds;
module.exports = Bounds;

Bounds.prototype.isEmpty = function()
{
    return this.minX > this.maxX || this.minY > this.maxY;
};

Bounds.prototype.clear = function()
{
    this.updateID++;

    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
};

/**
 * Can return Rectangle.EMPTY constant, either construct new rectangle, either use your rectangle
 * It is not guaranteed that it will return tempRect
 * @param tempRect {PIXI.Rectangle} temporary object will be used if AABB is not empty
 * @returns {PIXI.Rectangle}
 */
Bounds.prototype.getRectangle = function(rect)
{
    if (this.minX > this.maxX || this.minY > this.maxY) {
        return Rectangle.EMPTY;
    }

    rect = rect || new Rectangle(0, 0, 1, 1);

    rect.x = this.minX;
    rect.y = this.minY;
    rect.width = this.maxX - this.minX;
    rect.height = this.maxY - this.minY;

    return rect;
};

/**
 * This function should be inlined when its possible
 * @param point {PIXI.Point}
 */
Bounds.prototype.addPoint = function (point)
{
    this.minX = Math.min(this.minX, point.x);
    this.maxX = Math.max(this.maxX, point.x);
    this.minY = Math.min(this.minY, point.y);
    this.maxY = Math.max(this.maxY, point.y);
};

/**
 * Adds a quad, not transformed
 * @param vertices {Float32Array}
 * @returns {PIXI.Bounds}
 */
Bounds.prototype.addQuad = function(vertices)
{
    var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;

    var x = vertices[0];
    var y = vertices[1];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;

    x = vertices[2];
    y = vertices[3];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;

    x = vertices[4];
    y = vertices[5];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;

    x = vertices[6];
    y = vertices[7];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
};

/**
 * Adds sprite frame, transformed
 * @param transform {PIXI.TransformBase}
 * @param x0 {number}
 * @param y0 {number}
 * @param x1 {number}
 * @param y1 {number}
 */
Bounds.prototype.addFrame = function(transform, x0, y0, x1, y1)
{
    var matrix = transform.worldTransform;
    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
    var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;

    var x = a * x0 + c * y0 + tx;
    var y = b * x0 + d * y0 + ty;
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;

    x = a * x1 + c * y0 + tx;
    y = b * x1 + d * y0 + ty;
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;

    x = a * x0 + c * y1 + tx;
    y = b * x0 + d * y1 + ty;
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;

    x = a * x1 + c * y1 + tx;
    y = b * x1 + d * y1 + ty;
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
};

/**
 * add an array of vertices
 * @param transform {PIXI.TransformBase}
 * @param vertices {Float32Array}
 * @param beginOffset {number}
 * @param endOffset {number}
 */
Bounds.prototype.addVertices = function(transform, vertices, beginOffset, endOffset)
{
    var matrix = transform.worldTransform;
    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
    var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;

    for (var i = beginOffset; i < endOffset; i += 2)
    {
        var rawX = vertices[i], rawY = vertices[i + 1];
        var x = (a * rawX) + (c * rawY) + tx;
        var y = (d * rawY) + (b * rawX) + ty;

        minX = x < minX ? x : minX;
        minY = y < minY ? y : minY;
        maxX = x > maxX ? x : maxX;
        maxY = y > maxY ? y : maxY;
    }

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
};

Bounds.prototype.addBounds = function(bounds)
{
    var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;

    this.minX = bounds.minX < minX ? bounds.minX : minX;
    this.minY = bounds.minY < minY ? bounds.minY : minY;
    this.maxX = bounds.maxX > maxX ? bounds.maxX : maxX;
    this.maxY = bounds.maxY > maxY ? bounds.maxY : maxY;
};

},{"../math":102}],80:[function(require,module,exports){
var utils = require('../utils'),
    DisplayObject = require('./DisplayObject');

/**
 * A Container represents a collection of display objects.
 * It is the base class of all display objects that act as a container for other objects.
 *
 *```js
 * var container = new PIXI.Container();
 * container.addChild(sprite);
 * ```
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI
 */
function Container()
{
    DisplayObject.call(this);

    /**
     * The array of children of this container.
     *
     * @member {PIXI.DisplayObject[]}
     * @readonly
     */
    this.children = [];
}

// constructor
Container.prototype = Object.create(DisplayObject.prototype);
Container.prototype.constructor = Container;
module.exports = Container;

Object.defineProperties(Container.prototype, {
    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Container#
     */
    width: {
        get: function ()
        {
            return this.scale.x * this.getLocalBounds().width;
        },
        set: function (value)
        {

            var width = this.getLocalBounds().width;

            if (width !== 0)
            {
                this.scale.x = value / width;
            }
            else
            {
                this.scale.x = 1;
            }


            this._width = value;
        }
    },

    /**
     * The height of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Container#
     */
    height: {
        get: function ()
        {
            return  this.scale.y * this.getLocalBounds().height;
        },
        set: function (value)
        {

            var height = this.getLocalBounds().height;

            if (height !== 0)
            {
                this.scale.y = value / height ;
            }
            else
            {
                this.scale.y = 1;
            }

            this._height = value;
        }
    }
});

/**
 * Overridable method that can be used by Container subclasses whenever the children array is modified
 *
 * @private
 */
Container.prototype.onChildrenChange = function () {};

/**
 * Adds a child or multiple children to the container.
 *
 * Multple items can be added like so: `myContainer.addChild(thinkOne, thingTwo, thingThree)`
 * @param child {...PIXI.DisplayObject} The DisplayObject(s) to add to the container
 * @return {PIXI.DisplayObject} The first child that was added.
 */
Container.prototype.addChild = function (child)
{
    var argumentsLength = arguments.length;

    // if there is only one argument we can bypass looping through the them
    if(argumentsLength > 1)
    {
        // loop through the arguments property and add all children
        // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
        for (var i = 0; i < argumentsLength; i++)
        {
            this.addChild( arguments[i] );
        }
    }
    else
    {
        // if the child has a parent then lets remove it as Pixi objects can only exist in one place
        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        child.parent = this;

        // ensure a transform will be recalculated..
        this.transform._parentID = -1;

        this.children.push(child);

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(this.children.length-1);
        child.emit('added', this);
    }

    return child;
};

/**
 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
 *
 * @param child {PIXI.DisplayObject} The child to add
 * @param index {number} The index to place the child in
 * @return {PIXI.DisplayObject} The child that was added.
 */
Container.prototype.addChildAt = function (child, index)
{
    if (index >= 0 && index <= this.children.length)
    {
        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        child.parent = this;

        this.children.splice(index, 0, child);

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        child.emit('added', this);

        return child;
    }
    else
    {
        throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
    }
};

/**
 * Swaps the position of 2 Display Objects within this container.
 *
 * @param child {PIXI.DisplayObject} First display object to swap
 * @param child2 {PIXI.DisplayObject} Second display object to swap
 */
Container.prototype.swapChildren = function (child, child2)
{
    if (child === child2)
    {
        return;
    }

    var index1 = this.getChildIndex(child);
    var index2 = this.getChildIndex(child2);

    if (index1 < 0 || index2 < 0)
    {
        throw new Error('swapChildren: Both the supplied DisplayObjects must be children of the caller.');
    }

    this.children[index1] = child2;
    this.children[index2] = child;
    this.onChildrenChange(index1 < index2 ? index1 : index2);
};

/**
 * Returns the index position of a child DisplayObject instance
 *
 * @param child {PIXI.DisplayObject} The DisplayObject instance to identify
 * @return {number} The index position of the child display object to identify
 */
Container.prototype.getChildIndex = function (child)
{
    var index = this.children.indexOf(child);

    if (index === -1)
    {
        throw new Error('The supplied DisplayObject must be a child of the caller');
    }

    return index;
};

/**
 * Changes the position of an existing child in the display object container
 *
 * @param child {PIXI.DisplayObject} The child DisplayObject instance for which you want to change the index number
 * @param index {number} The resulting index number for the child display object
 */
Container.prototype.setChildIndex = function (child, index)
{
    if (index < 0 || index >= this.children.length)
    {
        throw new Error('The supplied index is out of bounds');
    }

    var currentIndex = this.getChildIndex(child);

    utils.removeItems(this.children, currentIndex, 1); // remove from old position
    this.children.splice(index, 0, child); //add at new position
    this.onChildrenChange(index);
};

/**
 * Returns the child at the specified index
 *
 * @param index {number} The index to get the child at
 * @return {PIXI.DisplayObject} The child at the given index, if any.
 */
Container.prototype.getChildAt = function (index)
{
    if (index < 0 || index >= this.children.length)
    {
        throw new Error('getChildAt: Supplied index ' + index + ' does not exist in the child list, or the supplied DisplayObject is not a child of the caller');
    }

    return this.children[index];
};

/**
 * Removes a child from the container.
 *
 * @param child {PIXI.DisplayObject} The DisplayObject to remove
 * @return {PIXI.DisplayObject} The child that was removed.
 */
Container.prototype.removeChild = function (child)
{
    var argumentsLength = arguments.length;

    // if there is only one argument we can bypass looping through the them
    if(argumentsLength > 1)
    {
        // loop through the arguments property and add all children
        // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
        for (var i = 0; i < argumentsLength; i++)
        {
            this.removeChild( arguments[i] );
        }
    }
    else
    {
        var index = this.children.indexOf(child);

        if (index === -1)
        {
            return;
        }

        child.parent = null;
        utils.removeItems(this.children, index, 1);

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        child.emit('removed', this);
    }

    return child;
};

/**
 * Removes a child from the specified index position.
 *
 * @param index {number} The index to get the child from
 * @return {PIXI.DisplayObject} The child that was removed.
 */
Container.prototype.removeChildAt = function (index)
{
    var child = this.getChildAt(index);

    child.parent = null;
    utils.removeItems(this.children, index, 1);

    // TODO - lets either do all callbacks or all events.. not both!
    this.onChildrenChange(index);
    child.emit('removed', this);

    return child;
};

/**
 * Removes all children from this container that are within the begin and end indexes.
 *
 * @param [beginIndex=0] {number} The beginning position.
 * @param [endIndex=this.children.length] {number} The ending position. Default value is size of the container.
 */
Container.prototype.removeChildren = function (beginIndex, endIndex)
{
    var begin = beginIndex || 0;
    var end = typeof endIndex === 'number' ? endIndex : this.children.length;
    var range = end - begin;
    var removed, i;

    if (range > 0 && range <= end)
    {
        removed = this.children.splice(begin, range);

        for (i = 0; i < removed.length; ++i)
        {
            removed[i].parent = null;
        }

        this.onChildrenChange(beginIndex);

        for (i = 0; i < removed.length; ++i)
        {
            removed[i].emit('removed', this);
        }

        return removed;
    }
    else if (range === 0 && this.children.length === 0)
    {
        return [];
    }
    else
    {
        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    }
};

/*
 * Updates the transform on all children of this container for rendering
 *
 * @private
 */
Container.prototype.updateTransform = function ()
{
    this._boundsID++;

    if (!this.visible)
    {
        return;
    }

    this.transform.updateTransform(this.parent.transform);

    //TODO: check render flags, how to process stuff here
    this.worldAlpha = this.alpha * this.parent.worldAlpha;

    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform();
    }
};

// performance increase to avoid using call.. (10x faster)
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;


Container.prototype.calculateBounds = function ()
{
    this._bounds.clear();

    if(!this.visible)
    {
        return;
    }

    this._calculateBounds();

    for (var i = 0; i < this.children.length; i++)
    {
        var child = this.children[i];

        child.calculateBounds();

        this._bounds.addBounds(child._bounds);
    }

    this._boundsID = this._lastBoundsID;
};

Container.prototype._calculateBounds = function ()
{
    //FILL IN//
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 */
Container.prototype.renderWebGL = function (renderer)
{

    // if the object is not visible or the alpha is 0 then no need to render this element
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {

        return;
    }


    // do a quick check to see if this element has a mask or a filter.
    if (this._mask || this._filters)
    {
        this.renderAdvancedWebGL(renderer);
    }
    else
    {
        this._renderWebGL(renderer);

        // simple render children!
        for (var i = 0, j = this.children.length; i < j; ++i)
        {
            this.children[i].renderWebGL(renderer);
        }
    }
};

Container.prototype.renderAdvancedWebGL = function (renderer)
{
    renderer.currentRenderer.flush();

    var filters = this._filters;
    var mask = this._mask;
    var i, j;

    // push filter first as we need to ensure the stencil buffer is correct for any masking
    if ( filters )
    {
        if(!this._enabledFilters)
        {
            this._enabledFilters = [];
        }

        this._enabledFilters.length = 0;

        for (i = 0; i < filters.length; i++)
        {
            if(filters[i].enabled)
            {
                this._enabledFilters.push( filters[i] );
            }
        }

        if( this._enabledFilters.length )
        {
            renderer.filterManager.pushFilter(this, this._enabledFilters);
        }
    }

    if ( mask )
    {
        renderer.maskManager.pushMask(this, this._mask);
    }

    renderer.currentRenderer.start();

    // add this object to the batch, only rendered if it has a texture.
    this._renderWebGL(renderer);

    // now loop through the children and make sure they get rendered
    for (i = 0, j = this.children.length; i < j; i++)
    {
        this.children[i].renderWebGL(renderer);
    }

    renderer.currentRenderer.flush();

    if ( mask )
    {
        renderer.maskManager.popMask(this, this._mask);
    }

    if ( filters && this._enabledFilters && this._enabledFilters.length )
    {
        renderer.filterManager.popFilter();
    }

    renderer.currentRenderer.start();
};

/**
 * To be overridden by the subclass
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 * @private
 */
Container.prototype._renderWebGL = function (renderer) // jshint unused:false
{
    // this is where content itself gets rendered...
};

/**
 * To be overridden by the subclass
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 * @private
 */
Container.prototype._renderCanvas = function (renderer) // jshint unused:false
{
    // this is where content itself gets rendered...
};


/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 */
Container.prototype.renderCanvas = function (renderer)
{
    // if not visible or the alpha is 0 then no need to render this
    if (!this.visible || this.alpha <= 0 || !this.renderable)
    {
        return;
    }

    if (this._mask)
    {
        renderer.maskManager.pushMask(this._mask);
    }

    this._renderCanvas(renderer);
    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].renderCanvas(renderer);
    }

    if (this._mask)
    {
        renderer.maskManager.popMask(renderer);
    }
};

/**
 * Removes all internal references and listeners as well as removes children from the display list. 
 * Do not use a Container after calling `destroy`.
 * @param [options] {object|boolean} Options parameter. A boolean will act as if all options have been set to that value
 * @param [options.children=false] {boolean} if set to true, all the children will have their destroy
 *      method called as well. 'options' will be passed on to those calls.
 */
Container.prototype.destroy = function (options)
{
    DisplayObject.prototype.destroy.call(this);

    var destroyChildren = typeof options === 'boolean' ? options : options && options.children;

    var oldChildren = this.children;
    this.children = null;

    if (destroyChildren)
    {
        for (var i = oldChildren.length - 1; i >= 0; i--)
        {
            var child = oldChildren[i];
            child.parent = null;
            child.destroy(options);
        }
    }
};

},{"../utils":151,"./DisplayObject":81}],81:[function(require,module,exports){
var EventEmitter = require('eventemitter3'),
    CONST = require('../const'),
    TransformStatic = require('./TransformStatic'),
    Transform = require('./Transform'),
    Bounds = require('./Bounds'),
    math = require('../math'),
    _tempDisplayObjectParent = new DisplayObject();

/**
 * The base class for all objects that are rendered on the screen.
 * This is an abstract class and should not be used on its own rather it should be extended.
 *
 * @class
 * @extends EventEmitter
 * @mixes PIXI.interaction.interactiveTarget
 * @memberof PIXI
 */
function DisplayObject()
{
    EventEmitter.call(this);

    var TransformClass = CONST.TRANSFORM_MODE.DEFAULT === CONST.TRANSFORM_MODE.STATIC ? TransformStatic : Transform;

    //TODO: need to create Transform from factory
    /**
     * World transform and local transform of this object.
     * This will be reworked in v4.1, please do not use it yet unless you know what are you doing!
     *
     * @member {PIXI.TransformBase}
     */
    this.transform =  new TransformClass();

    /**
     * The opacity of the object.
     *
     * @member {number}
     */
    this.alpha = 1;

    /**
     * The visibility of the object. If false the object will not be drawn, and
     * the updateTransform function will not be called.
     *
     * @member {boolean}
     */
    this.visible = true;

    /**
     * Can this object be rendered, if false the object will not be drawn but the updateTransform
     * methods will still be called.
     *
     * @member {boolean}
     */
    this.renderable = true;

    /**
     * The display object container that contains this display object.
     *
     * @member {PIXI.Container}
     * @readonly
     */
    this.parent = null;

    /**
     * The multiplied alpha of the displayObject
     *
     * @member {number}
     * @readonly
     */
    this.worldAlpha = 1;

    /**
     * The area the filter is applied to. This is used as more of an optimisation
     * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle
     *
     * Also works as an interaction mask
     *
     * @member {PIXI.Rectangle}
     */
    this.filterArea = null;

    this._filters = null;
    this._enabledFilters = null;

    /**
     * The bounds object, this is used to calculate and store the bounds of the displayObject
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._bounds = new Bounds();
    this._boundsID = 0;
    this._lastBoundsID = -1;
    this._boundsRect = null;
    this._localBoundsRect = null;

    /**
     * The original, cached mask of the object
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._mask = null;


}

// constructor
DisplayObject.prototype = Object.create(EventEmitter.prototype);
DisplayObject.prototype.constructor = DisplayObject;
module.exports = DisplayObject;


Object.defineProperties(DisplayObject.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     * An alias to position.x
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    x: {
        get: function ()
        {
            return this.position.x;
        },
        set: function (value)
        {
            this.transform.position.x = value;
        }
    },

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     * An alias to position.y
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    y: {
        get: function ()
        {
            return this.position.y;
        },
        set: function (value)
        {
            this.transform.position.y = value;
        }
    },

    /**
     * Current transform of the object based on world (parent) factors
     *
     * @member {PIXI.Matrix}
     * @memberof PIXI.DisplayObject#
     * @readonly
     */
    worldTransform: {
        get: function ()
        {
            return this.transform.worldTransform;
        }
    },

    /**
     * Current transform of the object based on local factors: position, scale, other stuff
     *
     * @member {PIXI.Matrix}
     * @memberof PIXI.DisplayObject#
     * @readonly
     */
    localTransform: {
        get: function ()
        {
            return this.transform.localTransform;
        }
    },

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.Point|PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    position: {
        get: function()
        {
            return this.transform.position;
        },
        set: function(value) {
            this.transform.position.copy(value);
        }
    },

    /**
     * The scale factor of the object.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.Point|PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    scale: {
        get: function() {
            return this.transform.scale;
        },
        set: function(value) {
            this.transform.scale.copy(value);
        }
    },

    /**
     * The pivot point of the displayObject that it rotates around
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.Point|PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    pivot: {
        get: function() {
            return this.transform.pivot;
        },
        set: function(value) {
            this.transform.pivot.copy(value);
        }
    },

    /**
     * The skew factor for the object in radians.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     * @memberof PIXI.DisplayObject#
     */
    skew: {
        get: function() {
            return this.transform.skew;
        },
        set: function(value) {
            this.transform.skew.copy(value);
        }
    },

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     * @memberof PIXI.DisplayObject#
     */
    rotation: {
        get: function ()
        {
            return this.transform.rotation;
        },
        set: function (value)
        {
            this.transform.rotation = value;
        }
    },

    /**
     * Indicates if the sprite is globally visible.
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @readonly
     */
    worldVisible: {
        get: function ()
        {
            var item = this;

            do {
                if (!item.visible)
                {
                    return false;
                }

                item = item.parent;
            } while (item);

            return true;
        }
    },

    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an object to the shape of the mask applied to it.
     * In PIXI a regular mask must be a PIXI.Graphics or a PIXI.Sprite object. This allows for much faster masking in canvas as it utilises shape clipping.
     * To remove a mask, set this property to null.
     *
     * @todo For the moment, PIXI.CanvasRenderer doesn't support PIXI.Sprite as mask.
     *
     * @member {PIXI.Graphics|PIXI.Sprite}
     * @memberof PIXI.DisplayObject#
     */
    mask: {
        get: function ()
        {
            return this._mask;
        },
        set: function (value)
        {
            if (this._mask)
            {
                this._mask.renderable = true;
            }

            this._mask = value;

            if (this._mask)
            {
                this._mask.renderable = false;
            }
        }
    },

    /**
     * Sets the filters for the displayObject.
     * * IMPORTANT: This is a webGL only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to 'null'
     *
     * @member {PIXI.AbstractFilter[]}
     * @memberof PIXI.DisplayObject#
     */
    filters: {
        get: function ()
        {
            return this._filters && this._filters.slice();
        },
        set: function (value)
        {
            this._filters = value && value.slice();
        }
    }

});

/*
 * Updates the object transform for rendering
 *
 * TODO - Optimization pass!
 */
DisplayObject.prototype.updateTransform = function ()
{
    this.transform.updateTransform(this.parent.transform);
    // multiply the alphas..
    this.worldAlpha = this.alpha * this.parent.worldAlpha;

    this._bounds.updateID++;
};

// performance increase to avoid using call.. (10x faster)
DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;

/**
 * recursively updates transform of all objects from the root to this one
 * internal function for toLocal()
 */
DisplayObject.prototype._recursivePostUpdateTransform = function()
{
    if (this.parent)
    {
        this.parent._recursivePostUpdateTransform();
        this.transform.updateTransform(this.parent.transform);
    }
    else
    {
        this.transform.updateTransform(_tempDisplayObjectParent.transform);
    }
};

/**
 *
 *
 * Retrieves the bounds of the displayObject as a rectangle object.
 * @param skipUpdate {boolean} setting to true will stop the transforms of the scene graph from being updated. This means the calculation returned MAY be out of date BUT will give you a nice performance boost
 * @param rect {PIXI.Rectangle} Optional rectangle to store the result of the bounds calculation
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getBounds = function (skipUpdate, rect)
{
    if(!skipUpdate)
    {
        if(!this.parent)
        {
            this.parent = _tempDisplayObjectParent;
            this.parent.transform._worldID++;
            this.updateTransform();
            this.parent = null;
        }
        else
        {
            this._recursivePostUpdateTransform();
            this.updateTransform();
        }
    }

    if(this._boundsID !== this._lastBoundsID)
    {
        this.calculateBounds();
    }

    if(!rect)
    {
        if(!this._boundsRect)
        {
            this._boundsRect = new math.Rectangle();
        }

        rect = this._boundsRect;
    }

    return this._bounds.getRectangle(rect);
};

/**
 * Retrieves the local bounds of the displayObject as a rectangle object
 * @param rect {PIXI.Rectangle} Optional rectangle to store the result of the bounds calculation
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
DisplayObject.prototype.getLocalBounds = function (rect)
{
    var transformRef = this.transform;
    var parentRef = this.parent;

    this.parent = null;
    this.transform = _tempDisplayObjectParent.transform;

    if(!rect)
    {
        if(!this._localBoundsRect)
        {
            this._localBoundsRect = new math.Rectangle();
        }

        rect = this._localBoundsRect;
    }

    var bounds = this.getBounds(false, rect);

    this.parent = parentRef;
    this.transform = transformRef;

    return bounds;
};

/**
 * Calculates the global position of the display object
 *
 * @param position {PIXI.Point} The world origin to calculate from
 * @return {PIXI.Point} A point object representing the position of this object
 */
DisplayObject.prototype.toGlobal = function (position, point, skipUpdate)
{
    if(!skipUpdate)
    {
        this._recursivePostUpdateTransform();

        // this parent check is for just in case the item is a root object.
        // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
        // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
        if(!this.parent)
        {
            this.parent = _tempDisplayObjectParent;
            this.displayObjectUpdateTransform();
            this.parent = null;
        }
        else
        {
            this.displayObjectUpdateTransform();
        }
    }

    // don't need to update the lot
    return this.worldTransform.apply(position, point);
};

/**
 * Calculates the local position of the display object relative to another point
 *
 * @param position {PIXI.Point} The world origin to calculate from
 * @param [from] {PIXI.DisplayObject} The DisplayObject to calculate the global position from
 * @param [point] {PIXI.Point} A Point object in which to store the value, optional (otherwise will create a new Point)
 * @return {PIXI.Point} A point object representing the position of this object
 */
DisplayObject.prototype.toLocal = function (position, from, point, skipUpdate)
{
    if (from)
    {
        position = from.toGlobal(position, point, skipUpdate);
    }

    if(! skipUpdate)
    {
        this._recursivePostUpdateTransform();

        // this parent check is for just in case the item is a root object.
        // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
        // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
        if(!this.parent)
        {
            this.parent = _tempDisplayObjectParent;
            this.displayObjectUpdateTransform();
            this.parent = null;
        }
        else
        {
            this.displayObjectUpdateTransform();
        }
    }

    // simply apply the matrix..
    return this.worldTransform.applyInverse(position, point);
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 */
DisplayObject.prototype.renderWebGL = function (renderer) // jshint unused:false
{
    // OVERWRITE;
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 */
DisplayObject.prototype.renderCanvas = function (renderer) // jshint unused:false
{
    // OVERWRITE;
};

/**
 * Set the parent Container of this DisplayObject
 *
 * @param container {PIXI.Container} The Container to add this DisplayObject to
 * @return {PIXI.Container} The Container that this DisplayObject was added to
 */
DisplayObject.prototype.setParent = function (container)
{
    if (!container || !container.addChild)
    {
        throw new Error('setParent: Argument must be a Container');
    }

    container.addChild(this);
    return container;
};

/**
 * Convenience function to set the postion, scale, skew and pivot at once.
 *
 * @param [x=0] {number} The X position
 * @param [y=0] {number} The Y position
 * @param [scaleX=1] {number} The X scale value
 * @param [scaleY=1] {number} The Y scale value
 * @param [rotation=0] {number} The rotation
 * @param [skewX=0] {number} The X skew value
 * @param [skewY=0] {number} The Y skew value
 * @param [pivotX=0] {number} The X pivot value
 * @param [pivotY=0] {number} The Y pivot value
 * @return {PIXI.DisplayObject} The DisplayObject instance
 */
DisplayObject.prototype.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY) //jshint ignore:line
{
    this.position.x = x || 0;
    this.position.y = y || 0;
    this.scale.x = !scaleX ? 1 : scaleX;
    this.scale.y = !scaleY ? 1 : scaleY;
    this.rotation = rotation || 0;
    this.skew.x = skewX || 0;
    this.skew.y = skewY || 0;
    this.pivot.x = pivotX || 0;
    this.pivot.y = pivotY || 0;
    return this;
};

/**
 * Base destroy method for generic display objects. This will automatically
 * remove the display object from its parent Container as well as remove
 * all current event listeners and internal references. Do not use a DisplayObject 
 * after calling `destroy`.
 */
DisplayObject.prototype.destroy = function ()
{
    this.removeAllListeners();
    if (this.parent)
    {
        this.parent.removeChild(this);
    }
    this.transform = null;

    this.parent = null;

    this._bounds = null;
    this._currentBounds = null;
    this._mask = null;

    this.filterArea = null;
};

},{"../const":78,"../math":102,"./Bounds":79,"./Transform":82,"./TransformStatic":84,"eventemitter3":32}],82:[function(require,module,exports){
var math = require('../math'),
    TransformBase = require('./TransformBase');


/**
 * Generic class to deal with traditional 2D matrix transforms
 * local transformation is calculated from position,scale,skew and rotation
 *
 * @class
 * @extends PIXI.TransformBase
 * @memberof PIXI
 */
function Transform()
{
    TransformBase.call(this);

     /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.Point}
     */
    this.position = new math.Point(0,0);

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.Point}
     */
    this.scale = new math.Point(1,1);

    /**
     * The skew amount, on the x and y axis.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.skew = new math.ObservablePoint(this.updateSkew, this, 0,0);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.Point}
     */
    this.pivot = new math.Point(0,0);

    /**
     * The rotation value of the object, in radians
     *
     * @member {Number}
     * @private
     */
    this._rotation = 0;

    this._sr = Math.sin(0);
    this._cr = Math.cos(0);
    this._cy  = Math.cos(0);//skewY);
    this._sy  = Math.sin(0);//skewY);
    this._nsx = Math.sin(0);//skewX);
    this._cx  = Math.cos(0);//skewX);
}

Transform.prototype = Object.create(TransformBase.prototype);
Transform.prototype.constructor = Transform;

Transform.prototype.updateSkew = function ()
{
    this._cy  = Math.cos(this.skew.y);
    this._sy  = Math.sin(this.skew.y);
    this._nsx = Math.sin(this.skew.x);
    this._cx  = Math.cos(this.skew.x);
};

/**
 * Updates only local matrix
 */
Transform.prototype.updateLocalTransform = function() {
    var lt = this.localTransform;
    var a, b, c, d;

    a  =  this._cr * this.scale.x;
    b  =  this._sr * this.scale.x;
    c  = -this._sr * this.scale.y;
    d  =  this._cr * this.scale.y;

    lt.a  = this._cy * a + this._sy * c;
    lt.b  = this._cy * b + this._sy * d;
    lt.c  = this._nsx * a + this._cx * c;
    lt.d  = this._nsx * b + this._cx * d;
};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param parentTransform {PIXI.Transform} The transform of the parent of this object
 */
Transform.prototype.updateTransform = function (parentTransform)
{

    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;
    var lt = this.localTransform;
    var a, b, c, d;

    a  =  this._cr * this.scale.x;
    b  =  this._sr * this.scale.x;
    c  = -this._sr * this.scale.y;
    d  =  this._cr * this.scale.y;

    lt.a  = this._cy * a + this._sy * c;
    lt.b  = this._cy * b + this._sy * d;
    lt.c  = this._nsx * a + this._cx * c;
    lt.d  = this._nsx * b + this._cx * d;

    lt.tx =  this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
    lt.ty =  this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);

    // concat the parent matrix with the objects transform.
    wt.a  = lt.a  * pt.a + lt.b  * pt.c;
    wt.b  = lt.a  * pt.b + lt.b  * pt.d;
    wt.c  = lt.c  * pt.a + lt.d  * pt.c;
    wt.d  = lt.c  * pt.b + lt.d  * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

    this._worldID ++;
};

/**
 * Decomposes a matrix and sets the transforms properties based on it.
 * @param {PIXI.Matrix} The matrix to decompose
 */
Transform.prototype.setFromMatrix = function (matrix)
{
    matrix.decompose(this);
};


Object.defineProperties(Transform.prototype, {
    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     * @memberof PIXI.Transform#
     */
    rotation: {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
            this._sr = Math.sin(value);
            this._cr = Math.cos(value);
        }
    }
});

module.exports = Transform;

},{"../math":102,"./TransformBase":83}],83:[function(require,module,exports){
var math = require('../math');


/**
 * Generic class to deal with traditional 2D matrix transforms
 *
 * @class
 * @memberof PIXI
 */
function TransformBase()
{
    /**
     * The global matrix transform. It can be swapped temporarily by some functions like getLocalBounds()
     *
     * @member {PIXI.Matrix}
     */
    this.worldTransform = new math.Matrix();
    /**
     * The local matrix transform
     * 
     * @member {PIXI.Matrix}
     */
    this.localTransform = new math.Matrix();

    this._worldID = 0;
}

TransformBase.prototype.constructor = TransformBase;

/**
 * TransformBase does not have decomposition, so this function wont do anything
 */
TransformBase.prototype.updateLocalTransform = function() { // jshint unused:false

};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.TransformBase} The transform of the parent of this object
 *
 */
TransformBase.prototype.updateTransform = function (parentTransform)
{
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;
    var lt = this.localTransform;

    // concat the parent matrix with the objects transform.
    wt.a  = lt.a  * pt.a + lt.b  * pt.c;
    wt.b  = lt.a  * pt.b + lt.b  * pt.d;
    wt.c  = lt.c  * pt.a + lt.d  * pt.c;
    wt.d  = lt.c  * pt.b + lt.d  * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

    this._worldID ++;
};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param  parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
TransformBase.prototype.updateWorldTransform = TransformBase.prototype.updateTransform;

TransformBase.IDENTITY = new TransformBase();

module.exports = TransformBase;

},{"../math":102}],84:[function(require,module,exports){
var math = require('../math'),
    TransformBase = require('./TransformBase');

/**
 * Transform that takes care about its versions
 *
 * @class
 * @extends PIXI.TransformBase
 * @memberof PIXI
 */
function TransformStatic()
{
    TransformBase.call(this);
     /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.position = new math.ObservablePoint(this.onChange, this,0,0);

    /**
     * The scale factor of the object.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.scale = new math.ObservablePoint(this.onChange, this,1,1);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @member {PIXI.ObservablePoint}
     */
    this.pivot = new math.ObservablePoint(this.onChange, this,0, 0);

    /**
     * The skew amount, on the x and y axis.
     *
     * @member {PIXI.ObservablePoint}
     */
    this.skew = new math.ObservablePoint(this.updateSkew, this,0, 0);

    this._rotation = 0;

    this._sr = Math.sin(0);
    this._cr = Math.cos(0);
    this._cy  = Math.cos(0);//skewY);
    this._sy  = Math.sin(0);//skewY);
    this._nsx = Math.sin(0);//skewX);
    this._cx  = Math.cos(0);//skewX);

    this._localID = 0;
    this._currentLocalID = 0;
}

TransformStatic.prototype = Object.create(TransformBase.prototype);
TransformStatic.prototype.constructor = TransformStatic;

TransformStatic.prototype.onChange = function ()
{
    this._localID ++;
};

TransformStatic.prototype.updateSkew = function ()
{
    this._cy  = Math.cos(this.skew._y);
    this._sy  = Math.sin(this.skew._y);
    this._nsx = Math.sin(this.skew._x);
    this._cx  = Math.cos(this.skew._x);

    this._localID ++;
};

/**
 * Updates only local matrix
 */
TransformStatic.prototype.updateLocalTransform = function() {
    var lt = this.localTransform;
    if(this._localID !== this._currentLocalID)
    {
        // get the matrix values of the displayobject based on its transform properties..
        var a,b,c,d;

        a  =  this._cr * this.scale._x;
        b  =  this._sr * this.scale._x;
        c  = -this._sr * this.scale._y;
        d  =  this._cr * this.scale._y;

        lt.a  = this._cy * a + this._sy * c;
        lt.b  = this._cy * b + this._sy * d;
        lt.c  = this._nsx * a + this._cx * c;
        lt.d  = this._nsx * b + this._cx * d;

        lt.tx =  this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
        lt.ty =  this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
        this._currentLocalID = this._localID;

        // force an update..
        this._parentID = -1;
    }
};

/**
 * Updates the values of the object and applies the parent's transform.
 * @param parentTransform {PIXI.Transform} The transform of the parent of this object
 *
 */
TransformStatic.prototype.updateTransform = function (parentTransform)
{
    var pt = parentTransform.worldTransform;
    var wt = this.worldTransform;
    var lt = this.localTransform;

    if(this._localID !== this._currentLocalID)
    {
        // get the matrix values of the displayobject based on its transform properties..
        var a,b,c,d;

        a  =  this._cr * this.scale._x;
        b  =  this._sr * this.scale._x;
        c  = -this._sr * this.scale._y;
        d  =  this._cr * this.scale._y;

        lt.a  = this._cy * a + this._sy * c;
        lt.b  = this._cy * b + this._sy * d;
        lt.c  = this._nsx * a + this._cx * c;
        lt.d  = this._nsx * b + this._cx * d;

        lt.tx =  this.position._x - (this.pivot._x * lt.a + this.pivot._y * lt.c);
        lt.ty =  this.position._y - (this.pivot._x * lt.b + this.pivot._y * lt.d);
        this._currentLocalID = this._localID;

        // force an update..
        this._parentID = -1;
    }

    if(this._parentID !== parentTransform._worldID)
    {
        // concat the parent matrix with the objects transform.
        wt.a  = lt.a  * pt.a + lt.b  * pt.c;
        wt.b  = lt.a  * pt.b + lt.b  * pt.d;
        wt.c  = lt.c  * pt.a + lt.d  * pt.c;
        wt.d  = lt.c  * pt.b + lt.d  * pt.d;
        wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
        wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;

        this._parentID = parentTransform._worldID;

        // update the id of the transform..
        this._worldID ++;
    }
};

/**
 * Decomposes a matrix and sets the transforms properties based on it.
 * @param {PIXI.Matrix} The matrix to decompose
 */
TransformStatic.prototype.setFromMatrix = function (matrix)
{
    matrix.decompose(this);
    this._localID ++;
};

Object.defineProperties(TransformStatic.prototype, {
    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     * @memberof PIXI.TransformStatic#
     */
    rotation: {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
            this._sr = Math.sin(value);
            this._cr = Math.cos(value);
            this._localID ++;
        }
    }
});

module.exports = TransformStatic;

},{"../math":102,"./TransformBase":83}],85:[function(require,module,exports){
var Container = require('../display/Container'),
    RenderTexture = require('../textures/RenderTexture'),
    Texture = require('../textures/Texture'),
    GraphicsData = require('./GraphicsData'),
    Sprite = require('../sprites/Sprite'),
    math = require('../math'),
    CONST = require('../const'),
    Bounds = require('../display/Bounds'),
    bezierCurveTo = require('./utils/bezierCurveTo'),
    CanvasRenderer = require('../renderers/canvas/CanvasRenderer'),
    canvasRenderer,
    tempMatrix = new math.Matrix(),
    tempPoint = new math.Point();

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
function Graphics()
{
    Container.call(this);

    /**
     * The alpha value used when filling the Graphics object.
     *
     * @member {number}
     * @default 1
     */
    this.fillAlpha = 1;

    /**
     * The width (thickness) of any lines drawn.
     *
     * @member {number}
     * @default 0
     */
    this.lineWidth = 0;

    /**
     * The color of any lines drawn.
     *
     * @member {string}
     * @default 0
     */
    this.lineColor = 0;

    /**
     * Graphics data
     *
     * @member {PIXI.GraphicsData[]}
     * @private
     */
    this.graphicsData = [];

    /**
     * The tint applied to the graphic shape. This is a hex value. Apply a value of 0xFFFFFF to reset the tint.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this.tint = 0xFFFFFF;

    /**
     * The previous tint applied to the graphic shape. Used to compare to the current tint and check if theres change.
     *
     * @member {number}
     * @private
     * @default 0xFFFFFF
     */
    this._prevTint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the graphic shape. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL;
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = CONST.BLEND_MODES.NORMAL;

    /**
     * Current path
     *
     * @member {PIXI.GraphicsData}
     * @private
     */
    this.currentPath = null;

    /**
     * Array containing some WebGL-related properties used by the WebGL renderer.
     *
     * @member {object<number, object>}
     * @private
     */
    // TODO - _webgl should use a prototype object, not a random undocumented object...
    this._webGL = {};

    /**
     * Whether this shape is being used as a mask.
     *
     * @member {boolean}
     */
    this.isMask = false;

    /**
     * The bounds' padding used for bounds calculation.
     *
     * @member {number}
     */
    this.boundsPadding = 0;

    /**
     * A cache of the local bounds to prevent recalculation.
     *
     * @member {PIXI.Rectangle}
     * @private
     */
    this._localBounds = new Bounds();

    /**
     * Used to detect if the graphics object has changed. If this is set to true then the graphics
     * object will be recalculated.
     *
     * @member {boolean}
     * @private
     */
    this.dirty = 0;

    /**
     * Used to detect if we need to do a fast rect check using the id compare method
     * @type {Number}
     */
    this.fastRectDirty = -1;

    /**
     * Used to detect if we clear the graphics webGL data
     * @type {Number}
     */
    this.clearDirty = 0;

    /**
     * Used to detect if we we need to recalculate local bounds
     * @type {Number}
     */
    this.boundsDirty = -1;

    /**
     * Used to detect if the cached sprite object needs to be updated.
     *
     * @member {boolean}
     * @private
     */
    this.cachedSpriteDirty = false;


    this._spriteRect = null;
    this._fastRect = false;

    /**
     * When cacheAsBitmap is set to true the graphics object will be rendered as if it was a sprite.
     * This is useful if your graphics element does not change often, as it will speed up the rendering
     * of the object in exchange for taking up texture memory. It is also useful if you need the graphics
     * object to be anti-aliased, because it will be rendered using canvas. This is not recommended if
     * you are constantly redrawing the graphics element.
     *
     * @name cacheAsBitmap
     * @member {boolean}
     * @memberof PIXI.Graphics#
     * @default false
     */
}

Graphics._SPRITE_TEXTURE = null;

// constructor
Graphics.prototype = Object.create(Container.prototype);
Graphics.prototype.constructor = Graphics;
module.exports = Graphics;

/**
 * Creates a new Graphics object with the same values as this one.
 * Note that the only the properties of the object are cloned, not its transform (position,scale,etc)
 *
 * @return {PIXI.Graphics} A clone of the graphics object
 */
Graphics.prototype.clone = function ()
{
    var clone = new Graphics();

    clone.renderable    = this.renderable;
    clone.fillAlpha     = this.fillAlpha;
    clone.lineWidth     = this.lineWidth;
    clone.lineColor     = this.lineColor;
    clone.tint          = this.tint;
    clone.blendMode     = this.blendMode;
    clone.isMask        = this.isMask;
    clone.boundsPadding = this.boundsPadding;
    clone.dirty         = 0;
    clone.cachedSpriteDirty = this.cachedSpriteDirty;

    // copy graphics data
    for (var i = 0; i < this.graphicsData.length; ++i)
    {
        clone.graphicsData.push(this.graphicsData[i].clone());
    }

    clone.currentPath = clone.graphicsData[clone.graphicsData.length - 1];

    clone.updateLocalBounds();

    return clone;
};

/**
 * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo() method or the drawCircle() method.
 *
 * @param lineWidth {number} width of the line to draw, will update the objects stored style
 * @param color {number} color of the line to draw, will update the objects stored style
 * @param alpha {number} alpha of the line to draw, will update the objects stored style
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.lineStyle = function (lineWidth, color, alpha)
{
    this.lineWidth = lineWidth || 0;
    this.lineColor = color || 0;
    this.lineAlpha = (alpha === undefined) ? 1 : alpha;

    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length)
        {
            // halfway through a line? start a new one!
            var shape = new math.Polygon(this.currentPath.shape.points.slice(-2));
            shape.closed = false;
            this.drawShape(shape);
        }
        else
        {
            // otherwise its empty so lets just set the line properties
            this.currentPath.lineWidth = this.lineWidth;
            this.currentPath.lineColor = this.lineColor;
            this.currentPath.lineAlpha = this.lineAlpha;
        }
    }

    return this;
};

/**
 * Moves the current drawing position to x, y.
 *
 * @param x {number} the X coordinate to move to
 * @param y {number} the Y coordinate to move to
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.moveTo = function (x, y)
{
    var shape = new math.Polygon([x,y]);
    shape.closed = false;
    this.drawShape(shape);

    return this;
};

/**
 * Draws a line using the current line style from the current drawing position to (x, y);
 * The current drawing position is then set to (x, y).
 *
 * @param x {number} the X coordinate to draw to
 * @param y {number} the Y coordinate to draw to
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.lineTo = function (x, y)
{
    this.currentPath.shape.points.push(x, y);
    this.dirty++;

    return this;
};

/**
 * Calculate the points for a quadratic bezier curve and then draws it.
 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
 *
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.quadraticCurveTo = function (cpX, cpY, toX, toY)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points = [0, 0];
        }
    }
    else
    {
        this.moveTo(0,0);
    }


    var xa,
        ya,
        n = 20,
        points = this.currentPath.shape.points;

    if (points.length === 0)
    {
        this.moveTo(0, 0);
    }

    var fromX = points[points.length-2];
    var fromY = points[points.length-1];

    var j = 0;
    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        xa = fromX + ( (cpX - fromX) * j );
        ya = fromY + ( (cpY - fromY) * j );

        points.push( xa + ( ((cpX + ( (toX - cpX) * j )) - xa) * j ),
                     ya + ( ((cpY + ( (toY - cpY) * j )) - ya) * j ) );
    }

    this.dirty++;

    return this;
};

/**
 * Calculate the points for a bezier curve and then draws it.
 *
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param cpX2 {number} Second Control point x
 * @param cpY2 {number} Second Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.bezierCurveTo = function (cpX, cpY, cpX2, cpY2, toX, toY)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points = [0, 0];
        }
    }
    else
    {
        this.moveTo(0,0);
    }

    var points = this.currentPath.shape.points;

    var fromX = points[points.length-2];
    var fromY = points[points.length-1];

    points.length -= 2;

    bezierCurveTo(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY, points);

    this.dirty++;

    return this;
};

/**
 * The arcTo() method creates an arc/curve between two tangents on the canvas.
 *
 * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
 *
 * @param x1 {number} The x-coordinate of the beginning of the arc
 * @param y1 {number} The y-coordinate of the beginning of the arc
 * @param x2 {number} The x-coordinate of the end of the arc
 * @param y2 {number} The y-coordinate of the end of the arc
 * @param radius {number} The radius of the arc
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.arcTo = function (x1, y1, x2, y2, radius)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points.push(x1, y1);
        }
    }
    else
    {
        this.moveTo(x1, y1);
    }

    var points = this.currentPath.shape.points,
        fromX = points[points.length-2],
        fromY = points[points.length-1],
        a1 = fromY - y1,
        b1 = fromX - x1,
        a2 = y2   - y1,
        b2 = x2   - x1,
        mm = Math.abs(a1 * b2 - b1 * a2);

    if (mm < 1.0e-8 || radius === 0)
    {
        if (points[points.length-2] !== x1 || points[points.length-1] !== y1)
        {
            points.push(x1, y1);
        }
    }
    else
    {
        var dd = a1 * a1 + b1 * b1,
            cc = a2 * a2 + b2 * b2,
            tt = a1 * a2 + b1 * b2,
            k1 = radius * Math.sqrt(dd) / mm,
            k2 = radius * Math.sqrt(cc) / mm,
            j1 = k1 * tt / dd,
            j2 = k2 * tt / cc,
            cx = k1 * b2 + k2 * b1,
            cy = k1 * a2 + k2 * a1,
            px = b1 * (k2 + j1),
            py = a1 * (k2 + j1),
            qx = b2 * (k1 + j2),
            qy = a2 * (k1 + j2),
            startAngle = Math.atan2(py - cy, px - cx),
            endAngle   = Math.atan2(qy - cy, qx - cx);

        this.arc(cx + x1, cy + y1, radius, startAngle, endAngle, b1 * a2 > b2 * a1);
    }

    this.dirty++;

    return this;
};

/**
 * The arc method creates an arc/curve (used to create circles, or parts of circles).
 *
 * @param cx {number} The x-coordinate of the center of the circle
 * @param cy {number} The y-coordinate of the center of the circle
 * @param radius {number} The radius of the circle
 * @param startAngle {number} The starting angle, in radians (0 is at the 3 o'clock position of the arc's circle)
 * @param endAngle {number} The ending angle, in radians
 * @param [anticlockwise=false] {boolean} Specifies whether the drawing should be counterclockwise or clockwise. False is default, and indicates clockwise, while true indicates counter-clockwise.
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise)
{
    anticlockwise = anticlockwise || false;

    if (startAngle === endAngle)
    {
        return this;
    }

    if( !anticlockwise && endAngle <= startAngle )
    {
        endAngle += Math.PI * 2;
    }
    else if( anticlockwise && startAngle <= endAngle )
    {
        startAngle += Math.PI * 2;
    }

    var sweep = anticlockwise ? (startAngle - endAngle) * -1 : (endAngle - startAngle);
    var segs =  Math.ceil(Math.abs(sweep) / (Math.PI * 2)) * 40;

    if(sweep === 0)
    {
        return this;
    }

    var startX = cx + Math.cos(startAngle) * radius;
    var startY = cy + Math.sin(startAngle) * radius;

    if (this.currentPath)
    {
        this.currentPath.shape.points.push(startX, startY);
    }
    else
    {
        this.moveTo(startX, startY);
    }

    var points = this.currentPath.shape.points;

    var theta = sweep/(segs*2);
    var theta2 = theta*2;

    var cTheta = Math.cos(theta);
    var sTheta = Math.sin(theta);

    var segMinus = segs - 1;

    var remainder = ( segMinus % 1 ) / segMinus;

    for(var i=0; i<=segMinus; i++)
    {
        var real =  i + remainder * i;


        var angle = ((theta) + startAngle + (theta2 * real));

        var c = Math.cos(angle);
        var s = -Math.sin(angle);

        points.push(( (cTheta *  c) + (sTheta * s) ) * radius + cx,
                    ( (cTheta * -s) + (sTheta * c) ) * radius + cy);
    }

    this.dirty++;

    return this;
};

/**
 * Specifies a simple one-color fill that subsequent calls to other Graphics methods
 * (such as lineTo() or drawCircle()) use when drawing.
 *
 * @param color {number} the color of the fill
 * @param alpha {number} the alpha of the fill
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.beginFill = function (color, alpha)
{
    this.filling = true;
    this.fillColor = color || 0;
    this.fillAlpha = (alpha === undefined) ? 1 : alpha;

    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length <= 2)
        {
            this.currentPath.fill = this.filling;
            this.currentPath.fillColor = this.fillColor;
            this.currentPath.fillAlpha = this.fillAlpha;
        }
    }
    return this;
};

/**
 * Applies a fill to the lines and shapes that were added since the last call to the beginFill() method.
 *
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.endFill = function ()
{
    this.filling = false;
    this.fillColor = null;
    this.fillAlpha = 1;

    return this;
};

/**
 *
 * @param x {number} The X coord of the top-left of the rectangle
 * @param y {number} The Y coord of the top-left of the rectangle
 * @param width {number} The width of the rectangle
 * @param height {number} The height of the rectangle
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.drawRect = function ( x, y, width, height )
{
    this.drawShape(new math.Rectangle(x,y, width, height));

    return this;
};

/**
 *
 * @param x {number} The X coord of the top-left of the rectangle
 * @param y {number} The Y coord of the top-left of the rectangle
 * @param width {number} The width of the rectangle
 * @param height {number} The height of the rectangle
 * @param radius {number} Radius of the rectangle corners
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.drawRoundedRect = function ( x, y, width, height, radius )
{
    this.drawShape(new math.RoundedRectangle(x, y, width, height, radius));

    return this;
};

/**
 * Draws a circle.
 *
 * @param x {number} The X coordinate of the center of the circle
 * @param y {number} The Y coordinate of the center of the circle
 * @param radius {number} The radius of the circle
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.drawCircle = function (x, y, radius)
{
    this.drawShape(new math.Circle(x,y, radius));

    return this;
};

/**
 * Draws an ellipse.
 *
 * @param x {number} The X coordinate of the center of the ellipse
 * @param y {number} The Y coordinate of the center of the ellipse
 * @param width {number} The half width of the ellipse
 * @param height {number} The half height of the ellipse
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.drawEllipse = function (x, y, width, height)
{
    this.drawShape(new math.Ellipse(x, y, width, height));

    return this;
};

/**
 * Draws a polygon using the given path.
 *
 * @param path {number[]|PIXI.Point[]} The path data used to construct the polygon.
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.drawPolygon = function (path)
{
    // prevents an argument assignment deopt
    // see section 3.1: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var points = path;

    var closed = true;

    if (points instanceof math.Polygon)
    {
        closed = points.closed;
        points = points.points;
    }

    if (!Array.isArray(points))
    {
        // prevents an argument leak deopt
        // see section 3.2: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
        points = new Array(arguments.length);

        for (var i = 0; i < points.length; ++i)
        {
            points[i] = arguments[i];
        }
    }

    var shape = new math.Polygon(points);
    shape.closed = closed;

    this.drawShape(shape);

    return this;
};

/**
 * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
 *
 * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
 */
Graphics.prototype.clear = function ()
{
    this.lineWidth = 0;
    this.filling = false;

    this.dirty++;
    this.clearDirty++;
    this.graphicsData = [];

    return this;
};

/**
 * True if graphics consists of one rectangle, and thus, can be drawn like a Sprite and masked with gl.scissor
 * @returns {boolean}
 */
Graphics.prototype.isFastRect = function() {
    return this.graphicsData.length === 1 && this.graphicsData[0].shape.type === CONST.SHAPES.RECT && !this.graphicsData[0].lineWidth;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 * @private
 */
Graphics.prototype._renderWebGL = function (renderer)
{
    // if the sprite is not visible or the alpha is 0 then no need to render this element
    if(this.dirty !== this.fastRectDirty)
    {
        this.fastRectDirty = this.dirty;
        this._fastRect = this.isFastRect();
    }

    //TODO this check can be moved to dirty?
    if(this._fastRect)
    {
        this._renderSpriteRect(renderer);
    }
    else
    {
        renderer.setObjectRenderer(renderer.plugins.graphics);
        renderer.plugins.graphics.render(this);
    }

};

Graphics.prototype._renderSpriteRect = function (renderer)
{
    var rect = this.graphicsData[0].shape;
    if(!this._spriteRect)
    {
        if(!Graphics._SPRITE_TEXTURE)
        {
            Graphics._SPRITE_TEXTURE = RenderTexture.create(10, 10);

            var currentRenderTarget = renderer._activeRenderTarget;
            renderer.bindRenderTexture(Graphics._SPRITE_TEXTURE);
            renderer.clear([1,1,1,1]);
            renderer.bindRenderTarget(currentRenderTarget);
        }

        this._spriteRect = new Sprite(Graphics._SPRITE_TEXTURE);
    }
    this._spriteRect.tint = this.graphicsData[0].fillColor;
    this._spriteRect.alpha = this.graphicsData[0].fillAlpha;
    this._spriteRect.worldAlpha = this.worldAlpha * this._spriteRect.alpha;

    Graphics._SPRITE_TEXTURE._frame.width = rect.width;
    Graphics._SPRITE_TEXTURE._frame.height = rect.height;

    this._spriteRect.transform.worldTransform = this.transform.worldTransform;

    this._spriteRect.anchor.set(-rect.x / rect.width, -rect.y / rect.height);
    this._spriteRect.onAnchorUpdate();

    this._spriteRect._renderWebGL(renderer);
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
Graphics.prototype._renderCanvas = function (renderer)
{
    if (this.isMask === true)
    {
        return;
    }

    renderer.plugins.graphics.render(this);
};

/**
 * Retrieves the bounds of the graphic shape as a rectangle object
 *
 * @param [matrix] {PIXI.Matrix} The world transform matrix to use, defaults to this
 *  object's worldTransform.
 * @return {PIXI.Rectangle} the rectangular bounding area
 */
Graphics.prototype._calculateBounds = function ()
{
    if (!this.renderable)
    {
        return;
    }

    if (this.boundsDirty !== this.dirty)
    {
        this.boundsDirty = this.dirty;
        this.updateLocalBounds();

        this.dirty++;
        this.cachedSpriteDirty = true;
    }

    var lb = this._localBounds;
    this._bounds.addFrame(this.transform, lb.minX, lb.minY, lb.maxX, lb.maxY);
};

/**
* Tests if a point is inside this graphics object
*
* @param point {PIXI.Point} the point to test
* @return {boolean} the result of the test
*/
Graphics.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var graphicsData = this.graphicsData;

    for (var i = 0; i < graphicsData.length; i++)
    {
        var data = graphicsData[i];

        if (!data.fill)
        {
            continue;
        }

        // only deal with fills..
        if (data.shape)
        {
            if ( data.shape.contains( tempPoint.x, tempPoint.y ) )
            {
                return true;
            }
        }
    }

    return false;
};

/**
 * Update the bounds of the object
 *
 */
Graphics.prototype.updateLocalBounds = function ()
{
    var minX = Infinity;
    var maxX = -Infinity;

    var minY = Infinity;
    var maxY = -Infinity;

    if (this.graphicsData.length)
    {
        var shape, points, x, y, w, h;

        for (var i = 0; i < this.graphicsData.length; i++)
        {
            var data = this.graphicsData[i];
            var type = data.type;
            var lineWidth = data.lineWidth;
            shape = data.shape;

            if (type === CONST.SHAPES.RECT || type === CONST.SHAPES.RREC)
            {
                x = shape.x - lineWidth/2;
                y = shape.y - lineWidth/2;
                w = shape.width + lineWidth;
                h = shape.height + lineWidth;

                minX = x < minX ? x : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y < minY ? y : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if (type === CONST.SHAPES.CIRC)
            {
                x = shape.x;
                y = shape.y;
                w = shape.radius + lineWidth/2;
                h = shape.radius + lineWidth/2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if (type === CONST.SHAPES.ELIP)
            {
                x = shape.x;
                y = shape.y;
                w = shape.width + lineWidth/2;
                h = shape.height + lineWidth/2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else
            {
                // POLY
                points = shape.points;

                for (var j = 0; j < points.length; j += 2)
                {
                    x = points[j];
                    y = points[j+1];

                    minX = x-lineWidth < minX ? x-lineWidth : minX;
                    maxX = x+lineWidth > maxX ? x+lineWidth : maxX;

                    minY = y-lineWidth < minY ? y-lineWidth : minY;
                    maxY = y+lineWidth > maxY ? y+lineWidth : maxY;
                }
            }
        }
    }
    else
    {
        minX = 0;
        maxX = 0;
        minY = 0;
        maxY = 0;
    }

    var padding = this.boundsPadding;

    this._localBounds.minX = minX - padding;
    this._localBounds.maxX = maxX + padding * 2;

    this._localBounds.minY = minY - padding;
    this._localBounds.maxY = maxY + padding * 2;
};


/**
 * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
 *
 * @param shape {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} The shape object to draw.
 * @return {PIXI.GraphicsData} The generated GraphicsData object.
 */
Graphics.prototype.drawShape = function (shape)
{
    if (this.currentPath)
    {
        // check current path!
        if (this.currentPath.shape.points.length <= 2)
        {
            this.graphicsData.pop();
        }
    }

    this.currentPath = null;

    var data = new GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, shape);

    this.graphicsData.push(data);

    if (data.type === CONST.SHAPES.POLY)
    {
        data.shape.closed = data.shape.closed || this.filling;
        this.currentPath = data;
    }

    this.dirty++;

    return data;
};

Graphics.prototype.generateCanvasTexture = function(scaleMode, resolution)
{
    resolution = resolution || 1;

    var bounds = this.getLocalBounds();

    var canvasBuffer = new RenderTexture.create(bounds.width * resolution, bounds.height * resolution);

    if(!canvasRenderer)
    {
        canvasRenderer = new CanvasRenderer();
    }

    tempMatrix.tx = -bounds.x;
    tempMatrix.ty = -bounds.y;

    canvasRenderer.render(this, canvasBuffer, false, tempMatrix);

    var texture = Texture.fromCanvas(canvasBuffer.baseTexture._canvasRenderTarget.canvas, scaleMode);
    texture.baseTexture.resolution = resolution;

    return texture;
};

Graphics.prototype.closePath = function ()
{
    // ok so close path assumes next one is a hole!
    var currentPath = this.currentPath;
    if (currentPath && currentPath.shape)
    {
        currentPath.shape.close();
    }
    return this;
};

Graphics.prototype.addHole = function()
{
    // this is a hole!
    var hole = this.graphicsData.pop();

    this.currentPath = this.graphicsData[this.graphicsData.length-1];

    this.currentPath.addHole(hole.shape);
    this.currentPath = null;

    return this;
};

/**
 * Destroys the Graphics object.
 */
Graphics.prototype.destroy = function ()
{
    Container.prototype.destroy.apply(this, arguments);

    // destroy each of the GraphicsData objects
    for (var i = 0; i < this.graphicsData.length; ++i) {
        this.graphicsData[i].destroy();
    }

    // for each webgl data entry, destroy the WebGLGraphicsData
    for (var id in this._webgl) {
        for (var j = 0; j < this._webgl[id].data.length; ++j) {
            this._webgl[id].data[j].destroy();
        }
    }

    if(this._spriteRect)
    {
        this._spriteRect.destroy();
    }
    this.graphicsData = null;

    this.currentPath = null;
    this._webgl = null;
    this._localBounds = null;
};

},{"../const":78,"../display/Bounds":79,"../display/Container":80,"../math":102,"../renderers/canvas/CanvasRenderer":109,"../sprites/Sprite":133,"../textures/RenderTexture":143,"../textures/Texture":144,"./GraphicsData":86,"./utils/bezierCurveTo":88}],86:[function(require,module,exports){
/**
 * A GraphicsData object.
 *
 * @class
 * @memberof PIXI
 * @param lineWidth {number} the width of the line to draw
 * @param lineColor {number} the color of the line to draw
 * @param lineAlpha {number} the alpha of the line to draw
 * @param fillColor {number} the color of the fill
 * @param fillAlpha {number} the alpha of the fill
 * @param fill      {boolean} whether or not the shape is filled with a colour
 * @param shape     {PIXI.Circle|PIXI.Rectangle|PIXI.Ellipse|PIXI.Polygon} The shape object to draw.
 */
function GraphicsData(lineWidth, lineColor, lineAlpha, fillColor, fillAlpha, fill, shape)
{
    /*
     * @member {number} the width of the line to draw
     */
    this.lineWidth = lineWidth;

    /*
     * @member {number} the color of the line to draw
     */
    this.lineColor = lineColor;

    /*
     * @member {number} the alpha of the line to draw
     */
    this.lineAlpha = lineAlpha;

    /*
     * @member {number} cached tint of the line to draw
     */
    this._lineTint = lineColor;

    /*
     * @member {number} the color of the fill
     */
    this.fillColor = fillColor;

    /*
     * @member {number} the alpha of the fill
     */
    this.fillAlpha = fillAlpha;

    /*
     * @member {number} cached tint of the fill
     */
    this._fillTint = fillColor;

    /*
     * @member {boolean} whether or not the shape is filled with a colour
     */
    this.fill = fill;

    this.holes = [];

    /*
     * @member {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} The shape object to draw.
     */
    this.shape = shape;

    /*
     * @member {number} The type of the shape, see the Const.Shapes file for all the existing types,
     */
    this.type = shape.type;
}

GraphicsData.prototype.constructor = GraphicsData;
module.exports = GraphicsData;

/**
 * Creates a new GraphicsData object with the same values as this one.
 *
 * @return {PIXI.GraphicsData} Cloned GraphicsData object
 */
GraphicsData.prototype.clone = function ()
{
    return new GraphicsData(
        this.lineWidth,
        this.lineColor,
        this.lineAlpha,
        this.fillColor,
        this.fillAlpha,
        this.fill,
        this.shape
    );
};

/**
 *
 *
 */
GraphicsData.prototype.addHole = function (shape)
{
    this.holes.push(shape);
};

/**
 * Destroys the Graphics data.
 */
GraphicsData.prototype.destroy = function () {
    this.shape = null;
    this.holes = null;
};

},{}],87:[function(require,module,exports){
var CanvasRenderer = require('../../renderers/canvas/CanvasRenderer'),
    CONST = require('../../const');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's CanvasGraphicsRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/CanvasGraphicsRenderer.java
 */

/**
 * Renderer dedicated to drawing and batching graphics objects.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.SystemRenderer} The current PIXI renderer.
 */
function CanvasGraphicsRenderer(renderer)
{
    this.renderer = renderer;
}


CanvasGraphicsRenderer.prototype.constructor = CanvasGraphicsRenderer;
module.exports = CanvasGraphicsRenderer;

CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);

/*
 * Renders a Graphics object to a canvas.
 *
 * @param graphics {PIXI.Graphics} the actual graphics object to render
 * @param context {CanvasRenderingContext2D} the 2d drawing method of the canvas
 */
CanvasGraphicsRenderer.prototype.render = function (graphics)
{
    var renderer = this.renderer;
    var context = renderer.context;
    var worldAlpha = graphics.worldAlpha;
    var transform = graphics.transform.worldTransform;
    var resolution = renderer.resolution;

     // if the tint has changed, set the graphics object to dirty.
    if (this._prevTint !== this.tint) {
        this.dirty = true;
    }

    context.setTransform(
        transform.a * resolution,
        transform.b * resolution,
        transform.c * resolution,
        transform.d * resolution,
        transform.tx * resolution,
        transform.ty * resolution
    );


    if (graphics.dirty)
    {
        this.updateGraphicsTint(graphics);
        graphics.dirty = false;
    }

    renderer.setBlendMode(graphics.blendMode);

    for (var i = 0; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];
        var shape = data.shape;

        var fillColor = data._fillTint;
        var lineColor = data._lineTint;

        context.lineWidth = data.lineWidth;

        if (data.type === CONST.SHAPES.POLY)
        {
            context.beginPath();

            this.renderPolygon(shape.points, shape.closed, context);

            for (var j = 0; j < data.holes.length; j++)
            {
                var hole = data.holes[j];
                this.renderPolygon(hole.points, true, context);
            }


            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.RECT)
        {

            if (data.fillColor || data.fillColor === 0)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fillRect(shape.x, shape.y, shape.width, shape.height);

            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
        }
        else if (data.type === CONST.SHAPES.CIRC)
        {
            // TODO - need to be Undefined!
            context.beginPath();
            context.arc(shape.x, shape.y, shape.radius,0,2*Math.PI);
            context.closePath();

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.ELIP)
        {
            // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

            var w = shape.width * 2;
            var h = shape.height * 2;

            var x = shape.x - w/2;
            var y = shape.y - h/2;

            context.beginPath();

            var kappa = 0.5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w,           // x-end
                ye = y + h,           // y-end
                xm = x + w / 2,       // x-middle
                ym = y + h / 2;       // y-middle

            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

            context.closePath();

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === CONST.SHAPES.RREC)
        {
            var rx = shape.x;
            var ry = shape.y;
            var width = shape.width;
            var height = shape.height;
            var radius = shape.radius;

            var maxRadius = Math.min(width, height) / 2 | 0;
            radius = radius > maxRadius ? maxRadius : radius;

            context.beginPath();
            context.moveTo(rx, ry + radius);
            context.lineTo(rx, ry + height - radius);
            context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
            context.lineTo(rx + width - radius, ry + height);
            context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
            context.lineTo(rx + width, ry + radius);
            context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
            context.lineTo(rx + radius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + radius);
            context.closePath();

            if (data.fillColor || data.fillColor === 0)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();

            }
            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
    }
};

/*
 * Updates the tint of a graphics object
 *
 * @private
 * @param graphics {PIXI.Graphics} the graphics that will have its tint updated
 *
 */
CanvasGraphicsRenderer.prototype.updateGraphicsTint = function (graphics)
{
    graphics._prevTint = graphics.tint;

    var tintR = (graphics.tint >> 16 & 0xFF) / 255;
    var tintG = (graphics.tint >> 8 & 0xFF) / 255;
    var tintB = (graphics.tint & 0xFF)/ 255;

    for (var i = 0; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];

        var fillColor = data.fillColor | 0;
        var lineColor = data.lineColor | 0;

        // super inline cos im an optimization NAZI :)
        data._fillTint = (((fillColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((fillColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (fillColor & 0xFF) / 255 * tintB*255);
        data._lineTint = (((lineColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((lineColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (lineColor & 0xFF) / 255 * tintB*255);
    }
};

CanvasGraphicsRenderer.prototype.renderPolygon = function (points, close, context)
{
    context.moveTo(points[0], points[1]);

    for (var j=1; j < points.length/2; j++)
    {
        context.lineTo(points[j * 2], points[j * 2 + 1]);
    }

    if (close)
    {
        context.closePath();
    }
};

/*
 * destroy graphics object
 *
 */
CanvasGraphicsRenderer.prototype.destroy = function ()
{
  this.renderer = null;
};

},{"../../const":78,"../../renderers/canvas/CanvasRenderer":109}],88:[function(require,module,exports){

/**
 * Calculate the points for a bezier curve and then draws it.
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @param fromX {number} Starting point x
 * @param fromY {number} Starting point y
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param cpX2 {number} Second Control point x
 * @param cpY2 {number} Second Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @param [path=number[]] Path array to push points into
 * @return {PIXI.Graphics}
 */
var bezierCurveTo = function (fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY, path) // jshint ignore:line
{
    path = path || [];

    var n = 20,
        dt,
        dt2,
        dt3,
        t2,
        t3;

    path.push(fromX, fromY);

    var j = 0;

    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        dt = (1 - j);
        dt2 = dt * dt;
        dt3 = dt2 * dt;

        t2 = j * j;
        t3 = t2 * j;

        path.push( dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX,
                   dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
    }

    return path;
};

module.exports = bezierCurveTo;

},{}],89:[function(require,module,exports){
var utils = require('../../utils'),
    CONST = require('../../const'),
    ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    WebGLGraphicsData = require('./WebGLGraphicsData'),
    PrimitiveShader = require('./shaders/PrimitiveShader'),

    // some drawing functions..
    buildPoly = require('./utils/buildPoly'),
    buildRectangle = require('./utils/buildRectangle'),
    buildRoundedRectangle = require('./utils/buildRoundedRectangle'),
    buildCircle = require('./utils/buildCircle');



/**
 * Renders the graphics object.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this object renderer works for.
 */
function GraphicsRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    this.graphicsDataPool = [];

    this.primitiveShader = null;

    this.gl = renderer.gl;

    // easy access!
    this.CONTEXT_UID = 0;
}

GraphicsRenderer.prototype = Object.create(ObjectRenderer.prototype);
GraphicsRenderer.prototype.constructor = GraphicsRenderer;
module.exports = GraphicsRenderer;

WebGLRenderer.registerPlugin('graphics', GraphicsRenderer);

/**
 * Called when there is a WebGL context change
 *
 * @private
 *
 */
GraphicsRenderer.prototype.onContextChange = function()
{
    this.gl = this.renderer.gl;
    this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    this.primitiveShader = new PrimitiveShader(this.gl);
};

/**
 * Destroys this renderer.
 *
 */
GraphicsRenderer.prototype.destroy = function ()
{
    ObjectRenderer.prototype.destroy.call(this);

    for (var i = 0; i < this.graphicsDataPool.length; ++i) {
        this.graphicsDataPool[i].destroy();
    }

    this.graphicsDataPool = null;
};

/**
 * Renders a graphics object.
 *
 * @param graphics {PIXI.Graphics} The graphics object to render.
 */
GraphicsRenderer.prototype.render = function(graphics)
{
    var renderer = this.renderer;
    var gl = renderer.gl;

    var webGLData;

    var webGL = graphics._webGL[this.CONTEXT_UID];

    if (!webGL || graphics.dirty !== webGL.dirty )
    {

        this.updateGraphics(graphics);

        webGL = graphics._webGL[this.CONTEXT_UID];
    }



    // This  could be speeded up for sure!
    var shader = this.primitiveShader;
    renderer.bindShader(shader);
    renderer.state.setBlendMode( graphics.blendMode );

    for (var i = 0, n = webGL.data.length; i < n; i++)
    {
        webGLData = webGL.data[i];
        var shaderTemp = webGLData.shader;

        renderer.bindShader(shaderTemp);
        shaderTemp.uniforms.translationMatrix = graphics.transform.worldTransform.toArray(true);
        shaderTemp.uniforms.tint = utils.hex2rgb(graphics.tint);
        shaderTemp.uniforms.alpha = graphics.worldAlpha;

        webGLData.vao.bind()
        .draw(gl.TRIANGLE_STRIP,  webGLData.indices.length)
        .unbind();
    }
};

/**
 * Updates the graphics object
 *
 * @private
 * @param graphics {PIXI.Graphics} The graphics object to update
 */
GraphicsRenderer.prototype.updateGraphics = function(graphics)
{
    var gl = this.renderer.gl;

     // get the contexts graphics object
    var webGL = graphics._webGL[this.CONTEXT_UID];

    // if the graphics object does not exist in the webGL context time to create it!
    if (!webGL)
    {
        webGL = graphics._webGL[this.CONTEXT_UID] = {lastIndex:0, data:[], gl:gl, clearDirty:-1, dirty:-1};

    }

    // flag the graphics as not dirty as we are about to update it...
    webGL.dirty = graphics.dirty;

    var i;

    // if the user cleared the graphics object we will need to clear every object
    if (graphics.clearDirty !== webGL.clearDirty)
    {
        webGL.clearDirty = graphics.clearDirty;

        // loop through and return all the webGLDatas to the object pool so than can be reused later on
        for (i = 0; i < webGL.data.length; i++)
        {
            var graphicsData = webGL.data[i];
            this.graphicsDataPool.push( graphicsData );
        }

        // clear the array and reset the index..
        webGL.data = [];
        webGL.lastIndex = 0;
    }

    var webGLData;

    // loop through the graphics datas and construct each one..
    // if the object is a complex fill then the new stencil buffer technique will be used
    // other wise graphics objects will be pushed into a batch..
    for (i = webGL.lastIndex; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];

        //TODO - this can be simplified
        webGLData = this.getWebGLData(webGL, 0);

        if (data.type === CONST.SHAPES.POLY)
        {
            buildPoly(data, webGLData);
        }
        if (data.type === CONST.SHAPES.RECT)
        {
            buildRectangle(data, webGLData);
        }
        else if (data.type === CONST.SHAPES.CIRC || data.type === CONST.SHAPES.ELIP)
        {
            buildCircle(data, webGLData);
        }
        else if (data.type === CONST.SHAPES.RREC)
        {
            buildRoundedRectangle(data, webGLData);
        }

        webGL.lastIndex++;
    }

    // upload all the dirty data...
    for (i = 0; i < webGL.data.length; i++)
    {
        webGLData = webGL.data[i];

        if (webGLData.dirty)
        {
            webGLData.upload();
        }
    }
};

/**
 *
 * @private
 * @param webGL {WebGLRenderingContext} the current WebGL drawing context
 * @param type {number} TODO @Alvin
 */
GraphicsRenderer.prototype.getWebGLData = function (webGL, type)
{
    var webGLData = webGL.data[webGL.data.length-1];

    if (!webGLData || webGLData.points.length > 320000)
    {
        webGLData = this.graphicsDataPool.pop() || new WebGLGraphicsData(this.renderer.gl, this.primitiveShader, this.renderer.state.attribsState);
        webGLData.reset(type);
        webGL.data.push(webGLData);
    }

    webGLData.dirty = true;

    return webGLData;
};

},{"../../const":78,"../../renderers/webgl/WebGLRenderer":116,"../../renderers/webgl/utils/ObjectRenderer":126,"../../utils":151,"./WebGLGraphicsData":90,"./shaders/PrimitiveShader":91,"./utils/buildCircle":92,"./utils/buildPoly":94,"./utils/buildRectangle":95,"./utils/buildRoundedRectangle":96}],90:[function(require,module,exports){
var glCore = require('pixi-gl-core');


/**
 * An object containing WebGL specific properties to be used by the WebGL renderer
 *
 * @class
 * @private
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The current WebGL drawing context
 * @param shader {PIXI.Shader} The shader
 * @param attribsState {object} The state for the VAO
 */
function WebGLGraphicsData(gl, shader, attribsState)
{

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
    this.buffer = glCore.GLBuffer.createVertexBuffer(gl);

    /**
     * The index buffer
     * @member {WebGLBuffer}
     */
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl);

    /**
     * Whether this graphics is dirty or not
     * @member {boolean}
     */
    this.dirty = true;

    this.glPoints = null;
    this.glIndices = null;

    /**
     *
     * @member {PIXI.Shader}
     */
    this.shader = shader;

    this.vao =  new glCore.VertexArrayObject(gl, attribsState)
    .addIndex(this.indexBuffer)
    .addAttribute(this.buffer, shader.attributes.aVertexPosition, gl.FLOAT, false, 4 * 6, 0)
    .addAttribute(this.buffer, shader.attributes.aColor, gl.FLOAT, false, 4 * 6, 2 * 4);


}

WebGLGraphicsData.prototype.constructor = WebGLGraphicsData;
module.exports = WebGLGraphicsData;

/**
 * Resets the vertices and the indices
 */
WebGLGraphicsData.prototype.reset = function ()
{
    this.points.length = 0;
    this.indices.length = 0;
};

/**
 * Binds the buffers and uploads the data
 */
WebGLGraphicsData.prototype.upload = function ()
{
    this.glPoints = new Float32Array(this.points);
    this.buffer.upload( this.glPoints );

    this.glIndices = new Uint16Array(this.indices);
    this.indexBuffer.upload( this.glIndices );

    this.dirty = false;
};



/**
 * Empties all the data
 */
WebGLGraphicsData.prototype.destroy = function ()
{
    this.color = null;
    this.points = null;
    this.indices = null;

    this.vao.destroy();
    this.buffer.destroy();
    this.indexBuffer.destroy();

    this.gl = null;

    this.buffer = null;
    this.indexBuffer = null;

    this.glPoints = null;
    this.glIndices = null;
};

},{"pixi-gl-core":7}],91:[function(require,module,exports){
var Shader = require('../../../Shader');

/**
 * This shader is used to draw simple primitive shapes for {@link PIXI.Graphics}.
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param gl {WebGLRenderingContext} The webgl shader manager this shader works for.
 */
function PrimitiveShader(gl)
{
    Shader.call(this,
        gl,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec4 aColor;',

            'uniform mat3 translationMatrix;',
            'uniform mat3 projectionMatrix;',

            'uniform float alpha;',
            'uniform vec3 tint;',

            'varying vec4 vColor;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vColor = aColor * vec4(tint * alpha, alpha);',
            '}'
        ].join('\n'),
        // fragment shader
        [
            'varying vec4 vColor;',

            'void main(void){',
            '   gl_FragColor = vColor;',
            '}'
        ].join('\n')
    );
}

PrimitiveShader.prototype = Object.create(Shader.prototype);
PrimitiveShader.prototype.constructor = PrimitiveShader;

module.exports = PrimitiveShader;

},{"../../../Shader":77}],92:[function(require,module,exports){
var buildLine = require('./buildLine'),
    CONST = require('../../../const'),
    utils = require('../../../utils');

/**
 * Builds a circle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object to draw
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
var buildCircle = function (graphicsData, webGLData)
{
    // need to convert points to a nice regular data
    var circleData = graphicsData.shape;
    var x = circleData.x;
    var y = circleData.y;
    var width;
    var height;

    // TODO - bit hacky??
    if (graphicsData.type === CONST.SHAPES.CIRC)
    {
        width = circleData.radius;
        height = circleData.radius;
    }
    else
    {
        width = circleData.width;
        height = circleData.height;
    }

    var totalSegs = Math.floor(30 * Math.sqrt(circleData.radius)) || Math.floor(15 * Math.sqrt(circleData.width + circleData.height));
    var seg = (Math.PI * 2) / totalSegs ;

    var i = 0;

    if (graphicsData.fill)
    {
        var color = utils.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vecPos = verts.length/6;

        indices.push(vecPos);

        for (i = 0; i < totalSegs + 1 ; i++)
        {
            verts.push(x,y, r, g, b, alpha);

            verts.push(x + Math.sin(seg * i) * width,
                       y + Math.cos(seg * i) * height,
                       r, g, b, alpha);

            indices.push(vecPos++, vecPos++);
        }

        indices.push(vecPos-1);
    }

    if (graphicsData.lineWidth)
    {
        var tempPoints = graphicsData.points;

        graphicsData.points = [];

        for (i = 0; i < totalSegs + 1; i++)
        {
            graphicsData.points.push(x + Math.sin(seg * i) * width,
                                     y + Math.cos(seg * i) * height);
        }

        buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};


module.exports = buildCircle;

},{"../../../const":78,"../../../utils":151,"./buildLine":93}],93:[function(require,module,exports){
var math = require('../../../math'),
    utils = require('../../../utils');

/**
 * Builds a line to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
var buildLine = function (graphicsData, webGLData)
{
    // TODO OPTIMISE!
    var i = 0;
    var points = graphicsData.points;

    if (points.length === 0)
    {
        return;
    }
    // if the line width is an odd number add 0.5 to align to a whole pixel
    // commenting this out fixes #711 and #1620
    // if (graphicsData.lineWidth%2)
    // {
    //     for (i = 0; i < points.length; i++)
    //     {
    //         points[i] += 0.5;
    //     }
    // }

    // get first and last point.. figure out the middle!
    var firstPoint = new math.Point(points[0], points[1]);
    var lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);

    // if the first point is the last point - gonna have issues :)
    if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y)
    {
        // need to clone as we are going to slightly modify the shape..
        points = points.slice();

        points.pop();
        points.pop();

        lastPoint = new math.Point(points[points.length - 2], points[points.length - 1]);

        var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) *0.5;
        var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) *0.5;

        points.unshift(midPointX, midPointY);
        points.push(midPointX, midPointY);
    }

    var verts = webGLData.points;
    var indices = webGLData.indices;
    var length = points.length / 2;
    var indexCount = points.length;
    var indexStart = verts.length/6;

    // DRAW the Line
    var width = graphicsData.lineWidth / 2;

    // sort color
    var color = utils.hex2rgb(graphicsData.lineColor);
    var alpha = graphicsData.lineAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;

    var px, py, p1x, p1y, p2x, p2y, p3x, p3y;
    var perpx, perpy, perp2x, perp2y, perp3x, perp3y;
    var a1, b1, c1, a2, b2, c2;
    var denom, pdist, dist;

    p1x = points[0];
    p1y = points[1];

    p2x = points[2];
    p2y = points[3];

    perpx = -(p1y - p2y);
    perpy =  p1x - p2x;

    dist = Math.sqrt(perpx*perpx + perpy*perpy);

    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;

    // start
    verts.push(p1x - perpx , p1y - perpy,
                r, g, b, alpha);

    verts.push(p1x + perpx , p1y + perpy,
                r, g, b, alpha);

    for (i = 1; i < length-1; i++)
    {
        p1x = points[(i-1)*2];
        p1y = points[(i-1)*2 + 1];

        p2x = points[(i)*2];
        p2y = points[(i)*2 + 1];

        p3x = points[(i+1)*2];
        p3y = points[(i+1)*2 + 1];

        perpx = -(p1y - p2y);
        perpy = p1x - p2x;

        dist = Math.sqrt(perpx*perpx + perpy*perpy);
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;

        perp2x = -(p2y - p3y);
        perp2y = p2x - p3x;

        dist = Math.sqrt(perp2x*perp2x + perp2y*perp2y);
        perp2x /= dist;
        perp2y /= dist;
        perp2x *= width;
        perp2y *= width;

        a1 = (-perpy + p1y) - (-perpy + p2y);
        b1 = (-perpx + p2x) - (-perpx + p1x);
        c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
        a2 = (-perp2y + p3y) - (-perp2y + p2y);
        b2 = (-perp2x + p2x) - (-perp2x + p3x);
        c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);

        denom = a1*b2 - a2*b1;

        if (Math.abs(denom) < 0.1 )
        {

            denom+=10.1;
            verts.push(p2x - perpx , p2y - perpy,
                r, g, b, alpha);

            verts.push(p2x + perpx , p2y + perpy,
                r, g, b, alpha);

            continue;
        }

        px = (b1*c2 - b2*c1)/denom;
        py = (a2*c1 - a1*c2)/denom;


        pdist = (px -p2x) * (px -p2x) + (py -p2y) * (py -p2y);


        if (pdist > 140 * 140)
        {
            perp3x = perpx - perp2x;
            perp3y = perpy - perp2y;

            dist = Math.sqrt(perp3x*perp3x + perp3y*perp3y);
            perp3x /= dist;
            perp3y /= dist;
            perp3x *= width;
            perp3y *= width;

            verts.push(p2x - perp3x, p2y -perp3y);
            verts.push(r, g, b, alpha);

            verts.push(p2x + perp3x, p2y +perp3y);
            verts.push(r, g, b, alpha);

            verts.push(p2x - perp3x, p2y -perp3y);
            verts.push(r, g, b, alpha);

            indexCount++;
        }
        else
        {

            verts.push(px , py);
            verts.push(r, g, b, alpha);

            verts.push(p2x - (px-p2x), p2y - (py - p2y));
            verts.push(r, g, b, alpha);
        }
    }

    p1x = points[(length-2)*2];
    p1y = points[(length-2)*2 + 1];

    p2x = points[(length-1)*2];
    p2y = points[(length-1)*2 + 1];

    perpx = -(p1y - p2y);
    perpy = p1x - p2x;

    dist = Math.sqrt(perpx*perpx + perpy*perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;

    verts.push(p2x - perpx , p2y - perpy);
    verts.push(r, g, b, alpha);

    verts.push(p2x + perpx , p2y + perpy);
    verts.push(r, g, b, alpha);

    indices.push(indexStart);

    for (i = 0; i < indexCount; i++)
    {
        indices.push(indexStart++);
    }

    indices.push(indexStart-1);
};

module.exports = buildLine;

},{"../../../math":102,"../../../utils":151}],94:[function(require,module,exports){
var buildLine = require('./buildLine'),
    utils = require('../../../utils'),
    earcut = require('earcut');

/**
 * Builds a polygon to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
var buildPoly = function (graphicsData, webGLData)
{
    graphicsData.points = graphicsData.shape.points.slice();

    var points = graphicsData.points;

    if(graphicsData.fill && points.length > 6)
    {

        var holeArray = [];
             // Process holes..
        var holes = graphicsData.holes;

        for (var i = 0; i < holes.length; i++) {
            var hole = holes[i];

            holeArray.push(points.length/2);

            points = points.concat(hole.points);
        }

        // get first and last point.. figure out the middle!
        var verts = webGLData.points;
        var indices = webGLData.indices;

        var length = points.length / 2;

        // sort color
        var color = utils.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;
        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var triangles = earcut(points, holeArray, 2);

        if (!triangles) {
            return;
        }

        var vertPos = verts.length / 6;

        for (i = 0; i < triangles.length; i+=3)
        {
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i+1] + vertPos);
            indices.push(triangles[i+2] +vertPos);
            indices.push(triangles[i+2] + vertPos);
        }

        for (i = 0; i < length; i++)
        {
            verts.push(points[i * 2], points[i * 2 + 1],
                       r, g, b, alpha);
        }
    }

    if (graphicsData.lineWidth > 0)
    {
        buildLine(graphicsData, webGLData);
    }
};


module.exports = buildPoly;

},{"../../../utils":151,"./buildLine":93,"earcut":31}],95:[function(require,module,exports){
var buildLine = require('./buildLine'),
    utils = require('../../../utils');

/**
 * Builds a rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
var buildRectangle = function (graphicsData, webGLData)
{
    // --- //
    // need to convert points to a nice regular data
    //
    var rectData = graphicsData.shape;
    var x = rectData.x;
    var y = rectData.y;
    var width = rectData.width;
    var height = rectData.height;

    if (graphicsData.fill)
    {
        var color = utils.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vertPos = verts.length/6;

        // start
        verts.push(x, y);
        verts.push(r, g, b, alpha);

        verts.push(x + width, y);
        verts.push(r, g, b, alpha);

        verts.push(x , y + height);
        verts.push(r, g, b, alpha);

        verts.push(x + width, y + height);
        verts.push(r, g, b, alpha);

        // insert 2 dead triangles..
        indices.push(vertPos, vertPos, vertPos+1, vertPos+2, vertPos+3, vertPos+3);
    }

    if (graphicsData.lineWidth)
    {
        var tempPoints = graphicsData.points;

        graphicsData.points = [x, y,
                  x + width, y,
                  x + width, y + height,
                  x, y + height,
                  x, y];


        buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

module.exports = buildRectangle;

},{"../../../utils":151,"./buildLine":93}],96:[function(require,module,exports){
var earcut = require('earcut'),
    buildLine = require('./buildLine'),
    utils = require('../../../utils');

/**
 * Builds a rounded rectangle to draw
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param graphicsData {PIXI.WebGLGraphicsData} The graphics object containing all the necessary properties
 * @param webGLData {object} an object containing all the webGL-specific information to create this shape
 */
var buildRoundedRectangle = function (graphicsData, webGLData)
{
    var rrectData = graphicsData.shape;
    var x = rrectData.x;
    var y = rrectData.y;
    var width = rrectData.width;
    var height = rrectData.height;

    var radius = rrectData.radius;

    var recPoints = [];
    recPoints.push(x, y + radius);
    quadraticBezierCurve(x, y + height - radius, x, y + height, x + radius, y + height, recPoints);
    quadraticBezierCurve(x + width - radius, y + height, x + width, y + height, x + width, y + height - radius, recPoints);
    quadraticBezierCurve(x + width, y + radius, x + width, y, x + width - radius, y, recPoints);
    quadraticBezierCurve(x + radius, y, x, y, x, y + radius + 0.0000000001, recPoints);

    // this tiny number deals with the issue that occurs when points overlap and earcut fails to triangulate the item.
    // TODO - fix this properly, this is not very elegant.. but it works for now.

    if (graphicsData.fill)
    {
        var color = utils.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vecPos = verts.length/6;

        var triangles = earcut(recPoints, null, 2);

        var i = 0;
        for (i = 0; i < triangles.length; i+=3)
        {
            indices.push(triangles[i] + vecPos);
            indices.push(triangles[i] + vecPos);
            indices.push(triangles[i+1] + vecPos);
            indices.push(triangles[i+2] + vecPos);
            indices.push(triangles[i+2] + vecPos);
        }

        for (i = 0; i < recPoints.length; i++)
        {
            verts.push(recPoints[i], recPoints[++i], r, g, b, alpha);
        }
    }

    if (graphicsData.lineWidth)
    {
        var tempPoints = graphicsData.points;

        graphicsData.points = recPoints;

        buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

/**
 * Calculate the points for a quadratic bezier curve. (helper function..)
 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
 *
 * Ignored from docs since it is not directly exposed.
 *
 * @ignore
 * @private
 * @param fromX {number} Origin point x
 * @param fromY {number} Origin point x
 * @param cpX {number} Control point x
 * @param cpY {number} Control point y
 * @param toX {number} Destination point x
 * @param toY {number} Destination point y
 * @param [out] {number[]} The output array to add points into. If not passed, a new array is created.
 * @return {number[]} an array of points
 */
var quadraticBezierCurve = function (fromX, fromY, cpX, cpY, toX, toY, out)// jshint ignore:line
{
    var xa,
        ya,
        xb,
        yb,
        x,
        y,
        n = 20,
        points = out || [];

    function getPt(n1 , n2, perc) {
        var diff = n2 - n1;

        return n1 + ( diff * perc );
    }

    var j = 0;
    for (var i = 0; i <= n; i++ ) {
        j = i / n;

        // The Green Line
        xa = getPt( fromX , cpX , j );
        ya = getPt( fromY , cpY , j );
        xb = getPt( cpX , toX , j );
        yb = getPt( cpY , toY , j );

        // The Black Dot
        x = getPt( xa , xb , j );
        y = getPt( ya , yb , j );

        points.push(x, y);
    }

    return points;
};


module.exports = buildRoundedRectangle;

},{"../../../utils":151,"./buildLine":93,"earcut":31}],97:[function(require,module,exports){
/**
 * @file        Main export of the PIXI core library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI
 */
// export core and const. We assign core to const so that the non-reference types in const remain in-tact
var core = module.exports = Object.assign(require('./const'), require('./math'), {
    // utils
    utils: require('./utils'),
    ticker: require('./ticker'),

    // display
    DisplayObject:          require('./display/DisplayObject'),
    Container:              require('./display/Container'),
    Transform:              require('./display/Transform'),
    TransformStatic:        require('./display/TransformStatic'),
    TransformBase:          require('./display/TransformBase'),

    // sprites
    Sprite:                 require('./sprites/Sprite'),
    CanvasSpriteRenderer:     require('./sprites/canvas/CanvasSpriteRenderer'),
    CanvasTinter:           require('./sprites/canvas/CanvasTinter'),
    SpriteRenderer:         require('./sprites/webgl/SpriteRenderer'),

    // text
    Text:                   require('./text/Text'),
    TextStyle:              require('./text/TextStyle'),
    // primitives
    Graphics:               require('./graphics/Graphics'),
    GraphicsData:           require('./graphics/GraphicsData'),
    GraphicsRenderer:       require('./graphics/webgl/GraphicsRenderer'),
    CanvasGraphicsRenderer: require('./graphics/canvas/CanvasGraphicsRenderer'),

    // textures
    Texture:                require('./textures/Texture'),
    BaseTexture:            require('./textures/BaseTexture'),
    RenderTexture:          require('./textures/RenderTexture'),
    BaseRenderTexture:      require('./textures/BaseRenderTexture'),
    VideoBaseTexture:       require('./textures/VideoBaseTexture'),
    TextureUvs:             require('./textures/TextureUvs'),

    // renderers - canvas
    CanvasRenderer:         require('./renderers/canvas/CanvasRenderer'),
    CanvasRenderTarget:     require('./renderers/canvas/utils/CanvasRenderTarget'),

    // renderers - webgl
    Shader:                 require('./Shader'),
    WebGLRenderer:          require('./renderers/webgl/WebGLRenderer'),
    WebGLManager:           require('./renderers/webgl/managers/WebGLManager'),
    ObjectRenderer:         require('./renderers/webgl/utils/ObjectRenderer'),
    RenderTarget:           require('./renderers/webgl/utils/RenderTarget'),
    Quad:                   require('./renderers/webgl/utils/Quad'),

    // filters - webgl
    SpriteMaskFilter:       require('./renderers/webgl/filters/spriteMask/SpriteMaskFilter'),
    Filter:                 require('./renderers/webgl/filters/Filter'),

    glCore:                   require('pixi-gl-core'),

    /**
     * This helper function will automatically detect which renderer you should be using.
     * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
     * the browser then this function will return a canvas renderer
     *
     * @memberof PIXI
     * @param width=800 {number} the width of the renderers view
     * @param height=600 {number} the height of the renderers view
     * @param [options] {object} The optional renderer parameters
     * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
     * @param [options.transparent=false] {boolean} If the render view is transparent, default false
     * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
     * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param [options.resolution=1] {number} The resolution / device pixel ratio of the renderer, retina would be 2
     * @param [noWebGL=false] {boolean} prevents selection of WebGL renderer, even if such is present
     *
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRenderer: function (width, height, options, noWebGL)
    {
        width = width || 800;
        height = height || 600;

        if (!noWebGL && core.utils.isWebGLSupported())
        {
            return new core.WebGLRenderer(width, height, options);
        }

        return new core.CanvasRenderer(width, height, options);
    }
});

},{"./Shader":77,"./const":78,"./display/Container":80,"./display/DisplayObject":81,"./display/Transform":82,"./display/TransformBase":83,"./display/TransformStatic":84,"./graphics/Graphics":85,"./graphics/GraphicsData":86,"./graphics/canvas/CanvasGraphicsRenderer":87,"./graphics/webgl/GraphicsRenderer":89,"./math":102,"./renderers/canvas/CanvasRenderer":109,"./renderers/canvas/utils/CanvasRenderTarget":111,"./renderers/webgl/WebGLRenderer":116,"./renderers/webgl/filters/Filter":118,"./renderers/webgl/filters/spriteMask/SpriteMaskFilter":121,"./renderers/webgl/managers/WebGLManager":125,"./renderers/webgl/utils/ObjectRenderer":126,"./renderers/webgl/utils/Quad":127,"./renderers/webgl/utils/RenderTarget":128,"./sprites/Sprite":133,"./sprites/canvas/CanvasSpriteRenderer":134,"./sprites/canvas/CanvasTinter":135,"./sprites/webgl/SpriteRenderer":137,"./text/Text":139,"./text/TextStyle":140,"./textures/BaseRenderTexture":141,"./textures/BaseTexture":142,"./textures/RenderTexture":143,"./textures/Texture":144,"./textures/TextureUvs":145,"./textures/VideoBaseTexture":146,"./ticker":148,"./utils":151,"pixi-gl-core":7}],98:[function(require,module,exports){
// Your friendly neighbour https://en.wikipedia.org/wiki/Dihedral_group of order 16

var ux = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1];
var uy = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1];
var vx = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1];
var vy = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1];
var tempMatrices = [];
var Matrix = require('./Matrix');

var mul = [];

function signum(x) {
    if (x < 0) {
        return -1;
    }
    if (x > 0) {
        return 1;
    }
    return 0;
}

function init() {
    for (var i = 0; i < 16; i++) {
        var row = [];
        mul.push(row);
        for (var j = 0; j < 16; j++) {
            var _ux = signum(ux[i] * ux[j] + vx[i] * uy[j]);
            var _uy = signum(uy[i] * ux[j] + vy[i] * uy[j]);
            var _vx = signum(ux[i] * vx[j] + vx[i] * vy[j]);
            var _vy = signum(uy[i] * vx[j] + vy[i] * vy[j]);
            for (var k = 0; k < 16; k++) {
                if (ux[k] === _ux && uy[k] === _uy && vx[k] === _vx && vy[k] === _vy) {
                    row.push(k);
                    break;
                }
            }
        }
    }

    for (i=0;i<16;i++) {
        var mat = new Matrix();
        mat.set(ux[i], uy[i], vx[i], vy[i], 0, 0);
        tempMatrices.push(mat);
    }
}

init();

/**
 * Implements Dihedral Group D_8, see [group D4]{@link http://mathworld.wolfram.com/DihedralGroupD4.html}, D8 is the same but with diagonals
 * Used for texture rotations
 * Vector xX(i), xY(i) is U-axis of sprite with rotation i
 * Vector yY(i), yY(i) is V-axis of sprite with rotation i
 * Rotations: 0 grad (0), 90 grad (2), 180 grad (4), 270 grad (6)
 * Mirrors: vertical (8), main diagonal (10), horizontal (12), reverse diagonal (14)
 * This is the small part of gameofbombs.com portal system. It works.
 * @author Ivan @ivanpopelyshev
 *
 * @namespace PIXI.GroupD8
 */
var GroupD8 = {
    E: 0,
    SE: 1,
    S: 2,
    SW: 3,
    W: 4,
    NW: 5,
    N: 6,
    NE: 7,
    MIRROR_VERTICAL: 8,
    MIRROR_HORIZONTAL: 12,
    uX: function (ind) {
        return ux[ind];
    },
    uY: function (ind) {
        return uy[ind];
    },
    vX: function (ind) {
        return vx[ind];
    },
    vY: function (ind) {
        return vy[ind];
    },
    inv: function (rotation) {
        if (rotation & 8) {
            return rotation & 15;
        }
        return (-rotation) & 7;
    },
    add: function (rotationSecond, rotationFirst) {
        return mul[rotationSecond][rotationFirst];
    },
    sub: function (rotationSecond, rotationFirst) {
        return mul[rotationSecond][GroupD8.inv(rotationFirst)];
    },
    /**
     * Adds 180 degrees to rotation. Commutative operation
     * @param rotation
     * @returns {number}
     */
    rotate180: function (rotation) {
        return rotation ^ 4;
    },
    /**
     * I dont know why sometimes width and heights needs to be swapped. We'll fix it later.
     * @param rotation
     * @returns {boolean}
     */
    isSwapWidthHeight: function(rotation) {
        return (rotation & 3) === 2;
    },
    byDirection: function (dx, dy) {
        if (Math.abs(dx) * 2 <= Math.abs(dy)) {
            if (dy >= 0) {
                return GroupD8.S;
            }
            else {
                return GroupD8.N;
            }
        } else if (Math.abs(dy) * 2 <= Math.abs(dx)) {
            if (dx > 0) {
                return GroupD8.E;
            }
            else {
                return GroupD8.W;
            }
        } else {
            if (dy > 0) {
                if (dx > 0) {
                    return GroupD8.SE;
                }
                else {
                    return GroupD8.SW;
                }
            }
            else if (dx > 0) {
                return GroupD8.NE;
            }
            else {
                return GroupD8.NW;
            }
        }
    },
    /**
     * Helps sprite to compensate texture packer rotation.
     * @param matrix {PIXI.Matrix} sprite world matrix
     * @param rotation {number}
     * @param tx {number|*} sprite anchoring
     * @param ty {number|*} sprite anchoring
     */
    matrixAppendRotationInv: function (matrix, rotation, tx, ty) {
        //Packer used "rotation", we use "inv(rotation)"
        var mat = tempMatrices[GroupD8.inv(rotation)];
        tx = tx || 0;
        ty = ty || 0;
        mat.tx = tx;
        mat.ty = ty;
        matrix.append(mat);
    }
};

module.exports = GroupD8;

},{"./Matrix":99}],99:[function(require,module,exports){
// @todo - ignore the too many parameters warning for now
// should either fix it or change the jshint config
// jshint -W072

var Point = require('./Point');

/**
 * The pixi Matrix class as an object, which makes it a lot faster,
 * here is a representation of it :
 * | a | b | tx|
 * | c | d | ty|
 * | 0 | 0 | 1 |
 *
 * @class
 * @memberof PIXI
 */
function Matrix()
{
    /**
     * @member {number}
     * @default 1
     */
    this.a = 1;

    /**
     * @member {number}
     * @default 0
     */
    this.b = 0;

    /**
     * @member {number}
     * @default 0
     */
    this.c = 0;

    /**
     * @member {number}
     * @default 1
     */
    this.d = 1;

    /**
     * @member {number}
     * @default 0
     */
    this.tx = 0;

    /**
     * @member {number}
     * @default 0
     */
    this.ty = 0;

    this.array = null;
}

Matrix.prototype.constructor = Matrix;
module.exports = Matrix;

/**
 * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
 *
 * a = array[0]
 * b = array[1]
 * c = array[3]
 * d = array[4]
 * tx = array[2]
 * ty = array[5]
 *
 * @param array {number[]} The array that the matrix will be populated from.
 */
Matrix.prototype.fromArray = function (array)
{
    this.a = array[0];
    this.b = array[1];
    this.c = array[3];
    this.d = array[4];
    this.tx = array[2];
    this.ty = array[5];
};


/**
 * sets the matrix properties
 *
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} tx
 * @param {number} ty
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.set = function (a, b, c, d, tx, ty)
{
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;

    return this;
};


/**
 * Creates an array from the current Matrix object.
 *
 * @param transpose {boolean} Whether we need to transpose the matrix or not
 * @param [out=new Float32Array(9)] {Float32Array} If provided the array will be assigned to out
 * @return {number[]} the newly created array which contains the matrix
 */
Matrix.prototype.toArray = function (transpose, out)
{
    if (!this.array)
    {
        this.array = new Float32Array(9);
    }

    var array = out || this.array;

    if (transpose)
    {
        array[0] = this.a;
        array[1] = this.b;
        array[2] = 0;
        array[3] = this.c;
        array[4] = this.d;
        array[5] = 0;
        array[6] = this.tx;
        array[7] = this.ty;
        array[8] = 1;
    }
    else
    {
        array[0] = this.a;
        array[1] = this.c;
        array[2] = this.tx;
        array[3] = this.b;
        array[4] = this.d;
        array[5] = this.ty;
        array[6] = 0;
        array[7] = 0;
        array[8] = 1;
    }

    return array;
};

/**
 * Get a new position with the current transformation applied.
 * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
 *
 * @param pos {PIXI.Point} The origin
 * @param [newPos] {PIXI.Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {PIXI.Point} The new point, transformed through this matrix
 */
Matrix.prototype.apply = function (pos, newPos)
{
    newPos = newPos || new Point();

    var x = pos.x;
    var y = pos.y;

    newPos.x = this.a * x + this.c * y + this.tx;
    newPos.y = this.b * x + this.d * y + this.ty;

    return newPos;
};

/**
 * Get a new position with the inverse of the current transformation applied.
 * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
 *
 * @param pos {PIXI.Point} The origin
 * @param [newPos] {PIXI.Point} The point that the new position is assigned to (allowed to be same as input)
 * @return {PIXI.Point} The new point, inverse-transformed through this matrix
 */
Matrix.prototype.applyInverse = function (pos, newPos)
{
    newPos = newPos || new Point();

    var id = 1 / (this.a * this.d + this.c * -this.b);

    var x = pos.x;
    var y = pos.y;

    newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
    newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;

    return newPos;
};

/**
 * Translates the matrix on the x and y.
 *
 * @param {number} x How much to translate x by
 * @param {number} y How much to translate y by
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.translate = function (x, y)
{
    this.tx += x;
    this.ty += y;

    return this;
};

/**
 * Applies a scale transformation to the matrix.
 *
 * @param {number} x The amount to scale horizontally
 * @param {number} y The amount to scale vertically
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.scale = function (x, y)
{
    this.a *= x;
    this.d *= y;
    this.c *= x;
    this.b *= y;
    this.tx *= x;
    this.ty *= y;

    return this;
};


/**
 * Applies a rotation transformation to the matrix.
 *
 * @param {number} angle - The angle in radians.
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.rotate = function (angle)
{
    var cos = Math.cos( angle );
    var sin = Math.sin( angle );

    var a1 = this.a;
    var c1 = this.c;
    var tx1 = this.tx;

    this.a = a1 * cos-this.b * sin;
    this.b = a1 * sin+this.b * cos;
    this.c = c1 * cos-this.d * sin;
    this.d = c1 * sin+this.d * cos;
    this.tx = tx1 * cos - this.ty * sin;
    this.ty = tx1 * sin + this.ty * cos;

    return this;
};

/**
 * Appends the given Matrix to this Matrix.
 *
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.append = function (matrix)
{
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;

    this.a  = matrix.a * a1 + matrix.b * c1;
    this.b  = matrix.a * b1 + matrix.b * d1;
    this.c  = matrix.c * a1 + matrix.d * c1;
    this.d  = matrix.c * b1 + matrix.d * d1;

    this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
    this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;

    return this;
};

/**
 * Sets the matrix based on all the available properties
 *
 * @param {number} x Position on the x axis
 * @param {number} y Position on the y axis
 * @param {number} pivotX Pivot on the x axis
 * @param {number} pivotY Pivot on the y axis
 * @param {number} scaleX Scale on the x axis
 * @param {number} scaleY Scale on the y axis
 * @param {number} rotation Rotation in radians
 * @param {number} skewX Skew on the x axis
 * @param {number} skewY Skew on the y axis
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.setTransform = function (x, y, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY)
{
    var a, b, c, d, sr, cr, cy, sy, nsx, cx;

    sr  = Math.sin(rotation);
    cr  = Math.cos(rotation);
    cy  = Math.cos(skewY);
    sy  = Math.sin(skewY);
    nsx = -Math.sin(skewX);
    cx  =  Math.cos(skewX);

    a  =  cr * scaleX;
    b  =  sr * scaleX;
    c  = -sr * scaleY;
    d  =  cr * scaleY;

    this.a  = cy * a + sy * c;
    this.b  = cy * b + sy * d;
    this.c  = nsx * a + cx * c;
    this.d  = nsx * b + cx * d;

    this.tx = x + ( pivotX * a + pivotY * c );
    this.ty = y + ( pivotX * b + pivotY * d );

    return this;
};

/**
 * Prepends the given Matrix to this Matrix.
 *
 * @param {PIXI.Matrix} matrix
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.prepend = function(matrix)
{
    var tx1 = this.tx;

    if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1)
    {
        var a1 = this.a;
        var c1 = this.c;
        this.a  = a1*matrix.a+this.b*matrix.c;
        this.b  = a1*matrix.b+this.b*matrix.d;
        this.c  = c1*matrix.a+this.d*matrix.c;
        this.d  = c1*matrix.b+this.d*matrix.d;
    }

    this.tx = tx1*matrix.a+this.ty*matrix.c+matrix.tx;
    this.ty = tx1*matrix.b+this.ty*matrix.d+matrix.ty;

    return this;
};

/**
 * Decomposes the matrix (x, y, scaleX, scaleY, and rotation) and sets the properties on to a transform.
 * @param transform {PIXI.Transform|PIXI.TransformStatic} the transform to apply the properties to.
 * @return {PIXI.Transform|PIXI.TransformStatic} The transform with the newly applied properies
*/
Matrix.prototype.decompose = function(transform)
{
    // sort out rotation / skew..
    var a = this.a,
        b = this.b,
        c = this.c,
        d = this.d;

    var skewX = Math.atan2(-c, d);
    var skewY = Math.atan2(b, a);

    var delta = Math.abs(1-skewX/skewY);

    if (delta < 0.00001)
    {
        transform.rotation = skewY;

        if (a < 0 && d >= 0)
        {
            transform.rotation += (transform.rotation <= 0) ? Math.PI : -Math.PI;
        }

        transform.skew.x = transform.skew.y = 0;

    }
    else
    {
        transform.skew.x = skewX;
        transform.skew.y = skewY;
    }

    // next set scale
    transform.scale.x = Math.sqrt(a * a + b * b);
    transform.scale.y = Math.sqrt(c * c + d * d);

    // next set position
    transform.position.x = this.tx;
    transform.position.y = this.ty;

    return transform;
};


/**
 * Inverts this matrix
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.invert = function()
{
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    var tx1 = this.tx;
    var n = a1*d1-b1*c1;

    this.a = d1/n;
    this.b = -b1/n;
    this.c = -c1/n;
    this.d = a1/n;
    this.tx = (c1*this.ty-d1*tx1)/n;
    this.ty = -(a1*this.ty-b1*tx1)/n;

    return this;
};


/**
 * Resets this Matix to an identity (default) matrix.
 *
 * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
 */
Matrix.prototype.identity = function ()
{
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;

    return this;
};

/**
 * Creates a new Matrix object with the same values as this one.
 *
 * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
 */
Matrix.prototype.clone = function ()
{
    var matrix = new Matrix();
    matrix.a = this.a;
    matrix.b = this.b;
    matrix.c = this.c;
    matrix.d = this.d;
    matrix.tx = this.tx;
    matrix.ty = this.ty;

    return matrix;
};

/**
 * Changes the values of the given matrix to be the same as the ones in this matrix
 *
 * @return {PIXI.Matrix} The matrix given in parameter with its values updated.
 */
Matrix.prototype.copy = function (matrix)
{
    matrix.a = this.a;
    matrix.b = this.b;
    matrix.c = this.c;
    matrix.d = this.d;
    matrix.tx = this.tx;
    matrix.ty = this.ty;

    return matrix;
};

/**
 * A default (identity) matrix
 *
 * @static
 * @const
 */
Matrix.IDENTITY = new Matrix();

/**
 * A temp matrix
 *
 * @static
 * @const
 */
Matrix.TEMP_MATRIX = new Matrix();

},{"./Point":101}],100:[function(require,module,exports){
/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 * An observable point is a point that triggers a callback when the point's position is changed.
 *
 * @class
 * @memberof PIXI
 * @param cb {Function} callback when changed
 * @param scope {Object} owner of callback
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function ObservablePoint(cb, scope, x, y)
{
    this._x = x || 0;
    this._y = y || 0;

    this.cb = cb;
    this.scope = scope;
}

ObservablePoint.prototype.constructor = ObservablePoint;
module.exports = ObservablePoint;



Object.defineProperties(ObservablePoint.prototype, {
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.ObservablePoint#
     */
    x: {
        get: function ()
        {
            return this._x;
        },
        set: function (value)
        {
            if (this._x !== value) {
                this._x = value;
                this.cb.call(this.scope);
            }
        }
    },
    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     *
     * @member {number}
     * @memberof PIXI.ObservablePoint#
     */
    y: {
        get: function ()
        {
            return this._y;
        },
        set: function (value)
        {
            if (this._y !== value) {
                this._y = value;
                this.cb.call(this.scope);
            }
        }
    }
});

/**
 * Sets the point to a new x and y position.
 * If y is omitted, both x and y will be set to x.
 *
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
ObservablePoint.prototype.set = function (x, y)
{
    var _x = x || 0;
    var _y = y || ( (y !== 0) ? _x : 0 );
    if (this._x !== _x || this._y !== _y)
    {
        this._x = _x;
        this._y = _y;
        this.cb.call(this.scope);
    }
};

/**
 * Copies the data from another point
 *
 * @param point {PIXI.Point|PIXI.ObservablePoint} point to copy from
 */
ObservablePoint.prototype.copy = function (point)
{
    if (this._x !== point.x || this._y !== point.y)
    {
        this._x = point.x;
        this._y = point.y;
        this.cb.call(this.scope);
    }
};

},{}],101:[function(require,module,exports){
/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 * @memberof PIXI
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
function Point(x, y)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;
}

Point.prototype.constructor = Point;
module.exports = Point;

/**
 * Creates a clone of this point
 *
 * @return {PIXI.Point} a copy of the point
 */
Point.prototype.clone = function ()
{
    return new Point(this.x, this.y);
};

/**
 * Copies x and y from the given point
 *
 * @param p {PIXI.Point}
 */
Point.prototype.copy = function (p) {
    this.set(p.x, p.y);
};

/**
 * Returns true if the given point is equal to this point
 *
 * @param p {PIXI.Point}
 * @returns {boolean} Whether the given point equal to this point
 */
Point.prototype.equals = function (p) {
    return (p.x === this.x) && (p.y === this.y);
};

/**
 * Sets the point to a new x and y position.
 * If y is omitted, both x and y will be set to x.
 *
 * @param [x=0] {number} position of the point on the x axis
 * @param [y=0] {number} position of the point on the y axis
 */
Point.prototype.set = function (x, y)
{
    this.x = x || 0;
    this.y = y || ( (y !== 0) ? this.x : 0 ) ;
};

},{}],102:[function(require,module,exports){
/**
 * Math classes and utilities mixed into PIXI namespace.
 *
 * @lends PIXI
 */
module.exports = {
    // These will be mixed to be made publicly available,
    // while this module is used internally in core
    // to avoid circular dependencies and cut down on
    // internal module requires.

    Point:              require('./Point'),
    ObservablePoint:    require('./ObservablePoint'),
    Matrix:             require('./Matrix'),
    GroupD8:            require('./GroupD8'),

    Circle:             require('./shapes/Circle'),
    Ellipse:            require('./shapes/Ellipse'),
    Polygon:            require('./shapes/Polygon'),
    Rectangle:          require('./shapes/Rectangle'),
    RoundedRectangle:   require('./shapes/RoundedRectangle')
};

},{"./GroupD8":98,"./Matrix":99,"./ObservablePoint":100,"./Point":101,"./shapes/Circle":103,"./shapes/Ellipse":104,"./shapes/Polygon":105,"./shapes/Rectangle":106,"./shapes/RoundedRectangle":107}],103:[function(require,module,exports){
var Rectangle = require('./Rectangle'),
    CONST = require('../../const');

/**
 * The Circle object can be used to specify a hit area for displayObjects
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the center of this circle
 * @param y {number} The Y coordinate of the center of this circle
 * @param radius {number} The radius of the circle
 */
function Circle(x, y, radius)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.radius = radius || 0;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     * @readOnly
     * @default CONST.SHAPES.CIRC
     * @see PIXI.SHAPES
     */
    this.type = CONST.SHAPES.CIRC;
}

Circle.prototype.constructor = Circle;
module.exports = Circle;

/**
 * Creates a clone of this Circle instance
 *
 * @return {PIXI.Circle} a copy of the Circle
 */
Circle.prototype.clone = function ()
{
    return new Circle(this.x, this.y, this.radius);
};

/**
 * Checks whether the x and y coordinates given are contained within this circle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Circle
 */
Circle.prototype.contains = function (x, y)
{
    if (this.radius <= 0)
    {
        return false;
    }

    var dx = (this.x - x),
        dy = (this.y - y),
        r2 = this.radius * this.radius;

    dx *= dx;
    dy *= dy;

    return (dx + dy <= r2);
};

/**
* Returns the framing rectangle of the circle as a Rectangle object
*
* @return {PIXI.Rectangle} the framing rectangle
*/
Circle.prototype.getBounds = function ()
{
    return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
};

},{"../../const":78,"./Rectangle":106}],104:[function(require,module,exports){
var Rectangle = require('./Rectangle'),
    CONST = require('../../const');

/**
 * The Ellipse object can be used to specify a hit area for displayObjects
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the center of the ellipse
 * @param y {number} The Y coordinate of the center of the ellipse
 * @param width {number} The half width of this ellipse
 * @param height {number} The half height of this ellipse
 */
function Ellipse(x, y, width, height)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     * @readOnly
     * @default CONST.SHAPES.ELIP
     * @see PIXI.SHAPES
     */
    this.type = CONST.SHAPES.ELIP;
}

Ellipse.prototype.constructor = Ellipse;
module.exports = Ellipse;

/**
 * Creates a clone of this Ellipse instance
 *
 * @return {PIXI.Ellipse} a copy of the ellipse
 */
Ellipse.prototype.clone = function ()
{
    return new Ellipse(this.x, this.y, this.width, this.height);
};

/**
 * Checks whether the x and y coordinates given are contained within this ellipse
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coords are within this ellipse
 */
Ellipse.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    //normalize the coords to an ellipse with center 0,0
    var normx = ((x - this.x) / this.width),
        normy = ((y - this.y) / this.height);

    normx *= normx;
    normy *= normy;

    return (normx + normy <= 1);
};

/**
 * Returns the framing rectangle of the ellipse as a Rectangle object
 *
 * @return {PIXI.Rectangle} the framing rectangle
 */
Ellipse.prototype.getBounds = function ()
{
    return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
};

},{"../../const":78,"./Rectangle":106}],105:[function(require,module,exports){
var Point = require('../Point'),
    CONST = require('../../const');

/**
 * @class
 * @memberof PIXI
 * @param points_ {PIXI.Point[]|number[]|...PIXI.Point|...number} This can be an array of Points that form the polygon,
 *      a flat array of numbers that will be interpreted as [x,y, x,y, ...], or the arguments passed can be
 *      all the points of the polygon e.g. `new PIXI.Polygon(new PIXI.Point(), new PIXI.Point(), ...)`, or the
 *      arguments passed can be flat x,y values e.g. `new Polygon(x,y, x,y, x,y, ...)` where `x` and `y` are
 *      Numbers.
 */
function Polygon(points_)
{
    // prevents an argument assignment deopt
    // see section 3.1: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var points = points_;

    //if points isn't an array, use arguments as the array
    if (!Array.isArray(points))
    {
        // prevents an argument leak deopt
        // see section 3.2: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
        points = new Array(arguments.length);

        for (var a = 0; a < points.length; ++a) {
            points[a] = arguments[a];
        }
    }

    // if this is an array of points, convert it to a flat array of numbers
    if (points[0] instanceof Point)
    {
        var p = [];
        for (var i = 0, il = points.length; i < il; i++)
        {
            p.push(points[i].x, points[i].y);
        }

        points = p;
    }

    this.closed = true;

    /**
     * An array of the points of this polygon
     *
     * @member {number[]}
     */
    this.points = points;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     * @readOnly
     * @default CONST.SHAPES.POLY
     * @see PIXI.SHAPES
     */
    this.type = CONST.SHAPES.POLY;
}

Polygon.prototype.constructor = Polygon;
module.exports = Polygon;

/**
 * Creates a clone of this polygon
 *
 * @return {PIXI.Polygon} a copy of the polygon
 */
Polygon.prototype.clone = function ()
{
    return new Polygon(this.points.slice());
};


Polygon.prototype.close = function ()
{
    var points = this.points;

    // close the poly if the value is true!
    if (points[0] !== points[points.length-2] || points[1] !== points[points.length-1])
    {
        points.push(points[0], points[1]);
    }
};

/**
 * Checks whether the x and y coordinates passed to this function are contained within this polygon
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this polygon
 */
Polygon.prototype.contains = function (x, y)
{
    var inside = false;

    // use some raycasting to test hits
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    var length = this.points.length / 2;

    for (var i = 0, j = length - 1; i < length; j = i++)
    {
        var xi = this.points[i * 2], yi = this.points[i * 2 + 1],
            xj = this.points[j * 2], yj = this.points[j * 2 + 1],
            intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect)
        {
            inside = !inside;
        }
    }

    return inside;
};

},{"../../const":78,"../Point":101}],106:[function(require,module,exports){
var CONST = require('../../const');

/**
 * the Rectangle object is an area defined by its position, as indicated by its top-left corner point (x, y) and by its width and its height.
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the upper-left corner of the rectangle
 * @param y {number} The Y coordinate of the upper-left corner of the rectangle
 * @param width {number} The overall width of this rectangle
 * @param height {number} The overall height of this rectangle
 */
function Rectangle(x, y, width, height)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     * @readOnly
     * @default CONST.SHAPES.RECT
     * @see PIXI.SHAPES
     */
    this.type = CONST.SHAPES.RECT;
}

Rectangle.prototype.constructor = Rectangle;
module.exports = Rectangle;

/**
 * A constant empty rectangle.
 *
 * @static
 * @constant
 */
Rectangle.EMPTY = new Rectangle(0, 0, 0, 0);


/**
 * Creates a clone of this Rectangle
 *
 * @return {PIXI.Rectangle} a copy of the rectangle
 */
Rectangle.prototype.clone = function ()
{
    return new Rectangle(this.x, this.y, this.width, this.height);
};

Rectangle.prototype.copy = function (rectangle)
{
    this.x = rectangle.x;
    this.y = rectangle.y;
    this.width = rectangle.width;
    this.height = rectangle.height;

    return this;
};

/**
 * Checks whether the x and y coordinates given are contained within this Rectangle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Rectangle
 */
Rectangle.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    if (x >= this.x && x < this.x + this.width)
    {
        if (y >= this.y && y < this.y + this.height)
        {
            return true;
        }
    }

    return false;
};

Rectangle.prototype.pad = function (paddingX, paddingY)
{
    paddingX = paddingX || 0;
    paddingY = paddingY || ( (paddingY !== 0) ? paddingX : 0 );

    this.x -= paddingX;
    this.y -= paddingY;

    this.width += paddingX * 2;
    this.height += paddingY * 2;
};

Rectangle.prototype.fit = function (rectangle)
{
    if (this.x < rectangle.x)
    {
        this.width += this.x;
        if(this.width < 0) {
          this.width = 0;
        }

        this.x = rectangle.x;
    }

    if (this.y < rectangle.y)
    {
        this.height += this.y;
        if(this.height < 0) {
          this.height = 0;
        }
        this.y = rectangle.y;
    }

    if ( this.x + this.width > rectangle.x + rectangle.width )
    {
        this.width = rectangle.width - this.x;
        if(this.width < 0) {
          this.width = 0;
        }
    }

    if ( this.y + this.height > rectangle.y + rectangle.height )
    {
        this.height = rectangle.height - this.y;
        if(this.height < 0) {
          this.height = 0;
        }
    }
};

Rectangle.prototype.enlarge = function (rect)
{

    if (rect === Rectangle.EMPTY)
    {
        return;
    }

    var x1 = Math.min(this.x, rect.x);
    var x2 = Math.max(this.x + this.width, rect.x + rect.width);
    var y1 = Math.min(this.y, rect.y);
    var y2 = Math.max(this.y + this.height, rect.y + rect.height);
    this.x = x1;
    this.width = x2 - x1;
    this.y = y1;
    this.height = y2 - y1;
};

},{"../../const":78}],107:[function(require,module,exports){
var CONST = require('../../const');

/**
 * The Rounded Rectangle object is an area that has nice rounded corners, as indicated by its top-left corner point (x, y) and by its width and its height and its radius.
 *
 * @class
 * @memberof PIXI
 * @param x {number} The X coordinate of the upper-left corner of the rounded rectangle
 * @param y {number} The Y coordinate of the upper-left corner of the rounded rectangle
 * @param width {number} The overall width of this rounded rectangle
 * @param height {number} The overall height of this rounded rectangle
 * @param radius {number} Controls the radius of the rounded corners
 */
function RoundedRectangle(x, y, width, height, radius)
{
    /**
     * @member {number}
     * @default 0
     */
    this.x = x || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width || 0;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height || 0;

    /**
     * @member {number}
     * @default 20
     */
    this.radius = radius || 20;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     * @readonly
     * @default CONST.SHAPES.RREC
     * @see PIXI.SHAPES
     */
    this.type = CONST.SHAPES.RREC;
}

RoundedRectangle.prototype.constructor = RoundedRectangle;
module.exports = RoundedRectangle;

/**
 * Creates a clone of this Rounded Rectangle
 *
 * @return {PIXI.RoundedRectangle} a copy of the rounded rectangle
 */
RoundedRectangle.prototype.clone = function ()
{
    return new RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);
};

/**
 * Checks whether the x and y coordinates given are contained within this Rounded Rectangle
 *
 * @param x {number} The X coordinate of the point to test
 * @param y {number} The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this Rounded Rectangle
 */
RoundedRectangle.prototype.contains = function (x, y)
{
    if (this.width <= 0 || this.height <= 0)
    {
        return false;
    }

    if (x >= this.x && x <= this.x + this.width)
    {
        if (y >= this.y && y <= this.y + this.height)
        {
            return true;
        }
    }

    return false;
};

},{"../../const":78}],108:[function(require,module,exports){
var utils = require('../utils'),
    math = require('../math'),
    CONST = require('../const'),
    Container = require('../display/Container'),
    RenderTexture = require('../textures/RenderTexture'),
    EventEmitter = require('eventemitter3'),
    tempMatrix = new math.Matrix();
/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @param system {string} The name of the system this renderer is for.
 * @param [width=800] {number} the width of the canvas view
 * @param [height=600] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.resolution=1] {number} The resolution / device pixel ratio of the renderer. The resolution of the renderer retina would be 2.
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.backgroundColor=0x000000] {number} The background color of the rendered area (shown if not transparent).
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function SystemRenderer(system, width, height, options)
{
    EventEmitter.call(this);

    utils.sayHello(system);

    // prepare options
    if (options)
    {
        for (var i in CONST.DEFAULT_RENDER_OPTIONS)
        {
            if (typeof options[i] === 'undefined')
            {
                options[i] = CONST.DEFAULT_RENDER_OPTIONS[i];
            }
        }
    }
    else
    {
        options = CONST.DEFAULT_RENDER_OPTIONS;
    }

    /**
     * The type of the renderer.
     *
     * @member {number}
     * @default PIXI.RENDERER_TYPE.UNKNOWN
     * @see PIXI.RENDERER_TYPE
     */
    this.type = CONST.RENDERER_TYPE.UNKNOWN;

    /**
     * The width of the canvas view
     *
     * @member {number}
     * @default 800
     */
    this.width = width || 800;

    /**
     * The height of the canvas view
     *
     * @member {number}
     * @default 600
     */
    this.height = height || 600;

    /**
     * The canvas element that everything is drawn to
     *
     * @member {HTMLCanvasElement}
     */
    this.view = options.view || document.createElement('canvas');

    /**
     * The resolution / device pixel ratio of the renderer
     *
     * @member {number}
     * @default 1
     */
    this.resolution = options.resolution;

    /**
     * Whether the render view is transparent
     *
     * @member {boolean}
     */
    this.transparent = options.transparent;

    /**
     * Whether the render view should be resized automatically
     *
     * @member {boolean}
     */
    this.autoResize = options.autoResize || false;

    /**
     * Tracks the blend modes useful for this renderer.
     *
     * @member {object<string, mixed>}
     */
    this.blendModes = null;

    /**
     * The value of the preserveDrawingBuffer flag affects whether or not the contents of the stencil buffer is retained after rendering.
     *
     * @member {boolean}
     */
    this.preserveDrawingBuffer = options.preserveDrawingBuffer;

    /**
     * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
     * If the scene is NOT transparent Pixi will use a canvas sized fillRect operation every frame to set the canvas background color.
     * If the scene is transparent Pixi will use clearRect to clear the canvas every frame.
     * Disable this by setting this to false. For example if your game has a canvas filling background image you often don't need this set.
     *
     * @member {boolean}
     * @default
     */
    this.clearBeforeRender = options.clearBeforeRender;

    /**
     * If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
     * Handy for crisp pixel art and speed on legacy devices.
     *
     * @member {boolean}
     */
    this.roundPixels = options.roundPixels;

    /**
     * The background color as a number.
     *
     * @member {number}
     * @private
     */
    this._backgroundColor = 0x000000;

    /**
     * The background color as an [R, G, B] array.
     *
     * @member {number[]}
     * @private
     */
    this._backgroundColorRgba = [0, 0, 0, 0];

    /**
     * The background color as a string.
     *
     * @member {string}
     * @private
     */
    this._backgroundColorString = '#000000';

    this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter

    /**
     * This temporary display object used as the parent of the currently being rendered item
     *
     * @member {PIXI.DisplayObject}
     * @private
     */
    this._tempDisplayObjectParent = new Container();

    /**
     * The last root object that the renderer tried to render.
     *
     * @member {PIXI.DisplayObject}
     * @private
     */
    this._lastObjectRendered = this._tempDisplayObjectParent;
}

// constructor
SystemRenderer.prototype = Object.create(EventEmitter.prototype);
SystemRenderer.prototype.constructor = SystemRenderer;
module.exports = SystemRenderer;

Object.defineProperties(SystemRenderer.prototype, {
    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     * @memberof PIXI.SystemRenderer#
     */
    backgroundColor:
    {
        get: function ()
        {
            return this._backgroundColor;
        },
        set: function (val)
        {
            this._backgroundColor = val;
            this._backgroundColorString = utils.hex2string(val);
            utils.hex2rgb(val, this._backgroundColorRgba);
        }
    }
});

/**
 * Resizes the canvas view to the specified width and height
 *
 * @param width {number} the new width of the canvas view
 * @param height {number} the new height of the canvas view
 */
SystemRenderer.prototype.resize = function (width, height) {
    this.width = width * this.resolution;
    this.height = height * this.resolution;

    this.view.width = this.width;
    this.view.height = this.height;

    if (this.autoResize)
    {
        this.view.style.width = this.width / this.resolution + 'px';
        this.view.style.height = this.height / this.resolution + 'px';
    }
};

/**
 * Useful function that returns a texture of the display object that can then be used to create sprites
 * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
 *
 * @param displayObject {PIXI.DisplayObject} The displayObject the object will be generated from
 * @param scaleMode {number} Should be one of the scaleMode consts
 * @param resolution {number} The resolution / device pixel ratio of the texture being generated
 * @return {PIXI.Texture} a texture of the graphics object
 */
SystemRenderer.prototype.generateTexture = function (displayObject, scaleMode, resolution) {

    var bounds = displayObject.getLocalBounds();

    var renderTexture = RenderTexture.create(bounds.width | 0, bounds.height | 0, scaleMode, resolution);

    tempMatrix.tx = -bounds.x;
    tempMatrix.ty = -bounds.y;

    this.render(displayObject, renderTexture, false, tempMatrix, true);

    return renderTexture;
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
SystemRenderer.prototype.destroy = function (removeView) {
    if (removeView && this.view.parentNode)
    {
        this.view.parentNode.removeChild(this.view);
    }

    this.type = CONST.RENDERER_TYPE.UNKNOWN;

    this.width = 0;
    this.height = 0;

    this.view = null;

    this.resolution = 0;

    this.transparent = false;

    this.autoResize = false;

    this.blendModes = null;

    this.preserveDrawingBuffer = false;
    this.clearBeforeRender = false;

    this.roundPixels = false;

    this._backgroundColor = 0;
    this._backgroundColorRgba = null;
    this._backgroundColorString = null;

    this.backgroundColor = 0;
    this._tempDisplayObjectParent = null;
    this._lastObjectRendered = null;
};

},{"../const":78,"../display/Container":80,"../math":102,"../textures/RenderTexture":143,"../utils":151,"eventemitter3":32}],109:[function(require,module,exports){
var SystemRenderer = require('../SystemRenderer'),
    CanvasMaskManager = require('./utils/CanvasMaskManager'),
    CanvasRenderTarget = require('./utils/CanvasRenderTarget'),
    mapCanvasBlendModesToPixi = require('./utils/mapCanvasBlendModesToPixi'),
    utils = require('../../utils'),
    CONST = require('../../const');

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should be used for browsers that do not support webGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=800] {number} the width of the canvas view
 * @param [height=600] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.resolution=1] {number} The resolution / device pixel ratio of the renderer. The resolution of the renderer retina would be 2.
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function CanvasRenderer(width, height, options)
{
    options = options || {};

    SystemRenderer.call(this, 'Canvas', width, height, options);

    this.type = CONST.RENDERER_TYPE.CANVAS;

    /**
     * The canvas 2d context that everything is drawn with.
     *
     * @member {CanvasRenderingContext2D}
     */
    this.rootContext = this.view.getContext('2d', { alpha: this.transparent });
    this.rootResolution = this.resolution;

    /**
     * Boolean flag controlling canvas refresh.
     *
     * @member {boolean}
     */
    this.refresh = true;

    /**
     * Instance of a CanvasMaskManager, handles masking when using the canvas renderer.
     *
     * @member {PIXI.CanvasMaskManager}
     */
    this.maskManager = new CanvasMaskManager(this);

    /**
     * The canvas property used to set the canvas smoothing property.
     *
     * @member {string}
     */
    this.smoothProperty = 'imageSmoothingEnabled';

    if (!this.rootContext.imageSmoothingEnabled)
    {
        if (this.rootContext.webkitImageSmoothingEnabled)
        {
            this.smoothProperty = 'webkitImageSmoothingEnabled';
        }
        else if (this.rootContext.mozImageSmoothingEnabled)
        {
            this.smoothProperty = 'mozImageSmoothingEnabled';
        }
        else if (this.rootContext.oImageSmoothingEnabled)
        {
            this.smoothProperty = 'oImageSmoothingEnabled';
        }
        else if (this.rootContext.msImageSmoothingEnabled)
        {
            this.smoothProperty = 'msImageSmoothingEnabled';
        }
    }

    this.initPlugins();

    this.blendModes = mapCanvasBlendModesToPixi();
    this._activeBlendMode = null;

    this.context = null;
    this.renderingToScreen = false;

    this.resize(width, height);
}

// constructor
CanvasRenderer.prototype = Object.create(SystemRenderer.prototype);
CanvasRenderer.prototype.constructor =  CanvasRenderer;
module.exports = CanvasRenderer;
utils.pluginTarget.mixin(CanvasRenderer);


/**
 * Renders the object to this canvas view
 *
 * @param displayObject {PIXI.DisplayObject} The object to be rendered
 * @param [renderTexture] {PIXI.RenderTexture} A render texture to be rendered to. If unset, it will render to the root context.
 * @param [clear=false] {boolean} Whether to clear the canvas before drawing
 * @param [transform] {PIXI.Transform} A transformation to be applied
 * @param [skipUpdateTransform=false] {boolean} Whether to skip the update transform
 */
CanvasRenderer.prototype.render = function (displayObject, renderTexture, clear, transform, skipUpdateTransform)
{

    if (!this.view){
      return;
    }

     // can be handy to know!
    this.renderingToScreen = !renderTexture;

    this.emit('prerender');

    if(renderTexture)
    {
        renderTexture = renderTexture.baseTexture || renderTexture;

        if(!renderTexture._canvasRenderTarget)
        {

            renderTexture._canvasRenderTarget = new CanvasRenderTarget(renderTexture.width, renderTexture.height, renderTexture.resolution);
            renderTexture.source = renderTexture._canvasRenderTarget.canvas;
            renderTexture.valid = true;
        }

        this.context = renderTexture._canvasRenderTarget.context;
        this.resolution = renderTexture._canvasRenderTarget.resolution;
    }
    else
    {

        this.context = this.rootContext;
        this.resolution = this.rootResolution;
    }

    var context = this.context;

    if(!renderTexture)
    {
        this._lastObjectRendered = displayObject;
    }




    if(!skipUpdateTransform)
    {
        // update the scene graph
        var cacheParent = displayObject.parent;
        var tempWt = this._tempDisplayObjectParent.transform.worldTransform;

        if(transform)
        {
            transform.copy(tempWt);
        }
        else
        {
            tempWt.identity();
        }

        displayObject.parent = this._tempDisplayObjectParent;
        displayObject.updateTransform();
        displayObject.parent = cacheParent;
       // displayObject.hitArea = //TODO add a temp hit area
    }


    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = 1;
    context.globalCompositeOperation = this.blendModes[CONST.BLEND_MODES.NORMAL];

    if (navigator.isCocoonJS && this.view.screencanvas)
    {
        context.fillStyle = 'black';
        context.clear();
    }

    if(clear !== undefined ? clear : this.clearBeforeRender)
    {
        if (this.renderingToScreen) {
            if (this.transparent) {
                context.clearRect(0, 0, this.width, this.height);
            }
            else {
                context.fillStyle = this._backgroundColorString;
                context.fillRect(0, 0, this.width, this.height);
            }
        } //else {
            //TODO: implement background for CanvasRenderTarget or RenderTexture?
        //}
    }

    // TODO RENDER TARGET STUFF HERE..
    var tempContext = this.context;

    this.context = context;
    displayObject.renderCanvas(this);
    this.context = tempContext;

    this.emit('postrender');
};


CanvasRenderer.prototype.setBlendMode = function (blendMode)
{
    if(this._activeBlendMode === blendMode) {
      return;
    }

    this.context.globalCompositeOperation = this.blendModes[blendMode];
};

/**
 * Removes everything from the renderer and optionally removes the Canvas DOM element.
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
CanvasRenderer.prototype.destroy = function (removeView)
{
    this.destroyPlugins();

    // call the base destroy
    SystemRenderer.prototype.destroy.call(this, removeView);

    this.context = null;

    this.refresh = true;

    this.maskManager.destroy();
    this.maskManager = null;

    this.smoothProperty = null;
};

/**
 * Resizes the canvas view to the specified width and height.
 *
 * @extends PIXI.SystemRenderer#resize
 *
 * @param width {number} The new width of the canvas view
 * @param height {number} The new height of the canvas view
 */
CanvasRenderer.prototype.resize = function (width, height)
{
    SystemRenderer.prototype.resize.call(this, width, height);

    //reset the scale mode.. oddly this seems to be reset when the canvas is resized.
    //surely a browser bug?? Let pixi fix that for you..
    if(this.smoothProperty)
    {
        this.rootContext[this.smoothProperty] = (CONST.SCALE_MODES.DEFAULT === CONST.SCALE_MODES.LINEAR);
    }

};

},{"../../const":78,"../../utils":151,"../SystemRenderer":108,"./utils/CanvasMaskManager":110,"./utils/CanvasRenderTarget":111,"./utils/mapCanvasBlendModesToPixi":113}],110:[function(require,module,exports){
var CONST = require('../../../const');
/**
 * A set of functions used to handle masking.
 *
 * @class
 * @memberof PIXI
 */
function CanvasMaskManager(renderer)
{
    this.renderer = renderer;
}

CanvasMaskManager.prototype.constructor = CanvasMaskManager;
module.exports = CanvasMaskManager;

/**
 * This method adds it to the current stack of masks.
 *
 * @param maskData {object} the maskData that will be pushed
 */
CanvasMaskManager.prototype.pushMask = function (maskData)
{
    var renderer = this.renderer;

    renderer.context.save();

    var cacheAlpha = maskData.alpha;
    var transform = maskData.transform.worldTransform;
    var resolution = renderer.resolution;

    renderer.context.setTransform(
        transform.a * resolution,
        transform.b * resolution,
        transform.c * resolution,
        transform.d * resolution,
        transform.tx * resolution,
        transform.ty * resolution
    );

    //TODO suport sprite alpha masks??
    //lots of effort required. If demand is great enough..
    if(!maskData._texture)
    {
        this.renderGraphicsShape(maskData);
        renderer.context.clip();
    }

    maskData.worldAlpha = cacheAlpha;
};

CanvasMaskManager.prototype.renderGraphicsShape = function (graphics)
{
    var context = this.renderer.context;
    var len = graphics.graphicsData.length;

    if (len === 0)
    {
        return;
    }

    context.beginPath();

    for (var i = 0; i < len; i++)
    {
        var data = graphics.graphicsData[i];
        var shape = data.shape;

        if (data.type === CONST.SHAPES.POLY)
        {

            var points = shape.points;

            context.moveTo(points[0], points[1]);

            for (var j=1; j < points.length/2; j++)
            {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
            }

            // if the first and last point are the same close the path - much neater :)
            if (points[0] === points[points.length-2] && points[1] === points[points.length-1])
            {
                context.closePath();
            }

        }
        else if (data.type === CONST.SHAPES.RECT)
        {
            context.rect(shape.x, shape.y, shape.width, shape.height);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.CIRC)
        {
            // TODO - need to be Undefined!
            context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.ELIP)
        {

            // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

            var w = shape.width * 2;
            var h = shape.height * 2;

            var x = shape.x - w/2;
            var y = shape.y - h/2;

            var kappa = 0.5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w,           // x-end
                ye = y + h,           // y-end
                xm = x + w / 2,       // x-middle
                ym = y + h / 2;       // y-middle

            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            context.closePath();
        }
        else if (data.type === CONST.SHAPES.RREC)
        {

            var rx = shape.x;
            var ry = shape.y;
            var width = shape.width;
            var height = shape.height;
            var radius = shape.radius;

            var maxRadius = Math.min(width, height) / 2 | 0;
            radius = radius > maxRadius ? maxRadius : radius;

            context.moveTo(rx, ry + radius);
            context.lineTo(rx, ry + height - radius);
            context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
            context.lineTo(rx + width - radius, ry + height);
            context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
            context.lineTo(rx + width, ry + radius);
            context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
            context.lineTo(rx + radius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + radius);
            context.closePath();
        }
    }
};

/**
 * Restores the current drawing context to the state it was before the mask was applied.
 *
 * @param renderer {PIXI.WebGLRenderer|PIXI.CanvasRenderer} The renderer context to use.
 */
CanvasMaskManager.prototype.popMask = function (renderer)
{
    renderer.context.restore();
};

CanvasMaskManager.prototype.destroy = function () {};

},{"../../../const":78}],111:[function(require,module,exports){
var CONST = require('../../../const');

/**
 * Creates a Canvas element of the given size.
 *
 * @class
 * @memberof PIXI
 * @param width {number} the width for the newly created canvas
 * @param height {number} the height for the newly created canvas
 * @param [resolution=1] The resolution / device pixel ratio of the canvas
 */
function CanvasRenderTarget(width, height, resolution)
{
    /**
     * The Canvas object that belongs to this CanvasRenderTarget.
     *
     * @member {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');

    /**
     * A CanvasRenderingContext2D object representing a two-dimensional rendering context.
     *
     * @member {CanvasRenderingContext2D}
     */
    this.context = this.canvas.getContext('2d');

    this.resolution = resolution || CONST.RESOLUTION;

    this.resize(width, height);
}

CanvasRenderTarget.prototype.constructor = CanvasRenderTarget;
module.exports = CanvasRenderTarget;

Object.defineProperties(CanvasRenderTarget.prototype, {
    /**
     * The width of the canvas buffer in pixels.
     *
     * @member {number}
     * @memberof PIXI.CanvasRenderTarget#
     */
    width: {
        get: function ()
        {
            return this.canvas.width;
        },
        set: function (val)
        {
            this.canvas.width = val;
        }
    },
    /**
     * The height of the canvas buffer in pixels.
     *
     * @member {number}
     * @memberof PIXI.CanvasRenderTarget#
     */
    height: {
        get: function ()
        {
            return this.canvas.height;
        },
        set: function (val)
        {
            this.canvas.height = val;
        }
    }
});

/**
 * Clears the canvas that was created by the CanvasRenderTarget class.
 *
 * @private
 */
CanvasRenderTarget.prototype.clear = function ()
{
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
};

/**
 * Resizes the canvas to the specified width and height.
 *
 * @param width {number} the new width of the canvas
 * @param height {number} the new height of the canvas
 */
CanvasRenderTarget.prototype.resize = function (width, height)
{

    this.canvas.width = width * this.resolution;
    this.canvas.height = height * this.resolution;
};

/**
 * Destroys this canvas.
 *
 */
CanvasRenderTarget.prototype.destroy = function ()
{
    this.context = null;
    this.canvas = null;
};

},{"../../../const":78}],112:[function(require,module,exports){

/**
 * Checks whether the Canvas BlendModes are supported by the current browser
 *
 * @return {boolean} whether they are supported
 */
var canUseNewCanvasBlendModes = function ()
{
    if (typeof document === 'undefined')
    {
        return false;
    }

    var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
    var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';

    var magenta = new Image();
    magenta.src = pngHead + 'AP804Oa6' + pngEnd;

    var yellow = new Image();
    yellow.src = pngHead + '/wCKxvRF' + pngEnd;

    var canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;

    var context = canvas.getContext('2d');
    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta, 0, 0);
    context.drawImage(yellow, 2, 0);

    var imageData = context.getImageData(2,0,1,1);
    
    if (!imageData)
    {
        return false;
    }
    
    var data = imageData.data;
    
    return (data[0] === 255 && data[1] === 0 && data[2] === 0);
};

module.exports = canUseNewCanvasBlendModes;

},{}],113:[function(require,module,exports){
var CONST = require('../../../const'),
canUseNewCanvasBlendModes = require('./canUseNewCanvasBlendModes');

/**
 * Maps blend combinations to Canvas
 * @class
 * @memberof PIXI
 * @param array
 */
function mapCanvasBlendModesToPixi(array)
{
    array = array || [];

    if (canUseNewCanvasBlendModes())
    {
        array[CONST.BLEND_MODES.NORMAL]        = 'source-over';
        array[CONST.BLEND_MODES.ADD]           = 'lighter'; //IS THIS OK???
        array[CONST.BLEND_MODES.MULTIPLY]      = 'multiply';
        array[CONST.BLEND_MODES.SCREEN]        = 'screen';
        array[CONST.BLEND_MODES.OVERLAY]       = 'overlay';
        array[CONST.BLEND_MODES.DARKEN]        = 'darken';
        array[CONST.BLEND_MODES.LIGHTEN]       = 'lighten';
        array[CONST.BLEND_MODES.COLOR_DODGE]   = 'color-dodge';
        array[CONST.BLEND_MODES.COLOR_BURN]    = 'color-burn';
        array[CONST.BLEND_MODES.HARD_LIGHT]    = 'hard-light';
        array[CONST.BLEND_MODES.SOFT_LIGHT]    = 'soft-light';
        array[CONST.BLEND_MODES.DIFFERENCE]    = 'difference';
        array[CONST.BLEND_MODES.EXCLUSION]     = 'exclusion';
        array[CONST.BLEND_MODES.HUE]           = 'hue';
        array[CONST.BLEND_MODES.SATURATION]    = 'saturate';
        array[CONST.BLEND_MODES.COLOR]         = 'color';
        array[CONST.BLEND_MODES.LUMINOSITY]    = 'luminosity';
    }
    else
    {
        // this means that the browser does not support the cool new blend modes in canvas 'cough' ie 'cough'
        array[CONST.BLEND_MODES.NORMAL]        = 'source-over';
        array[CONST.BLEND_MODES.ADD]           = 'lighter'; //IS THIS OK???
        array[CONST.BLEND_MODES.MULTIPLY]      = 'source-over';
        array[CONST.BLEND_MODES.SCREEN]        = 'source-over';
        array[CONST.BLEND_MODES.OVERLAY]       = 'source-over';
        array[CONST.BLEND_MODES.DARKEN]        = 'source-over';
        array[CONST.BLEND_MODES.LIGHTEN]       = 'source-over';
        array[CONST.BLEND_MODES.COLOR_DODGE]   = 'source-over';
        array[CONST.BLEND_MODES.COLOR_BURN]    = 'source-over';
        array[CONST.BLEND_MODES.HARD_LIGHT]    = 'source-over';
        array[CONST.BLEND_MODES.SOFT_LIGHT]    = 'source-over';
        array[CONST.BLEND_MODES.DIFFERENCE]    = 'source-over';
        array[CONST.BLEND_MODES.EXCLUSION]     = 'source-over';
        array[CONST.BLEND_MODES.HUE]           = 'source-over';
        array[CONST.BLEND_MODES.SATURATION]    = 'source-over';
        array[CONST.BLEND_MODES.COLOR]         = 'source-over';
        array[CONST.BLEND_MODES.LUMINOSITY]    = 'source-over';
    }

    return array;
}

module.exports = mapCanvasBlendModesToPixi;

},{"../../../const":78,"./canUseNewCanvasBlendModes":112}],114:[function(require,module,exports){

var CONST = require('../../const');

/**
 * TextureGarbageCollector. This class manages the GPU and ensures that it does not get clogged up with textures that are no longer being used.
 *
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function TextureGarbageCollector(renderer)
{
    this.renderer = renderer;

    this.count = 0;
    this.checkCount = 0;
    this.maxIdle = 60 * 60;
    this.checkCountMax = 60 * 10;

    this.mode = CONST.GC_MODES.DEFAULT;
}

TextureGarbageCollector.prototype.constructor = TextureGarbageCollector;
module.exports = TextureGarbageCollector;

/**
 * Checks to see when the last time a texture was used
 * if the texture has not been used for a specified amount of time it will be removed from the GPU
 */
TextureGarbageCollector.prototype.update = function()
{
    this.count++;

    if(this.mode === CONST.GC_MODES.MANUAL)
    {
        return;
    }

    this.checkCount++;


    if(this.checkCount > this.checkCountMax)
    {
        this.checkCount = 0;

        this.run();
    }
};

/**
 * Checks to see when the last time a texture was used
 * if the texture has not been used for a specified amount of time it will be removed from the GPU
 */
TextureGarbageCollector.prototype.run = function()
{
    var tm = this.renderer.textureManager;
    var managedTextures =  tm._managedTextures;
    var wasRemoved = false;
    var i,j;

    for (i = 0; i < managedTextures.length; i++)
    {
        var texture = managedTextures[i];

        // only supports non generated textures at the moment!
        if (!texture._glRenderTargets && this.count - texture.touched > this.maxIdle)
        {
            tm.destroyTexture(texture, true);
            managedTextures[i] = null;
            wasRemoved = true;
        }
    }

    if (wasRemoved)
    {
        j = 0;

        for (i = 0; i < managedTextures.length; i++)
        {
            if (managedTextures[i] !== null)
            {
                managedTextures[j++] = managedTextures[i];
            }
        }

        managedTextures.length = j;
    }
};

/**
 * Removes all the textures within the specified displayObject and its children from the GPU
 *
 * @param displayObject {PIXI.DisplayObject} the displayObject to remove the textures from.
 */
TextureGarbageCollector.prototype.unload = function( displayObject )
{
    var tm = this.renderer.textureManager;

    if(displayObject._texture)
    {
        tm.destroyTexture(displayObject._texture, true);
    }

    for (var i = displayObject.children.length - 1; i >= 0; i--) {

        this.unload(displayObject.children[i]);

    }
};

},{"../../const":78}],115:[function(require,module,exports){
var GLTexture = require('pixi-gl-core').GLTexture,
    CONST = require('../../const'),
    RenderTarget = require('./utils/RenderTarget'),
	utils = require('../../utils');

/**
 * Helper class to create a webGL Texture
 *
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} A reference to the current renderer
 */
var TextureManager = function(renderer)
{
    /**
     * A reference to the current renderer
     *
     * @member {PIXI.WebGLRenderer}
     */
    this.renderer = renderer;

    /**
     * The current WebGL rendering context
     *
     * @member {WebGLRenderingContext}
     */
	this.gl = renderer.gl;

	/**
     * Track textures in the renderer so we can no longer listen to them on destruction.
     *
     * @member {Array<*>}
     * @private
     */
	this._managedTextures = [];
};

TextureManager.prototype.bindTexture = function()
{
};


TextureManager.prototype.getTexture = function()
{
};

/**
 * Updates and/or Creates a WebGL texture for the renderer's context.
 *
 * @param texture {PIXI.BaseTexture|PIXI.Texture} the texture to update
 */
TextureManager.prototype.updateTexture = function(texture)
{
	texture = texture.baseTexture || texture;

    var isRenderTexture = !!texture._glRenderTargets;

	if (!texture.hasLoaded)
    {
        return;
    }

    var glTexture = texture._glTextures[this.renderer.CONTEXT_UID];

    if (!glTexture)
    {
        if(isRenderTexture)
        {
            var renderTarget = new RenderTarget(this.gl, texture.width, texture.height, texture.scaleMode, texture.resolution);
            renderTarget.resize(texture.width, texture.height);
            texture._glRenderTargets[this.renderer.CONTEXT_UID] = renderTarget;
            glTexture = renderTarget.texture;
        }
        else
        {
            glTexture = new GLTexture(this.gl);
            glTexture.premultiplyAlpha = true;
            glTexture.upload(texture.source);
        }

        texture._glTextures[this.renderer.CONTEXT_UID] = glTexture;

        texture.on('update', this.updateTexture, this);
        texture.on('dispose', this.destroyTexture, this);

        this._managedTextures.push(texture);

        if(texture.isPowerOfTwo)
        {
            if(texture.mipmap)
            {
                glTexture.enableMipmap();
            }

            if(texture.wrapMode === CONST.WRAP_MODES.CLAMP)
            {
                glTexture.enableWrapClamp();
            }
            else if(texture.wrapMode === CONST.WRAP_MODES.REPEAT)
            {
                glTexture.enableWrapRepeat();
            }
            else
            {
                glTexture.enableWrapMirrorRepeat();
            }
        }
        else
        {
            glTexture.enableWrapClamp();
        }

        if(texture.scaleMode === CONST.SCALE_MODES.NEAREST)
        {
            glTexture.enableNearestScaling();
        }
        else
        {
            glTexture.enableLinearScaling();
        }
    }
    else
    {
        // the textur ealrady exists so we only need to update it..
        if(isRenderTexture)
        {
            texture._glRenderTargets[this.renderer.CONTEXT_UID].resize(texture.width, texture.height);
        }
        else
        {
            glTexture.upload(texture.source);
        }
    }

    return  glTexture;
};

/**
 * Deletes the texture from WebGL
 *
 * @param texture {PIXI.BaseTexture|PIXI.Texture} the texture to destroy
 * @param [skipRemove=false] {boolean} Whether to skip removing the texture from the TextureManager.
 */
TextureManager.prototype.destroyTexture = function(texture, skipRemove)
{
	texture = texture.baseTexture || texture;

    if (!texture.hasLoaded)
    {
        return;
    }

    if (texture._glTextures[this.renderer.CONTEXT_UID])
    {
        texture._glTextures[this.renderer.CONTEXT_UID].destroy();
        texture.off('update', this.updateTexture, this);
        texture.off('dispose', this.destroyTexture, this);


        delete texture._glTextures[this.renderer.CONTEXT_UID];

        if (!skipRemove)
        {
            var i = this._managedTextures.indexOf(texture);
            if (i !== -1) {
                utils.removeItems(this._managedTextures, i, 1);
            }
        }
    }
};

/**
 * Deletes all the textures from WebGL
 */
TextureManager.prototype.removeAll = function()
{
	// empty all the old gl textures as they are useless now
    for (var i = 0; i < this._managedTextures.length; ++i)
    {
        var texture = this._managedTextures[i];
        if (texture._glTextures[this.renderer.CONTEXT_UID])
        {
            delete texture._glTextures[this.renderer.CONTEXT_UID];
        }
    }
};

/**
 * Destroys this manager and removes all its textures
 */
TextureManager.prototype.destroy = function()
{
    // destroy managed textures
    for (var i = 0; i < this._managedTextures.length; ++i)
    {
        var texture = this._managedTextures[i];
        this.destroyTexture(texture, true);
        texture.off('update', this.updateTexture, this);
        texture.off('dispose', this.destroyTexture, this);
    }

    this._managedTextures = null;
};

module.exports = TextureManager;

},{"../../const":78,"../../utils":151,"./utils/RenderTarget":128,"pixi-gl-core":7}],116:[function(require,module,exports){
var SystemRenderer = require('../SystemRenderer'),
    MaskManager = require('./managers/MaskManager'),
    StencilManager = require('./managers/StencilManager'),
    FilterManager = require('./managers/FilterManager'),
    RenderTarget = require('./utils/RenderTarget'),
    ObjectRenderer = require('./utils/ObjectRenderer'),
    TextureManager = require('./TextureManager'),
    TextureGarbageCollector = require('./TextureGarbageCollector'),
    WebGLState = require('./WebGLState'),
    createContext = require('pixi-gl-core').createContext,
    mapWebGLDrawModesToPixi = require('./utils/mapWebGLDrawModesToPixi'),
    validateContext = require('./utils/validateContext'),
    utils = require('../../utils'),
    glCore = require('pixi-gl-core'),
    CONST = require('../../const');

var CONTEXT_UID = 0;

/**
 * The WebGLRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=0] {number} the width of the canvas view
 * @param [height=0] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias. If not available natively then FXAA antialiasing is used
 * @param [options.forceFXAA=false] {boolean} forces FXAA antialiasing to be used over native. FXAA is faster, but may not always look as great
 * @param [options.resolution=1] {number} The resolution / device pixel ratio of the renderer. The resolution of the renderer retina would be 2.
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass. If you wish to set this to false, you *must* set preserveDrawingBuffer to `true`.
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if
 *      you need to call toDataUrl on the webgl context.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function WebGLRenderer(width, height, options)
{
    options = options || {};

    SystemRenderer.call(this, 'WebGL', width, height, options);
    /**
     * The type of this renderer as a standardised const
     *
     * @member {number}
     * @see PIXI.RENDERER_TYPE
     */
    this.type = CONST.RENDERER_TYPE.WEBGL;

    this.handleContextLost = this.handleContextLost.bind(this);
    this.handleContextRestored = this.handleContextRestored.bind(this);

    this.view.addEventListener('webglcontextlost', this.handleContextLost, false);
    this.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);

    /**
     * The options passed in to create a new webgl context.
     *
     * @member {object}
     * @private
     */
    this._contextOptions = {
        alpha: this.transparent,
        antialias: options.antialias,
        premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
        stencil: true,
        preserveDrawingBuffer: options.preserveDrawingBuffer
    };

    this._backgroundColorRgba[3] = this.transparent ? 0 : 1;

    /**
     * Manages the masks using the stencil buffer.
     *
     * @member {PIXI.MaskManager}
     */
    this.maskManager = new MaskManager(this);

    /**
     * Manages the stencil buffer.
     *
     * @member {PIXI.StencilManager}
     */
    this.stencilManager = new StencilManager(this);

    /**
     * An empty renderer.
     *
     * @member {PIXI.ObjectRenderer}
     */
    this.emptyRenderer = new ObjectRenderer(this);

    /**
     * The currently active ObjectRenderer.
     *
     * @member {PIXI.ObjectRenderer}
     */
    this.currentRenderer = this.emptyRenderer;

    this.initPlugins();

    /**
     * The current WebGL rendering context, it is created here
     *
     * @member {WebGLRenderingContext}
     */
    // initialize the context so it is ready for the managers.
    if(options.context)
    {
        // checks to see if a context is valid..
        validateContext(options.context);
    }

    this.gl = options.context || createContext(this.view, this._contextOptions);

    this.CONTEXT_UID = CONTEXT_UID++;

    /**
     * The currently active ObjectRenderer.
     *
     * @member {PIXI.WebGLState}
     */
    this.state = new WebGLState(this.gl);

    this.renderingToScreen = true;



    this._initContext();

    /**
     * Manages the filters.
     *
     * @member {PIXI.FilterManager}
     */
    this.filterManager = new FilterManager(this);
    // map some webGL blend and drawmodes..
    this.drawModes = mapWebGLDrawModesToPixi(this.gl);


    /**
     * Holds the current shader
     *
     * @member {PIXI.Shader}
     */
    this._activeShader = null;

    /**
     * Holds the current render target
     *
     * @member {PIXI.RenderTarget}
     */
    this._activeRenderTarget = null;
    this._activeTextureLocation = 999;
    this._activeTexture = null;

    this.setBlendMode(0);


}

// constructor
WebGLRenderer.prototype = Object.create(SystemRenderer.prototype);
WebGLRenderer.prototype.constructor = WebGLRenderer;
module.exports = WebGLRenderer;
utils.pluginTarget.mixin(WebGLRenderer);

/**
 * Creates the WebGL context
 *
 * @private
 */
WebGLRenderer.prototype._initContext = function ()
{
    var gl = this.gl;

    // create a texture manager...
    this.textureManager = new TextureManager(this);
    this.textureGC = new TextureGarbageCollector(this);

    this.state.resetToDefault();

    this.rootRenderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);
    this.rootRenderTarget.clearColor = this._backgroundColorRgba;


    this.bindRenderTarget(this.rootRenderTarget);

    this.emit('context', gl);

    // setup the width/height properties and gl viewport
    this.resize(this.width, this.height);
};

/**
 * Renders the object to its webGL view
 *
 * @param displayObject {PIXI.DisplayObject} the object to be rendered
 * @param renderTexture {PIXI.RenderTexture}
 * @param [clear] {boolean} Should the canvas be cleared before the new render
 * @param [transform] {PIXI.Transform}
 * @param [skipUpdateTransform] {boolean}
 */
WebGLRenderer.prototype.render = function (displayObject, renderTexture, clear, transform, skipUpdateTransform)
{

    // can be handy to know!
    this.renderingToScreen = !renderTexture;

    this.emit('prerender');


    // no point rendering if our context has been blown up!
    if (!this.gl || this.gl.isContextLost())
    {
        return;
    }

    if(!renderTexture)
    {
        this._lastObjectRendered = displayObject;
    }

    if(!skipUpdateTransform)
    {
        // update the scene graph
        var cacheParent = displayObject.parent;
        displayObject.parent = this._tempDisplayObjectParent;
        displayObject.updateTransform();
        displayObject.parent = cacheParent;
       // displayObject.hitArea = //TODO add a temp hit area
    }

    this.bindRenderTexture(renderTexture, transform);

    this.currentRenderer.start();

    if(clear !== undefined ? clear : this.clearBeforeRender)
    {
        this._activeRenderTarget.clear();
    }

    displayObject.renderWebGL(this);

    // apply transform..
    this.currentRenderer.flush();

    //this.setObjectRenderer(this.emptyRenderer);

    this.textureGC.update();

    this.emit('postrender');
};

/**
 * Changes the current renderer to the one given in parameter
 *
 * @param objectRenderer {PIXI.ObjectRenderer} The object renderer to use.
 */
WebGLRenderer.prototype.setObjectRenderer = function (objectRenderer)
{
    if (this.currentRenderer === objectRenderer)
    {
        return;
    }

    this.currentRenderer.stop();
    this.currentRenderer = objectRenderer;
    this.currentRenderer.start();
};

/**
 * This shoudl be called if you wish to do some custom rendering
 * It will basically render anything that may be batched up such as sprites
 *
 */
WebGLRenderer.prototype.flush = function ()
{
    this.setObjectRenderer(this.emptyRenderer);
};

/**
 * Resizes the webGL view to the specified width and height.
 *
 * @param width {number} the new width of the webGL view
 * @param height {number} the new height of the webGL view
 */
WebGLRenderer.prototype.resize = function (width, height)
{
  //  if(width * this.resolution === this.width && height * this.resolution === this.height)return;

    SystemRenderer.prototype.resize.call(this, width, height);

    this.rootRenderTarget.resize(width, height);

    if(this._activeRenderTarget === this.rootRenderTarget)
    {
        this.rootRenderTarget.activate();

        if(this._activeShader)
        {
            this._activeShader.uniforms.projectionMatrix = this.rootRenderTarget.projectionMatrix.toArray(true);
        }
    }
};

/**
 * Resizes the webGL view to the specified width and height.
 *
 * @param blendMode {number} the desired blend mode
 */
WebGLRenderer.prototype.setBlendMode = function (blendMode)
{
    this.state.setBlendMode(blendMode);
};

/**
 * Erases the active render target and fills the drawing area with a colour
 *
 * @param [clearColor] {number} The colour
 */
WebGLRenderer.prototype.clear = function (clearColor)
{
    this._activeRenderTarget.clear(clearColor);
};

/**
 * Sets the transform of the active render target to the given matrix
 *
 * @param matrix {PIXI.Matrix} The transformation matrix
 */
WebGLRenderer.prototype.setTransform = function (matrix)
{
    this._activeRenderTarget.transform = matrix;
};


/**
 * Binds a render texture for rendering
 *
 * @param renderTexture {PIXI.RenderTexture} The render texture to render
 * @param transform     {PIXI.Transform}     The transform to be applied to the render texture
 */
WebGLRenderer.prototype.bindRenderTexture = function (renderTexture, transform)
{
    var renderTarget;

    if(renderTexture)
    {
        var baseTexture = renderTexture.baseTexture;
        var gl = this.gl;

        if(!baseTexture._glRenderTargets[this.CONTEXT_UID])
        {

            this.textureManager.updateTexture(baseTexture);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        else
        {
            // the texture needs to be unbound if its being rendererd too..
            this._activeTextureLocation = baseTexture._id;
            gl.activeTexture(gl.TEXTURE0 + baseTexture._id);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }


        renderTarget =  baseTexture._glRenderTargets[this.CONTEXT_UID];
        renderTarget.setFrame(renderTexture.frame);
    }
    else
    {
        renderTarget = this.rootRenderTarget;
    }

    renderTarget.transform = transform;
    this.bindRenderTarget(renderTarget);

    return this;
};

/**
 * Changes the current render target to the one given in parameter
 *
 * @param renderTarget {PIXI.RenderTarget} the new render target
 */
WebGLRenderer.prototype.bindRenderTarget = function (renderTarget)
{
    if(renderTarget !== this._activeRenderTarget)
    {
        this._activeRenderTarget = renderTarget;
        renderTarget.activate();

        if(this._activeShader)
        {
            this._activeShader.uniforms.projectionMatrix = renderTarget.projectionMatrix.toArray(true);
        }


        this.stencilManager.setMaskStack( renderTarget.stencilMaskStack );
    }

    return this;
};

/**
 * Changes the current shader to the one given in parameter
 *
 * @param shader {PIXI.Shader} the new shader
 */
WebGLRenderer.prototype.bindShader = function (shader)
{
    //TODO cache
    if(this._activeShader !== shader)
    {
        this._activeShader = shader;
        shader.bind();

        // automatically set the projection matrix
        shader.uniforms.projectionMatrix = this._activeRenderTarget.projectionMatrix.toArray(true);
    }

    return this;
};

/**
 * Binds the texture ... @mat
 *
 * @param texture {PIXI.Texture} the new texture
 * @param location {number} the texture location
 */
WebGLRenderer.prototype.bindTexture = function (texture, location)
{
    texture = texture.baseTexture || texture;

    var gl = this.gl;

    //TODO test perf of cache?
    location = location || 0;

    if(this._activeTextureLocation !== location)//
    {
        this._activeTextureLocation = location;
        gl.activeTexture(gl.TEXTURE0 + location );
    }

    //TODO - can we cache this texture too?
    this._activeTexture = texture;

    if (!texture._glTextures[this.CONTEXT_UID])
    {
        // this will also bind the texture..
        this.textureManager.updateTexture(texture);

    }
    else
    {
        texture.touched = this.textureGC.count;
        // bind the current texture
        texture._glTextures[this.CONTEXT_UID].bind();
    }

    return this;
};

WebGLRenderer.prototype.createVao = function ()
{
    return new glCore.VertexArrayObject(this.gl, this.state.attribState);
};

/**
 * Resets the WebGL state so you can render things however you fancy!
 */
WebGLRenderer.prototype.reset = function ()
{
    this.setObjectRenderer(this.emptyRenderer);

    this._activeShader = null;
    this._activeRenderTarget = this.rootRenderTarget;
    this._activeTextureLocation = 999;
    this._activeTexture = null;

    // bind the main frame buffer (the screen);
    this.rootRenderTarget.activate();

    this.state.resetToDefault();

    return this;
};

/**
 * Handles a lost webgl context
 *
 * @private
 */
WebGLRenderer.prototype.handleContextLost = function (event)
{
    event.preventDefault();
};

/**
 * Handles a restored webgl context
 *
 * @private
 */
WebGLRenderer.prototype.handleContextRestored = function ()
{
    this._initContext();
    this.textureManager.removeAll();
};

/**
 * Removes everything from the renderer (event listeners, spritebatch, etc...)
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.  https://github.com/pixijs/pixi.js/issues/2233
 */
WebGLRenderer.prototype.destroy = function (removeView)
{
    this.destroyPlugins();

    // remove listeners
    this.view.removeEventListener('webglcontextlost', this.handleContextLost);
    this.view.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.textureManager.destroy();

    // call base destroy
    SystemRenderer.prototype.destroy.call(this, removeView);

    this.uid = 0;

    // destroy the managers
    this.maskManager.destroy();
    this.stencilManager.destroy();
    this.filterManager.destroy();

    this.maskManager = null;
    this.filterManager = null;
    this.textureManager = null;
    this.currentRenderer = null;

    this.handleContextLost = null;
    this.handleContextRestored = null;

    this._contextOptions = null;
    this.gl.useProgram(null);

    if(this.gl.getExtension('WEBGL_lose_context'))
    {
        this.gl.getExtension('WEBGL_lose_context').loseContext();
    }

    this.gl = null;

    // this = null;
};

},{"../../const":78,"../../utils":151,"../SystemRenderer":108,"./TextureGarbageCollector":114,"./TextureManager":115,"./WebGLState":117,"./managers/FilterManager":122,"./managers/MaskManager":123,"./managers/StencilManager":124,"./utils/ObjectRenderer":126,"./utils/RenderTarget":128,"./utils/mapWebGLDrawModesToPixi":131,"./utils/validateContext":132,"pixi-gl-core":7}],117:[function(require,module,exports){
var mapWebGLBlendModesToPixi = require('./utils/mapWebGLBlendModesToPixi');

/**
 * A WebGL state machines
 *
 * @memberof PIXI
 * @class
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 */
function WebGLState(gl)
{
    /**
     * The current active state
     *
     * @member {Uint8Array}
     */
    this.activeState = new Uint8Array(16);

    /**
     * The default state
     *
     * @member {Uint8Array}
     */
    this.defaultState = new Uint8Array(16);

    // default blend mode..
    this.defaultState[0] = 1;

    /**
     * The current state index in the stack
     *
     * @member {number}
     * @private
     */
    this.stackIndex = 0;

    /**
     * The stack holding all the different states
     *
     * @member {Array<*>}
     * @private
     */
    this.stack = [];

    /**
     * The current WebGL rendering context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    this.maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    this.attribState = {tempAttribState:new Array(this.maxAttribs),
        attribState:new Array(this.maxAttribs)};

    this.blendModes = mapWebGLBlendModesToPixi(gl);

    // check we have vao..
    this.nativeVaoExtension = (
        gl.getExtension('OES_vertex_array_object') ||
        gl.getExtension('MOZ_OES_vertex_array_object') ||
        gl.getExtension('WEBKIT_OES_vertex_array_object')
    );
}

/**
 * Pushes a new active state
 */
WebGLState.prototype.push = function()
{
    // next state..
    var state = this.stack[++this.stackIndex];

    if(!state)
    {
        state = this.stack[this.stackIndex] = new Uint8Array(16);
    }

    // copy state..
    // set active state so we can force overrides of gl state
    for (var i = 0; i < this.activeState.length; i++)
    {
        this.activeState[i] = state[i];
    }
};

var BLEND = 0,
    DEPTH_TEST = 1,
    FRONT_FACE = 2,
    CULL_FACE = 3,
    BLEND_FUNC = 4;

/**
 * Pops a state out
 */
WebGLState.prototype.pop = function()
{
    var state = this.stack[--this.stackIndex];
    this.setState(state);
};

/**
 * Sets the current state
 * @param state {number}
 */
WebGLState.prototype.setState = function(state)
{
    this.setBlend(state[BLEND]);
    this.setDepthTest(state[DEPTH_TEST]);
    this.setFrontFace(state[FRONT_FACE]);
    this.setCullFace(state[CULL_FACE]);
    this.setBlendMode(state[BLEND_FUNC]);
};

/**
 * Sets the blend mode ? @mat
 * @param value {number}
 */
WebGLState.prototype.setBlend = function(value)
{
    if(this.activeState[BLEND] === value|0) {
        return;
    }

    this.activeState[BLEND] = value|0;

    var gl = this.gl;

    if(value)
    {
        gl.enable(gl.BLEND);
    }
    else
    {
        gl.disable(gl.BLEND);
    }
};

/**
 * Sets the blend mode ? @mat
 * @param value {number}
 */
WebGLState.prototype.setBlendMode = function(value)
{
    if(value === this.activeState[BLEND_FUNC]) {
        return;
    }

    this.activeState[BLEND_FUNC] = value;

    this.gl.blendFunc(this.blendModes[value][0], this.blendModes[value][1]);
};

/**
 * Sets the depth test @mat
 * @param value {number}
 */
WebGLState.prototype.setDepthTest = function(value)
{
    if(this.activeState[DEPTH_TEST] === value|0) {
        return;
    }

    this.activeState[DEPTH_TEST] = value|0;

    var gl = this.gl;

    if(value)
    {
        gl.enable(gl.DEPTH_TEST);
    }
    else
    {
        gl.disable(gl.DEPTH_TEST);
    }
};

/**
 * Sets the depth test @mat
 * @param value {number}
 */
WebGLState.prototype.setCullFace = function(value)
{
    if(this.activeState[CULL_FACE] === value|0) {
        return;
    }

    this.activeState[CULL_FACE] = value|0;

    var gl = this.gl;

    if(value)
    {
        gl.enable(gl.CULL_FACE);
    }
    else
    {
        gl.disable(gl.CULL_FACE);
    }
};

/**
 * Sets the depth test @mat
 * @param value {number}
 */
WebGLState.prototype.setFrontFace = function(value)
{
    if(this.activeState[FRONT_FACE] === value|0) {
        return;
    }

    this.activeState[FRONT_FACE] = value|0;

    var gl = this.gl;

    if(value)
    {
        gl.frontFace(gl.CW);
    }
    else
    {
        gl.frontFace(gl.CCW);
    }
};

/**
 * Disables all the vaos in use
 */
WebGLState.prototype.resetAttributes = function()
{
    var i;

    for ( i = 0; i < this.attribState.tempAttribState.length; i++) {
        this.attribState.tempAttribState[i] = 0;
    }

    for ( i = 0; i < this.attribState.attribState.length; i++) {
        this.attribState.attribState[i] = 0;
    }

    var gl = this.gl;

    // im going to assume one is always active for performance reasons.
    for (i = 1; i < this.maxAttribs; i++)
    {
        gl.disableVertexAttribArray(i);
    }
};

//used
/**
 * Resets all the logic and disables the vaos
 */
WebGLState.prototype.resetToDefault = function()
{

    // unbind any VAO if they exist..
    if(this.nativeVaoExtension)
    {
        this.nativeVaoExtension.bindVertexArrayOES(null);
    }


    // reset all attributs..
    this.resetAttributes();

    // set active state so we can force overrides of gl state
    for (var i = 0; i < this.activeState.length; i++)
    {
        this.activeState[i] = 32;
    }

    var gl = this.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);


    this.setState(this.defaultState);
};

module.exports = WebGLState;

},{"./utils/mapWebGLBlendModesToPixi":130}],118:[function(require,module,exports){
var extractUniformsFromSrc = require('./extractUniformsFromSrc'),
    utils = require('../../../utils'),
    CONST = require('../../../const'),
    SOURCE_KEY_MAP = {};

// var math = require('../../../math');
/**
 * @class
 * @memberof PIXI
 * @extends PIXI.Shader
 * @param [vertexSrc] {string} The source of the vertex shader.
 * @param [uniforms] {object} Custom uniforms to use to augment the built-in ones.
 * @param [fragmentSrc] {string} The source of the fragment shader.
 */
function Filter(vertexSrc, fragmentSrc, uniforms)
{

    /**
     * The vertex shader.
     *
     * @member {string}
     */
    this.vertexSrc = vertexSrc || Filter.defaultVertexSrc;

    /**
     * The fragment shader.
     *
     * @member {string}
     */
    this.fragmentSrc = fragmentSrc || Filter.defaultFragmentSrc;

    this.blendMode = CONST.BLEND_MODES.NORMAL;

    // pull out the vertex and shader uniforms if they are not specified..
    // currently this does not extract structs only default types
    this.uniformData = uniforms || extractUniformsFromSrc( this.vertexSrc, this.fragmentSrc, 'projectionMatrix|uSampler');

    this.uniforms = {};

    for (var i in this.uniformData)
    {
        this.uniforms[i] = this.uniformData[i].value;
    }

    // this is where we store shader references..
    // TODO we could cache this!
    this.glShaders = [];

    // used for cacheing.. sure there is a better way!
    if(!SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc])
    {
        SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc] = utils.uid();
    }

    this.glShaderKey = SOURCE_KEY_MAP[this.vertexSrc + this.fragmentSrc];

    /**
     * The padding of the filter. Some filters require extra space to breath such as a blur. Increasing this will add extra width and height to the bounds of the object that the filter is applied to.
     */
    this.padding = 4;

    /**
     * The resolution of the filter. Setting this to be lower will lower the quality but increase the performance of the filter.
     * @member {number}
     */
    this.resolution = 1;

    /**
     * If enabled is true the filter is applied, if false it will not.
     * @member {boolean}
     */
    this.enabled = true;
}

// constructor
//Filter.prototype.constructor = Filter;
module.exports = Filter;

// var tempMatrix = new math.Matrix();

Filter.prototype.apply = function(filterManager, input, output, clear)
{
    // --- //
  //  this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(tempMatrix, window.panda );

    // do as you please!

    filterManager.applyFilter(this, input, output, clear);

    // or just do a regular render..
};

/**
 * The default vertex shader source
 *
 * @static
 * @constant
 */
Filter.defaultVertexSrc = [
    'attribute vec2 aVertexPosition;',
    'attribute vec2 aTextureCoord;',

    'uniform mat3 projectionMatrix;',
    'uniform mat3 filterMatrix;',

    'varying vec2 vTextureCoord;',
    'varying vec2 vFilterCoord;',

    'void main(void){',
    '   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
    '   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;',
    '   vTextureCoord = aTextureCoord ;',
    '}'
].join('\n');

/**
 * The default fragment shader source
 *
 * @static
 * @constant
 */
Filter.defaultFragmentSrc = [
    'varying vec2 vTextureCoord;',
    'varying vec2 vFilterCoord;',

    'uniform sampler2D uSampler;',
    'uniform sampler2D filterSampler;',

    'void main(void){',
    '   vec4 masky = texture2D(filterSampler, vFilterCoord);',
    '   vec4 sample = texture2D(uSampler, vTextureCoord);',
    '   vec4 color;',
    '   if(mod(vFilterCoord.x, 1.0) > 0.5)',
    '   {',
    '     color = vec4(1.0, 0.0, 0.0, 1.0);',
    '   }',
    '   else',
    '   {',
    '     color = vec4(0.0, 1.0, 0.0, 1.0);',
    '   }',
   // '   gl_FragColor = vec4(mod(vFilterCoord.x, 1.5), vFilterCoord.y,0.0,1.0);',
    '   gl_FragColor = mix(sample, masky, 0.5);',
    '   gl_FragColor *= sample.a;',
    '}'
].join('\n');

},{"../../../const":78,"../../../utils":151,"./extractUniformsFromSrc":119}],119:[function(require,module,exports){
var defaultValue = require('pixi-gl-core').shader.defaultValue;

function extractUniformsFromSrc(vertexSrc, fragmentSrc, mask)
{
    var vertUniforms = extractUniformsFromString(vertexSrc, mask);
    var fragUniforms = extractUniformsFromString(fragmentSrc, mask);

    return Object.assign(vertUniforms, fragUniforms);
}


function extractUniformsFromString(string)
{
    var maskRegex = new RegExp('^(projectionMatrix|uSampler|filterArea)$');

    var uniforms = {};
    var nameSplit;


    // clean the lines a little - remove extra spaces / teabs etc
    // then split along ';'
    var lines = string.replace(/\s+/g,' ')
                .split(/\s*;\s*/);

    // loop through..
    for (var i = 0; i < lines.length; i++)
    {
        var line = lines[i].trim();

        if(line.indexOf('uniform') > -1)
        {
            var splitLine = line.split(' ');
            var type = splitLine[1];

            var name = splitLine[2];
            var size = 1;

            if(name.indexOf('[') > -1)
            {
                // array!
                nameSplit = name.split(/\[|\]/);
                name = nameSplit[0];
                size *= Number(nameSplit[1]);
            }

            if(!name.match(maskRegex))
            {
                uniforms[name] = {
                    value:defaultValue(type, size),
                    name:name,
                    type:type
                };
            }
        }
    }

    return uniforms;
}

module.exports = extractUniformsFromSrc;

},{"pixi-gl-core":7}],120:[function(require,module,exports){
var math = require('../../../math');

/*
 * Calculates the mapped matrix
 * @param filterArea {Rectangle} The filter area
 * @param sprite {Sprite} the target sprite
 * @param outputMatrix {Matrix} @alvin
 */
// TODO playing around here.. this is temporary - (will end up in the shader)
// thia returns a matrix that will normalise map filter cords in the filter to screen space
var calculateScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize)
{
     //var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    // var texture = {width:1136, height:700};//sprite._texture.baseTexture;

    // TODO unwrap?
    var mappedMatrix = outputMatrix.identity();

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    mappedMatrix.scale( textureSize.width , textureSize.height );

    return mappedMatrix;

};

var calculateNormalizedScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize)
{
    var mappedMatrix = outputMatrix.identity();

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    var translateScaleX = (textureSize.width / filterArea.width);
    var translateScaleY = (textureSize.height / filterArea.height);

    mappedMatrix.scale( translateScaleX , translateScaleY );

    return mappedMatrix;
};

// this will map the filter coord so that a texture can be used based on the transform of a sprite
var calculateSpriteMatrix = function (outputMatrix, filterArea, textureSize, sprite)
{
    var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    texture = sprite._texture.baseTexture;

    // TODO unwrap?
    var mappedMatrix = outputMatrix.identity();

    // scale..
    var ratio = textureSize.height / textureSize.width;

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    mappedMatrix.scale(1 , ratio);

    var translateScaleX = (textureSize.width / texture.width);
    var translateScaleY = (textureSize.height / texture.height);

    worldTransform.tx /= texture.width * translateScaleX;

    //this...?  free beer for anyone who can explain why this makes sense!
    worldTransform.ty /= texture.width * translateScaleX;
    // worldTransform.ty /= texture.height * translateScaleY;

    worldTransform.invert();
    mappedMatrix.prepend(worldTransform);

    // apply inverse scale..
    mappedMatrix.scale(1 , 1/ratio);

    mappedMatrix.scale( translateScaleX , translateScaleY );

    mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

    return mappedMatrix;
};

module.exports = {
    calculateScreenSpaceMatrix:calculateScreenSpaceMatrix,
    calculateNormalizedScreenSpaceMatrix:calculateNormalizedScreenSpaceMatrix,
    calculateSpriteMatrix:calculateSpriteMatrix
};

},{"../../../math":102}],121:[function(require,module,exports){
var Filter = require('../Filter'),
    math =  require('../../../../math');

// @see https://github.com/substack/brfs/issues/25

/**
 * The SpriteMaskFilter class
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI
 * @param sprite {PIXI.Sprite} the target sprite
 */
function SpriteMaskFilter(sprite)
{
    var maskMatrix = new math.Matrix();

    Filter.call(this,
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n}\n",
        "#define GLSLIFY 1\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float alpha;\nuniform sampler2D mask;\n\nvoid main(void)\n{\n    // check clip! this will stop the mask bleeding out from the edges\n    vec2 text = abs( vMaskCoord - 0.5 );\n    text = step(0.5, text);\n    float clip = 1.0 - max(text.y, text.x);\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, vMaskCoord);\n    original *= (masky.r * masky.a * alpha * clip);\n    gl_FragColor = original;\n}\n"
    );

    sprite.renderable = false;

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;
}

SpriteMaskFilter.prototype = Object.create(Filter.prototype);
SpriteMaskFilter.prototype.constructor = SpriteMaskFilter;
module.exports = SpriteMaskFilter;

/**
 * Applies the filter
 *
 * @param filterManager {PIXI.FilterManager} The renderer to retrieve the filter from
 * @param input {PIXI.RenderTarget}
 * @param output {PIXI.RenderTarget}
 */
SpriteMaskFilter.prototype.apply = function (filterManager, input, output)
{
    var maskSprite = this.maskSprite;

    this.uniforms.mask = maskSprite._texture;
    this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite );
    this.uniforms.alpha = maskSprite.worldAlpha;

    filterManager.applyFilter(this, input, output);
};

},{"../../../../math":102,"../Filter":118}],122:[function(require,module,exports){

var WebGLManager = require('./WebGLManager'),
    RenderTarget = require('../utils/RenderTarget'),
    Quad = require('../utils/Quad'),
    math =  require('../../../math'),
    Shader = require('../../../Shader'),
    filterTransforms = require('../filters/filterTransforms'),
    bitTwiddle = require('bit-twiddle');

var FilterState = function()
{
    this.renderTarget = null;
    this.sourceFrame = new math.Rectangle();
    this.destinationFrame = new math.Rectangle();
    this.filters = [];
    this.target = null;
    this.resolution = 1;
};


/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGLManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function FilterManager(renderer)
{
    WebGLManager.call(this, renderer);

    this.gl = this.renderer.gl;
    // know about sprites!
    this.quad = new Quad(this.gl, renderer.state.attribState);

    this.shaderCache = {};
    // todo add default!
    this.pool = {};

    this.filterData = null;
}

FilterManager.prototype = Object.create(WebGLManager.prototype);
FilterManager.prototype.constructor = FilterManager;
module.exports = FilterManager;

FilterManager.prototype.pushFilter = function(target, filters)
{
    var renderer = this.renderer;

    var filterData = this.filterData;

    if(!filterData)
    {
        filterData = this.renderer._activeRenderTarget.filterStack;

        // add new stack
        var filterState = new FilterState();
        filterState.sourceFrame = filterState.destinationFrame = this.renderer._activeRenderTarget.size;
        filterState.renderTarget = renderer._activeRenderTarget;

        this.renderer._activeRenderTarget.filterData = filterData = {
            index:0,
            stack:[filterState]
        };

        this.filterData = filterData;
    }

    // get the current filter state..
    var currentState = filterData.stack[++filterData.index];
    if(!currentState)
    {
        currentState = filterData.stack[filterData.index] = new FilterState();
    }

    // for now we go off the filter of the first resolution..
    var resolution = filters[0].resolution;
    var padding = filters[0].padding;
    var targetBounds = target.filterArea || target.getBounds(true);
    var sourceFrame = currentState.sourceFrame;
    var destinationFrame = currentState.destinationFrame;

    sourceFrame.x = ((targetBounds.x * resolution) | 0) / resolution;
    sourceFrame.y = ((targetBounds.y * resolution) | 0) / resolution;
    sourceFrame.width = ((targetBounds.width * resolution) | 0) / resolution;
    sourceFrame.height = ((targetBounds.height * resolution) | 0) / resolution;

    if(filterData.stack[0].renderTarget.transform)
    {//jshint ignore:line

        // TODO we should fit the rect around the transform..

    }
    else
    {
        sourceFrame.fit(filterData.stack[0].destinationFrame);
    }

    // lets pplay the padding After we fit the element to the screen.
    // this should stop the strange side effects that can occour when cropping to the edges
    sourceFrame.pad(padding);



    destinationFrame.width = sourceFrame.width;
    destinationFrame.height = sourceFrame.height;

    var renderTarget = this.getPotRenderTarget(renderer.gl, sourceFrame.width, sourceFrame.height, resolution);

    currentState.target = target;
    currentState.filters = filters;
    currentState.resolution = resolution;
    currentState.renderTarget = renderTarget;

    // bind the render taget to draw the shape in the top corner..

    renderTarget.setFrame(destinationFrame, sourceFrame);
    // bind the render target
    renderer.bindRenderTarget(renderTarget);

    // clear the renderTarget
    renderer.clear();//[0.5,0.5,0.5, 1.0]);
};

FilterManager.prototype.popFilter = function()
{
    var filterData = this.filterData;

    var lastState = filterData.stack[filterData.index-1];
    var currentState = filterData.stack[filterData.index];

    this.quad.map(currentState.renderTarget.size, currentState.sourceFrame).upload();

    var filters = currentState.filters;

    if(filters.length === 1)
    {
        filters[0].apply(this, currentState.renderTarget, lastState.renderTarget, false);
        this.freePotRenderTarget(currentState.renderTarget);
    }
    else
    {
        var flip = currentState.renderTarget;
        var flop = this.getPotRenderTarget(this.renderer.gl, currentState.sourceFrame.width, currentState.sourceFrame.height, 1);
        flop.setFrame(currentState.destinationFrame, currentState.sourceFrame);

        for (var i = 0; i < filters.length-1; i++)
        {
            filters[i].apply(this, flip, flop, true);

            var t = flip;
            flip = flop;
            flop = t;
        }

        filters[i].apply(this, flip, lastState.renderTarget, false);

        this.freePotRenderTarget(flip);
        this.freePotRenderTarget(flop);
    }

    filterData.index--;

    if(filterData.index === 0)
    {
        this.filterData = null;
    }
};

FilterManager.prototype.applyFilter = function (filter, input, output, clear)
{
    var renderer = this.renderer;
    var shader = filter.glShaders[renderer.CONTEXT_UID];

    // cacheing..
    if(!shader)
    {
        if(filter.glShaderKey)
        {
            shader = this.shaderCache[filter.glShaderKey];

            if(!shader)
            {
                shader = filter.glShaders[renderer.CONTEXT_UID] = this.shaderCache[filter.glShaderKey] = new Shader(this.gl, filter.vertexSrc, filter.fragmentSrc);
            }
        }
        else
        {
            shader = filter.glShaders[renderer.CONTEXT_UID] = new Shader(this.gl, filter.vertexSrc, filter.fragmentSrc);
        }

        //TODO - this only needs to be done once?
        this.quad.initVao(shader);
    }

    renderer.bindRenderTarget(output);



    if(clear)
    {
        var gl = renderer.gl;

        gl.disable(gl.SCISSOR_TEST);
        renderer.clear();//[1, 1, 1, 1]);
        gl.enable(gl.SCISSOR_TEST);
    }

    // in case the render target is being masked using a scissor rect
    if(output === renderer.maskManager.scissorRenderTarget)
    {
        renderer.maskManager.pushScissorMask(null, renderer.maskManager.scissorData);
    }

    renderer.bindShader(shader);

    // this syncs the pixi filters  uniforms with glsl uniforms
    this.syncUniforms(shader, filter);

    // bind the input texture..
    input.texture.bind(0);
    // when you manually bind a texture, please switch active texture location to it
    renderer._activeTextureLocation = 0;

    renderer.state.setBlendMode( filter.blendMode );

    this.quad.draw();
};

// this returns a matrix that will normalise map filter cords in the filter to screen space
FilterManager.prototype.syncUniforms = function (shader, filter)
{
    var uniformData = filter.uniformData;
    var uniforms = filter.uniforms;

    // 0 is reserverd for the pixi texture so we start at 1!
    var textureCount = 1;
    var currentState;

    if(shader.uniforms.data.filterArea)
    {
        currentState = this.filterData.stack[this.filterData.index];
        var filterArea = shader.uniforms.filterArea;

        filterArea[0] = currentState.renderTarget.size.width;
        filterArea[1] = currentState.renderTarget.size.height;
        filterArea[2] = currentState.sourceFrame.x;
        filterArea[3] = currentState.sourceFrame.y;

        shader.uniforms.filterArea = filterArea;
    }

    // use this to clamp displaced texture coords so they belong to filterArea
    // see displacementFilter fragment shader for an example
    if(shader.uniforms.data.filterClamp)
    {
        currentState = this.filterData.stack[this.filterData.index];
        var filterClamp = shader.uniforms.filterClamp;

        filterClamp[0] = 0.5 / currentState.renderTarget.size.width;
        filterClamp[1] = 0.5 / currentState.renderTarget.size.height;
        filterClamp[2] = (currentState.sourceFrame.width - 0.5) / currentState.renderTarget.size.width;
        filterClamp[3] = (currentState.sourceFrame.height - 0.5) / currentState.renderTarget.size.height;

        shader.uniforms.filterClamp = filterClamp;
    }

    var val;
    //TODO Cacheing layer..
    for(var i in uniformData)
    {
        if(uniformData[i].type === 'sampler2D')
        {
            shader.uniforms[i] = textureCount;

            if(uniforms[i].baseTexture)
            {
                this.renderer.bindTexture(uniforms[i].baseTexture, textureCount);
            }
            else
            {
                // this is helpful as renderTargets can also be set.
                // Although thinking about it, we could probably
                // make the filter texture cache return a RenderTexture
                // rather than a renderTarget
                var gl = this.renderer.gl;
                this.renderer._activeTextureLocation = gl.TEXTURE0 + textureCount;
                gl.activeTexture(gl.TEXTURE0 + textureCount );
                uniforms[i].texture.bind();
            }

            textureCount++;
        }
        else if(uniformData[i].type === 'mat3')
        {
            // check if its pixi matrix..
            if(uniforms[i].a !== undefined)
            {
                shader.uniforms[i] = uniforms[i].toArray(true);
            }
            else
            {
                shader.uniforms[i] = uniforms[i];
            }
        }
        else if(uniformData[i].type === 'vec2')
        {
            //check if its a point..
           if(uniforms[i].x !== undefined)
           {
                val = shader.uniforms[i] || new Float32Array(2);
                val[0] = uniforms[i].x;
                val[1] = uniforms[i].y;
                shader.uniforms[i] = val;
           }
           else
           {
                shader.uniforms[i] = uniforms[i];
           }
        }
        else if(uniformData[i].type === 'float')
        {
            if(shader.uniforms.data[i].value !== uniformData[i])
            {
                shader.uniforms[i] = uniforms[i];
            }
        }
        else
        {
            shader.uniforms[i] = uniforms[i];
        }
    }
};


FilterManager.prototype.getRenderTarget = function(clear, resolution)
{
    var currentState = this.filterData.stack[this.filterData.index];
    var renderTarget = this.getPotRenderTarget(this.renderer.gl, currentState.sourceFrame.width, currentState.sourceFrame.height, resolution || currentState.resolution);
    renderTarget.setFrame(currentState.destinationFrame, currentState.sourceFrame);

    return renderTarget;
};

FilterManager.prototype.returnRenderTarget = function(renderTarget)
{
    return this.freePotRenderTarget(renderTarget);
};

/*
 * Calculates the mapped matrix
 * @param filterArea {Rectangle} The filter area
 * @param sprite {Sprite} the target sprite
 * @param outputMatrix {Matrix} @alvin
 */
// TODO playing around here.. this is temporary - (will end up in the shader)
// thia returns a matrix that will normalise map filter cords in the filter to screen space
FilterManager.prototype.calculateScreenSpaceMatrix = function (outputMatrix)
{
    var currentState = this.filterData.stack[this.filterData.index];
    return filterTransforms.calculateScreenSpaceMatrix(outputMatrix,  currentState.sourceFrame, currentState.renderTarget.size);
};

/**
 * Multiply vTextureCoord to this matrix to achieve (0,0,1,1) for filterArea
 *
 * @param outputMatrix {PIXI.Matrix}
 */
FilterManager.prototype.calculateNormalizedScreenSpaceMatrix = function (outputMatrix)
{
    var currentState = this.filterData.stack[this.filterData.index];

    return filterTransforms.calculateNormalizedScreenSpaceMatrix(outputMatrix, currentState.sourceFrame, currentState.renderTarget.size, currentState.destinationFrame);
};

// this will map the filter coord so that a texture can be used based on the transform of a sprite
FilterManager.prototype.calculateSpriteMatrix = function (outputMatrix, sprite)
{
    var currentState = this.filterData.stack[this.filterData.index];
    return filterTransforms.calculateSpriteMatrix(outputMatrix, currentState.sourceFrame, currentState.renderTarget.size, sprite);
};

FilterManager.prototype.destroy = function()
{
     this.shaderCache = [];
     this.emptyPool();
};



//TODO move to a seperate class could be on renderer?
//also - could cause issue with multiple contexts?
FilterManager.prototype.getPotRenderTarget = function(gl, minWidth, minHeight, resolution)
{
    //TODO you coud return a bigger texture if there is not one in the pool?
    minWidth = bitTwiddle.nextPow2(minWidth * resolution);
    minHeight = bitTwiddle.nextPow2(minHeight * resolution);

    var key = ((minWidth & 0xFFFF) << 16) | ( minHeight & 0xFFFF);

    if(!this.pool[key]) {
      this.pool[key] = [];
    }

    var renderTarget = this.pool[key].pop() || new RenderTarget(gl, minWidth, minHeight, null, 1);

    //manually tweak the resolution...
    //this will not modify the size of the frame buffer, just its resolution.
    renderTarget.resolution = resolution;
    renderTarget.defaultFrame.width = renderTarget.size.width = minWidth / resolution;
    renderTarget.defaultFrame.height = renderTarget.size.height = minHeight / resolution;
    return renderTarget;
};

FilterManager.prototype.emptyPool = function()
{
    for (var i in this.pool)
    {
        var textures = this.pool[i];
        if(textures)
        {
            for (var j = 0; j < textures.length; j++)
            {
                textures[j].destroy(true);
            }
        }
    }

    this.pool = {};
};

FilterManager.prototype.freePotRenderTarget = function(renderTarget)
{
    var minWidth = renderTarget.size.width * renderTarget.resolution;
    var minHeight = renderTarget.size.height * renderTarget.resolution;

    var key = ((minWidth & 0xFFFF) << 16) | (minHeight & 0xFFFF);
    this.pool[key].push(renderTarget);
};

},{"../../../Shader":77,"../../../math":102,"../filters/filterTransforms":120,"../utils/Quad":127,"../utils/RenderTarget":128,"./WebGLManager":125,"bit-twiddle":30}],123:[function(require,module,exports){
var WebGLManager = require('./WebGLManager'),
    AlphaMaskFilter = require('../filters/spriteMask/SpriteMaskFilter');

/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function MaskManager(renderer)
{
    WebGLManager.call(this, renderer);

    //TODO - we don't need both!
    this.scissor = false;
    this.scissorData = null;
    this.scissorRenderTarget = null;

    this.enableScissor = true;

    this.alphaMaskPool = [];
    this.alphaMaskIndex = 0;
}

MaskManager.prototype = Object.create(WebGLManager.prototype);
MaskManager.prototype.constructor = MaskManager;
module.exports = MaskManager;

/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param target {PIXI.DisplayObject} Display Object to push the mask to
 * @param maskData {PIXI.Sprite|PIXI.Graphics}
 */
MaskManager.prototype.pushMask = function (target, maskData)
{
    if (maskData.texture)
    {
        this.pushSpriteMask(target, maskData);
    }
    else
    {
        if(this.enableScissor && !this.scissor && !this.renderer.stencilManager.stencilMaskStack.length && maskData.isFastRect())
        {
            var matrix = maskData.worldTransform;

            var rot = Math.atan2(matrix.b, matrix.a);

            // use the nearest degree!
            rot = Math.round(rot * (180/Math.PI));

            if(rot % 90)
            {
                this.pushStencilMask(maskData);
            }
            else
            {
                this.pushScissorMask(target, maskData);
            }
        }
        else
        {
            this.pushStencilMask(maskData);
        }
    }
};

/**
 * Removes the last mask from the mask stack and doesn't return it.
 *
 * @param target {PIXI.DisplayObject} Display Object to pop the mask from
 * @param maskData {Array<*>}
 */
MaskManager.prototype.popMask = function (target, maskData)
{
    if (maskData.texture)
    {
        this.popSpriteMask(target, maskData);
    }
    else
    {
        if(this.enableScissor && !this.renderer.stencilManager.stencilMaskStack.length)
        {
            this.popScissorMask(target, maskData);
        }
        else
        {
            this.popStencilMask(target, maskData);
        }

    }
};

/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param target {PIXI.RenderTarget} Display Object to push the sprite mask to
 * @param maskData {PIXI.Sprite} Sprite to be used as the mask
 */
MaskManager.prototype.pushSpriteMask = function (target, maskData)
{
    var alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];

    if (!alphaMaskFilter)
    {
        alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new AlphaMaskFilter(maskData)];
    }

    alphaMaskFilter[0].resolution = this.renderer.resolution;
    alphaMaskFilter[0].maskSprite = maskData;

    //TODO - may cause issues!
    target.filterArea = maskData.getBounds(true);

    this.renderer.filterManager.pushFilter(target, alphaMaskFilter);

    this.alphaMaskIndex++;
};

/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 */
MaskManager.prototype.popSpriteMask = function ()
{
    this.renderer.filterManager.popFilter();
    this.alphaMaskIndex--;
};


/**
 * Applies the Mask and adds it to the current filter stack.
 *
 * @param maskData {Array<*>}
 */
MaskManager.prototype.pushStencilMask = function (maskData)
{
    this.renderer.currentRenderer.stop();
    this.renderer.stencilManager.pushStencil(maskData);
};

/**
 * Removes the last filter from the filter stack and doesn't return it.
 *
 */
MaskManager.prototype.popStencilMask = function ()
{
    this.renderer.currentRenderer.stop();
    this.renderer.stencilManager.popStencil();
};

/**
 *
 * @param target {PIXI.RenderTarget} Display Object to push the scissor mask to
 * @param maskData
 */
MaskManager.prototype.pushScissorMask = function (target, maskData)
{
    maskData.renderable = true;

    var renderTarget = this.renderer._activeRenderTarget;

    var bounds = maskData.getBounds();

    bounds.fit(renderTarget.size);
    maskData.renderable = false;

    this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST);

    var resolution = this.renderer.resolution;
    this.renderer.gl.scissor(bounds.x * resolution,
        (renderTarget.root ? renderTarget.size.height - bounds.y - bounds.height : bounds.y) * resolution,
                           bounds.width * resolution,
                           bounds.height * resolution);

    this.scissorRenderTarget = renderTarget;
    this.scissorData = maskData;
    this.scissor = true;
};

/**
 *
 *
 */
MaskManager.prototype.popScissorMask = function ()
{
    this.scissorRenderTarget = null;
    this.scissorData = null;
    this.scissor = false;

    // must be scissor!
    var gl = this.renderer.gl;
    gl.disable(gl.SCISSOR_TEST);
};

},{"../filters/spriteMask/SpriteMaskFilter":121,"./WebGLManager":125}],124:[function(require,module,exports){
var WebGLManager = require('./WebGLManager');

/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function StencilManager(renderer)
{
    WebGLManager.call(this, renderer);
    this.stencilMaskStack = null;
}

StencilManager.prototype = Object.create(WebGLManager.prototype);
StencilManager.prototype.constructor = StencilManager;
module.exports = StencilManager;

/**
 * Changes the mask stack that is used by this manager.
 *
 * @param stencilMaskStack {PIXI.Graphics[]} The mask stack
 */
StencilManager.prototype.setMaskStack = function ( stencilMaskStack )
{
    this.stencilMaskStack = stencilMaskStack;

    var gl = this.renderer.gl;

    if (stencilMaskStack.length === 0)
    {
        gl.disable(gl.STENCIL_TEST);
    }
    else
    {
        gl.enable(gl.STENCIL_TEST);
    }
};

/**
 * Applies the Mask and adds it to the current filter stack. @alvin
 *
 * @param graphics {PIXI.Graphics}
 */
StencilManager.prototype.pushStencil = function (graphics)
{
    this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

    this.renderer._activeRenderTarget.attachStencilBuffer();

    var gl = this.renderer.gl,
        sms = this.stencilMaskStack;

    if (sms.length === 0)
    {
        gl.enable(gl.STENCIL_TEST);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.stencilFunc(gl.ALWAYS,1,1);
    }

    sms.push(graphics);

    gl.colorMask(false, false, false, false);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);

    this.renderer.plugins.graphics.render(graphics);

    gl.colorMask(true, true, true, true);
    gl.stencilFunc(gl.NOTEQUAL,0, sms.length);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
};

/**
 * TODO @alvin
 */
StencilManager.prototype.popStencil = function ()
{
    this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

    var gl = this.renderer.gl,
        sms = this.stencilMaskStack;

    var graphics = sms.pop();

    if (sms.length === 0)
    {
        // the stack is empty!
        gl.disable(gl.STENCIL_TEST);
    }
    else
    {
        gl.colorMask(false, false, false, false);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);

        this.renderer.plugins.graphics.render(graphics);

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, sms.length);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
    }
};

/**
 * Destroys the mask stack.
 *
 */
StencilManager.prototype.destroy = function ()
{
    WebGLManager.prototype.destroy.call(this);

    this.stencilMaskStack.stencilStack = null;
};

},{"./WebGLManager":125}],125:[function(require,module,exports){
/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function WebGLManager(renderer)
{
    /**
     * The renderer this manager works for.
     *
     * @member {PIXI.WebGLRenderer}
     */
    this.renderer = renderer;

    this.renderer.on('context', this.onContextChange, this);
}

WebGLManager.prototype.constructor = WebGLManager;
module.exports = WebGLManager;

/**
 * Generic method called when there is a WebGL context change.
 *
 */
WebGLManager.prototype.onContextChange = function ()
{
	// do some codes init!
};

/**
 * Generic destroy methods to be overridden by the subclass
 *
 */
WebGLManager.prototype.destroy = function ()
{
    this.renderer.off('context', this.onContextChange, this);

    this.renderer = null;
};

},{}],126:[function(require,module,exports){
var WebGLManager = require('../managers/WebGLManager');

/**
 * Base for a common object renderer that can be used as a system renderer plugin.
 *
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this object renderer works for.
 */
function ObjectRenderer(renderer)
{
    WebGLManager.call(this, renderer);
}


ObjectRenderer.prototype = Object.create(WebGLManager.prototype);
ObjectRenderer.prototype.constructor = ObjectRenderer;
module.exports = ObjectRenderer;

/**
 * Starts the renderer and sets the shader
 *
 */
ObjectRenderer.prototype.start = function ()
{
    // set the shader..
};

/**
 * Stops the renderer
 *
 */
ObjectRenderer.prototype.stop = function ()
{
    this.flush();
};

/**
 * Stub method for rendering content and emptying the current batch.
 *
 */
ObjectRenderer.prototype.flush = function ()
{
    // flush!
};

/**
 * Renders an object
 *
 * @param object {PIXI.DisplayObject} The object to render.
 */
ObjectRenderer.prototype.render = function (object) // jshint unused:false
{
    // render the object
};

},{"../managers/WebGLManager":125}],127:[function(require,module,exports){
var glCore = require('pixi-gl-core'),
    createIndicesForQuads = require('../../../utils/createIndicesForQuads');

/**
 * Helper class to create a quad
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The gl context for this quad to use.
 * @param state {object} TODO: Description
 */
function Quad(gl, state)
{
    /*
     * the current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

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

    this.interleaved = new Float32Array(8 * 2);

    for (var i = 0; i < 4; i++) {
        this.interleaved[i*4] = this.vertices[(i*2)];
        this.interleaved[(i*4)+1] = this.vertices[(i*2)+1];
        this.interleaved[(i*4)+2] = this.uvs[i*2];
        this.interleaved[(i*4)+3] = this.uvs[(i*2)+1];
    }

    /*
     * @member {Uint16Array} An array containing the indices of the vertices
     */
    this.indices = createIndicesForQuads(1);

    /*
     * @member {glCore.GLBuffer} The vertex buffer
     */
    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.interleaved, gl.STATIC_DRAW);

    /*
     * @member {glCore.GLBuffer} The index buffer
     */
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

    /*
     * @member {glCore.VertexArrayObject} The index buffer
     */
    this.vao = new glCore.VertexArrayObject(gl, state);

}

Quad.prototype.constructor = Quad;

/**
 * Initialises the vaos and uses the shader
 * @param shader {PIXI.Shader} the shader to use
 */
Quad.prototype.initVao = function(shader)
{
    this.vao.clear()
    .addIndex(this.indexBuffer)
    .addAttribute(this.vertexBuffer, shader.attributes.aVertexPosition, this.gl.FLOAT, false, 4 * 4, 0)
    .addAttribute(this.vertexBuffer, shader.attributes.aTextureCoord, this.gl.FLOAT, false, 4 * 4, 2 * 4);
};

/**
 * Maps two Rectangle to the quad
 * @param targetTextureFrame {PIXI.Rectangle} the first rectangle
 * @param destinationFrame {PIXI.Rectangle} the second rectangle
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

/**
 * Draws the quad
 */
Quad.prototype.draw = function()
{
    this.vao.bind()
    .draw(this.gl.TRIANGLES, 6, 0)
    .unbind();

    return this;
};

/**
 * Binds the buffer and uploads the data
 */
Quad.prototype.upload = function()
{
    for (var i = 0; i < 4; i++) {
        this.interleaved[i*4] = this.vertices[(i*2)];
        this.interleaved[(i*4)+1] = this.vertices[(i*2)+1];
        this.interleaved[(i*4)+2] = this.uvs[i*2];
        this.interleaved[(i*4)+3] = this.uvs[(i*2)+1];
    }

    this.vertexBuffer.upload(this.interleaved);

    return this;
};

/**
 * Removes this quad from WebGL
 */
Quad.prototype.destroy = function()
{
    var gl = this.gl;

     gl.deleteBuffer(this.vertexBuffer);
     gl.deleteBuffer(this.indexBuffer);
};

module.exports = Quad;

},{"../../../utils/createIndicesForQuads":149,"pixi-gl-core":7}],128:[function(require,module,exports){
var math = require('../../../math'),
    CONST = require('../../../const'),
    GLFramebuffer = require('pixi-gl-core').GLFramebuffer;

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 * @param [width=0] {number} the horizontal range of the filter
 * @param [height=0] {number} the vertical range of the filter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=1] {number} The current resolution / device pixel ratio
 * @param [root=false] {boolean} Whether this object is the root element or not
 */
var RenderTarget = function(gl, width, height, scaleMode, resolution, root)
{
    //TODO Resolution could go here ( eg low res blurs )

    /**
     * The current WebGL drawing context.
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    // next time to create a frame buffer and texture

    /**
     * A frame buffer
     *
     * @member {PIXI.glCore.GLFramebuffer}
     */
    this.frameBuffer = null;

    /**
     * The texture
     *
     * @member {PIXI.glCore.GLTexture}
     */
    this.texture = null;

    /**
     * The background colour of this render target, as an array of [r,g,b,a] values
     *
     * @member {number[]}
     */
    this.clearColor = [0, 0, 0, 0];

    /**
     * The size of the object as a rectangle
     *
     * @member {PIXI.Rectangle}
     */
    this.size = new math.Rectangle(0, 0, 1, 1);

    /**
     * The current resolution / device pixel ratio
     *
     * @member {number}
     * @default 1
     */
    this.resolution = resolution || CONST.RESOLUTION;

    /**
     * The projection matrix
     *
     * @member {PIXI.Matrix}
     */
    this.projectionMatrix = new math.Matrix();

    /**
     * The object's transform
     *
     * @member {PIXI.Matrix}
     */
    this.transform = null;

    /**
     * The frame.
     *
     * @member {PIXI.Rectangle}
     */
    this.frame = null;

    /**
     * The stencil buffer stores masking data for the render target
     *
     * @member {glCore.GLBuffer}
     */
    this.defaultFrame = new math.Rectangle();
    this.destinationFrame = null;
    this.sourceFrame = null;

    /**
     * The stencil buffer stores masking data for the render target
     *
     * @member {glCore.GLBuffer}
     */
    this.stencilBuffer = null;

    /**
     * The data structure for the stencil masks
     *
     * @member {PIXI.Graphics[]}
     */
    this.stencilMaskStack = [];

    /**
     * Stores filter data for the render target
     *
     * @member {object[]}
     */
    this.filterData = null;

    /**
     * The scale mode.
     *
     * @member {number}
     * @default PIXI.SCALE_MODES.DEFAULT
     * @see PIXI.SCALE_MODES
     */
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;

    /**
     * Whether this object is the root element or not
     *
     * @member {boolean}
     */
    this.root = root;


    if (!this.root)
    {
        this.frameBuffer = GLFramebuffer.createRGBA(gl, 100, 100);

        if( this.scaleMode === CONST.SCALE_MODES.NEAREST)
        {
            this.frameBuffer.texture.enableNearestScaling();
        }
        else
        {
            this.frameBuffer.texture.enableLinearScaling();

        }
        /*
            A frame buffer needs a target to render to..
            create a texture and bind it attach it to the framebuffer..
         */

        // this is used by the base texture
        this.texture = this.frameBuffer.texture;
    }
    else
    {
        // make it a null framebuffer..
        this.frameBuffer = new GLFramebuffer(gl, 100, 100);
        this.frameBuffer.framebuffer = null;

    }

    this.setFrame();

    this.resize(width, height);
};

RenderTarget.prototype.constructor = RenderTarget;
module.exports = RenderTarget;

/**
 * Clears the filter texture.
 *
 * @param [clearColor=this.clearColor] {number[]} Array of [r,g,b,a] to clear the framebuffer
 */
RenderTarget.prototype.clear = function(clearColor)
{
    var cc = clearColor || this.clearColor;
    this.frameBuffer.clear(cc[0],cc[1],cc[2],cc[3]);//r,g,b,a);
};

/**
 * Binds the stencil buffer.
 *
 */
RenderTarget.prototype.attachStencilBuffer = function()
{
    //TODO check if stencil is done?
    /**
     * The stencil buffer is used for masking in pixi
     * lets create one and then add attach it to the framebuffer..
     */
    if (!this.root)
    {
        this.frameBuffer.enableStencil();
    }
};

RenderTarget.prototype.setFrame = function(destinationFrame, sourceFrame)
{
    this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
    this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;
};

/**
 * Binds the buffers and initialises the viewport.
 *
 */
RenderTarget.prototype.activate = function()
{
    //TOOD refactor usage of frame..
    var gl = this.gl;

    // make surethe texture is unbound!
    this.frameBuffer.bind();

    this.calculateProjection( this.destinationFrame, this.sourceFrame );

    if(this.transform)
    {
        this.projectionMatrix.append(this.transform);
    }

    //TODO add a check as them may be the same!
    if(this.destinationFrame !== this.sourceFrame)
    {

        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(this.destinationFrame.x | 0,this.destinationFrame.y | 0, (this.destinationFrame.width * this.resolution) | 0, (this.destinationFrame.height* this.resolution) | 0);
    }
    else
    {
        gl.disable(gl.SCISSOR_TEST);
    }


    // TODO - does not need to be updated all the time??
    gl.viewport(this.destinationFrame.x | 0,this.destinationFrame.y | 0, (this.destinationFrame.width * this.resolution) | 0, (this.destinationFrame.height * this.resolution)|0);


};


/**
 * Updates the projection matrix based on a projection frame (which is a rectangle)
 *
 */
RenderTarget.prototype.calculateProjection = function (destinationFrame, sourceFrame)
{
    var pm = this.projectionMatrix;

    sourceFrame = sourceFrame || destinationFrame;

    pm.identity();

    // TODO: make dest scale source
    if (!this.root)
    {
        pm.a = 1 / destinationFrame.width*2;
        pm.d = 1 / destinationFrame.height*2;

        pm.tx = -1 - sourceFrame.x * pm.a;
        pm.ty = -1 - sourceFrame.y * pm.d;
    }
    else
    {
        pm.a = 1 / destinationFrame.width*2;
        pm.d = -1 / destinationFrame.height*2;

        pm.tx = -1 - sourceFrame.x * pm.a;
        pm.ty = 1 - sourceFrame.y * pm.d;
    }
};


/**
 * Resizes the texture to the specified width and height
 *
 * @param width {Number} the new width of the texture
 * @param height {Number} the new height of the texture
 */
RenderTarget.prototype.resize = function (width, height)
{
    width = width | 0;
    height = height | 0;

    if (this.size.width === width && this.size.height === height)
    {
        return;
    }

    this.size.width = width;
    this.size.height = height;

    this.defaultFrame.width = width;
    this.defaultFrame.height = height;


    this.frameBuffer.resize(width * this.resolution, height * this.resolution);

    var projectionFrame = this.frame || this.size;

    this.calculateProjection( projectionFrame );
};

/**
 * Destroys the render target.
 *
 */
RenderTarget.prototype.destroy = function ()
{
    this.frameBuffer.destroy();

    this.frameBuffer = null;
    this.texture = null;
};

},{"../../../const":78,"../../../math":102,"pixi-gl-core":7}],129:[function(require,module,exports){
var glCore = require('pixi-gl-core');

var fragTemplate = [
    'precision mediump float;',
    'void main(void){',
        'float test = 0.1;',
        '%forloop%',
        'gl_FragColor = vec4(0.0);',
    '}'
].join('\n');

var checkMaxIfStatmentsInShader = function(maxIfs, gl)
{
    var createTempContext = !gl;

    if(createTempContext)
    {
        var tinyCanvas = document.createElement('canvas');
        tinyCanvas.width = 1;
        tinyCanvas.height = 1;

        gl = glCore.createContext(tinyCanvas);
    }

    var shader = gl.createShader(gl.FRAGMENT_SHADER);

    while(true)
    {
        var fragmentSrc = fragTemplate.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));

        gl.shaderSource(shader, fragmentSrc);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            maxIfs = (maxIfs/2)|0;
        }
        else
        {
            // valid!
            break;
        }
    }

    if(createTempContext)
    {
        // get rid of context
        if(gl.getExtension('WEBGL_lose_context'))
        {
            gl.getExtension('WEBGL_lose_context').loseContext();
        }
    }

    return maxIfs;
};



function generateIfTestSrc(maxIfs)
{
    var src = '';

    for (var i = 0; i < maxIfs; i++)
    {
        if(i > 0)
        {
            src += '\nelse ';
        }

        if(i < maxIfs-1)
        {
            src += 'if(test == ' + i + '.0){}';
        }
    }

    return src;
}

module.exports = checkMaxIfStatmentsInShader;

},{"pixi-gl-core":7}],130:[function(require,module,exports){
var CONST = require('../../../const');

/**
 * Maps gl blend combinations to WebGL
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The current WebGL drawing context
 * @param array
 */
function mapWebGLBlendModesToPixi(gl, array)
{
    array = array || [];

    //TODO - premultiply alpha would be different.
    //add a boolean for that!
    array[CONST.BLEND_MODES.NORMAL]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.ADD]           = [gl.ONE,       gl.DST_ALPHA];
    array[CONST.BLEND_MODES.MULTIPLY]      = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.SCREEN]        = [gl.ONE,       gl.ONE_MINUS_SRC_COLOR];
    array[CONST.BLEND_MODES.OVERLAY]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.DARKEN]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.LIGHTEN]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.COLOR_DODGE]   = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.COLOR_BURN]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.HARD_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.SOFT_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.DIFFERENCE]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.EXCLUSION]     = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.HUE]           = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.SATURATION]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.COLOR]         = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    array[CONST.BLEND_MODES.LUMINOSITY]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];

    return array;
}

module.exports = mapWebGLBlendModesToPixi;

},{"../../../const":78}],131:[function(require,module,exports){
var CONST = require('../../../const');

/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} The current WebGL drawing context
 * @param object
 */
function mapWebGLDrawModesToPixi(gl, object)
{
	object= object || {};

    object[CONST.DRAW_MODES.POINTS]         = gl.POINTS;
    object[CONST.DRAW_MODES.LINES]          = gl.LINES;
    object[CONST.DRAW_MODES.LINE_LOOP]      = gl.LINE_LOOP;
    object[CONST.DRAW_MODES.LINE_STRIP]     = gl.LINE_STRIP;
    object[CONST.DRAW_MODES.TRIANGLES]      = gl.TRIANGLES;
    object[CONST.DRAW_MODES.TRIANGLE_STRIP] = gl.TRIANGLE_STRIP;
    object[CONST.DRAW_MODES.TRIANGLE_FAN]   = gl.TRIANGLE_FAN;

}

module.exports = mapWebGLDrawModesToPixi;

},{"../../../const":78}],132:[function(require,module,exports){


function validateContext(gl)
{
	var attributes = gl.getContextAttributes();

	// this is going to be fairly simple for now.. but at least we have rom to grow!
	if(!attributes.stencil)
	{
		console.warn('Provided WebGL context does not have a stencil buffer, masks may not render correctly'); // jshint ignore:line
	}
}

module.exports = validateContext;

},{}],133:[function(require,module,exports){
var math = require('../math'),
    Texture = require('../textures/Texture'),
    Container = require('../display/Container'),
    utils = require('../utils'),
    CONST = require('../const'),
    tempPoint = new math.Point();

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * var sprite = new PIXI.Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 * @param texture {PIXI.Texture} The texture for this sprite
 */
function Sprite(texture)
{
    Container.call(this);

    /**
     * The anchor sets the origin point of the texture.
     * The default is 0,0 this means the texture's origin is the top left
     * Setting the anchor to 0.5,0.5 means the texture's origin is centered
     * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
     *
     * @member {PIXI.ObservablePoint}
     */
    this.anchor = new math.ObservablePoint(this.onAnchorUpdate, this);

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @private
     */
    this._texture = null;

    /**
     * The width of the sprite (this is initially set by the texture)
     *
     * @member {number}
     * @private
     */
    this._width = 0;

    /**
     * The height of the sprite (this is initially set by the texture)
     *
     * @member {number}
     * @private
     */
    this._height = 0;

    /**
     * The tint applied to the sprite. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    this._tint = null;
    this._tintRGB = null;
    this.tint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = CONST.BLEND_MODES.NORMAL;

    /**
     * The shader that will be used to render the sprite. Set to null to remove a current shader.
     *
     * @member {PIXI.AbstractFilter|PIXI.Shader}
     */
    this.shader = null;

    /**
     * An internal cached value of the tint.
     *
     * @member {number}
     * @default 0xFFFFFF
     * @private
     */
    this.cachedTint = 0xFFFFFF;

    // call texture setter
    this.texture = texture || Texture.EMPTY;

    /**
     * this is used to store the vertex data of the sprite (basically a quad)
     * @type {Float32Array}
     */
    this.vertexData = new Float32Array(8);

    /**
     * this is used to calculate the bounds of the object IF it is a trimmed sprite
     * @type {Float32Array}
     */
    this.vertexTrimmedData = null;

    this._transformID = -1;
    this._textureID = -1;
}

// constructor
Sprite.prototype = Object.create(Container.prototype);
Sprite.prototype.constructor = Sprite;
module.exports = Sprite;

Object.defineProperties(Sprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     */
    width: {
        get: function ()
        {
            return Math.abs(this.scale.x) * this.texture.orig.width;
        },
        set: function (value)
        {
            var sign = utils.sign(this.scale.x) || 1;
            this.scale.x = sign * value / this.texture.orig.width;
            this._width = value;
        }
    },

    /**
     * The height of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Sprite#
     */
    height: {
        get: function ()
        {
            return  Math.abs(this.scale.y) * this.texture.orig.height;
        },
        set: function (value)
        {
            var sign = utils.sign(this.scale.y) || 1;
            this.scale.y = sign * value / this.texture.orig.height;
            this._height = value;
        }
    },

    tint: {
        get: function ()
        {
            return  this._tint;
        },
        set: function (value)
        {
            this._tint = value;
            this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
        }
    },

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.Sprite#
     */
    texture: {
        get: function ()
        {
            return  this._texture;
        },
        set: function (value)
        {
            if (this._texture === value)
            {
                return;
            }

            this._texture = value;
            this.cachedTint = 0xFFFFFF;

            this._textureID = -1;

            if (value)
            {
                // wait for the texture to load
                if (value.baseTexture.hasLoaded)
                {
                    this._onTextureUpdate();
                }
                else
                {
                    value.once('update', this._onTextureUpdate, this);
                }
            }
        }
    }
});

/**
 * When the texture is updated, this event will fire to update the scale and frame
 *
 * @private
 */
Sprite.prototype._onTextureUpdate = function ()
{
    this._textureID = -1;

    // so if _width is 0 then width was not set..
    if (this._width)
    {
        this.scale.x = utils.sign(this.scale.x) * this._width / this.texture.orig.width;
    }

    if (this._height)
    {
        this.scale.y = utils.sign(this.scale.y) * this._height / this.texture.orig.height;
    }
};

Sprite.prototype.onAnchorUpdate = function()
{
    this._transformID = -1;
};

/**
 * calculates worldTransform * vertices, store it in vertexData
 */
Sprite.prototype.calculateVertices = function ()
{
    if(this._transformID === this.transform._worldID && this._textureID === this._texture._updateID)
    {
        return;
    }

    this._transformID = this.transform._worldID;
    this._textureID = this._texture._updateID;

    // set the vertex data

    var texture = this._texture,
        wt = this.transform.worldTransform,
        a = wt.a, b = wt.b, c = wt.c, d = wt.d, tx = wt.tx, ty = wt.ty,
        vertexData = this.vertexData,
        w0, w1, h0, h1,
        trim = texture.trim,
        orig = texture.orig;

    if (trim)
    {
        // if the sprite is trimmed and is not a tilingsprite then we need to add the extra space before transforming the sprite coords..
        w1 = trim.x - this.anchor._x * orig.width;
        w0 = w1 + trim.width;

        h1 = trim.y - this.anchor._y * orig.height;
        h0 = h1 + trim.height;

    }
    else
    {
        w0 = orig.width * (1-this.anchor._x);
        w1 = orig.width * -this.anchor._x;

        h0 = orig.height * (1-this.anchor._y);
        h1 = orig.height * -this.anchor._y;
    }

    // xy
    vertexData[0] = a * w1 + c * h1 + tx;
    vertexData[1] = d * h1 + b * w1 + ty;

    // xy
    vertexData[2] = a * w0 + c * h1 + tx;
    vertexData[3] = d * h1 + b * w0 + ty;

     // xy
    vertexData[4] = a * w0 + c * h0 + tx;
    vertexData[5] = d * h0 + b * w0 + ty;

    // xy
    vertexData[6] = a * w1 + c * h0 + tx;
    vertexData[7] = d * h0 + b * w1 + ty;
};

/**
 * calculates worldTransform * vertices for a non texture with a trim. store it in vertexTrimmedData
 * This is used to ensure that the true width and height of a trimmed texture is respected
 */
Sprite.prototype.calculateTrimmedVertices = function ()
{
    if(!this.vertexTrimmedData)
    {
        this.vertexTrimmedData = new Float32Array(8);
    }

    // lets do some special trim code!
    var texture = this._texture,
        vertexData = this.vertexTrimmedData,
        orig = texture.orig;

    // lets calculate the new untrimmed bounds..
    var wt = this.transform.worldTransform,
        a = wt.a, b = wt.b, c = wt.c, d = wt.d, tx = wt.tx, ty = wt.ty,
        w0, w1, h0, h1;

    w0 = (orig.width ) * (1-this.anchor._x);
    w1 = (orig.width ) * -this.anchor._x;

    h0 = orig.height * (1-this.anchor._y);
    h1 = orig.height * -this.anchor._y;

    // xy
    vertexData[0] = a * w1 + c * h1 + tx;
    vertexData[1] = d * h1 + b * w1 + ty;

    // xy
    vertexData[2] = a * w0 + c * h1 + tx;
    vertexData[3] = d * h1 + b * w0 + ty;

    // xy
    vertexData[4] = a * w0 + c * h0 + tx;
    vertexData[5] = d * h0 + b * w0 + ty;

    // xy
    vertexData[6] = a * w1 + c * h0 + tx;
    vertexData[7] = d * h0 + b * w1 + ty;
};

/**
*
* Renders the object using the WebGL renderer
*
* @param renderer {PIXI.WebGLRenderer}
* @private
*/
Sprite.prototype._renderWebGL = function (renderer)
{
    this.calculateVertices();

    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};

/**
* Renders the object using the Canvas renderer
*
* @param renderer {PIXI.CanvasRenderer} The renderer
* @private
*/
Sprite.prototype._renderCanvas = function (renderer)
{
    renderer.plugins.sprite.render(this);
};


Sprite.prototype._calculateBounds = function ()
{

    var trim = this._texture.trim,
        orig = this._texture.orig;

    //First lets check to see if the current texture has a trim..
    if (!trim || trim.width === orig.width && trim.height === orig.height) {

        // no trim! lets use the usual calculations..
        this.calculateVertices();
        this._bounds.addQuad(this.vertexData);
    }
    else
    {
        // lets calculate a special trimmed bounds...
        this.calculateTrimmedVertices();
        this._bounds.addQuad(this.vertexTrimmedData);
    }
};

/**
 * Gets the local bounds of the sprite object.
 *
 */

Sprite.prototype.getLocalBounds = function (rect)
{
    // we can do a fast local bounds if the sprite has no children!
    if(this.children.length === 0)
    {

        this._bounds.minX = -this._texture.orig.width * this.anchor._x;
        this._bounds.minY = -this._texture.orig.height * this.anchor._y;
        this._bounds.maxX = this._texture.orig.width;
        this._bounds.maxY = this._texture.orig.height;

        if(!rect)
        {
            if(!this._localBoundsRect)
            {
                this._localBoundsRect = new math.Rectangle();
            }

            rect = this._localBoundsRect;
        }

        return this._bounds.getRectangle(rect);
    }
    else
    {
        return Container.prototype.getLocalBounds.call(this, rect);
    }

};

/**
* Tests if a point is inside this sprite
*
* @param point {PIXI.Point} the point to test
* @return {boolean} the result of the test
*/
Sprite.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var width = this._texture.orig.width;
    var height = this._texture.orig.height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( tempPoint.x > x1 && tempPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( tempPoint.y > y1 && tempPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};


/**
 * Destroys this sprite and optionally its texture and children
 *
 * @param [options] {object|boolean} Options parameter. A boolean will act as if all options have been set to that value
 * @param [options.children=false] {boolean} if set to true, all the children will have their destroy
 *      method called as well. 'options' will be passed on to those calls.
 * @param [options.texture=false] {boolean} Should it destroy the current texture of the sprite as well
 * @param [options.baseTexture=false] {boolean} Should it destroy the base texture of the sprite as well
 */
Sprite.prototype.destroy = function (options)
{
    Container.prototype.destroy.call(this, options);

    this.anchor = null;

    var destroyTexture = typeof options === 'boolean' ? options : options && options.texture;
    if (destroyTexture)
    {
        var destroyBaseTexture = typeof options === 'boolean' ? options : options && options.baseTexture;
        this._texture.destroy(!!destroyBaseTexture);
    }

    this._texture = null;
    this.shader = null;
};

// some helper functions..

/**
 * Helper function that creates a new sprite based on the source you provide.
 * The source can be - frame id, image url, video url, canvas element, video element, base texture
 *
 * @static
 * @param {number|string|PIXI.BaseTexture|HTMLCanvasElement|HTMLVideoElement} source Source to create texture from
 * @return {PIXI.Texture} The newly created texture
 */
Sprite.from = function (source)
{
    return new Sprite(Texture.from(source));
};

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the frameId
 */
Sprite.fromFrame = function (frameId)
{
    var texture = utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
    }

    return new Sprite(texture);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {string} The image url of the texture
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} if you want to specify the scale mode, see {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Sprite} A new Sprite using a texture from the texture cache matching the image id
 */
Sprite.fromImage = function (imageId, crossorigin, scaleMode)
{
    return new Sprite(Texture.fromImage(imageId, crossorigin, scaleMode));
};

},{"../const":78,"../display/Container":80,"../math":102,"../textures/Texture":144,"../utils":151}],134:[function(require,module,exports){
var CanvasRenderer = require('../../renderers/canvas/CanvasRenderer'),
    CONST = require('../../const'),
    math = require('../../math'),
    canvasRenderWorldTransform = new math.Matrix(),
    CanvasTinter = require('./CanvasTinter');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's CanvasSpriteRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/CanvasSpriteRenderer.java
 */

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer sprite this batch works for.
 */
function CanvasSpriteRenderer(renderer)
{
    this.renderer = renderer;
}


CanvasSpriteRenderer.prototype.constructor = CanvasSpriteRenderer;
module.exports = CanvasSpriteRenderer;

CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

/**
 * Renders the sprite object.
 *
 * @param sprite {PIXI.Sprite} the sprite to render when using this spritebatch
 */
CanvasSpriteRenderer.prototype.render = function (sprite)
{
    var texture = sprite._texture,
        renderer = this.renderer,
        wt = sprite.transform.worldTransform,
        dx,
        dy,
        width = texture._frame.width,
        height = texture._frame.height;

    if (texture.orig.width <= 0 || texture.orig.height <= 0 || !texture.baseTexture.source)
    {
        return;
    }

    renderer.setBlendMode(sprite.blendMode);

    //  Ignore null sources
    if (texture.valid)
    {
        renderer.context.globalAlpha = sprite.worldAlpha;

        // If smoothingEnabled is supported and we need to change the smoothing property for sprite texture
        var smoothingEnabled = texture.baseTexture.scaleMode === CONST.SCALE_MODES.LINEAR;
        if (renderer.smoothProperty && renderer.context[renderer.smoothProperty] !== smoothingEnabled)
        {
            renderer.context[renderer.smoothProperty] = smoothingEnabled;
        }

        if (texture.trim) {
            dx = texture.trim.width/2 + texture.trim.x - sprite.anchor.x * texture.orig.width;
            dy = texture.trim.height/2 + texture.trim.y - sprite.anchor.y * texture.orig.height;
        } else {
            dx = (0.5 - sprite.anchor.x) * texture.orig.width;
            dy = (0.5 - sprite.anchor.y) * texture.orig.height;
        }
        if(texture.rotate) {
            wt.copy(canvasRenderWorldTransform);
            wt = canvasRenderWorldTransform;
            math.GroupD8.matrixAppendRotationInv(wt, texture.rotate, dx, dy);
            // the anchor has already been applied above, so lets set it to zero
            dx = 0;
            dy = 0;
        }
        dx -= width/2;
        dy -= height/2;
        // Allow for pixel rounding
        if (renderer.roundPixels)
        {
            renderer.context.setTransform(
                wt.a,
                wt.b,
                wt.c,
                wt.d,
                (wt.tx * renderer.resolution) | 0,
                (wt.ty * renderer.resolution) | 0
            );

            dx = dx | 0;
            dy = dy | 0;
        }
        else
        {
            renderer.context.setTransform(
                wt.a,
                wt.b,
                wt.c,
                wt.d,
                wt.tx * renderer.resolution,
                wt.ty * renderer.resolution
            );
        }

        var resolution = texture.baseTexture.resolution;

        if (sprite.tint !== 0xFFFFFF)
        {
            if (sprite.cachedTint !== sprite.tint)
            {
                sprite.cachedTint = sprite.tint;

                // TODO clean up caching - how to clean up the caches?
                sprite.tintedTexture = CanvasTinter.getTintedTexture(sprite, sprite.tint);
            }

            renderer.context.drawImage(
                sprite.tintedTexture,
                0,
                0,
                width * resolution,
                height * resolution,
                dx * renderer.resolution,
                dy * renderer.resolution,
                width * renderer.resolution,
                height * renderer.resolution
            );
        }
        else
        {

            renderer.context.drawImage(
                texture.baseTexture.source,
                texture._frame.x * resolution,
                texture._frame.y * resolution,
                width * resolution,
                height * resolution,
                dx  * renderer.resolution,
                dy  * renderer.resolution,
                width * renderer.resolution,
                height * renderer.resolution
            );
        }
    }
};

/**
 * destroy the sprite object.
 *
 */
CanvasSpriteRenderer.prototype.destroy = function (){
  this.renderer = null;
};

},{"../../const":78,"../../math":102,"../../renderers/canvas/CanvasRenderer":109,"./CanvasTinter":135}],135:[function(require,module,exports){
var utils = require('../../utils'),
    canUseNewCanvasBlendModes = require('../../renderers/canvas/utils/canUseNewCanvasBlendModes');

/**
 * Utility methods for Sprite/Texture tinting.
 *
 * @namespace PIXI.CanvasTinter
 */
var CanvasTinter = module.exports = {
    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.CanvasTinter
     * @param sprite {PIXI.Sprite} the sprite to tint
     * @param color {number} the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedTexture: function (sprite, color)
    {
        var texture = sprite.texture;

        color = CanvasTinter.roundColor(color);

        var stringColor = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);

        texture.tintCache = texture.tintCache || {};

        if (texture.tintCache[stringColor])
        {
            return texture.tintCache[stringColor];
        }

        // clone texture..
        var canvas = CanvasTinter.canvas || document.createElement('canvas');

        //CanvasTinter.tintWithPerPixel(texture, stringColor, canvas);
        CanvasTinter.tintMethod(texture, color, canvas);

        if (CanvasTinter.convertTintToImage)
        {
            // is this better?
            var tintImage = new Image();
            tintImage.src = canvas.toDataURL();

            texture.tintCache[stringColor] = tintImage;
        }
        else
        {
            texture.tintCache[stringColor] = canvas;
            // if we are not converting the texture to an image then we need to lose the reference to the canvas
            CanvasTinter.canvas = null;
        }

        return canvas;
    },

    /**
     * Tint a texture using the 'multiply' operation.
     *
     * @memberof PIXI.CanvasTinter
     * @param texture {PIXI.Texture} the texture to tint
     * @param color {number} the color to use to tint the sprite with
     * @param canvas {HTMLCanvasElement} the current canvas
     */
    tintWithMultiply: function (texture, color, canvas)
    {
        var context = canvas.getContext( '2d' );
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = crop.width;
        canvas.height = crop.height;

        context.fillStyle = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);

        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'multiply';

        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        context.globalCompositeOperation = 'destination-atop';

        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );
    },

    /**
     * Tint a texture using the 'overlay' operation.
     *
     * @memberof PIXI.CanvasTinter
     * @param texture {PIXI.Texture} the texture to tint
     * @param color {number} the color to use to tint the sprite with
     * @param canvas {HTMLCanvasElement} the current canvas
     */
    tintWithOverlay: function (texture, color, canvas)
    {
        var context = canvas.getContext( '2d' );
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = crop.width;
        canvas.height = crop.height;

        context.globalCompositeOperation = 'copy';
        context.fillStyle = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);
        context.fillRect(0, 0, crop.width, crop.height);

        context.globalCompositeOperation = 'destination-atop';
        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        // context.globalCompositeOperation = 'copy';
    },

    /**
     * Tint a texture pixel per pixel.
     *
     * @memberof PIXI.CanvasTinter
     * @param texture {PIXI.Texture} the texture to tint
     * @param color {number} the color to use to tint the sprite with
     * @param canvas {HTMLCanvasElement} the current canvas
     */
    tintWithPerPixel: function (texture, color, canvas)
    {
        var context = canvas.getContext( '2d' );
        var crop = texture._frame.clone();
        var resolution = texture.baseTexture.resolution;

        crop.x *= resolution;
        crop.y *= resolution;
        crop.width *= resolution;
        crop.height *= resolution;

        canvas.width = crop.width;
        canvas.height = crop.height;

        context.globalCompositeOperation = 'copy';
        context.drawImage(
            texture.baseTexture.source,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
        );

        var rgbValues = utils.hex2rgb(color);
        var r = rgbValues[0], g = rgbValues[1], b = rgbValues[2];

        var pixelData = context.getImageData(0, 0, crop.width, crop.height);

        var pixels = pixelData.data;

        for (var i = 0; i < pixels.length; i += 4)
        {
            pixels[i+0] *= r;
            pixels[i+1] *= g;
            pixels[i+2] *= b;
        }

        context.putImageData(pixelData, 0, 0);
    },

    /**
     * Rounds the specified color according to the CanvasTinter.cacheStepsPerColorChannel.
     *
     * @memberof PIXI.CanvasTinter
     * @param color {number} the color to round, should be a hex color
     */
    roundColor: function (color)
    {
        var step = CanvasTinter.cacheStepsPerColorChannel;

        var rgbValues = utils.hex2rgb(color);

        rgbValues[0] = Math.min(255, (rgbValues[0] / step) * step);
        rgbValues[1] = Math.min(255, (rgbValues[1] / step) * step);
        rgbValues[2] = Math.min(255, (rgbValues[2] / step) * step);

        return utils.rgb2hex(rgbValues);
    },

    /**
     * Number of steps which will be used as a cap when rounding colors.
     *
     * @memberof PIXI.CanvasTinter
     * @type {number}
     */
    cacheStepsPerColorChannel: 8,

    /**
     * Tint cache boolean flag.
     *
     * @memberof PIXI.CanvasTinter
     * @type {boolean}
     */
    convertTintToImage: false,

    /**
     * Whether or not the Canvas BlendModes are supported, consequently the ability to tint using the multiply method.
     *
     * @memberof PIXI.CanvasTinter
     * @type {boolean}
     */
    canUseMultiply: canUseNewCanvasBlendModes(),

    /**
     * The tinting method that will be used.
     *
     * @memberof PIXI.CanvasTinter
     * @type {tintMethodFunctionType}
     */
    tintMethod: 0
};

CanvasTinter.tintMethod = CanvasTinter.canUseMultiply ? CanvasTinter.tintWithMultiply :  CanvasTinter.tintWithPerPixel;

/**
 * The tintMethod type.
 *
 * @memberof PIXI.CanvasTinter
 * @callback tintMethodFunctionType
 * @param texture {PIXI.Texture} the texture to tint
 * @param color {number} the color to use to tint the sprite with
 * @param canvas {HTMLCanvasElement} the current canvas
 */

},{"../../renderers/canvas/utils/canUseNewCanvasBlendModes":112,"../../utils":151}],136:[function(require,module,exports){


 var Buffer = function(size)
 {

     this.vertices = new ArrayBuffer(size);

     /**
      * View on the vertices as a Float32Array for positions
      *
      * @member {Float32Array}
      */
     this.float32View = new Float32Array(this.vertices);

     /**
      * View on the vertices as a Uint32Array for uvs
      *
      * @member {Float32Array}
      */
     this.uint32View = new Uint32Array(this.vertices);
 };

 module.exports = Buffer;

 Buffer.prototype.destroy = function(){
   this.vertices = null;
   this.positions = null;
   this.uvs = null;
   this.colors  = null;
 };
},{}],137:[function(require,module,exports){
var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    createIndicesForQuads = require('../../utils/createIndicesForQuads'),
    generateMultiTextureShader = require('./generateMultiTextureShader'),
    checkMaxIfStatmentsInShader = require('../../renderers/webgl/utils/checkMaxIfStatmentsInShader'),
    Buffer = require('./BatchBuffer'),
    CONST = require('../../const'),
    glCore = require('pixi-gl-core'),
    bitTwiddle = require('bit-twiddle');

    var TICK = 0;
/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function SpriteRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    /**
     * Number of values sent in the vertex buffer.
     * positionX, positionY, colorR, colorG, colorB = 5
     *
     * @member {number}
     */
    this.vertSize = 5;

    /**
     * The size of the vertex information in bytes.
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of images in the SpriteBatch before it flushes.
     *
     * @member {number}
     */
    this.size = CONST.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

    // the total number of bytes in our batch
    // var numVerts = this.size * 4 * this.vertByteSize;

    this.buffers = [];
    for (var i = 1; i <= bitTwiddle.nextPow2(this.size); i*=2) {
        var numVertsTemp = i * 4 * this.vertByteSize;
        this.buffers.push(new Buffer(numVertsTemp));
    }

    /**
     * Holds the indices of the geometry (quads) to draw
     *
     * @member {Uint16Array}
     */
    this.indices = createIndicesForQuads(this.size);

    /**
     * The default shaders that is used if a sprite doesn't have a more specific one.
     * there is a shader for each number of textures that can be rendererd.
     * These shaders will also be generated on the fly as required.
     * @member {PIXI.Shader[]}
     */
    this.shaders = null;

    this.currentIndex = 0;
    TICK =0;
    this.groups = [];

    for (var k = 0; k < this.size; k++)
    {
        this.groups[k] = {textures:[], textureCount:0, ids:[], size:0, start:0, blend:0};
    }

    this.sprites = [];

    this.vertexBuffers = [];
    this.vaos = [];

    this.vaoMax = 2;
    this.vertexCount = 0;

    this.renderer.on('prerender', this.onPrerender, this);
}


SpriteRenderer.prototype = Object.create(ObjectRenderer.prototype);
SpriteRenderer.prototype.constructor = SpriteRenderer;
module.exports = SpriteRenderer;

WebGLRenderer.registerPlugin('sprite', SpriteRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 */
SpriteRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    // step 1: first check max textures the GPU can handle.
    this.MAX_TEXTURES = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), CONST.SPRITE_MAX_TEXTURES);

    // step 2: check the maximum number of if statements the shader can have too..
    this.MAX_TEXTURES = checkMaxIfStatmentsInShader( this.MAX_TEXTURES, gl );

    this.shaders = new Array(this.MAX_TEXTURES);
    this.shaders[0] = generateMultiTextureShader(gl, 1);
    this.shaders[1] = generateMultiTextureShader(gl, 2);

    // create a couple of buffers
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

    // we use the second shader as the first one depending on your browser may omit aTextureId
    // as it is not used by the shader so is optimized out.
    var shader = this.shaders[1];

    for (var i = 0; i < this.vaoMax; i++) {
        this.vertexBuffers[i] = glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);

        // build the vao object that will render..
        this.vaos[i] = this.renderer.createVao()
        .addIndex(this.indexBuffer)
        .addAttribute(this.vertexBuffers[i], shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
        .addAttribute(this.vertexBuffers[i], shader.attributes.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
        .addAttribute(this.vertexBuffers[i], shader.attributes.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4)
        .addAttribute(this.vertexBuffers[i], shader.attributes.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);
    }

    this.vao = this.vaos[0];
    this.currentBlendMode = 99999;
};

SpriteRenderer.prototype.onPrerender = function ()
{
    this.vertexCount = 0;
};

/**
 * Renders the sprite object.
 *
 * @param sprite {PIXI.Sprite} the sprite to render when using this spritebatch
 */
SpriteRenderer.prototype.render = function (sprite)
{
    //TODO set blend modes..
    // check texture..
    if (this.currentIndex >= this.size)
    {
        this.flush();
    }


    // get the uvs for the texture


    // if the uvs have not updated then no point rendering just yet!
    if (!sprite.texture._uvs)
    {
        return;
    }

    // push a texture.
    // increment the batchsize
    this.sprites[this.currentIndex++] = sprite;
};

/**
 * Renders the content and empties the current batch.
 *
 */
SpriteRenderer.prototype.flush = function ()
{
    if (this.currentIndex === 0) {
      return;
    }

    var gl = this.renderer.gl;

    var np2 = bitTwiddle.nextPow2(this.currentIndex);
    var log2 = bitTwiddle.log2(np2);
    var buffer = this.buffers[log2];

    var sprites = this.sprites;
    var groups = this.groups;

    var float32View = buffer.float32View;
    var uint32View = buffer.uint32View;

    var index = 0;
    var nextTexture;
    var currentTexture;
    var groupCount = 1;
    var textureCount = 0;
    var currentGroup = groups[0];
    var vertexData;
    var tint;
    var uvs;
    var textureId;
    var blendMode = sprites[0].blendMode;
    var shader;

    currentGroup.textureCount = 0;
    currentGroup.start = 0;
    currentGroup.blend = blendMode;

    TICK++;

    for (var i = 0; i < this.currentIndex; i++)
    {
        // upload the sprite elemetns...
        // they have all ready been calculated so we just need to push them into the buffer.
        var sprite = sprites[i];

        nextTexture = sprite._texture.baseTexture;

        if(blendMode !== sprite.blendMode)
        {
            blendMode = sprite.blendMode;

            // force the batch to break!
            currentTexture = null;
            textureCount = this.MAX_TEXTURES;
            TICK++;
        }

        if(currentTexture !== nextTexture)
        {
            currentTexture = nextTexture;

            if(nextTexture._enabled !== TICK)
            {
                if(textureCount === this.MAX_TEXTURES)
                {
                    TICK++;

                    textureCount = 0;

                    currentGroup.size = i - currentGroup.start;

                    currentGroup = groups[groupCount++];
                    currentGroup.textureCount = 0;
                    currentGroup.blend = blendMode;
                    currentGroup.start = i;
                }

                nextTexture._enabled = TICK;
                nextTexture._id = textureCount;

                currentGroup.textures[currentGroup.textureCount++] = nextTexture;
                textureCount++;
            }

        }

        vertexData = sprite.vertexData;

        //TODO this sum does not need to be set each frame..
        tint = sprite._tintRGB + (sprite.worldAlpha * 255 << 24);
        uvs = sprite._texture._uvs.uvsUint32;
        textureId = nextTexture._id;

        if (this.renderer.roundPixels)
        {
            var resolution = this.renderer.resolution;

            //xy
            float32View[index] = ((vertexData[0] * resolution) | 0) / resolution;
            float32View[index+1] = ((vertexData[1] * resolution) | 0) / resolution;

            // xy
            float32View[index+5] = ((vertexData[2] * resolution) | 0) / resolution;
            float32View[index+6] = ((vertexData[3] * resolution) | 0) / resolution;

             // xy
            float32View[index+10] = ((vertexData[4] * resolution) | 0) / resolution;
            float32View[index+11] = ((vertexData[5] * resolution) | 0) / resolution;

            // xy
            float32View[index+15] = ((vertexData[6] * resolution) | 0) / resolution;
            float32View[index+16] = ((vertexData[7] * resolution) | 0) / resolution;

        }
        else
        {
            //xy
            float32View[index] = vertexData[0];
            float32View[index+1] = vertexData[1];

            // xy
            float32View[index+5] = vertexData[2];
            float32View[index+6] = vertexData[3];

             // xy
            float32View[index+10] = vertexData[4];
            float32View[index+11] = vertexData[5];

            // xy
            float32View[index+15] = vertexData[6];
            float32View[index+16] = vertexData[7];
        }

        uint32View[index+2] = uvs[0];
        uint32View[index+7] = uvs[1];
        uint32View[index+12] = uvs[2];
        uint32View[index+17] = uvs[3];

        uint32View[index+3] = uint32View[index+8] = uint32View[index+13] = uint32View[index+18] = tint;
        float32View[index+4] = float32View[index+9] = float32View[index+14] = float32View[index+19] = textureId;

        index += 20;
    }

    currentGroup.size = i - currentGroup.start;

    this.vertexCount++;

    if(this.vaoMax <= this.vertexCount)
    {
        this.vaoMax++;
        shader = this.shaders[1];
        this.vertexBuffers[this.vertexCount] = glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
        // build the vao object that will render..
        this.vaos[this.vertexCount] = this.renderer.createVao()
        .addIndex(this.indexBuffer)
        .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
        .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
        .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4)
        .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);
    }

    this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0);
    this.vao = this.vaos[this.vertexCount].bind();

    /// render the groups..
    for (i = 0; i < groupCount; i++) {

        var group = groups[i];
        var groupTextureCount = group.textureCount;
        shader = this.shaders[groupTextureCount-1];

        if(!shader)
        {
            shader = this.shaders[groupTextureCount-1] = generateMultiTextureShader(gl, groupTextureCount);
            //console.log("SHADER generated for " + textureCount + " textures")
        }

        this.renderer.bindShader(shader);

        for (var j = 0; j < groupTextureCount; j++)
        {
            this.renderer.bindTexture(group.textures[j], j);
        }

        // set the blend mode..
        this.renderer.state.setBlendMode( group.blend );

        gl.drawElements(gl.TRIANGLES, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
    }

    // reset elements for the next flush
    this.currentIndex = 0;
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteRenderer.prototype.start = function ()
{
    //this.renderer.bindShader(this.shader);
    //TICK %= 1000;
};

SpriteRenderer.prototype.stop = function ()
{
    this.flush();
    this.vao.unbind();
};
/**
 * Destroys the SpriteBatch.
 *
 */
SpriteRenderer.prototype.destroy = function ()
{
    for (var i = 0; i < this.vaoMax; i++) {
        this.vertexBuffers[i].destroy();
        this.vaos[i].destroy();
    }

    this.indexBuffer.destroy();

    this.renderer.off('prerender', this.onPrerender, this);
    ObjectRenderer.prototype.destroy.call(this);

    for (i = 0; i < this.shaders.length; i++) {

        if(this.shaders[i])
        {
            this.shaders[i].destroy();
        }
    }

    this.vertexBuffers = null;
    this.vaos = null;
    this.indexBuffer = null;
    this.indices = null;

    this.sprites = null;

    for (i = 0; i < this.buffers.length; i++) {
        this.buffers[i].destroy();
    }

};

},{"../../const":78,"../../renderers/webgl/WebGLRenderer":116,"../../renderers/webgl/utils/ObjectRenderer":126,"../../renderers/webgl/utils/checkMaxIfStatmentsInShader":129,"../../utils/createIndicesForQuads":149,"./BatchBuffer":136,"./generateMultiTextureShader":138,"bit-twiddle":30,"pixi-gl-core":7}],138:[function(require,module,exports){
var Shader = require('../../Shader');


var fragTemplate = [
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'varying float vTextureId;',
    'uniform sampler2D uSamplers[%count%];',

    'void main(void){',
    'vec4 color;',
    'float textureId = floor(vTextureId+0.5);',
    '%forloop%',
    'gl_FragColor = color * vColor;',
    '}'
].join('\n');

function generateMultiTextureShader(gl, maxTextures)
{
    var vertexSrc = "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vTextureId = aTextureId;\n   vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}\n";
    var fragmentSrc = fragTemplate;

    fragmentSrc = fragmentSrc.replace(/%count%/gi, maxTextures);
    fragmentSrc = fragmentSrc.replace(/%forloop%/gi, generateSampleSrc(maxTextures));

    var shader = new Shader(gl, vertexSrc, fragmentSrc);

    var sampleValues = [];
    for (var i = 0; i < maxTextures; i++)
    {
        sampleValues[i] = i;
    }

    shader.bind();
    shader.uniforms.uSamplers = sampleValues;

    return shader;
}

function generateSampleSrc(maxTextures)
{
    var src = '';

    src += '\n';
    src += '\n';

    for (var i = 0; i < maxTextures; i++)
    {
        if(i > 0)
        {
            src += '\nelse ';
        }

        if(i < maxTextures-1)
        {
            src += 'if(textureId == ' + i + '.0)';
        }

        src += '\n{';
        src += '\n\tcolor = texture2D(uSamplers['+i+'], vTextureCoord);';
        src += '\n}';
    }

    src += '\n';
    src += '\n';

    return src;
}



module.exports = generateMultiTextureShader;

},{"../../Shader":77}],139:[function(require,module,exports){
var Sprite = require('../sprites/Sprite'),
    Texture = require('../textures/Texture'),
    math = require('../math'),
    utils = require('../utils'),
    CONST = require('../const'),
    TextStyle = require('./TextStyle');

    var defaultDestroyOptions = {
            texture:true,
            children:false,
            baseTexture:true
    };
/**
 * A Text Object will create a line or multiple lines of text. To split a line you can use '\n' in your text string,
 * or add a wordWrap property set to true and and wordWrapWidth property with a value in the style object.
 *
 * A Text can be created directly from a string and a style object
 *
 * ```js
 * var text = new PIXI.Text('This is a pixi text',{font : '24px Arial', fill : 0xff1010, align : 'center'});
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 * @param text {string} The string that you would like the text to display
 * @param [style] {object|PIXI.TextStyle} The style parameters
 */
function Text(text, style)
{
    /**
     * The canvas element that everything is drawn to
     *
     * @member {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');

    /**
     * The canvas 2d context that everything is drawn with
     * @member {HTMLCanvasElement}
     */
    this.context = this.canvas.getContext('2d');

    /**
     * The resolution / device pixel ratio of the canvas. This is set automatically by the renderer.
     * @member {number}
     * @default 1
     */
    this.resolution = CONST.RESOLUTION;

    /**
     * Private tracker for the current text.
     *
     * @member {string}
     * @private
     */
    this._text = null;

    /**
     * Private tracker for the current style.
     *
     * @member {object}
     * @private
     */
    this._style = null;
    /**
     * Private listener to track style changes.
     *
     * @member {Function}
     * @private
     */
    this._styleListener = null;

    /**
     * Private tracker for the current font.
     *
     * @member {string}
     * @private
     */
    this._font = '';

    var texture = Texture.fromCanvas(this.canvas);
    texture.orig = new math.Rectangle();
    texture.trim = new math.Rectangle();
    Sprite.call(this, texture);

    this.text = text;
    this.style = style;

    this.localStyleID = -1;
}

// constructor
Text.prototype = Object.create(Sprite.prototype);
Text.prototype.constructor = Text;
module.exports = Text;

Text.fontPropertiesCache = {};
Text.fontPropertiesCanvas = document.createElement('canvas');
Text.fontPropertiesContext = Text.fontPropertiesCanvas.getContext('2d');

Object.defineProperties(Text.prototype, {
    /**
     * The width of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */
    width: {
        get: function ()
        {
            this.updateText(true);

            return Math.abs(this.scale.x) * this.texture.orig.width;
        },
        set: function (value)
        {
            this.updateText(true);

            var sign = utils.sign(this.scale.x) || 1;
            this.scale.x = sign * value / this.texture.orig.width;
            this._width = value;
        }
    },

    /**
     * The height of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.Text#
     */
    height: {
        get: function ()
        {
            this.updateText(true);

            return Math.abs(this.scale.y) * this._texture.orig.height;
        },
        set: function (value)
        {
            this.updateText(true);

            var sign = utils.sign(this.scale.x) || 1;
            this.scale.x = sign * value / this.texture.orig.width;
            this._width = value;
        }
    },

    /**
     * Set the style of the text. Set up an event listener to listen for changes on the style object and mark the text as dirty.
     *
     * @member {object|PIXI.TextStyle}
     * @memberof PIXI.Text#
     */
    style: {
        get: function ()
        {
            return this._style;
        },
        set: function (style)
        {

            style = style || {};
            if (style instanceof TextStyle)
            {
                this._style = style;
            }
            else
            {
                this._style = new TextStyle(style);
            }

            this.localStyleID = -1;
            this.dirty = true;
        }
    },

    /**
     * Set the copy for the text object. To split a line you can use '\n'.
     *
     * @member {string}
     * @memberof PIXI.Text#
     */
    text: {
        get: function()
        {
            return this._text;
        },
        set: function (text){

            text = text || ' ';
            text = text.toString();

            if (this._text === text)
            {
                return;
            }
            this._text = text;
            this.dirty = true;
        }
    }
});

/**
 * Renders text and updates it when needed
 * @param respectDirty {boolean} Whether to abort updating the text if the Text isn't dirty and the function is called.
 * @private
 */
Text.prototype.updateText = function (respectDirty)
{
    var style = this._style;

    // check if style has changed..
    if(this.localStyleID !== style.styleID)
    {
        this.dirty = true;
        this.localStyleID = style.styleID;
    }

    if (!this.dirty && respectDirty) {
        return;
    }

    // build canvas api font setting from invididual components. Convert a numeric style.fontSize to px
    var fontSizeString = (typeof style.fontSize === 'number') ? style.fontSize + 'px' : style.fontSize;
    this._font = style.fontStyle + ' ' + style.fontVariant + ' ' + style.fontWeight + ' ' + fontSizeString + ' ' + style.fontFamily;

    this.context.font = this._font;

    // word wrap
    // preserve original text
    var outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;

    // split text into lines
    var lines = outputText.split(/(?:\r\n|\r|\n)/);

    // calculate text width
    var lineWidths = new Array(lines.length);
    var maxLineWidth = 0;
    var fontProperties = this.determineFontProperties(this._font);

    var i;
    for (i = 0; i < lines.length; i++)
    {
        var lineWidth = this.context.measureText(lines[i]).width + ((lines[i].length - 1) * style.letterSpacing);
        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }

    var width = maxLineWidth + style.strokeThickness;
    if (style.dropShadow)
    {
        width += style.dropShadowDistance;
    }

    width += style.padding * 2;

    this.canvas.width = Math.ceil( ( width + this.context.lineWidth ) * this.resolution );

    // calculate text height
    var lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;

    var height = Math.max(lineHeight, fontProperties.fontSize  + style.strokeThickness) + (lines.length - 1) * lineHeight;
    if (style.dropShadow)
    {
        height += style.dropShadowDistance;
    }

    this.canvas.height = Math.ceil( ( height + this._style.padding * 2 ) * this.resolution );

    this.context.scale( this.resolution, this.resolution);

    if (navigator.isCocoonJS)
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }

//    this.context.fillStyle="#FF0000";
//    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.font = this._font;
    this.context.strokeStyle = style.stroke;
    this.context.lineWidth = style.strokeThickness;
    this.context.textBaseline = style.textBaseline;
    this.context.lineJoin = style.lineJoin;
    this.context.miterLimit = style.miterLimit;

    var linePositionX;
    var linePositionY;

    if (style.dropShadow)
    {
        if (style.dropShadowBlur > 0) {
            this.context.shadowColor = style.dropShadowColor;
            this.context.shadowBlur = style.dropShadowBlur;
        } else {
            this.context.fillStyle = style.dropShadowColor;
        }

        var xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        var yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

        for (i = 0; i < lines.length; i++)
        {
            linePositionX = style.strokeThickness / 2;
            linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

            if (style.align === 'right')
            {
                linePositionX += maxLineWidth - lineWidths[i];
            }
            else if (style.align === 'center')
            {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }

            if (style.fill)
            {
                this.drawLetterSpacing(lines[i], linePositionX + xShadowOffset + style.padding, linePositionY + yShadowOffset + style.padding);

                if (style.stroke && style.strokeThickness)
                {
                    this.context.strokeStyle = style.dropShadowColor;
                    this.drawLetterSpacing(lines[i], linePositionX + xShadowOffset + style.padding, linePositionY + yShadowOffset + style.padding, true);
                    this.context.strokeStyle = style.stroke;
			    }
            }
        }
    }

    //set canvas text styles
    this.context.fillStyle = this._generateFillStyle(style, lines);

    //draw lines line by line
    for (i = 0; i < lines.length; i++)
    {
        linePositionX = style.strokeThickness / 2;
        linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

        if (style.align === 'right')
        {
            linePositionX += maxLineWidth - lineWidths[i];
        }
        else if (style.align === 'center')
        {
            linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }

        if (style.stroke && style.strokeThickness)
        {
            this.drawLetterSpacing(lines[i], linePositionX + style.padding, linePositionY + style.padding, true);
        }

        if (style.fill)
        {
            this.drawLetterSpacing(lines[i], linePositionX + style.padding, linePositionY + style.padding);
        }
    }

    this.updateTexture();
};

/**
 * Render the text with letter-spacing.
 * @param {string} text - The text to draw
 * @param {number} x - Horizontal position to draw the text
 * @param {number} y - Vertical position to draw the text
 * @param {boolean} isStroke - Is this drawing for the outside stroke of the text? If not, it's for the inside fill
 * @private
 */
Text.prototype.drawLetterSpacing = function(text, x, y, isStroke)
{
    var style = this._style;

    // letterSpacing of 0 means normal
    var letterSpacing = style.letterSpacing;

    if (letterSpacing === 0)
    {
        if (isStroke)
        {
            this.context.strokeText(text, x, y);
        }
        else
        {
            this.context.fillText(text, x, y);
        }
        return;
    }

    var characters = String.prototype.split.call(text, ''),
        index = 0,
        current,
        currentPosition = x;

    while (index < text.length)
    {
        current = characters[index++];
        if (isStroke)
        {
            this.context.strokeText(current, currentPosition, y);
        }
        else
        {
            this.context.fillText(current, currentPosition, y);
        }
        currentPosition += this.context.measureText(current).width + letterSpacing;
    }
};

/**
 * Updates texture size based on canvas size
 *
 * @private
 */
Text.prototype.updateTexture = function ()
{
    var texture = this._texture;
    var style = this._style;

    texture.baseTexture.hasLoaded = true;
    texture.baseTexture.resolution = this.resolution;

    texture.baseTexture.realWidth = this.canvas.width;
    texture.baseTexture.realHeight = this.canvas.height;
    texture.baseTexture.width = this.canvas.width / this.resolution;
    texture.baseTexture.height = this.canvas.height / this.resolution;
    texture.trim.width = texture._frame.width = this.canvas.width / this.resolution;
    texture.trim.height = texture._frame.height = this.canvas.height / this.resolution;

    texture.trim.x = -style.padding;
    texture.trim.y = -style.padding;

    texture.orig.width = texture._frame.width;
    texture.orig.height = texture._frame.height - style.padding*2;

    //call sprite onTextureUpdate to update scale if _width or _height were set
    this._onTextureUpdate();

    texture.baseTexture.emit('update',  texture.baseTexture);

    this.dirty = false;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 */
Text.prototype.renderWebGL = function (renderer)
{
    if(this.resolution !== renderer.resolution)
    {
        this.resolution = renderer.resolution;
        this.dirty = true;
    }

    this.updateText(true);

    Sprite.prototype.renderWebGL.call(this, renderer);
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The renderer
 * @private
 */
Text.prototype._renderCanvas = function (renderer)
{
    if(this.resolution !== renderer.resolution)
    {
        this.resolution = renderer.resolution;
        this.dirty = true;
    }

    this.updateText(true);

    Sprite.prototype._renderCanvas.call(this, renderer);
};

/**
 * Calculates the ascent, descent and fontSize of a given fontStyle
 *
 * @param fontStyle {string} String representing the style of the font
 * @return {Object} Font properties object
 * @private
 */
Text.prototype.determineFontProperties = function (fontStyle)
{
    var properties = Text.fontPropertiesCache[fontStyle];

    if (!properties)
    {
        properties = {};

        var canvas = Text.fontPropertiesCanvas;
        var context = Text.fontPropertiesContext;

        context.font = fontStyle;

        var width = Math.ceil(context.measureText('|MÉq').width);
        var baseline = Math.ceil(context.measureText('M').width);
        var height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = fontStyle;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText('|MÉq', 0, baseline);

        var imagedata = context.getImageData(0, 0, width, height).data;
        var pixels = imagedata.length;
        var line = width * 4;

        var i, j;

        var idx = 0;
        var stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; i++)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx += line;
            }
            else
            {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; i--)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }
            if (!stop)
            {
                idx -= line;
            }
            else
            {
                break;
            }
        }

        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;

        Text.fontPropertiesCache[fontStyle] = properties;
    }

    return properties;
};

/**
 * Applies newlines to a string to have it optimally fit into the horizontal
 * bounds set by the Text object's wordWrapWidth property.
 *
 * @param text {string} String to apply word wrapping to
 * @return {string} New string with new lines applied where required
 * @private
 */
Text.prototype.wordWrap = function (text)
{
    // Greedy wrapping algorithm that will wrap words as the line grows longer
    // than its horizontal bounds.
    var result = '';
    var lines = text.split('\n');
    var wordWrapWidth = this._style.wordWrapWidth;
    for (var i = 0; i < lines.length; i++)
    {
        var spaceLeft = wordWrapWidth;
        var words = lines[i].split(' ');
        for (var j = 0; j < words.length; j++)
        {
            var wordWidth = this.context.measureText(words[j]).width;
            if (this._style.breakWords && wordWidth > wordWrapWidth)
            {
                // Word should be split in the middle
                var characters = words[j].split('');
                for (var c = 0; c < characters.length; c++)
                {
                  var characterWidth = this.context.measureText(characters[c]).width;
                  if (characterWidth > spaceLeft)
                  {
                    result += '\n' + characters[c];
                    spaceLeft = wordWrapWidth - characterWidth;
                  }
                  else
                  {
                    if (c === 0)
                    {
                      result += ' ';
                    }
                    result += characters[c];
                    spaceLeft -= characterWidth;
                  }
                }
            }
            else
            {
                var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
                if (j === 0 || wordWidthWithSpace > spaceLeft)
                {
                    // Skip printing the newline if it's the first word of the line that is
                    // greater than the word wrap width.
                    if (j > 0)
                    {
                        result += '\n';
                    }
                    result += words[j];
                    spaceLeft = wordWrapWidth - wordWidth;
                }
                else
                {
                    spaceLeft -= wordWidthWithSpace;
                    result += ' ' + words[j];
                }
            }
        }

        if (i < lines.length-1)
        {
            result += '\n';
        }
    }
    return result;
};

/**
 * calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
 */
Text.prototype._calculateBounds = function ()
{
    this.updateText(true);
    this.calculateVertices();
    // if we have already done this on THIS frame.
    this._bounds.addQuad(this.vertexData);
};

/**
 * Method to be called upon a TextStyle change.
 * @private
 */
Text.prototype._onStyleChange = function ()
{
    this.dirty = true;
};

/**
 * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
 * @return string|Number|CanvasGradient
 * @private
 */
Text.prototype._generateFillStyle = function (style, lines)
{
    if (!Array.isArray(style.fill))
    {
        return style.fill;
    }
    else
    {
        // the gradient will be evenly spaced out according to how large the array is.
        // ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
        var i;
        var gradient;
        var totalIterations;
        var currentIteration;
        var stop;

        var width = this.canvas.width / this.resolution;
        var height = this.canvas.height / this.resolution;

        if (style.fillGradientType === CONST.TEXT_GRADIENT.LINEAR_VERTICAL)
        {
            // start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
            gradient = this.context.createLinearGradient(width / 2, 0, width / 2, height);

            // we need to repeat the gradient so that each invididual line of text has the same vertical gradient effect
            // ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875
            totalIterations = ( style.fill.length + 1 ) * lines.length;
            currentIteration = 0;
            for (i = 0; i < lines.length; i++)
            {
                currentIteration += 1;
                for (var j = 0; j < style.fill.length; j++)
                {
                    stop = (currentIteration / totalIterations);
                    gradient.addColorStop(stop, style.fill[j]);
                    currentIteration++;
                }
            }
        }
        else
        {
            // start the gradient at the center left of the canvas, and end at the center right of the canvas
            gradient = this.context.createLinearGradient(0, height / 2, width, height / 2);

            // can just evenly space out the gradients in this case, as multiple lines makes no difference to an even left to right gradient
            totalIterations = style.fill.length + 1;
            currentIteration = 1;

            for (i = 0; i < style.fill.length; i++)
            {
                stop = currentIteration / totalIterations;
                gradient.addColorStop(stop, style.fill[i]);
                currentIteration++;
            }
        }

        return gradient;
    }
};

/**
 * Destroys this text object.
 * Note* Unlike a Sprite, a Text object will automatically destroy its baseTexture and texture as
 * the majorety of the time the texture will not be shared with any other Sprites.
 *
 * @param [options] {object|boolean} Options parameter. A boolean will act as if all options have been set to that value
 * @param [options.children=false] {boolean} if set to true, all the children will have their destroy
 *      method called as well. 'options' will be passed on to those calls.
 * @param [options.texture=true] {boolean} Should it destroy the current texture of the sprite as well
 * @param [options.baseTexture=true] {boolean} Should it destroy the base texture of the sprite as well
 */
Text.prototype.destroy = function (options)
{
    if (typeof options === 'boolean') {
        options = { children: options };
    }

    options =  Object.assign({}, defaultDestroyOptions, options);

    Sprite.prototype.destroy.call(this, options);

    // make sure to reset the the context and canvas.. dont want this hanging around in memory!
    this.context = null;
    this.canvas = null;

    this._style = null;
};

},{"../const":78,"../math":102,"../sprites/Sprite":133,"../textures/Texture":144,"../utils":151,"./TextStyle":140}],140:[function(require,module,exports){
var CONST = require('../const'),
    utils = require('../utils');

/**
 * A TextStyle Object decorates a Text Object. It can be shared between
 * multiple Text objects. Changing the style will update all text objects using it.
 *
 * @class
 * @memberof PIXI
 * @param [style] {object} The style parameters
 * @param [style.align='left'] {string} Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
 * @param [style.breakWords=false] {boolean} Indicates if lines can be wrapped within words, it needs wordWrap to be set to true
 * @param [style.dropShadow=false] {boolean} Set a drop shadow for the text
 * @param [style.dropShadowAngle=Math.PI/6] {number} Set a angle of the drop shadow
 * @param [style.dropShadowBlur=0] {number} Set a shadow blur radius
 * @param [style.dropShadowColor='#000000'] {string} A fill style to be used on the dropshadow e.g 'red', '#00FF00'
 * @param [style.dropShadowDistance=5] {number} Set a distance of the drop shadow
 * @param [style.fill='black'] {string|string[]|number|number[]|CanvasGradient|CanvasPattern} A canvas fillstyle that will be used on the
 *      text e.g 'red', '#00FF00'. Can be an array to create a gradient eg ['#000000','#FFFFFF'] @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
 * @param [style.fillGradientType=PIXI.TEXT_GRADIENT.LINEAR_VERTICAL] {number} If fills styles are supplied, this can change the type/direction of the gradient. See {@link PIXI.TEXT_GRADIENT} for possible values
 * @param [style.fontFamily='Arial'] {string} The font family
 * @param [style.fontSize=26] {number|string} The font size (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em')
 * @param [style.fontStyle='normal'] {string} The font style ('normal', 'italic' or 'oblique')
 * @param [style.fontVariant='normal'] {string} The font variant ('normal' or 'small-caps')
 * @param [style.fontWeight='normal'] {string} The font weight ('normal', 'bold', 'bolder', 'lighter' and '100', '200', '300', '400', '500', '600', '700', 800' or '900')
 * @param [style.letterSpacing=0] {number} The amount of spacing between letters, default is 0
 * @param [style.lineHeight] {number} The line height, a number that represents the vertical space that a letter uses
 * @param [style.lineJoin='miter'] {string} The lineJoin property sets the type of corner created, it can resolve
 *      spiked text issues. Default is 'miter' (creates a sharp corner).
 * @param [style.miterLimit=10] {number} The miter limit to use when using the 'miter' lineJoin mode. This can reduce
 *      or increase the spikiness of rendered text.
 * @param [style.padding=0] {number} Occasionally some fonts are cropped on top or bottom. Adding some padding will
 *      prevent this from happening by adding padding to the top and bottom of text height.
 * @param [style.stroke='black'] {string|number} A canvas fillstyle that will be used on the text stroke e.g 'blue', '#FCFF00'
 * @param [style.strokeThickness=0] {number} A number that represents the thickness of the stroke. Default is 0 (no stroke)
 * @param [style.textBaseline='alphabetic'] {string} The baseline of the text that is rendered.
 * @param [style.wordWrap=false] {boolean} Indicates if word wrap should be used
 * @param [style.wordWrapWidth=100] {number} The width at which text will wrap, it needs wordWrap to be set to true
 */
function TextStyle(style)
{
    this.styleID = 0;
    Object.assign(this, this._defaults, style);
}

TextStyle.prototype.constructor = TextStyle;
module.exports = TextStyle;

// Default settings. Explained in the constructor.
TextStyle.prototype._defaults = {
    align: 'left',
    breakWords: false,
    dropShadow: false,
    dropShadowAngle: Math.PI / 6,
    dropShadowBlur: 0,
    dropShadowColor: '#000000',
    dropShadowDistance: 5,
    fill: 'black',
    fillGradientType: CONST.TEXT_GRADIENT.LINEAR_VERTICAL,
    fontFamily: 'Arial',
    fontSize: 26,
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    letterSpacing: 0,
    lineHeight: 0,
    lineJoin: 'miter',
    miterLimit: 10,
    padding: 0,
    stroke: 'black',
    strokeThickness: 0,
    textBaseline: 'alphabetic',
    wordWrap: false,
    wordWrapWidth: 100
};

/**
 * Creates a new TextStyle object with the same values as this one.
 * Note that the only the properties of the object are cloned.
 *
 * @return {PIXI.TextStyle} New cloned TextStyle object
 */
TextStyle.prototype.clone = function ()
{
    var clonedProperties = {};
    for (var key in this._defaults)
    {
        clonedProperties[key] = this[key];
    }
    return new TextStyle(clonedProperties);
};

/**
 * Resets all properties to the defaults specified in TextStyle.prototype._default
 */
TextStyle.prototype.reset = function ()
{
    Object.assign(this, this._defaults);
};

/**
 * Create setters and getters for each of the style properties. Converts colors where necessary.
 */
Object.defineProperties(TextStyle.prototype, {
     align: {
        get: function ()
        {
            return this._align;
        },
        set: function (align)
        {
            if (this._align !== align)
            {
                this._align = align;
                this.styleID++;
            }
        }
    },

    breakWords: {
        get: function ()
        {
            return this._breakWords;
        },
        set: function (breakWords)
        {
            if (this._breakWords !== breakWords)
            {
                this._breakWords = breakWords;
                this.styleID++;
            }
        }
    },

    dropShadow: {
        get: function ()
        {
            return this._dropShadow;
        },
        set: function (dropShadow)
        {
            if (this._dropShadow !== dropShadow)
            {
                this._dropShadow = dropShadow;
                this.styleID++;
            }
        }
    },

    dropShadowAngle: {
        get: function ()
        {
            return this._dropShadowAngle;
        },
        set: function (dropShadowAngle)
        {
            if (this._dropShadowAngle !== dropShadowAngle)
            {
                this._dropShadowAngle = dropShadowAngle;
                this.styleID++;
            }
        }
    },

    dropShadowBlur: {
        get: function ()
        {
            return this._dropShadowBlur;
        },
        set: function (dropShadowBlur)
        {
            if (this._dropShadowBlur !== dropShadowBlur)
            {
                this._dropShadowBlur = dropShadowBlur;
                this.styleID++;
            }
        }
    },

    dropShadowColor: {
        get: function ()
        {
            return this._dropShadowColor;
        },
        set: function (dropShadowColor)
        {
            var outputColor = getColor(dropShadowColor);
            if (this._dropShadowColor !== outputColor)
            {
                this._dropShadowColor = outputColor;
                this.styleID++;
            }
        }
    },

    dropShadowDistance: {
        get: function ()
        {
            return this._dropShadowDistance;
        },
        set: function (dropShadowDistance)
        {
            if (this._dropShadowDistance !== dropShadowDistance)
            {
                this._dropShadowDistance = dropShadowDistance;
                this.styleID++;
            }
        }
    },

    fill: {
        get: function ()
        {
            return this._fill;
        },
        set: function (fill)
        {
            var outputColor = getColor(fill);
            if (this._fill !== outputColor)
            {
                this._fill = outputColor;
                this.styleID++;
            }
        }
    },

    fillGradientType: {
        get: function ()
        {
            return this._fillGradientType;
        },
        set: function (fillGradientType)
        {
            if (this._fillGradientType !== fillGradientType)
            {
                this._fillGradientType = fillGradientType;
                this.styleID++;
            }
        }
    },

    fontFamily: {
        get: function ()
        {
            return this._fontFamily;
        },
        set: function (fontFamily)
        {
            if (this.fontFamily !== fontFamily)
            {
                this._fontFamily = fontFamily;
                this.styleID++;
            }
        }
    },

    fontSize: {
        get: function ()
        {
            return this._fontSize;
        },
        set: function (fontSize)
        {
            if (this._fontSize !== fontSize)
            {
                this._fontSize = fontSize;
                this.styleID++;
            }
        }
    },

    fontStyle: {
        get: function ()
        {
            return this._fontStyle;
        },
        set: function (fontStyle)
        {
            if (this._fontStyle !== fontStyle)
            {
                this._fontStyle = fontStyle;
                this.styleID++;
            }
        }
    },

    fontVariant: {
        get: function ()
        {
            return this._fontVariant;
        },
        set: function (fontVariant)
        {
            if (this._fontVariant !== fontVariant)
            {
                this._fontVariant = fontVariant;
                this.styleID++;
            }
        }
    },

    fontWeight: {
        get: function ()
        {
            return this._fontWeight;
        },
        set: function (fontWeight)
        {
            if (this._fontWeight !== fontWeight)
            {
                this._fontWeight = fontWeight;
                this.styleID++;
            }
        }
    },

    letterSpacing: {
        get: function ()
        {
            return this._letterSpacing;
        },
        set: function (letterSpacing)
        {
            if (this._letterSpacing !== letterSpacing)
            {
                this._letterSpacing = letterSpacing;
                this.styleID++;
            }
        }
    },

    lineHeight: {
        get: function ()
        {
            return this._lineHeight;
        },
        set: function (lineHeight)
        {
            if (this._lineHeight !== lineHeight)
            {
                this._lineHeight = lineHeight;
                this.styleID++;
            }
        }
    },

    lineJoin: {
        get: function ()
        {
            return this._lineJoin;
        },
        set: function (lineJoin)
        {
            if (this._lineJoin !== lineJoin)
            {
                this._lineJoin = lineJoin;
                this.styleID++;
            }
        }
    },

    miterLimit: {
        get: function ()
        {
            return this._miterLimit;
        },
        set: function (miterLimit)
        {
            if (this._miterLimit !== miterLimit)
            {
                this._miterLimit = miterLimit;
                this.styleID++;
            }
        }
    },

    padding: {
        get: function ()
        {
            return this._padding;
        },
        set: function (padding)
        {
            if (this._padding !== padding)
            {
                this._padding = padding;
                this.styleID++;
            }
        }
    },

    stroke: {
        get: function ()
        {
            return this._stroke;
        },
        set: function (stroke)
        {
            var outputColor = getColor(stroke);
            if (this._stroke !== outputColor)
            {
                this._stroke = outputColor;
                this.styleID++;
            }
        }
    },

    strokeThickness: {
        get: function ()
        {
            return this._strokeThickness;
        },
        set: function (strokeThickness)
        {
            if (this._strokeThickness !== strokeThickness)
            {
                this._strokeThickness = strokeThickness;
                this.styleID++;
            }
        }
    },

    textBaseline: {
        get: function ()
        {
            return this._textBaseline;
        },
        set: function (textBaseline)
        {
            if (this._textBaseline !== textBaseline)
            {
                this._textBaseline = textBaseline;
                this.styleID++;
            }
        }
    },

    wordWrap: {
        get: function ()
        {
            return this._wordWrap;
        },
        set: function (wordWrap)
        {
            if (this._wordWrap !== wordWrap)
            {
                this._wordWrap = wordWrap;
                this.styleID++;
            }
        }
    },

    wordWrapWidth: {
        get: function ()
        {
            return this._wordWrapWidth;
        },
        set: function (wordWrapWidth)
        {
            if (this._wordWrapWidth !== wordWrapWidth)
            {
                this._wordWrapWidth = wordWrapWidth;
                this.styleID++;
            }
        }
    }
});

/**
 * Utility function to convert hexadecimal colors to strings, and simply return the color if it's a string.
 *
 * @return {string} The color as a string.
 */
function getColor(color)
{
    if (typeof color === 'number')
    {
        return utils.hex2string(color);
    }
    else if (Array.isArray(color))
    {
        for (var i = 0; i < color.length; ++i)
        {
            if (typeof color[i] === 'number')
            {
                color[i] = utils.hex2string(color[i]);
            }
        }
    }

    return color;
}

},{"../const":78,"../utils":151}],141:[function(require,module,exports){
var BaseTexture = require('./BaseTexture'),
    CONST = require('../const');

/**
 * A BaseRenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a BaseRenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A BaseRenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * var renderer = PIXI.autoDetectRenderer(1024, 1024, { view: canvas, ratio: 1 });
 * var BaserenderTexture = new PIXI.BaseRenderTexture(renderer, 800, 600);
 * var sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * BaserenderTexture.render(sprite);
 * ```
 *
 * The Sprite in this case will be rendered to a position of 0,0. To render this sprite at its actual
 * position a Container should be used:
 *
 * ```js
 * var doc = new PIXI.Container();
 *
 * doc.addChild(sprite);
 *
 * var baseRenderTexture = new PIXI.BaserenderTexture(100, 100);
 * var renderTexture = new PIXI.RenderTexture(baseRenderTexture);
 *
 * renderer.render(doc, renderTexture);  // Renders to center of RenderTexture
 * ```
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 * @param [width=100] {number} The width of the base render texture
 * @param [height=100] {number} The height of the base render texture
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=1] {number} The resolution / device pixel ratio of the texture being generated
 */
function BaseRenderTexture(width, height, scaleMode, resolution)
{
    BaseTexture.call(this, null, scaleMode);

    this.resolution = resolution || CONST.RESOLUTION;

    this.width = width || 100;
    this.height = height || 100;

    this.realWidth = this.width * this.resolution;
    this.realHeight = this.height * this.resolution;

    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;
    this.hasLoaded = true;

    /**
     * A map of renderer IDs to webgl renderTargets
     *
     * @member {object<number, WebGLTexture>}
     * @private
     */
    this._glRenderTargets = [];

    /**
     * A reference to the canvas render target (we only need one as this can be shared accross renderers)
     *
     * @member {object<number, WebGLTexture>}
     * @private
     */
    this._canvasRenderTarget = null;

    /**
     * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
     *
     * @member {boolean}
     */
    this.valid = false;
}

BaseRenderTexture.prototype = Object.create(BaseTexture.prototype);
BaseRenderTexture.prototype.constructor = BaseRenderTexture;
module.exports = BaseRenderTexture;

/**
 * Resizes the BaseRenderTexture.
 *
 * @param width {number} The width to resize to.
 * @param height {number} The height to resize to.
 */
BaseRenderTexture.prototype.resize = function (width, height)
{

    if (width === this.width && height === this.height)
    {
        return;
    }

    this.valid = (width > 0 && height > 0);

    this.width = width;
    this.height = height;

    this.realWidth = this.width * this.resolution;
    this.realHeight = this.height * this.resolution;

    if (!this.valid)
    {
        return;
    }

    this.emit('update', this);

};

/**
 * Destroys this texture
 *
 */
BaseRenderTexture.prototype.destroy = function ()
{
    BaseTexture.prototype.destroy.call(this, true);
    this.renderer = null;
};


},{"../const":78,"./BaseTexture":142}],142:[function(require,module,exports){
var utils = require('../utils'),
    CONST = require('../const'),
    EventEmitter = require('eventemitter3'),
    determineCrossOrigin = require('../utils/determineCrossOrigin'),
    bitTwiddle = require('bit-twiddle');

/**
 * A texture stores the information that represents an image. All textures have a base texture.
 *
 * @class
 * @memberof PIXI
 * @param [source ]{HTMLImageElement|HTMLCanvasElement} the source object of the texture.
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=1] {number} The resolution / device pixel ratio of the texture
 */
function BaseTexture(source, scaleMode, resolution)
{
    EventEmitter.call(this);

    this.uid = utils.uid();

    this.touched = 0;

    /**
     * The resolution / device pixel ratio of the texture
     *
     * @member {number}
     * @default 1
     */
    this.resolution = resolution || CONST.RESOLUTION;

    /**
     * The width of the base texture set when the image has loaded
     *
     * @member {number}
     * @readonly
     */
    this.width = 100;

    /**
     * The height of the base texture set when the image has loaded
     *
     * @member {number}
     * @readonly
     */
    this.height = 100;

    // TODO docs
    // used to store the actual dimensions of the source
    /**
     * Used to store the actual width of the source of this texture
     *
     * @member {number}
     * @readonly
     */
    this.realWidth = 100;
    /**
     * Used to store the actual height of the source of this texture
     *
     * @member {number}
     * @readonly
     */
    this.realHeight = 100;

    /**
     * The scale mode to apply when scaling this texture
     *
     * @member {number}
     * @default PIXI.SCALE_MODES.DEFAULT
     * @see PIXI.SCALE_MODES
     */
    this.scaleMode = scaleMode || CONST.SCALE_MODES.DEFAULT;

    /**
     * Set to true once the base texture has successfully loaded.
     *
     * This is never true if the underlying source fails to load or has no texture data.
     *
     * @member {boolean}
     * @readonly
     */
    this.hasLoaded = false;

    /**
     * Set to true if the source is currently loading.
     *
     * If an Image source is loading the 'loaded' or 'error' event will be
     * dispatched when the operation ends. An underyling source that is
     * immediately-available bypasses loading entirely.
     *
     * @member {boolean}
     * @readonly
     */
    this.isLoading = false;

    /**
     * The image source that is used to create the texture.
     *
     * TODO: Make this a setter that calls loadSource();
     *
     * @member {HTMLImageElement|HTMLCanvasElement}
     * @readonly
     */
    this.source = null; // set in loadSource, if at all

    /**
     * Controls if RGB channels should be pre-multiplied by Alpha  (WebGL only)
     * All blend modes, and shaders written for default value. Change it on your own risk.
     *
     * @member {boolean}
     * @default true
     */
    this.premultipliedAlpha = true;

    /**
     * The image url of the texture
     *
     * @member {string}
     */
    this.imageUrl = null;

    /**
     * Wether or not the texture is a power of two, try to use power of two textures as much as you can
     * @member {boolean}
     * @private
     */
    this.isPowerOfTwo = false;

    // used for webGL

    /**
     *
     * Set this to true if a mipmap of this texture needs to be generated. This value needs to be set before the texture is used
     * Also the texture must be a power of two size to work
     *
     * @member {boolean}
     * @see PIXI.MIPMAP_TEXTURES
     */
    this.mipmap = CONST.MIPMAP_TEXTURES;

    /**
     *
     * WebGL Texture wrap mode
     *
     * @member {number}
     * @see PIXI.WRAP_MODES
     */
    this.wrapMode = CONST.WRAP_MODES.DEFAULT;

    /**
     * A map of renderer IDs to webgl textures
     *
     * @member {object<number, WebGLTexture>}
     * @private
     */
    this._glTextures = [];
    this._enabled = 0;
    this._id = 0;

    // if no source passed don't try to load
    if (source)
    {
        this.loadSource(source);
    }

    /**
     * Fired when a not-immediately-available source finishes loading.
     *
     * @event loaded
     * @memberof PIXI.BaseTexture#
     * @protected
     */

    /**
     * Fired when a not-immediately-available source fails to load.
     *
     * @event error
     * @memberof PIXI.BaseTexture#
     * @protected
     */
}

BaseTexture.prototype = Object.create(EventEmitter.prototype);
BaseTexture.prototype.constructor = BaseTexture;
module.exports = BaseTexture;

/**
 * Updates the texture on all the webgl renderers, this also assumes the src has changed.
 *
 * @fires update
 */
BaseTexture.prototype.update = function ()
{
    this.realWidth = this.source.naturalWidth || this.source.videoWidth || this.source.width;
    this.realHeight = this.source.naturalHeight || this.source.videoHeight || this.source.height;

    this.width = this.realWidth / this.resolution;
    this.height = this.realHeight / this.resolution;

    this.isPowerOfTwo = bitTwiddle.isPow2(this.realWidth) && bitTwiddle.isPow2(this.realHeight);

    this.emit('update', this);
};

/**
 * Load a source.
 *
 * If the source is not-immediately-available, such as an image that needs to be
 * downloaded, then the 'loaded' or 'error' event will be dispatched in the future
 * and `hasLoaded` will remain false after this call.
 *
 * The logic state after calling `loadSource` directly or indirectly (eg. `fromImage`, `new BaseTexture`) is:
 *
 *     if (texture.hasLoaded) {
 *        // texture ready for use
 *     } else if (texture.isLoading) {
 *        // listen to 'loaded' and/or 'error' events on texture
 *     } else {
 *        // not loading, not going to load UNLESS the source is reloaded
 *        // (it may still make sense to listen to the events)
 *     }
 *
 * @protected
 * @param source {HTMLImageElement|HTMLCanvasElement} the source object of the texture.
 */
BaseTexture.prototype.loadSource = function (source)
{
    var wasLoading = this.isLoading;
    this.hasLoaded = false;
    this.isLoading = false;

    if (wasLoading && this.source)
    {
        this.source.onload = null;
        this.source.onerror = null;
    }

    this.source = source;

    // Apply source if loaded. Otherwise setup appropriate loading monitors.
    if ((this.source.complete || this.source.getContext) && this.source.width && this.source.height)
    {
        this._sourceLoaded();
    }
    else if (!source.getContext)
    {

        // Image fail / not ready
        this.isLoading = true;

        var scope = this;

        source.onload = function ()
        {
            source.onload = null;
            source.onerror = null;

            if (!scope.isLoading)
            {
                return;
            }

            scope.isLoading = false;
            scope._sourceLoaded();

            scope.emit('loaded', scope);
        };

        source.onerror = function ()
        {
            source.onload = null;
            source.onerror = null;

            if (!scope.isLoading)
            {
                return;
            }

            scope.isLoading = false;
            scope.emit('error', scope);
        };

        // Per http://www.w3.org/TR/html5/embedded-content-0.html#the-img-element
        //   "The value of `complete` can thus change while a script is executing."
        // So complete needs to be re-checked after the callbacks have been added..
        // NOTE: complete will be true if the image has no src so best to check if the src is set.
        if (source.complete && source.src)
        {
            this.isLoading = false;

            // ..and if we're complete now, no need for callbacks
            source.onload = null;
            source.onerror = null;

            if (source.width && source.height)
            {
                this._sourceLoaded();

                // If any previous subscribers possible
                if (wasLoading)
                {
                    this.emit('loaded', this);
                }
            }
            else
            {
                // If any previous subscribers possible
                if (wasLoading)
                {
                    this.emit('error', this);
                }
            }
        }
    }
};

/**
 * Used internally to update the width, height, and some other tracking vars once
 * a source has successfully loaded.
 *
 * @private
 */
BaseTexture.prototype._sourceLoaded = function ()
{
    this.hasLoaded = true;
    this.update();
};

/**
 * Destroys this base texture
 *
 */
BaseTexture.prototype.destroy = function ()
{
    if (this.imageUrl)
    {
        delete utils.BaseTextureCache[this.imageUrl];
        delete utils.TextureCache[this.imageUrl];

        this.imageUrl = null;

        if (!navigator.isCocoonJS)
        {
            this.source.src = '';
        }
    }
    else if (this.source && this.source._pixiId)
    {
        delete utils.BaseTextureCache[this.source._pixiId];
    }

    this.source = null;

    this.dispose();
};

/**
 * Frees the texture from WebGL memory without destroying this texture object.
 * This means you can still use the texture later which will upload it to GPU
 * memory again.
 *
 */
BaseTexture.prototype.dispose = function ()
{
    this.emit('dispose', this);

    // this should no longer be needed, the renderers should cleanup all the gl textures.
    // this._glTextures = {};
};

/**
 * Changes the source image of the texture.
 * The original source must be an Image element.
 *
 * @param newSrc {string} the path of the image
 */
BaseTexture.prototype.updateSourceImage = function (newSrc)
{
    this.source.src = newSrc;

    this.loadSource(this.source);
};

/**
 * Helper function that creates a base texture from the given image url.
 * If the image is not in the base texture cache it will be created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param [crossorigin=(auto)] {boolean} Should use anonymous CORS? Defaults to true if the URL is not a data-URI.
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return PIXI.BaseTexture
 */
BaseTexture.fromImage = function (imageUrl, crossorigin, scaleMode)
{
    var baseTexture = utils.BaseTextureCache[imageUrl];

    if (!baseTexture)
    {
        // new Image() breaks tex loading in some versions of Chrome.
        // See https://code.google.com/p/chromium/issues/detail?id=238071
        var image = new Image();//document.createElement('img');


        if (crossorigin === undefined && imageUrl.indexOf('data:') !== 0)
        {
            image.crossOrigin = determineCrossOrigin(imageUrl);
        }

        baseTexture = new BaseTexture(image, scaleMode);
        baseTexture.imageUrl = imageUrl;

        image.src = imageUrl;

        utils.BaseTextureCache[imageUrl] = baseTexture;

        // if there is an @2x at the end of the url we are going to assume its a highres image
        baseTexture.resolution = utils.getResolutionOfUrl(imageUrl);
    }

    return baseTexture;
};

/**
 * Helper function that creates a base texture from the given canvas element.
 *
 * @static
 * @param canvas {HTMLCanvasElement} The canvas element source of the texture
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return PIXI.BaseTexture
 */
BaseTexture.fromCanvas = function (canvas, scaleMode)
{
    if (!canvas._pixiId)
    {
        canvas._pixiId = 'canvas_' + utils.uid();
    }

    var baseTexture = utils.BaseTextureCache[canvas._pixiId];

    if (!baseTexture)
    {
        baseTexture = new BaseTexture(canvas, scaleMode);
        utils.BaseTextureCache[canvas._pixiId] = baseTexture;
    }

    return baseTexture;
};

},{"../const":78,"../utils":151,"../utils/determineCrossOrigin":150,"bit-twiddle":30,"eventemitter3":32}],143:[function(require,module,exports){
var BaseRenderTexture = require('./BaseRenderTexture'),
    Texture = require('./Texture');

/**
 * A RenderTexture is a special texture that allows any Pixi display object to be rendered to it.
 *
 * __Hint__: All DisplayObjects (i.e. Sprites) that render to a RenderTexture should be preloaded
 * otherwise black rectangles will be drawn instead.
 *
 * A RenderTexture takes a snapshot of any Display Object given to its render method. The position
 * and rotation of the given Display Objects is ignored. For example:
 *
 * ```js
 * var renderer = PIXI.autoDetectRenderer(1024, 1024, { view: canvas, ratio: 1 });
 * var renderTexture = PIXI.RenderTexture.create(800, 600);
 * var sprite = PIXI.Sprite.fromImage("spinObj_01.png");
 *
 * sprite.position.x = 800/2;
 * sprite.position.y = 600/2;
 * sprite.anchor.x = 0.5;
 * sprite.anchor.y = 0.5;
 *
 * renderer.render(sprite, renderTexture);
 * ```
 *
 * The Sprite in this case will be rendered to a position of 0,0. To render this sprite at its actual
 * position a Container should be used:
 *
 * ```js
 * var doc = new PIXI.Container();
 *
 * doc.addChild(sprite);
 *
 * renderer.render(doc, renderTexture);  // Renders to center of renderTexture
 * ```
 *
 * @class
 * @extends PIXI.Texture
 * @memberof PIXI
 * @param baseRenderTexture {PIXI.BaseRenderTexture} The renderer used for this RenderTexture
 * @param [frame] {PIXI.Rectangle} The rectangle frame of the texture to show
 */
function RenderTexture(baseRenderTexture, frame)
{
    // suport for legacy..
    this.legacyRenderer = null;

    if( !(baseRenderTexture instanceof BaseRenderTexture) )
    {
        var width = arguments[1];
        var height = arguments[2];
        var scaleMode = arguments[3] || 0;
        var resolution = arguments[4] || 1;

        // we have an old render texture..
        console.warn('v4 RenderTexture now expects a new BaseRenderTexture. Please use RenderTexture.create('+width+', '+height+')');  // jshint ignore:line
        this.legacyRenderer = arguments[0];

        frame = null;
        baseRenderTexture = new BaseRenderTexture(width, height, scaleMode, resolution);
    }


    /**
     * The base texture object that this texture uses
     *
     * @member {BaseTexture}
     */
    Texture.call(this,
        baseRenderTexture,
        frame
    );

    /**
     * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
     *
     * @member {boolean}
     */
    this.valid = true;

    this._updateUvs();
}

RenderTexture.prototype = Object.create(Texture.prototype);
RenderTexture.prototype.constructor = RenderTexture;
module.exports = RenderTexture;

/**
 * Resizes the RenderTexture.
 *
 * @param width {number} The width to resize to.
 * @param height {number} The height to resize to.
 * @param doNotResizeBaseTexture {boolean} Should the baseTexture.width and height values be resized as well?
 */
RenderTexture.prototype.resize = function (width, height, doNotResizeBaseTexture)
{

    //TODO - could be not required..
    this.valid = (width > 0 && height > 0);

    this._frame.width = this.orig.width = width;
    this._frame.height = this.orig.height = height;

    if (!doNotResizeBaseTexture)
    {
        this.baseTexture.resize(width, height);
    }

    this._updateUvs();
};

/**
 * A short hand way of creating a render texture..
 * @param [width=100] {number} The width of the render texture
 * @param [height=100] {number} The height of the render texture
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @param [resolution=1] {number} The resolution / device pixel ratio of the texture being generated
 */
RenderTexture.create = function(width, height, scaleMode, resolution)
{
    return new RenderTexture(new BaseRenderTexture(width, height, scaleMode, resolution));
};

},{"./BaseRenderTexture":141,"./Texture":144}],144:[function(require,module,exports){
var BaseTexture = require('./BaseTexture'),
    VideoBaseTexture = require('./VideoBaseTexture'),
    TextureUvs = require('./TextureUvs'),
    EventEmitter = require('eventemitter3'),
    math = require('../math'),
    utils = require('../utils');

/**
 * A texture stores the information that represents an image or part of an image. It cannot be added
 * to the display list directly. Instead use it as the texture for a Sprite. If no frame is provided then the whole image is used.
 *
 * You can directly create a texture from an image and then reuse it multiple times like this :
 *
 * ```js
 * var texture = PIXI.Texture.fromImage('assets/image.png');
 * var sprite1 = new PIXI.Sprite(texture);
 * var sprite2 = new PIXI.Sprite(texture);
 * ```
 *
 * @class
 * @memberof PIXI
 * @param baseTexture {PIXI.BaseTexture} The base texture source to create the texture from
 * @param [frame] {PIXI.Rectangle} The rectangle frame of the texture to show
 * @param [orig] {PIXI.Rectangle} The area of original texture
 * @param [trim] {PIXI.Rectangle} Trimmed rectangle of original texture
 * @param [rotate] {number} indicates how the texture was rotated by texture packer. See {@link PIXI.GroupD8}
 */
function Texture(baseTexture, frame, orig, trim, rotate)
{
    EventEmitter.call(this);

    /**
     * Does this Texture have any frame data assigned to it?
     *
     * @member {boolean}
     */
    this.noFrame = false;

    if (!frame)
    {
        this.noFrame = true;
        frame = new math.Rectangle(0, 0, 1, 1);
    }

    if (baseTexture instanceof Texture)
    {
        baseTexture = baseTexture.baseTexture;
    }

    /**
     * The base texture that this texture uses.
     *
     * @member {PIXI.BaseTexture}
     */
    this.baseTexture = baseTexture;

    /**
     * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
     * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
     *
     * @member {PIXI.Rectangle}
     */
    this._frame = frame;

    /**
     * This is the trimmed area of original texture, before it was put in atlas
     *
     * @member {PIXI.Rectangle}
     */
    this.trim = trim;

    /**
     * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
     *
     * @member {boolean}
     */
    this.valid = false;

    /**
     * This will let a renderer know that a texture has been updated (used mainly for webGL uv updates)
     *
     * @member {boolean}
     */
    this.requiresUpdate = false;

    /**
     * The WebGL UV data cache.
     *
     * @member {PIXI.TextureUvs}
     * @private
     */
    this._uvs = null;

    /**
     * This is the area of original texture, before it was put in atlas
     *
     * @member {PIXI.Rectangle}
     */
    this.orig = orig || frame;//new math.Rectangle(0, 0, 1, 1);

    this._rotate = +(rotate || 0);

    if (rotate === true) {
        // this is old texturepacker legacy, some games/libraries are passing "true" for rotated textures
        this._rotate = 2;
    } else {
        if (this._rotate % 2 !== 0) {
            throw 'attempt to use diamond-shaped UVs. If you are sure, set rotation manually';
        }
    }

    if (baseTexture.hasLoaded)
    {
        if (this.noFrame)
        {
            frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);

            // if there is no frame we should monitor for any base texture changes..
            baseTexture.on('update', this.onBaseTextureUpdated, this);
        }
        this.frame = frame;
    }
    else
    {
        baseTexture.once('loaded', this.onBaseTextureLoaded, this);
    }

    /**
     * Fired when the texture is updated. This happens if the frame or the baseTexture is updated.
     *
     * @event update
     * @memberof PIXI.Texture#
     * @protected
     */


    this._updateID = 0;
}

Texture.prototype = Object.create(EventEmitter.prototype);
Texture.prototype.constructor = Texture;
module.exports = Texture;

Object.defineProperties(Texture.prototype, {
    /**
     * The frame specifies the region of the base texture that this texture uses.
     *
     * @member {PIXI.Rectangle}
     * @memberof PIXI.Texture#
     */
    frame: {
        get: function ()
        {
            return this._frame;
        },
        set: function (frame)
        {
            this._frame = frame;

            this.noFrame = false;

            if (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height)
            {
                throw new Error('Texture Error: frame does not fit inside the base Texture dimensions ' + this);
            }

            //this.valid = frame && frame.width && frame.height && this.baseTexture.source && this.baseTexture.hasLoaded;
            this.valid = frame && frame.width && frame.height && this.baseTexture.hasLoaded;

            if (!this.trim && !this.rotate)
            {
                this.orig = frame;
            }

            if (this.valid)
            {
                this._updateUvs();
            }
        }
    },
    /**
     * Indicates whether the texture is rotated inside the atlas
     * set to 2 to compensate for texture packer rotation
     * set to 6 to compensate for spine packer rotation
     * can be used to rotate or mirror sprites
     * See {@link PIXI.GroupD8} for explanation
     *
     * @member {number}
     */
    rotate: {
        get: function ()
        {
            return this._rotate;
        },
        set: function (rotate)
        {
            this._rotate = rotate;
            if (this.valid)
            {
                this._updateUvs();
            }
        }
    },

    /**
     * The width of the Texture in pixels.
     *
     * @member {number}
     */
    width: {
        get: function() {
            return this.orig ? this.orig.width : 0;
        }
    },

    /**
     * The height of the Texture in pixels.
     *
     * @member {number}
     */
    height: {
        get: function() {
            return this.orig ? this.orig.height : 0;
        }
    }
});

/**
 * Updates this texture on the gpu.
 *
 */
Texture.prototype.update = function ()
{
    this.baseTexture.update();
};

/**
 * Called when the base texture is loaded
 *
 * @private
 */
Texture.prototype.onBaseTextureLoaded = function (baseTexture)
{
    this._updateID++;

    // TODO this code looks confusing.. boo to abusing getters and setterss!
    if (this.noFrame)
    {
        this.frame = new math.Rectangle(0, 0, baseTexture.width, baseTexture.height);
    }
    else
    {
        this.frame = this._frame;
    }

    this.baseTexture.on('update', this.onBaseTextureUpdated, this);
    this.emit('update', this);

};

/**
 * Called when the base texture is updated
 *
 * @private
 */
Texture.prototype.onBaseTextureUpdated = function (baseTexture)
{
    this._updateID++;

    this._frame.width = baseTexture.width;
    this._frame.height = baseTexture.height;

    this.emit('update', this);
};

/**
 * Destroys this texture
 *
 * @param [destroyBase=false] {boolean} Whether to destroy the base texture as well
 */
Texture.prototype.destroy = function (destroyBase)
{
    if (this.baseTexture)
    {

        if (destroyBase)
        {
            // delete the texture if it exists in the texture cache..
            // this only needs to be removed if the base texture is actually destoryed too..
            if(utils.TextureCache[this.baseTexture.imageUrl])
            {
                delete utils.TextureCache[this.baseTexture.imageUrl];
            }

            this.baseTexture.destroy();
        }

        this.baseTexture.off('update', this.onBaseTextureUpdated, this);
        this.baseTexture.off('loaded', this.onBaseTextureLoaded, this);

        this.baseTexture = null;
    }

    this._frame = null;
    this._uvs = null;
    this.trim = null;
    this.orig = null;

    this.valid = false;

    this.off('dispose', this.dispose, this);
    this.off('update', this.update, this);
};

/**
 * Creates a new texture object that acts the same as this one.
 *
 * @return {PIXI.Texture}
 */
Texture.prototype.clone = function ()
{
    return new Texture(this.baseTexture, this.frame, this.orig, this.trim, this.rotate);
};

/**
 * Updates the internal WebGL UV cache.
 *
 * @protected
 */
Texture.prototype._updateUvs = function ()
{
    if (!this._uvs)
    {
        this._uvs = new TextureUvs();
    }

    this._uvs.set(this._frame, this.baseTexture, this.rotate);

    this._updateID++;
};

/**
 * Helper function that creates a Texture object from the given image url.
 * If the image is not in the texture cache it will be  created and loaded.
 *
 * @static
 * @param imageUrl {string} The image url of the texture
 * @param [crossorigin] {boolean} Whether requests should be treated as crossorigin
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromImage = function (imageUrl, crossorigin, scaleMode)
{
    var texture = utils.TextureCache[imageUrl];

    if (!texture)
    {
        texture = new Texture(BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
        utils.TextureCache[imageUrl] = texture;
    }

    return texture;
};

/**
 * Helper function that creates a sprite that will contain a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromFrame = function (frameId)
{
    var texture = utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
    }

    return texture;
};

/**
 * Helper function that creates a new Texture based on the given canvas element.
 *
 * @static
 * @param canvas {HTMLCanvasElement} The canvas element source of the texture
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromCanvas = function (canvas, scaleMode)
{
    return new Texture(BaseTexture.fromCanvas(canvas, scaleMode));
};

/**
 * Helper function that creates a new Texture based on the given video element.
 *
 * @static
 * @param video {HTMLVideoElement|string} The URL or actual element of the video
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromVideo = function (video, scaleMode)
{
    if (typeof video === 'string')
    {
        return Texture.fromVideoUrl(video, scaleMode);
    }
    else
    {
        return new Texture(VideoBaseTexture.fromVideo(video, scaleMode));
    }
};

/**
 * Helper function that creates a new Texture based on the video url.
 *
 * @static
 * @param videoUrl {string} URL of the video
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.Texture} The newly created texture
 */
Texture.fromVideoUrl = function (videoUrl, scaleMode)
{
    return new Texture(VideoBaseTexture.fromUrl(videoUrl, scaleMode));
};

/**
 * Helper function that creates a new Texture based on the source you provide.
 * The soucre can be - frame id, image url, video url, canvae element, video element, base texture
 *
 * @static
 * @param {number|string|PIXI.BaseTexture|HTMLCanvasElement|HTMLVideoElement} source Source to create texture from
 * @return {PIXI.Texture} The newly created texture
 */
Texture.from = function (source)
{
    //TODO auto detect cross origin..
    //TODO pass in scale mode?
    if(typeof source === 'string')
    {
        var texture = utils.TextureCache[source];

        if (!texture)
        {
            // check if its a video..
            var isVideo = source.match(/\.(mp4|webm|ogg|h264|avi|mov)$/) !== null;
            if(isVideo)
            {
                return Texture.fromVideoUrl(source);
            }

            return Texture.fromImage(source);
        }

        return texture;
    }
    else if(source instanceof HTMLCanvasElement)
    {
        return Texture.fromCanvas(source);
    }
    else if(source instanceof HTMLVideoElement)
    {
        return Texture.fromVideo(source);
    }
    else if(source instanceof BaseTexture)
    {
        return new Texture(BaseTexture);
    }
};


/**
 * Adds a texture to the global utils.TextureCache. This cache is shared across the whole PIXI object.
 *
 * @static
 * @param texture {PIXI.Texture} The Texture to add to the cache.
 * @param id {string} The id that the texture will be stored against.
 */
Texture.addTextureToCache = function (texture, id)
{
    utils.TextureCache[id] = texture;
};

/**
 * Remove a texture from the global utils.TextureCache.
 *
 * @static
 * @param id {string} The id of the texture to be removed
 * @return {PIXI.Texture} The texture that was removed
 */
Texture.removeTextureFromCache = function (id)
{
    var texture = utils.TextureCache[id];

    delete utils.TextureCache[id];
    delete utils.BaseTextureCache[id];

    return texture;
};

/**
 * An empty texture, used often to not have to create multiple empty textures.
 * Can not be destroyed.
 *
 * @static
 * @constant
 */
Texture.EMPTY = new Texture(new BaseTexture());
Texture.EMPTY.destroy = function() {};
Texture.EMPTY.on = function() {};
Texture.EMPTY.once = function() {};
Texture.EMPTY.emit = function() {};


},{"../math":102,"../utils":151,"./BaseTexture":142,"./TextureUvs":145,"./VideoBaseTexture":146,"eventemitter3":32}],145:[function(require,module,exports){

/**
 * A standard object to store the Uvs of a texture
 *
 * @class
 * @private
 * @memberof PIXI
 */
function TextureUvs()
{
    this.x0 = 0;
    this.y0 = 0;

    this.x1 = 1;
    this.y1 = 0;

    this.x2 = 1;
    this.y2 = 1;

    this.x3 = 0;
    this.y3 = 1;

    this.uvsUint32 = new Uint32Array(4);
}

module.exports = TextureUvs;

var GroupD8 = require('../math/GroupD8');

/**
 * Sets the texture Uvs based on the given frame information
 * @param frame {PIXI.Rectangle}
 * @param baseFrame {PIXI.Rectangle}
 * @param rotate {number} Rotation of frame, see {@link PIXI.GroupD8}
 * @private
 */
TextureUvs.prototype.set = function (frame, baseFrame, rotate)
{
    var tw = baseFrame.width;
    var th = baseFrame.height;

    if(rotate)
    {
        //width and height div 2 div baseFrame size
        var w2 = frame.width / 2 / tw;
        var h2 = frame.height / 2 / th;
        //coordinates of center
        var cX = frame.x / tw + w2;
        var cY = frame.y / th + h2;
        rotate = GroupD8.add(rotate, GroupD8.NW); //NW is top-left corner
        this.x0 = cX + w2 * GroupD8.uX(rotate);
        this.y0 = cY + h2 * GroupD8.uY(rotate);
        rotate = GroupD8.add(rotate, 2); //rotate 90 degrees clockwise
        this.x1 = cX + w2 * GroupD8.uX(rotate);
        this.y1 = cY + h2 * GroupD8.uY(rotate);
        rotate = GroupD8.add(rotate, 2);
        this.x2 = cX + w2 * GroupD8.uX(rotate);
        this.y2 = cY + h2 * GroupD8.uY(rotate);
        rotate = GroupD8.add(rotate, 2);
        this.x3 = cX + w2 * GroupD8.uX(rotate);
        this.y3 = cY + h2 * GroupD8.uY(rotate);
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

    this.uvsUint32[0] = (((this.y0 * 65535) & 0xFFFF) << 16) | ((this.x0 * 65535) & 0xFFFF);
    this.uvsUint32[1] = (((this.y1 * 65535) & 0xFFFF) << 16) | ((this.x1 * 65535) & 0xFFFF);
    this.uvsUint32[2] = (((this.y2 * 65535) & 0xFFFF) << 16) | ((this.x2 * 65535) & 0xFFFF);
    this.uvsUint32[3] = (((this.y3 * 65535) & 0xFFFF) << 16) | ((this.x3 * 65535) & 0xFFFF);
};

},{"../math/GroupD8":98}],146:[function(require,module,exports){
var BaseTexture = require('./BaseTexture'),
    utils = require('../utils');

/**
 * A texture of a [playing] Video.
 *
 * Video base textures mimic Pixi BaseTexture.from.... method in their creation process.
 *
 * This can be used in several ways, such as:
 *
 * ```js
 * var texture = PIXI.VideoBaseTexture.fromUrl('http://mydomain.com/video.mp4');
 *
 * var texture = PIXI.VideoBaseTexture.fromUrl({ src: 'http://mydomain.com/video.mp4', mime: 'video/mp4' });
 *
 * var texture = PIXI.VideoBaseTexture.fromUrls(['/video.webm', '/video.mp4']);
 *
 * var texture = PIXI.VideoBaseTexture.fromUrls([
 *     { src: '/video.webm', mime: 'video/webm' },
 *     { src: '/video.mp4', mime: 'video/mp4' }
 * ]);
 * ```
 *
 * See the ["deus" demo](http://www.goodboydigital.com/pixijs/examples/deus/).
 *
 * @class
 * @extends PIXI.BaseTexture
 * @memberof PIXI
 * @param source {HTMLVideoElement} Video source
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 */
function VideoBaseTexture(source, scaleMode)
{
    if (!source)
    {
        throw new Error('No video source element specified.');
    }

    // hook in here to check if video is already available.
    // BaseTexture looks for a source.complete boolean, plus width & height.

    if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height)
    {
        source.complete = true;
    }

    BaseTexture.call(this, source, scaleMode);

    /**
     * Should the base texture automatically update itself, set to true by default
     *
     * @member {boolean}
     * @default true
     */
    this.autoUpdate = false;

    this._onUpdate = this._onUpdate.bind(this);
    this._onCanPlay = this._onCanPlay.bind(this);

    if (!source.complete)
    {
        source.addEventListener('canplay', this._onCanPlay);
        source.addEventListener('canplaythrough', this._onCanPlay);

        // started playing..
        source.addEventListener('play', this._onPlayStart.bind(this));
        source.addEventListener('pause', this._onPlayStop.bind(this));
    }

    this.__loaded = false;
}

VideoBaseTexture.prototype = Object.create(BaseTexture.prototype);
VideoBaseTexture.prototype.constructor = VideoBaseTexture;
module.exports = VideoBaseTexture;

/**
 * The internal update loop of the video base texture, only runs when autoUpdate is set to true
 *
 * @private
 */
VideoBaseTexture.prototype._onUpdate = function ()
{
    if (this.autoUpdate)
    {
        window.requestAnimationFrame(this._onUpdate);
        this.update();
    }
};

/**
 * Runs the update loop when the video is ready to play
 *
 * @private
 */
VideoBaseTexture.prototype._onPlayStart = function ()
{
    if (!this.autoUpdate)
    {
        window.requestAnimationFrame(this._onUpdate);
        this.autoUpdate = true;
    }
};

/**
 * Fired when a pause event is triggered, stops the update loop
 *
 * @private
 */
VideoBaseTexture.prototype._onPlayStop = function ()
{
    this.autoUpdate = false;
};

/**
 * Fired when the video is loaded and ready to play
 *
 * @private
 */
VideoBaseTexture.prototype._onCanPlay = function ()
{
    this.hasLoaded = true;

    if (this.source)
    {
        this.source.removeEventListener('canplay', this._onCanPlay);
        this.source.removeEventListener('canplaythrough', this._onCanPlay);

        this.width = this.source.videoWidth;
        this.height = this.source.videoHeight;

        this.source.play();

        // prevent multiple loaded dispatches..
        if (!this.__loaded)
        {
            this.__loaded = true;
            this.emit('loaded', this);
        }
    }
};

/**
 * Destroys this texture
 *
 */
VideoBaseTexture.prototype.destroy = function ()
{
    if (this.source && this.source._pixiId)
    {
        delete utils.BaseTextureCache[ this.source._pixiId ];
        delete this.source._pixiId;
    }

    BaseTexture.prototype.destroy.call(this);
};

/**
 * Mimic Pixi BaseTexture.from.... method.
 *
 * @static
 * @param video {HTMLVideoElement} Video to create texture from
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.VideoBaseTexture} Newly created VideoBaseTexture
 */
VideoBaseTexture.fromVideo = function (video, scaleMode)
{
    if (!video._pixiId)
    {
        video._pixiId = 'video_' + utils.uid();
    }

    var baseTexture = utils.BaseTextureCache[video._pixiId];

    if (!baseTexture)
    {
        baseTexture = new VideoBaseTexture(video, scaleMode);
        utils.BaseTextureCache[ video._pixiId ] = baseTexture;
    }

    return baseTexture;
};

/**
 * Helper function that creates a new BaseTexture based on the given video element.
 * This BaseTexture can then be used to create a texture
 *
 * @static
 * @param videoSrc {string|object|string[]|object[]} The URL(s) for the video.
 * @param [videoSrc.src] {string} One of the source urls for the video
 * @param [videoSrc.mime] {string} The mimetype of the video (e.g. 'video/mp4'). If not specified
 *  the url's extension will be used as the second part of the mime type.
 * @param scaleMode {number} See {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.VideoBaseTexture} Newly created VideoBaseTexture
 */
VideoBaseTexture.fromUrl = function (videoSrc, scaleMode)
{
    var video = document.createElement('video');

    // array of objects or strings
    if (Array.isArray(videoSrc))
    {
        for (var i = 0; i < videoSrc.length; ++i)
        {
            video.appendChild(createSource(videoSrc[i].src || videoSrc[i], videoSrc[i].mime));
        }
    }
    // single object or string
    else
    {
        video.appendChild(createSource(videoSrc.src || videoSrc, videoSrc.mime));
    }

    video.load();
    video.play();

    return VideoBaseTexture.fromVideo(video, scaleMode);
};

VideoBaseTexture.fromUrls = VideoBaseTexture.fromUrl;

function createSource(path, type)
{
    if (!type)
    {
        type = 'video/' + path.substr(path.lastIndexOf('.') + 1);
    }

    var source = document.createElement('source');

    source.src = path;
    source.type = type;

    return source;
}

},{"../utils":151,"./BaseTexture":142}],147:[function(require,module,exports){
var CONST = require('../const'),
    EventEmitter = require('eventemitter3'),
    // Internal event used by composed emitter
    TICK = 'tick';

/**
 * A Ticker class that runs an update loop that other objects listen to.
 * This class is composed around an EventEmitter object to add listeners
 * meant for execution on the next requested animation frame.
 * Animation frames are requested only when necessary,
 * e.g. When the ticker is started and the emitter has listeners.
 *
 * @class
 * @memberof PIXI.ticker
 */
function Ticker()
{
    var _this = this;

    /**
     * Internal tick method bound to ticker instance.
     * This is because in early 2015, Function.bind
     * is still 60% slower in high performance scenarios.
     * Also separating frame requests from update method
     * so listeners may be called at any time and with
     * any animation API, just invoke ticker.update(time).
     *
     * @private
     */
    this._tick = function _tick(time) {

        _this._requestId = null;

        if (_this.started)
        {
            // Invoke listeners now
            _this.update(time);
            // Listener side effects may have modified ticker state.
            if (_this.started && _this._requestId === null && _this._emitter.listeners(TICK, true))
            {
                _this._requestId = requestAnimationFrame(_this._tick);
            }
        }
    };

    /**
     * Internal emitter used to fire 'tick' event
     * @private
     */
    this._emitter = new EventEmitter();

    /**
     * Internal current frame request ID
     * @private
     */
    this._requestId = null;

    /**
     * Internal value managed by minFPS property setter and getter.
     * This is the maximum allowed milliseconds between updates.
     * @private
     */
    this._maxElapsedMS = 100;

    /**
     * Whether or not this ticker should invoke the method
     * {@link PIXI.ticker.Ticker#start} automatically
     * when a listener is added.
     *
     * @member {boolean}
     * @default false
     */
    this.autoStart = false;

    /**
     * Scalar time value from last frame to this frame.
     * This value is capped by setting {@link PIXI.ticker.Ticker#minFPS}
     * and is scaled with {@link PIXI.ticker.Ticker#speed}.
     * **Note:** The cap may be exceeded by scaling.
     *
     * @member {number}
     * @default 1
     */
    this.deltaTime = 1;

    /**
     * Time elapsed in milliseconds from last frame to this frame.
     * Opposed to what the scalar {@link PIXI.ticker.Ticker#deltaTime}
     * is based, this value is neither capped nor scaled.
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     *
     * @member {number}
     * @default 1 / TARGET_FPMS
     */
    this.elapsedMS = 1 / CONST.TARGET_FPMS; // default to target frame time

    /**
     * The last time {@link PIXI.ticker.Ticker#update} was invoked.
     * This value is also reset internally outside of invoking
     * update, but only when a new animation frame is requested.
     * If the platform supports DOMHighResTimeStamp,
     * this value will have a precision of 1 µs.
     *
     * @member {number}
     * @default 0
     */
    this.lastTime = 0;

    /**
     * Factor of current {@link PIXI.ticker.Ticker#deltaTime}.
     * @example
     * // Scales ticker.deltaTime to what would be
     * // the equivalent of approximately 120 FPS
     * ticker.speed = 2;
     *
     * @member {number}
     * @default 1
     */
    this.speed = 1;

    /**
     * Whether or not this ticker has been started.
     * `true` if {@link PIXI.ticker.Ticker#start} has been called.
     * `false` if {@link PIXI.ticker.Ticker#stop} has been called.
     * While `false`, this value may change to `true` in the
     * event of {@link PIXI.ticker.Ticker#autoStart} being `true`
     * and a listener is added.
     *
     * @member {boolean}
     * @default false
     */
    this.started = false;
}

Object.defineProperties(Ticker.prototype, {
    /**
     * The frames per second at which this ticker is running.
     * The default is approximately 60 in most modern browsers.
     * **Note:** This does not factor in the value of
     * {@link PIXI.ticker.Ticker#speed}, which is specific
     * to scaling {@link PIXI.ticker.Ticker#deltaTime}.
     *
     * @memberof PIXI.ticker.Ticker#
     * @readonly
     */
    FPS: {
        get: function()
        {
            return 1000 / this.elapsedMS;
        }
    },

    /**
     * Manages the maximum amount of milliseconds allowed to
     * elapse between invoking {@link PIXI.ticker.Ticker#update}.
     * This value is used to cap {@link PIXI.ticker.Ticker#deltaTime},
     * but does not effect the measured value of {@link PIXI.ticker.Ticker#FPS}.
     * When setting this property it is clamped to a value between
     * `0` and `PIXI.TARGET_FPMS * 1000`.
     *
     * @memberof PIXI.ticker.Ticker#
     * @default 10
     */
    minFPS: {
        get: function()
        {
            return 1000 / this._maxElapsedMS;
        },
        set: function(fps)
        {
            // Clamp: 0 to TARGET_FPMS
            var minFPMS = Math.min(Math.max(0, fps) / 1000, CONST.TARGET_FPMS);
            this._maxElapsedMS = 1 / minFPMS;
        }
    }
});

/**
 * Conditionally requests a new animation frame.
 * If a frame has not already been requested, and if the internal
 * emitter has listeners, a new frame is requested.
 *
 * @private
 */
Ticker.prototype._requestIfNeeded = function _requestIfNeeded()
{
    if (this._requestId === null && this._emitter.listeners(TICK, true))
    {
        // ensure callbacks get correct delta
        this.lastTime = performance.now();
        this._requestId = requestAnimationFrame(this._tick);
    }
};

/**
 * Conditionally cancels a pending animation frame.
 *
 * @private
 */
Ticker.prototype._cancelIfNeeded = function _cancelIfNeeded()
{
    if (this._requestId !== null)
    {
        cancelAnimationFrame(this._requestId);
        this._requestId = null;
    }
};

/**
 * Conditionally requests a new animation frame.
 * If the ticker has been started it checks if a frame has not already
 * been requested, and if the internal emitter has listeners. If these
 * conditions are met, a new frame is requested. If the ticker has not
 * been started, but autoStart is `true`, then the ticker starts now,
 * and continues with the previous conditions to request a new frame.
 *
 * @private
 */
Ticker.prototype._startIfPossible = function _startIfPossible()
{
    if (this.started)
    {
        this._requestIfNeeded();
    }
    else if (this.autoStart)
    {
        this.start();
    }
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#on} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @param fn {Function} The listener function to be added for updates
 * @param [context] {Function} The listener context
 * @returns {PIXI.ticker.Ticker} This instance of a ticker
 */
Ticker.prototype.add = function add(fn, context)
{
    this._emitter.on(TICK, fn, context);

    this._startIfPossible();

    return this;
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#once} internally for the
 * internal 'tick' event. It checks if the emitter has listeners,
 * and if so it requests a new animation frame at this point.
 *
 * @param fn {Function} The listener function to be added for one update
 * @param [context] {Function} The listener context
 * @returns {PIXI.ticker.Ticker} This instance of a ticker
 */
Ticker.prototype.addOnce = function addOnce(fn, context)
{
    this._emitter.once(TICK, fn, context);

    this._startIfPossible();

    return this;
};

/**
 * Calls {@link module:eventemitter3.EventEmitter#off} internally for 'tick' event.
 * It checks if the emitter has listeners for 'tick' event.
 * If it does, then it cancels the animation frame.
 *
 * @param [fn] {Function} The listener function to be removed
 * @param [context] {Function} The listener context to be removed
 * @returns {PIXI.ticker.Ticker} This instance of a ticker
 */
Ticker.prototype.remove = function remove(fn, context)
{
    this._emitter.off(TICK, fn, context);

    if (!this._emitter.listeners(TICK, true))
    {
        this._cancelIfNeeded();
    }

    return this;
};

/**
 * Starts the ticker. If the ticker has listeners
 * a new animation frame is requested at this point.
 */
Ticker.prototype.start = function start()
{
    if (!this.started)
    {
        this.started = true;
        this._requestIfNeeded();
    }
};

/**
 * Stops the ticker. If the ticker has requested
 * an animation frame it is canceled at this point.
 */
Ticker.prototype.stop = function stop()
{
    if (this.started)
    {
        this.started = false;
        this._cancelIfNeeded();
    }
};

/**
 * Triggers an update. An update entails setting the
 * current {@link PIXI.ticker.Ticker#elapsedMS},
 * the current {@link PIXI.ticker.Ticker#deltaTime},
 * invoking all listeners with current deltaTime,
 * and then finally setting {@link PIXI.ticker.Ticker#lastTime}
 * with the value of currentTime that was provided.
 * This method will be called automatically by animation
 * frame callbacks if the ticker instance has been started
 * and listeners are added.
 *
 * @param [currentTime=performance.now()] {number} the current time of execution
 */
Ticker.prototype.update = function update(currentTime)
{
    var elapsedMS;

    // Allow calling update directly with default currentTime.
    currentTime = currentTime || performance.now();

    // If the difference in time is zero or negative, we ignore most of the work done here.
    // If there is no valid difference, then should be no reason to let anyone know about it.
    // A zero delta, is exactly that, nothing should update.
    //
    // The difference in time can be negative, and no this does not mean time traveling.
    // This can be the result of a race condition between when an animation frame is requested
    // on the current JavaScript engine event loop, and when the ticker's start method is invoked
    // (which invokes the internal _requestIfNeeded method). If a frame is requested before
    // _requestIfNeeded is invoked, then the callback for the animation frame the ticker requests,
    // can receive a time argument that can be less than the lastTime value that was set within
    // _requestIfNeeded. This difference is in microseconds, but this is enough to cause problems.
    //
    // This check covers this browser engine timing issue, as well as if consumers pass an invalid
    // currentTime value. This may happen if consumers opt-out of the autoStart, and update themselves.

    if (currentTime > this.lastTime)
    {
        // Save uncapped elapsedMS for measurement
        elapsedMS = this.elapsedMS = currentTime - this.lastTime;

        // cap the milliseconds elapsed used for deltaTime
        if (elapsedMS > this._maxElapsedMS)
        {
            elapsedMS = this._maxElapsedMS;
        }

        this.deltaTime = elapsedMS * CONST.TARGET_FPMS * this.speed;

        // Invoke listeners added to internal emitter
        this._emitter.emit(TICK, this.deltaTime);
    }
    else
    {
        this.deltaTime = this.elapsedMS = 0;
    }

    this.lastTime = currentTime;
};

module.exports = Ticker;

},{"../const":78,"eventemitter3":32}],148:[function(require,module,exports){
var Ticker = require('./Ticker');

/**
 * The shared ticker instance used by {@link PIXI.extras.MovieClip}.
 * and by {@link PIXI.interaction.InteractionManager}.
 * The property {@link PIXI.ticker.Ticker#autoStart} is set to `true`
 * for this instance. Please follow the examples for usage, including
 * how to opt-out of auto-starting the shared ticker.
 *
 * @example
 * var ticker = PIXI.ticker.shared;
 * // Set this to prevent starting this ticker when listeners are added.
 * // By default this is true only for the PIXI.ticker.shared instance.
 * ticker.autoStart = false;
 * // FYI, call this to ensure the ticker is stopped. It should be stopped
 * // if you have not attempted to render anything yet.
 * ticker.stop();
 * // Call this when you are ready for a running shared ticker.
 * ticker.start();
 *
 * @example
 * // You may use the shared ticker to render...
 * var renderer = PIXI.autoDetectRenderer(800, 600);
 * var stage = new PIXI.Container();
 * var interactionManager = PIXI.interaction.InteractionManager(renderer);
 * document.body.appendChild(renderer.view);
 * ticker.add(function (time) {
 *     renderer.render(stage);
 * });
 *
 * @example
 * // Or you can just update it manually.
 * ticker.autoStart = false;
 * ticker.stop();
 * function animate(time) {
 *     ticker.update(time);
 *     renderer.render(stage);
 *     requestAnimationFrame(animate);
 * }
 * animate(performance.now());
 *
 * @type {PIXI.ticker.Ticker}
 * @memberof PIXI.ticker
 */
var shared = new Ticker();
shared.autoStart = true;

/**
 * @namespace PIXI.ticker
 */
module.exports = {
    shared: shared,
    Ticker: Ticker
};

},{"./Ticker":147}],149:[function(require,module,exports){
/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 * @param size {number} Number of quads
 * @return {Uint16Array} indices
 */
var createIndicesForQuads = function (size)
{
    // the total number of indices in our array, there are 6 points per quad.

    var totalIndices = size * 6;

    var indices = new Uint16Array(totalIndices);

	// fill the indices with the quads to draw
    for (var i=0, j=0; i < totalIndices; i += 6, j += 4)
    {
        indices[i + 0] = j + 0;
        indices[i + 1] = j + 1;
        indices[i + 2] = j + 2;
        indices[i + 3] = j + 0;
        indices[i + 4] = j + 2;
        indices[i + 5] = j + 3;
    }

    return indices;
};

module.exports = createIndicesForQuads;

},{}],150:[function(require,module,exports){
var tempAnchor;
var _url = require('url');

/**
 * Sets the `crossOrigin` property for this resource based on if the url
 * for this resource is cross-origin. If crossOrigin was manually set, this
 * function does nothing.
 * Nipped from the resource loader!
 * @private
 * @param url {string} The url to test.
 * @param loc [location=window.location] {object} The location object to test against.
 * @return {string} The crossOrigin value to use (or empty string for none).
 */
var determineCrossOrigin = function (url, loc) {
    // data: and javascript: urls are considered same-origin
    if (url.indexOf('data:') === 0) {
        return '';
    }

    // default is window.location
    loc = loc || window.location;

    if (!tempAnchor) {
        tempAnchor = document.createElement('a');
    }

    // let the browser determine the full href for the url of this resource and then
    // parse with the node url lib, we can't use the properties of the anchor element
    // because they don't work in IE9 :(
    tempAnchor.href = url;
    url = _url.parse(tempAnchor.href);

    var samePort = (!url.port && loc.port === '') || (url.port === loc.port);

    // if cross origin
    if (url.hostname !== loc.hostname || !samePort || url.protocol !== loc.protocol) {
        return 'anonymous';
    }

    return '';
};

module.exports = determineCrossOrigin;

},{"url":72}],151:[function(require,module,exports){
var CONST = require('../const');

/**
 * @namespace PIXI.utils
 */
var utils = module.exports = {
    _uid: 0,
    _saidHello: false,

    EventEmitter:   require('eventemitter3'),
    pluginTarget:   require('./pluginTarget'),

    /**
     * Gets the next unique identifier
     *
     * @memberof PIXI.utils
     * @return {number} The next unique identifier to use.
     */
    uid: function ()
    {
        return ++utils._uid;
    },

    /**
     * Converts a hex color number to an [R, G, B] array
     *
     * @memberof PIXI.utils
     * @param hex {number}
     * @param  {number[]} [out=[]] If supplied, this array will be used rather than returning a new one
     * @return {number[]} An array representing the [R, G, B] of the color.
     */
    hex2rgb: function (hex, out)
    {
        out = out || [];

        out[0] = (hex >> 16 & 0xFF) / 255;
        out[1] = (hex >> 8 & 0xFF) / 255;
        out[2] = (hex & 0xFF) / 255;

        return out;
    },

    /**
     * Converts a hex color number to a string.
     *
     * @memberof PIXI.utils
     * @param hex {number} Number in hex
     * @return {string} The string color.
     */
    hex2string: function (hex)
    {
        hex = hex.toString(16);
        hex = '000000'.substr(0, 6 - hex.length) + hex;

        return '#' + hex;
    },

    /**
     * Converts a color as an [R, G, B] array to a hex number
     *
     * @memberof PIXI.utils
     * @param rgb {number[]} rgb array
     * @return {number} The color number
     */
    rgb2hex: function (rgb)
    {
        return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
    },


    /**
     * get the resolution / device pixel ratio of an asset by looking for the prefix
     * used by spritesheets and image urls
     *
     * @memberof PIXI.utils
     * @param url {string} the image path
     * @return {number} resolution / device pixel ratio of an asset
     */
    getResolutionOfUrl: function (url)
    {
        var resolution = CONST.RETINA_PREFIX.exec(url);

        if (resolution)
        {
           return parseFloat(resolution[1]);
        }

        return 1;
    },

    /**
     * Logs out the version and renderer information for this running instance of PIXI.
     * If you don't want to see this message you can set `PIXI.utils._saidHello = true;`
     * so the library thinks it already said it. Keep in mind that doing that will forever
     * makes you a jerk face.
     *
     * @memberof PIXI.utils
     * @param {string} type - The string renderer type to log.
     * @constant
     * @static
     */
    sayHello: function (type)
    {
        if (utils._saidHello)
        {
            return;
        }

        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
        {
            var args = [
                '\n %c %c %c Pixi.js ' + CONST.VERSION + ' - ✰ ' + type + ' ✰  %c ' + ' %c ' + ' http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n',
                'background: #ff66a5; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff66a5; background: #030307; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'background: #ffc3dc; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;'
            ];

            window.console.log.apply(console, args); //jshint ignore:line
        }
        else if (window.console)
        {
            window.console.log('Pixi.js ' + CONST.VERSION + ' - ' + type + ' - http://www.pixijs.com/'); //jshint ignore:line
        }

        utils._saidHello = true;
    },

    /**
     * Helper for checking for webgl support
     *
     * @memberof PIXI.utils
     * @return {boolean} is webgl supported
     */
    isWebGLSupported: function ()
    {
        var contextOptions = { stencil: true, failIfMajorPerformanceCaveat: true };
        try
        {
            if (!window.WebGLRenderingContext)
            {
                return false;
            }

            var canvas = document.createElement('canvas'),
                gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);

            var success = !!(gl && gl.getContextAttributes().stencil);
            if (gl)
            {
                var loseContext = gl.getExtension('WEBGL_lose_context');

                if(loseContext)
                {
                    loseContext.loseContext();
                }
            }
            gl = null;

            return success;
        }
        catch (e)
        {
            return false;
        }
    },

    /**
     * Returns sign of number
     *
     * @memberof PIXI.utils
     * @param n {number}
     * @returns {number} 0 if n is 0, -1 if n is negative, 1 if n i positive
     */
    sign: function (n)
    {
        return n ? (n < 0 ? -1 : 1) : 0;
    },

    /**
     * Remove a range of items from an array
     *
     * @memberof PIXI.utils
     * @param {Array<*>} arr The target array
     * @param {number} startIdx The index to begin removing from (inclusive)
     * @param {number} removeCount How many items to remove
     */
    removeItems: function (arr, startIdx, removeCount)
    {
        var length = arr.length;

        if (startIdx >= length || removeCount === 0)
        {
            return;
        }

        removeCount = (startIdx+removeCount > length ? length-startIdx : removeCount);
        for (var i = startIdx, len = length-removeCount; i < len; ++i)
        {
            arr[i] = arr[i + removeCount];
        }

        arr.length = len;
    },

    /**
     * @todo Describe property usage
     *
     * @memberof PIXI.utils
     * @private
     */
    TextureCache: {},

    /**
     * @todo Describe property usage
     *
     * @memberof PIXI.utils
     * @private
     */
    BaseTextureCache: {}
};

},{"../const":78,"./pluginTarget":153,"eventemitter3":32}],152:[function(require,module,exports){


var  Device = require('ismobilejs');

var maxRecommendedTextures = function(max)
{

	if(Device.tablet || Device.phone)
	{
		// check if the res is iphone 6 or higher..
		return 2;
	}
	else
	{
		// desktop should be ok
		return max;
	}
};

module.exports = maxRecommendedTextures;
},{"ismobilejs":33}],153:[function(require,module,exports){
/**
 * Mixins functionality to make an object have "plugins".
 *
 * @mixin
 * @memberof PIXI.utils
 * @param obj {object} The object to mix into.
 * @example
 *      function MyObject() {}
 *
 *      pluginTarget.mixin(MyObject);
 */
function pluginTarget(obj)
{
    obj.__plugins = {};

    /**
     * Adds a plugin to an object
     *
     * @param pluginName {string} The events that should be listed.
     * @param ctor {Function} The constructor function for the plugin.
     */
    obj.registerPlugin = function (pluginName, ctor)
    {
        obj.__plugins[pluginName] = ctor;
    };

    /**
     * Instantiates all the plugins of this object
     *
     */
    obj.prototype.initPlugins = function ()
    {
        this.plugins = this.plugins || {};

        for (var o in obj.__plugins)
        {
            this.plugins[o] = new (obj.__plugins[o])(this);
        }
    };

    /**
     * Removes all the plugins of this object
     *
     */
    obj.prototype.destroyPlugins = function ()
    {
        for (var o in this.plugins)
        {
            this.plugins[o].destroy();
            this.plugins[o] = null;
        }

        this.plugins = null;
    };
}


module.exports = {
    /**
     * Mixes in the properties of the pluginTarget into another object
     *
     * @param obj {object} The obj to mix into
     */
    mixin: function mixin(obj)
    {
        pluginTarget(obj);
    }
};

},{}],154:[function(require,module,exports){
/*global console */
var core = require('./core'),
    mesh = require('./mesh'),
    particles = require('./particles'),
    extras = require('./extras'),
    filters = require('./filters');

// provide method to give a stack track for warnings
// useful for tracking-down where deprecated methods/properties/classes
// are being used within the code
function warn(msg) {
    var stack = new Error().stack;

    // Handle IE < 10 and Safari < 6
    if (typeof stack === 'undefined') {
        console.warn('Deprecation Warning: ', msg);
    }
    else {
        // chop off the stack trace which includes pixi.js internal calls
        stack = stack.split('\n').splice(3).join('\n');

        if (console.groupCollapsed) {
            console.groupCollapsed('%cDeprecation Warning: %c%s', 'color:#614108;background:#fffbe6', 'font-weight:normal;color:#614108;background:#fffbe6', msg);
            console.warn(stack);
            console.groupEnd();
        }
        else {
            console.warn('Deprecation Warning: ', msg);
            console.warn(stack);
        }
    }
}

/**
 * @class
 * @private
 * @name SpriteBatch
 * @memberof PIXI
 * @see PIXI.ParticleContainer
 * @throws {ReferenceError} SpriteBatch does not exist any more, please use the new ParticleContainer instead.
 * @deprecated since version 3.0.0
 */
core.SpriteBatch = function()
{
    throw new ReferenceError('SpriteBatch does not exist any more, please use the new ParticleContainer instead.');
};

/**
 * @class
 * @private
 * @name AssetLoader
 * @memberof PIXI
 * @see PIXI.loaders.Loader
 * @throws {ReferenceError} The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.
 * @deprecated since version 3.0.0
 */
core.AssetLoader = function()
{
    throw new ReferenceError('The loader system was overhauled in pixi v3, please see the new PIXI.loaders.Loader class.');
};

Object.defineProperties(core, {

    /**
     * @class
     * @private
     * @name Stage
     * @memberof PIXI
     * @see PIXI.Container
     * @deprecated since version 3.0.0
     */
    Stage: {
        get: function()
        {
            warn('You do not need to use a PIXI Stage any more, you can simply render any container.');
            return core.Container;
        }
    },

    /**
     * @class
     * @private
     * @name DisplayObjectContainer
     * @memberof PIXI
     * @see PIXI.Container
     * @deprecated since version 3.0.0
     */
    DisplayObjectContainer: {
        get: function()
        {
            warn('DisplayObjectContainer has been shortened to Container, please use Container from now on.');
            return core.Container;
        }
    },

    /**
     * @class
     * @private
     * @name Strip
     * @memberof PIXI
     * @see PIXI.mesh.Mesh
     * @deprecated since version 3.0.0
     */
    Strip: {
        get: function()
        {
            warn('The Strip class has been renamed to Mesh and moved to mesh.Mesh, please use mesh.Mesh from now on.');
            return mesh.Mesh;
        }
    },

    /**
     * @class
     * @private
     * @name Rope
     * @memberof PIXI
     * @see PIXI.mesh.Rope
     * @deprecated since version 3.0.0
     */
    Rope: {
        get: function()
        {
            warn('The Rope class has been moved to mesh.Rope, please use mesh.Rope from now on.');
            return mesh.Rope;
        }
    },

    /**
     * @class
     * @private
     * @name ParticleContainer
     * @memberof PIXI
     * @see PIXI.particles.ParticleContainer
     * @deprecated since version 4.0.0
     */
    ParticleContainer: {
        get: function() {
            warn('The ParticleContainer class has been moved to particles.ParticleContainer, please use particles.ParticleContainer from now on.');
            return particles.ParticleContainer;
        }
    },

    /**
     * @class
     * @private
     * @name MovieClip
     * @memberof PIXI
     * @see PIXI.extras.MovieClip
     * @deprecated since version 3.0.0
     */
    MovieClip: {
        get: function()
        {
            warn('The MovieClip class has been moved to extras.MovieClip, please use extras.MovieClip from now on.');
            return extras.MovieClip;
        }
    },

    /**
     * @class
     * @private
     * @name TilingSprite
     * @memberof PIXI
     * @see PIXI.extras.TilingSprite
     * @deprecated since version 3.0.0
     */
    TilingSprite: {
        get: function()
        {
            warn('The TilingSprite class has been moved to extras.TilingSprite, please use extras.TilingSprite from now on.');
            return extras.TilingSprite;
        }
    },

    /**
     * @class
     * @private
     * @name BitmapText
     * @memberof PIXI
     * @see PIXI.extras.BitmapText
     * @deprecated since version 3.0.0
     */
    BitmapText: {
        get: function()
        {
            warn('The BitmapText class has been moved to extras.BitmapText, please use extras.BitmapText from now on.');
            return extras.BitmapText;
        }
    },

    /**
     * @class
     * @private
     * @name blendModes
     * @memberof PIXI
     * @see PIXI.BLEND_MODES
     * @deprecated since version 3.0.0
     */
    blendModes: {
        get: function()
        {
            warn('The blendModes has been moved to BLEND_MODES, please use BLEND_MODES from now on.');
            return core.BLEND_MODES;
        }
    },

    /**
     * @class
     * @private
     * @name scaleModes
     * @memberof PIXI
     * @see PIXI.SCALE_MODES
     * @deprecated since version 3.0.0
     */
    scaleModes: {
        get: function()
        {
            warn('The scaleModes has been moved to SCALE_MODES, please use SCALE_MODES from now on.');
            return core.SCALE_MODES;
        }
    },

    /**
     * @class
     * @private
     * @name BaseTextureCache
     * @memberof PIXI
     * @see PIXI.utils.BaseTextureCache
     * @deprecated since version 3.0.0
     */
    BaseTextureCache: {
        get: function ()
        {
            warn('The BaseTextureCache class has been moved to utils.BaseTextureCache, please use utils.BaseTextureCache from now on.');
            return core.utils.BaseTextureCache;
        }
    },

    /**
     * @class
     * @private
     * @name TextureCache
     * @memberof PIXI
     * @see PIXI.utils.TextureCache
     * @deprecated since version 3.0.0
     */
    TextureCache: {
        get: function ()
        {
            warn('The TextureCache class has been moved to utils.TextureCache, please use utils.TextureCache from now on.');
            return core.utils.TextureCache;
        }
    },

    /**
     * @namespace
     * @private
     * @name math
     * @memberof PIXI
     * @see PIXI
     * @deprecated since version 3.0.6
     */
    math: {
        get: function ()
        {
            warn('The math namespace is deprecated, please access members already accessible on PIXI.');
            return core;
        }
    },

     /**
     * @class
     * @private
     * @name PIXI.AbstractFilter
     * @see PIXI.Filter
     * @deprecated since version 3.0.6
     */
    AbstractFilter: {
        get: function()
        {
            warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');
            return core.Filter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.TransformManual
     * @see PIXI.TransformBase
     * @deprecated since version 4.0.0
     */
    TransformManual: {
        get: function()
        {
            warn('TransformManual has been renamed to TransformBase, please update your pixi-spine');
            return core.TransformBase;
        }
    }
});

core.DisplayObject.prototype.generateTexture = function(renderer, scaleMode, resolution)
{
    warn('generateTexture has moved to the renderer, please use renderer.generateTexture(displayObject)');
    return renderer.generateTexture(this, scaleMode, resolution);
};


core.Graphics.prototype.generateTexture = function(scaleMode, resolution)
{
    warn('graphics generate texture has moved to the renderer. Or to render a graphics to a texture using canvas please use generateCanvasTexture');
    return this.generateCanvasTexture(scaleMode, resolution);
};

core.RenderTexture.prototype.render = function(displayObject, matrix, clear, updateTransform)
{
    this.legacyRenderer.render(displayObject, this, clear, matrix, !updateTransform);
    warn('RenderTexture.render is now deprecated, please use renderer.render(displayObject, renderTexture)');
};

core.RenderTexture.prototype.getImage = function(target)
{
    warn('RenderTexture.getImage is now deprecated, please use renderer.extract.image(target)');
    return this.legacyRenderer.extract.image(target);
};

core.RenderTexture.prototype.getBase64 = function(target)
{
    warn('RenderTexture.getBase64 is now deprecated, please use renderer.extract.base64(target)');
    return this.legacyRenderer.extract.base64(target);
};

core.RenderTexture.prototype.getCanvas = function(target)
{
    warn('RenderTexture.getCanvas is now deprecated, please use renderer.extract.canvas(target)');
    return this.legacyRenderer.extract.canvas(target);
};

core.RenderTexture.prototype.getPixels = function(target)
{
    warn('RenderTexture.getPixels is now deprecated, please use renderer.extract.pixels(target)');
    return this.legacyRenderer.pixels(target);
};



/**
 * @method
 * @private
 * @name PIXI.Sprite#setTexture
 * @see PIXI.Sprite#texture
 * @deprecated since version 3.0.0
 */
core.Sprite.prototype.setTexture = function(texture)
{
    this.texture = texture;
    warn('setTexture is now deprecated, please use the texture property, e.g : sprite.texture = texture;');
};



/**
 * @method
 * @name PIXI.extras.BitmapText#setText
 * @see PIXI.extras.BitmapText#text
 * @deprecated since version 3.0.0
 */
extras.BitmapText.prototype.setText = function(text)
{
    this.text = text;
    warn('setText is now deprecated, please use the text property, e.g : myBitmapText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setText
 * @see PIXI.Text#text
 * @deprecated since version 3.0.0
 */
core.Text.prototype.setText = function(text)
{
    this.text = text;
    warn('setText is now deprecated, please use the text property, e.g : myText.text = \'my text\';');
};

/**
 * @method
 * @name PIXI.Text#setStyle
 * @see PIXI.Text#style
 * @deprecated since version 3.0.0
 */
core.Text.prototype.setStyle = function(style)
{
    this.style = style;
    warn('setStyle is now deprecated, please use the style property, e.g : myText.style = style;');
};

Object.defineProperties(core.TextStyle.prototype, {
    /**
     * Set all properties of a font as a single string
     *
     * @name PIXI.TextStyle#font
     * @deprecated since version 4.0.0
     */
    font: {
        get: function ()
        {
            warn('text style property \'font\' is now deprecated, please use the \'fontFamily\',\'fontSize\',fontStyle\',\'fontVariant\' and \'fontWeight\' properties from now on');
            var fontSizeString = (typeof this._fontSize === 'number') ? this._fontSize + 'px' : this._fontSize;
            return this._fontStyle + ' ' + this._fontVariant + ' ' + this._fontWeight + ' ' + fontSizeString + ' ' + this._fontFamily;
        },
        set: function (font)
        {
            warn('text style property \'font\' is now deprecated, please use the \'fontFamily\',\'fontSize\',fontStyle\',\'fontVariant\' and \'fontWeight\' properties from now on');

            // can work out fontStyle from search of whole string
            if ( font.indexOf('italic') > 1 )
            {
                this._fontStyle = 'italic';
            }
            else if ( font.indexOf('oblique') > -1 )
            {
                this._fontStyle = 'oblique';
            }
            else
            {
                this._fontStyle = 'normal';
            }

            // can work out fontVariant from search of whole string
            if ( font.indexOf('small-caps') > -1 )
            {
                this._fontVariant = 'small-caps';
            }
            else
            {
                this._fontVariant = 'normal';
            }

            // fontWeight and fontFamily are tricker to find, but it's easier to find the fontSize due to it's units
            var splits = font.split(' ');
            var i;
            var fontSizeIndex = -1;

            this._fontSize = 26;
            for ( i = 0; i < splits.length; ++i )
            {
                if ( splits[i].match( /(px|pt|em|%)/ ) )
                {
                    fontSizeIndex = i;
                    this._fontSize = splits[i];
                    break;
                }
            }

            // we can now search for fontWeight as we know it must occur before the fontSize
            this._fontWeight = 'normal';
            for ( i = 0; i < fontSizeIndex; ++i )
            {
                if ( splits[i].match( /(bold|bolder|lighter|100|200|300|400|500|600|700|800|900)/ ) )
                {
                    this._fontWeight = splits[i];
                    break;
                }
            }

            // and finally join everything together after the fontSize in case the font family has multiple words
            if ( fontSizeIndex > -1 && fontSizeIndex < splits.length-1 )
            {
                this._fontFamily = '';
                for ( i = fontSizeIndex + 1; i < splits.length; ++i )
                {
                    this._fontFamily += splits[i] + ' ';
                }

                this._fontFamily = this._fontFamily.slice(0, -1);
            }
            else
            {
                this._fontFamily = 'Arial';
            }

            this.styleID++;
        }
    }
} );

/**
 * @method
 * @name PIXI.Texture#setFrame
 * @see PIXI.Texture#setFrame
 * @deprecated since version 3.0.0
 */
core.Texture.prototype.setFrame = function(frame)
{
    this.frame = frame;
    warn('setFrame is now deprecated, please use the frame property, e.g : myTexture.frame = frame;');
};

Object.defineProperties(filters, {

    /**
     * @class
     * @private
     * @name PIXI.filters.AbstractFilter
     * @see PIXI.AbstractFilter
     * @deprecated since version 3.0.6
     */
    AbstractFilter: {
        get: function()
        {
            warn('AstractFilter has been renamed to Filter, please use PIXI.Filter');
            return core.AbstractFilter;
        }
    },

    /**
     * @class
     * @private
     * @name PIXI.filters.SpriteMaskFilter
     * @see PIXI.SpriteMaskFilter
     * @deprecated since version 3.0.6
     */
    SpriteMaskFilter: {
        get: function()
        {
            warn('filters.SpriteMaskFilter is an undocumented alias, please use SpriteMaskFilter from now on.');
            return core.SpriteMaskFilter;
        }
    }
});

/**
 * @method
 * @name PIXI.utils.uuid
 * @see PIXI.utils.uid
 * @deprecated since version 3.0.6
 */
core.utils.uuid = function ()
{
    warn('utils.uuid() is deprecated, please use utils.uid() from now on.');
    return core.utils.uid();
};

/**
 * @method
 * @name PIXI.utils.canUseNewCanvasBlendModes
 * @see PIXI.CanvasTinter
 * @deprecated
 */
core.utils.canUseNewCanvasBlendModes = function() {
    warn('utils.canUseNewCanvasBlendModes() is deprecated, please use CanvasTinter.canUseMultiply from now on');
    return core.CanvasTinter.canUseMultiply;
};
},{"./core":97,"./extras":164,"./filters":175,"./mesh":191,"./particles":194}],155:[function(require,module,exports){
var core = require('../../core'),
    tempRect = new core.Rectangle();

/**
 * The extract manager provides functionality to export content from the renderers
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer} A reference to the current renderer
 */
function CanvasExtract(renderer)
{
    this.renderer = renderer;
    renderer.extract = this;
}


CanvasExtract.prototype.constructor = CanvasExtract;
module.exports = CanvasExtract;

/**
 * Will return a HTML Image of the target
 *
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {HTMLImageElement} HTML Image of the target
 */
CanvasExtract.prototype.image = function ( target )
{
	var image = new Image();
    image.src = this.base64( target );
    return image;
};

/**
 * Will return a a base64 encoded string of this target. It works by calling CanvasExtract.getCanvas and then running toDataURL on that.
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {string} A base64 encoded string of the texture.
 */
CanvasExtract.prototype.base64 = function ( target )
{
    return this.canvas( target ).toDataURL();
};

/**
 * Creates a Canvas element, renders this target to it and then returns it.
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
 */
CanvasExtract.prototype.canvas = function ( target )
{
	var renderer = this.renderer;
	var context;
	var resolution;
    var frame;
    var renderTexture;

    if(target)
    {
        if(target instanceof core.RenderTexture)
        {
            renderTexture = target;
        }
        else
        {
            renderTexture = renderer.generateTexture(target);
        }
    }

	if(renderTexture)
    {
        context = renderTexture.baseTexture._canvasRenderTarget.context;
        resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
        frame = renderTexture.frame;
    }
    else
    {
        context = renderer.rootContext;
        resolution = renderer.rootResolution;

        frame = tempRect;
        frame.width = this.renderer.width;
        frame.height = this.renderer.height;
    }

    var width = frame.width * resolution;
    var height = frame.height * resolution;

   	var canvasBuffer = new core.CanvasRenderTarget(width, height);
    var canvasData = context.getImageData(frame.x * resolution, frame.y * resolution, width, height);
    canvasBuffer.context.putImageData(canvasData, 0, 0);


    // send the canvas back..
    return canvasBuffer.canvas;
};

/**
 * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA order, with integer values between 0 and 255 (included).
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {Uint8ClampedArray} One-dimensional array containing the pixel data of the entire texture
 */
CanvasExtract.prototype.pixels = function ( target )
{
    var renderer = this.renderer;
    var context;
    var resolution;
    var frame;
    var renderTexture;

    if(target)
    {
        if(target instanceof core.RenderTexture)
        {
            renderTexture = target;
        }
        else
        {
            renderTexture = renderer.generateTexture(target);
        }
    }

    if(renderTexture)
    {
        context = renderTexture.baseTexture._canvasRenderTarget.context;
        resolution = renderTexture.baseTexture._canvasRenderTarget.resolution;
        frame = renderTexture.frame;
    }
    else
    {
        context = renderer.rootContext;
        resolution = renderer.rootResolution;

        frame = tempRect;
        frame.width = renderer.width;
        frame.height = renderer.height;
    }

    return context.getImageData(0, 0, frame.width * resolution, frame.height * resolution).data;
};

/**
 * Destroys the extract
 *
 */
CanvasExtract.prototype.destroy = function ()
{
    this.renderer.extract = null;
    this.renderer = null;
};

core.CanvasRenderer.registerPlugin('extract', CanvasExtract);

},{"../../core":97}],156:[function(require,module,exports){

module.exports = {
    webGL: require('./webgl/WebGLExtract'),
    canvas: require('./canvas/CanvasExtract')
};
},{"./canvas/CanvasExtract":155,"./webgl/WebGLExtract":157}],157:[function(require,module,exports){
var core = require('../../core'),
    tempRect = new core.Rectangle();

/**
 * The extract manager provides functionality to export content from the renderers
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} A reference to the current renderer
 */
function WebGLExtract(renderer)
{
    this.renderer = renderer;
    renderer.extract = this;
}


WebGLExtract.prototype.constructor = WebGLExtract;
module.exports = WebGLExtract;

/**
 * Will return a HTML Image of the target
 *
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {HTMLImageElement} HTML Image of the target
 */
WebGLExtract.prototype.image = function ( target )
{
	var image = new Image();
    image.src = this.base64( target );
    return image;
};

/**
 * Will return a a base64 encoded string of this target. It works by calling WebGLExtract.getCanvas and then running toDataURL on that.
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {string} A base64 encoded string of the texture.
 */
WebGLExtract.prototype.base64 = function ( target )
{
    return this.canvas( target ).toDataURL();
};

/**
 * Creates a Canvas element, renders this target to it and then returns it.
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
 */
WebGLExtract.prototype.canvas = function ( target )
{
	var renderer = this.renderer;
	var textureBuffer;
	var resolution;
    var frame;
    var flipY = false;
    var renderTexture;

    if(target)
    {
        if(target instanceof core.RenderTexture)
        {
            renderTexture = target;
        }
        else
        {
            renderTexture = this.renderer.generateTexture(target);

        }
    }

	if(renderTexture)
	{
		textureBuffer = renderTexture.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID];
		resolution = textureBuffer.resolution;
	    frame = renderTexture.frame;
        flipY = false;
    }
	else
	{
		textureBuffer = this.renderer.rootRenderTarget;
		resolution = textureBuffer.resolution;
        flipY = true;

        frame = tempRect;
        frame.width = textureBuffer.size.width;
        frame.height = textureBuffer.size.height;

	}



    var width = frame.width * resolution;
    var height = frame.height * resolution;

   	var canvasBuffer = new core.CanvasRenderTarget(width, height);

    if(textureBuffer)
    {
        // bind the buffer
        renderer.bindRenderTarget(textureBuffer);

        // set up an array of pixels
        var webGLPixels = new Uint8Array(4 * width * height);

        // read pixels to the array
        var gl = renderer.gl;
        gl.readPixels(frame.x * resolution, frame.y * resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);

        // add the pixels to the canvas
        var canvasData = canvasBuffer.context.getImageData(0, 0, width, height);
        canvasData.data.set(webGLPixels);

        canvasBuffer.context.putImageData(canvasData, 0, 0);

        // pulling pixels
        if(flipY)
        {
            canvasBuffer.context.scale(1, -1);
            canvasBuffer.context.drawImage(canvasBuffer.canvas, 0,-height);
        }
    }

     // send the canvas back..
    return canvasBuffer.canvas;
};

/**
 * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA order, with integer values between 0 and 255 (included).
 * @param target {PIXI.DisplayObject|PIXI.RenderTexture} A displayObject or renderTexture to convert. If left empty will use use the main renderer
 * @return {Uint8ClampedArray} One-dimensional array containing the pixel data of the entire texture
 */
WebGLExtract.prototype.pixels = function ( target )
{
    var renderer = this.renderer;
    var textureBuffer;
    var resolution;
    var frame;
    var renderTexture;

    if(target)
    {
        if(target instanceof core.RenderTexture)
        {
            renderTexture = target;
        }
        else
        {
            renderTexture = this.renderer.generateTexture(target);
        }
    }

    if(renderTexture)
    {
        textureBuffer = renderTexture.baseTexture._glRenderTargets[this.renderer.CONTEXT_UID];
        resolution = textureBuffer.resolution;
        frame = renderTexture.frame;

    }
    else
    {
        textureBuffer = this.renderer.rootRenderTarget;
        resolution = textureBuffer.resolution;

        frame = tempRect;
        frame.width = textureBuffer.size.width;
        frame.height = textureBuffer.size.height;
    }

    var width = frame.width * resolution;
    var height = frame.height * resolution;

    var webGLPixels = new Uint8Array(4 * width * height);

    if(textureBuffer)
    {
        // bind the buffer
        renderer.bindRenderTarget(textureBuffer);
        // read pixels to the array
        var gl = renderer.gl;
        gl.readPixels(frame.x * resolution, frame.y * resolution, width, height, gl.RGBA, gl.UNSIGNED_BYTE, webGLPixels);
    }

    return webGLPixels;
};

/**
 * Destroys the extract
 *
 */
WebGLExtract.prototype.destroy = function ()
{
    this.renderer.extract = null;
    this.renderer = null;
};

core.WebGLRenderer.registerPlugin('extract', WebGLExtract);

},{"../../core":97}],158:[function(require,module,exports){
var core = require('../core'),
    ObservablePoint = require('../core/math/ObservablePoint');

/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font. To
 * split a line you can use '\n', '\r' or '\r\n' in your string. You can generate the fnt files using:
 *
 * A BitmapText can only be created when the font is loaded
 *
 * ```js
 * // in this case the font is in a file called 'desyrel.fnt'
 * var bitmapText = new PIXI.extras.BitmapText("text using a fancy font!", {font: "35px Desyrel", align: "right"});
 * ```
 *
 * http://www.angelcode.com/products/bmfont/ for windows or
 * http://www.bmglyph.com/ for mac.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.extras
 * @param text {string} The copy that you would like the text to display
 * @param style {object} The style parameters
 * @param style.font {string|object} The font descriptor for the object, can be passed as a string of form
 *      "24px FontName" or "FontName" or as an object with explicit name/size properties.
 * @param [style.font.name] {string} The bitmap font id
 * @param [style.font.size] {number} The size of the font in pixels, e.g. 24
 * @param [style.align='left'] {string} Alignment for multiline text ('left', 'center' or 'right'), does not affect
 *      single line text
 * @param [style.tint=0xFFFFFF] {number} The tint color
 */
function BitmapText(text, style)
{
    core.Container.call(this);

    style = style || {};

    /**
     * The width of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @member {number}
     * @readonly
     */
    this.textWidth = 0;

    /**
     * The height of the overall text, different from fontSize,
     * which is defined in the style object
     *
     * @member {number}
     * @readonly
     */
    this.textHeight = 0;

    /**
     * Private tracker for the letter sprite pool.
     *
     * @member {PIXI.Sprite[]}
     * @private
     */
    this._glyphs = [];

    /**
     * Private tracker for the current style.
     *
     * @member {object}
     * @private
     */
    this._font = {
        tint: style.tint !== undefined ? style.tint : 0xFFFFFF,
        align: style.align || 'left',
        name: null,
        size: 0
    };

    /**
     * Private tracker for the current font.
     *
     * @member {object}
     * @private
     */
    this.font = style.font; // run font setter

    /**
     * Private tracker for the current text.
     *
     * @member {string}
     * @private
     */
    this._text = text;

    /**
     * The max width of this bitmap text in pixels. If the text provided is longer than the value provided, line breaks will be automatically inserted in the last whitespace.
     * Disable by setting value to 0
     *
     * @member {number}
     */
    this.maxWidth = 0;

    /**
     * The max line height. This is useful when trying to use the total height of the Text, ie: when trying to vertically align.
     *
     * @member {number}
     */
    this.maxLineHeight = 0;

    /**
     * Text anchor. read-only
     *
     * @member {PIXI.ObservablePoint}
     * @private
     */
    this._anchor = new ObservablePoint(this.makeDirty, this, 0, 0);

    /**
     * The dirty state of this object.
     *
     * @member {boolean}
     */
    this.dirty = false;

    this.updateText();
}

// constructor
BitmapText.prototype = Object.create(core.Container.prototype);
BitmapText.prototype.constructor = BitmapText;
module.exports = BitmapText;

Object.defineProperties(BitmapText.prototype, {
    /**
     * The tint of the BitmapText object
     *
     * @member {number}
     * @memberof PIXI.extras.BitmapText#
     */
    tint: {
        get: function ()
        {
            return this._font.tint;
        },
        set: function (value)
        {
            this._font.tint = (typeof value === 'number' && value >= 0) ? value : 0xFFFFFF;

            this.dirty = true;
        }
    },

    /**
     * The alignment of the BitmapText object
     *
     * @member {string}
     * @default 'left'
     * @memberof PIXI.extras.BitmapText#
     */
    align: {
        get: function ()
        {
            return this._font.align;
        },
        set: function (value)
        {
            this._font.align = value || 'left';

            this.dirty = true;
        }
    },

    /**
     * The anchor sets the origin point of the text.
     * The default is 0,0 this means the text's origin is the top left
     * Setting the anchor to 0.5,0.5 means the text's origin is centered
     * Setting the anchor to 1,1 would mean the text's origin point will be the bottom right corner
     *
     * @member {PIXI.Point | number}
     * @memberof PIXI.extras.BitmapText#
     */
    anchor: {
        get : function() {
            return this._anchor;
        },
        set: function(value) {
            if (typeof value === 'number'){
                 this._anchor.set(value);
            }
            else {
                this._anchor.copy(value);
            }
        }
    },

    /**
     * The font descriptor of the BitmapText object
     *
     * @member {string|object}
     * @memberof PIXI.extras.BitmapText#
     */
    font: {
        get: function ()
        {
            return this._font;
        },
        set: function (value)
        {
            if (!value) {
                return;
            }

            if (typeof value === 'string') {
                value = value.split(' ');

                this._font.name = value.length === 1 ? value[0] : value.slice(1).join(' ');
                this._font.size = value.length >= 2 ? parseInt(value[0], 10) : BitmapText.fonts[this._font.name].size;
            }
            else {
                this._font.name = value.name;
                this._font.size = typeof value.size === 'number' ? value.size : parseInt(value.size, 10);
            }

            this.dirty = true;
        }
    },

    /**
     * The text of the BitmapText object
     *
     * @member {string}
     * @memberof PIXI.extras.BitmapText#
     */
    text: {
        get: function ()
        {
            return this._text;
        },
        set: function (value)
        {
            value = value.toString() || ' ';
            if (this._text === value)
            {
                return;
            }
            this._text = value;
            this.dirty = true;
        }
    }
});

/**
 * Renders text and updates it when needed
 *
 * @private
 */
BitmapText.prototype.updateText = function ()
{
    var data = BitmapText.fonts[this._font.name];
    var pos = new core.Point();
    var prevCharCode = null;
    var chars = [];
    var lastLineWidth = 0;
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    var scale = this._font.size / data.size;
    var lastSpace = -1;
    var lastSpaceWidth = 0;
    var maxLineHeight = 0;

    for (var i = 0; i < this.text.length; i++)
    {
        var charCode = this.text.charCodeAt(i);
        
        if(/(\s)/.test(this.text.charAt(i))){
            lastSpace = i;
            lastSpaceWidth = lastLineWidth;
        }

        if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i)))
        {
            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        if (lastSpace !== -1 && this.maxWidth > 0 && pos.x * scale > this.maxWidth)
        {
            core.utils.removeItems(chars, lastSpace, i - lastSpace);
            i = lastSpace;
            lastSpace = -1;

            lineWidths.push(lastSpaceWidth);
            maxLineWidth = Math.max(maxLineWidth, lastSpaceWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        var charData = data.chars[charCode];

        if (!charData)
        {
            continue;
        }

        if (prevCharCode && charData.kerning[prevCharCode])
        {
            pos.x += charData.kerning[prevCharCode];
        }

        chars.push({texture:charData.texture, line: line, charCode: charCode, position: new core.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)});
        lastLineWidth = pos.x + (charData.texture.width + charData.xOffset);
        pos.x += charData.xAdvance;
        maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
        prevCharCode = charCode;
    }

    lineWidths.push(lastLineWidth);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);

    var lineAlignOffsets = [];

    for (i = 0; i <= line; i++)
    {
        var alignOffset = 0;

        if (this._font.align === 'right')
        {
            alignOffset = maxLineWidth - lineWidths[i];
        }
        else if (this._font.align === 'center')
        {
            alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }

        lineAlignOffsets.push(alignOffset);
    }

    var lenChars = chars.length;
    var tint = this.tint;

    for (i = 0; i < lenChars; i++)
    {
        var c = this._glyphs[i]; // get the next glyph sprite

        if (c)
        {
            c.texture = chars[i].texture;
        }
        else
        {
            c = new core.Sprite(chars[i].texture);
            this._glyphs.push(c);
        }

        c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
        c.position.y = chars[i].position.y * scale;
        c.scale.x = c.scale.y = scale;
        c.tint = tint;

        if (!c.parent)
        {
            this.addChild(c);
        }
    }

    // remove unnecessary children.
    for (i = lenChars; i < this._glyphs.length; ++i)
    {
        this.removeChild(this._glyphs[i]);
    }

    this.textWidth = maxLineWidth * scale;
    this.textHeight = (pos.y + data.lineHeight) * scale;

    // apply anchor
    if (this.anchor.x !== 0 || this.anchor.y !== 0)
    {
        for (i = 0; i < lenChars; i++)
        {
            this._glyphs[i].x -= this.textWidth * this.anchor.x;
            this._glyphs[i].y -= this.textHeight * this.anchor.y;
        }
    }
    this.maxLineHeight = maxLineHeight * scale;
};

/**
 * Updates the transform of this object
 *
 * @private
 */
BitmapText.prototype.updateTransform = function ()
{
    this.validate();
    this.containerUpdateTransform();
};

/**
 * Validates text before calling parent's getLocalBounds
 *
 * @return {PIXI.Rectangle} The rectangular bounding area
 */

BitmapText.prototype.getLocalBounds = function()
{
    this.validate();
    return core.Container.prototype.getLocalBounds.call(this);
};

/**
 * Updates text when needed
 *
 * @private
 */
BitmapText.prototype.validate = function()
{
    if (this.dirty)
    {
        this.updateText();
        this.dirty = false;
    }
};

BitmapText.prototype.makeDirty = function() {
    this.dirty = true;
};

BitmapText.fonts = {};

},{"../core":97,"../core/math/ObservablePoint":100}],159:[function(require,module,exports){
var core = require('../core');

/**
 * @typedef FrameObject
 * @type {object}
 * @property texture {PIXI.Texture} The {@link PIXI.Texture} of the frame
 * @property time {number} the duration of the frame in ms
 */

/**
 * A MovieClip is a simple way to display an animation depicted by a list of textures.
 *
 * ```js
 * var alienImages = ["image_sequence_01.png","image_sequence_02.png","image_sequence_03.png","image_sequence_04.png"];
 * var textureArray = [];
 *
 * for (var i=0; i < 4; i++)
 * {
 *      var texture = PIXI.Texture.fromImage(alienImages[i]);
 *      textureArray.push(texture);
 * };
 *
 * var mc = new PIXI.MovieClip(textureArray);
 * ```
 *
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 * @param textures {PIXI.Texture[]|FrameObject[]} an array of {@link PIXI.Texture} or frame objects that make up the animation
 */
function MovieClip(textures)
{
    core.Sprite.call(this, textures[0] instanceof core.Texture ? textures[0] : textures[0].texture);

    /**
     * @private
     */
    this._textures = null;

    /**
     * @private
     */
    this._durations = null;

    this.textures = textures;

    /**
     * The speed that the MovieClip will play at. Higher is faster, lower is slower
     *
     * @member {number}
     * @default 1
     */
    this.animationSpeed = 1;

    /**
     * Whether or not the movie clip repeats after playing.
     *
     * @member {boolean}
     * @default true
     */
    this.loop = true;

    /**
     * Function to call when a MovieClip finishes playing
     *
     * @method
     * @memberof PIXI.extras.MovieClip#
     */
    this.onComplete = null;

    /**
     * Elapsed time since animation has been started, used internally to display current texture
     *
     * @member {number}
     * @private
     */
    this._currentTime = 0;

    /**
     * Indicates if the MovieClip is currently playing
     *
     * @member {boolean}
     * @readonly
     */
    this.playing = false;
}

// constructor
MovieClip.prototype = Object.create(core.Sprite.prototype);
MovieClip.prototype.constructor = MovieClip;
module.exports = MovieClip;

Object.defineProperties(MovieClip.prototype, {
    /**
     * totalFrames is the total number of frames in the MovieClip. This is the same as number of textures
     * assigned to the MovieClip.
     *
     * @member {number}
     * @memberof PIXI.extras.MovieClip#
     * @default 0
     * @readonly
     */
    totalFrames: {
        get: function()
        {
            return this._textures.length;
        }
    },

    /**
     * The array of textures used for this MovieClip
     *
     * @member {PIXI.Texture[]}
     * @memberof PIXI.extras.MovieClip#
     *
     */
    textures: {
        get: function ()
        {
            return this._textures;
        },
        set: function (value)
        {
            if(value[0] instanceof core.Texture)
            {
                this._textures = value;
                this._durations = null;
            }
            else
            {
                this._textures = [];
                this._durations = [];
                for(var i = 0; i < value.length; i++)
                {
                    this._textures.push(value[i].texture);
                    this._durations.push(value[i].time);
                }
            }
        }
    },

    /**
    * The MovieClips current frame index
    *
    * @member {number}
    * @memberof PIXI.extras.MovieClip#
    * @readonly
    */
    currentFrame: {
        get: function ()
        {
            var currentFrame = Math.floor(this._currentTime) % this._textures.length;
            if (currentFrame < 0)
            {
                currentFrame += this._textures.length;
            }
            return currentFrame;
        }
    }

});

/**
 * Stops the MovieClip
 *
 */
MovieClip.prototype.stop = function ()
{
    if(!this.playing)
    {
        return;
    }

    this.playing = false;
    core.ticker.shared.remove(this.update, this);
};

/**
 * Plays the MovieClip
 *
 */
MovieClip.prototype.play = function ()
{
    if(this.playing)
    {
        return;
    }

    this.playing = true;
    core.ticker.shared.add(this.update, this);
};

/**
 * Stops the MovieClip and goes to a specific frame
 *
 * @param frameNumber {number} frame index to stop at
 */
MovieClip.prototype.gotoAndStop = function (frameNumber)
{
    this.stop();

    this._currentTime = frameNumber;

    this._texture = this._textures[this.currentFrame];
    this._textureID = -1;
};

/**
 * Goes to a specific frame and begins playing the MovieClip
 *
 * @param frameNumber {number} frame index to start at
 */
MovieClip.prototype.gotoAndPlay = function (frameNumber)
{
    this._currentTime = frameNumber;

    this.play();
};

/*
 * Updates the object transform for rendering
 * @private
 */
MovieClip.prototype.update = function (deltaTime)
{
    var elapsed = this.animationSpeed * deltaTime;

    if (this._durations !== null)
    {
        var lag = this._currentTime % 1 * this._durations[this.currentFrame];

        lag += elapsed / 60 * 1000;

        while (lag < 0)
        {
            this._currentTime--;
            lag += this._durations[this.currentFrame];
        }

        var sign = Math.sign(this.animationSpeed * deltaTime);
        this._currentTime = Math.floor(this._currentTime);

        while (lag >= this._durations[this.currentFrame])
        {
            lag -= this._durations[this.currentFrame] * sign;
            this._currentTime += sign;
        }

        this._currentTime += lag / this._durations[this.currentFrame];
    }
    else
    {
        this._currentTime += elapsed;
    }

    if (this._currentTime < 0 && !this.loop)
    {
        this.gotoAndStop(0);

        if (this.onComplete)
        {
            this.onComplete();
        }
    }
    else if (this._currentTime >= this._textures.length && !this.loop)
    {
        this.gotoAndStop(this._textures.length - 1);

        if (this.onComplete)
        {
            this.onComplete();
        }
    }
    else
    {
        this._texture = this._textures[this.currentFrame];
        this._textureID = -1;
    }

};

/*
 * Stops the MovieClip and destroys it
 *
 */
MovieClip.prototype.destroy = function ( )
{
    this.stop();
    core.Sprite.prototype.destroy.call(this);
};

/**
 * A short hand way of creating a movieclip from an array of frame ids
 *
 * @static
 * @param frames {string[]} the array of frames ids the movieclip will use as its texture frames
 */
MovieClip.fromFrames = function (frames)
{
    var textures = [];

    for (var i = 0; i < frames.length; ++i)
    {
        textures.push(core.Texture.fromFrame(frames[i]));
    }

    return new MovieClip(textures);
};

/**
 * A short hand way of creating a movieclip from an array of image ids
 *
 * @static
 * @param images {string[]} the array of image urls the movieclip will use as its texture frames
 */
MovieClip.fromImages = function (images)
{
    var textures = [];

    for (var i = 0; i < images.length; ++i)
    {
        textures.push(core.Texture.fromImage(images[i]));
    }

    return new MovieClip(textures);
};

},{"../core":97}],160:[function(require,module,exports){
var core = require('../core'),
    tempPoint = new core.Point(),
    Texture = require('../core/textures/Texture'),
    CanvasTinter = require('../core/sprites/canvas/CanvasTinter'),
    TilingShader = require('./webgl/TilingShader'),
    tempArray = new Float32Array(4);
/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
 * @param texture {PIXI.Texture} the texture of the tiling sprite
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
function TilingSprite(texture, width, height)
{
    core.Sprite.call(this, texture);

    /**
     * The scaling of the image that is being tiled
     *
     * @member {PIXI.Point}
     */
    this.tileScale = new core.Point(1,1);


    /**
     * The offset position of the image that is being tiled
     *
     * @member {PIXI.Point}
     */
    this.tilePosition = new core.Point(0,0);

    ///// private

    /**
     * The with of the tiling sprite
     *
     * @member {number}
     * @private
     */
    this._width = width || 100;

    /**
     * The height of the tiling sprite
     *
     * @member {number}
     * @private
     */
    this._height = height || 100;

    /**
     * An internal WebGL UV cache.
     *
     * @member {PIXI.TextureUvs}
     * @private
     */
    this._uvs = new core.TextureUvs();

    this._canvasPattern = null;

    this._glDatas = [];
}

TilingSprite.prototype = Object.create(core.Sprite.prototype);
TilingSprite.prototype.constructor = TilingSprite;
module.exports = TilingSprite;


Object.defineProperties(TilingSprite.prototype, {
    /**
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.extras.TilingSprite#
     */
    width: {
        get: function ()
        {
            return this._width;
        },
        set: function (value)
        {
            this._width = value;
        }
    },

    /**
     * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof PIXI.extras.TilingSprite#
     */
    height: {
        get: function ()
        {
            return this._height;
        },
        set: function (value)
        {
            this._height = value;
        }
    }
});

TilingSprite.prototype._onTextureUpdate = function ()
{
    return;
};


/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The renderer
 * @private
 */
TilingSprite.prototype._renderWebGL = function (renderer)
{

    // tweak our texture temporarily..
    var texture = this._texture;

    if(!texture || !texture._uvs)
    {
        return;
    }

     // get rid of any thing that may be batching.
    renderer.flush();

    var gl = renderer.gl;
    var glData = this._glDatas[renderer.CONTEXT_UID];

    if(!glData)
    {
        glData = {
            shader:new TilingShader(gl),
            quad:new core.Quad(gl)
        };

        this._glDatas[renderer.CONTEXT_UID] = glData;

        glData.quad.initVao(glData.shader);
    }

    // if the sprite is trimmed and is not a tilingsprite then we need to add the extra space before transforming the sprite coords..
    var vertices = glData.quad.vertices;

    vertices[0] = vertices[6] = ( this._width ) * -this.anchor.x;
    vertices[1] = vertices[3] = this._height * -this.anchor.y;

    vertices[2] = vertices[4] = ( this._width ) * (1-this.anchor.x);
    vertices[5] = vertices[7] = this._height * (1-this.anchor.y);

    glData.quad.upload();

    renderer.bindShader(glData.shader);

    var textureUvs = texture._uvs,
        textureWidth = texture._frame.width,
        textureHeight = texture._frame.height,
        textureBaseWidth = texture.baseTexture.width,
        textureBaseHeight = texture.baseTexture.height;

    var uPixelSize = glData.shader.uniforms.uPixelSize;
    uPixelSize[0] = 1.0/textureBaseWidth;
    uPixelSize[1] = 1.0/textureBaseHeight;
    glData.shader.uniforms.uPixelSize = uPixelSize;

    var uFrame = glData.shader.uniforms.uFrame;
    uFrame[0] = textureUvs.x0;
    uFrame[1] = textureUvs.y0;
    uFrame[2] = textureUvs.x1 - textureUvs.x0;
    uFrame[3] = textureUvs.y2 - textureUvs.y0;
    glData.shader.uniforms.uFrame = uFrame;

    var uTransform = glData.shader.uniforms.uTransform;
    uTransform[0] = (this.tilePosition.x % (textureWidth * this.tileScale.x)) / this._width;
    uTransform[1] = (this.tilePosition.y % (textureHeight * this.tileScale.y)) / this._height;
    uTransform[2] = ( textureBaseWidth / this._width ) * this.tileScale.x;
    uTransform[3] = ( textureBaseHeight / this._height ) * this.tileScale.y;
    glData.shader.uniforms.uTransform = uTransform;

    glData.shader.uniforms.translationMatrix = this.worldTransform.toArray(true);

    var color = tempArray;

    core.utils.hex2rgb(this.tint, color);
    color[3] = this.worldAlpha;

    glData.shader.uniforms.uColor = color;

    renderer.bindTexture(this._texture, 0);

    renderer.state.setBlendMode( this.blendMode );
    glData.quad.draw();
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} a reference to the canvas renderer
 * @private
 */
TilingSprite.prototype._renderCanvas = function (renderer)
{
    var texture = this._texture;

    if (!texture.baseTexture.hasLoaded)
    {
      return;
    }

    var context = renderer.context,
        transform = this.worldTransform,
        resolution = renderer.resolution,
        baseTexture = texture.baseTexture,
        modX = (this.tilePosition.x / this.tileScale.x) % texture._frame.width,
        modY = (this.tilePosition.y / this.tileScale.y) % texture._frame.height;

    // create a nice shiny pattern!
    // TODO this needs to be refreshed if texture changes..
    if(!this._canvasPattern)
    {
        // cut an object from a spritesheet..
        var tempCanvas = new core.CanvasRenderTarget(texture._frame.width, texture._frame.height);

        // Tint the tiling sprite
        if (this.tint !== 0xFFFFFF)
        {
            if (this.cachedTint !== this.tint)
            {
                this.cachedTint = this.tint;

                this.tintedTexture = CanvasTinter.getTintedTexture(this, this.tint);
            }
            tempCanvas.context.drawImage(this.tintedTexture, 0, 0);
        }
        else
        {
            tempCanvas.context.drawImage(baseTexture.source, -texture._frame.x, -texture._frame.y);
        }
        this._canvasPattern = tempCanvas.context.createPattern( tempCanvas.canvas, 'repeat' );
    }

    // set context state..
    context.globalAlpha = this.worldAlpha;
    context.setTransform(transform.a * resolution,
                       transform.b * resolution,
                       transform.c * resolution,
                       transform.d * resolution,
                       transform.tx * resolution,
                       transform.ty * resolution);

    // TODO - this should be rolled into the setTransform above..
    context.scale(this.tileScale.x,this.tileScale.y);

    context.translate(modX + (this.anchor.x * -this._width ),
                      modY + (this.anchor.y * -this._height));

    // check blend mode
    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== renderer.context.globalCompositeOperation)
    {
        context.globalCompositeOperation = compositeOperation;
    }

    // fill the pattern!
    context.fillStyle = this._canvasPattern;
    context.fillRect(-modX,
                     -modY,
                     this._width / this.tileScale.x,
                     this._height / this.tileScale.y);


    //TODO - pretty sure this can be deleted...
    //context.translate(-this.tilePosition.x + (this.anchor.x * this._width), -this.tilePosition.y + (this.anchor.y * this._height));
    //context.scale(1 / this.tileScale.x, 1 / this.tileScale.y);
};


/**
 * Returns the framing rectangle of the sprite as a Rectangle object
*
 * @return {PIXI.Rectangle} the framing rectangle
 */
TilingSprite.prototype.getBounds = function ()
{
    var width = this._width;
    var height = this._height;

    var w0 = width * (1-this.anchor.x);
    var w1 = width * -this.anchor.x;

    var h0 = height * (1-this.anchor.y);
    var h1 = height * -this.anchor.y;

    var worldTransform = this.worldTransform;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var x1 = a * w1 + c * h1 + tx;
    var y1 = d * h1 + b * w1 + ty;

    var x2 = a * w0 + c * h1 + tx;
    var y2 = d * h1 + b * w0 + ty;

    var x3 = a * w0 + c * h0 + tx;
    var y3 = d * h0 + b * w0 + ty;

    var x4 =  a * w1 + c * h0 + tx;
    var y4 =  d * h0 + b * w1 + ty;

    var minX,
        maxX,
        minY,
        maxY;

    minX = x1;
    minX = x2 < minX ? x2 : minX;
    minX = x3 < minX ? x3 : minX;
    minX = x4 < minX ? x4 : minX;

    minY = y1;
    minY = y2 < minY ? y2 : minY;
    minY = y3 < minY ? y3 : minY;
    minY = y4 < minY ? y4 : minY;

    maxX = x1;
    maxX = x2 > maxX ? x2 : maxX;
    maxX = x3 > maxX ? x3 : maxX;
    maxX = x4 > maxX ? x4 : maxX;

    maxY = y1;
    maxY = y2 > maxY ? y2 : maxY;
    maxY = y3 > maxY ? y3 : maxY;
    maxY = y4 > maxY ? y4 : maxY;

    var bounds = this._bounds;

    bounds.x = minX;
    bounds.width = maxX - minX;

    bounds.y = minY;
    bounds.height = maxY - minY;

    // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
    this._currentBounds = bounds;

    return bounds;
};

/**
 * Checks if a point is inside this tiling sprite
 * @param point {PIXI.Point} the point to check
 */
TilingSprite.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var width = this._width;
    var height = this._height;
    var x1 = -width * this.anchor.x;
    var y1;

    if ( tempPoint.x > x1 && tempPoint.x < x1 + width )
    {
        y1 = -height * this.anchor.y;

        if ( tempPoint.y > y1 && tempPoint.y < y1 + height )
        {
            return true;
        }
    }

    return false;
};

/**
 * Destroys this tiling sprite
 *
 */
TilingSprite.prototype.destroy = function () {
    core.Sprite.prototype.destroy.call(this);

    this.tileScale = null;
    this._tileScaleOffset = null;
    this.tilePosition = null;

    this._uvs = null;
};

/**
 * Helper function that creates a new tiling sprite based on the source you provide.
 * The source can be - frame id, image url, video url, canvas element, video element, base texture
 *
 * @static
 * @param {number|string|PIXI.BaseTexture|HTMLCanvasElement|HTMLVideoElement} source Source to create texture from
* @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 * @return {PIXI.Texture} The newly created texture
 */
TilingSprite.from = function (source,width,height)
{
    return new TilingSprite(Texture.from(source),width,height);
};



/**
 * Helper function that creates a tiling sprite that will use a texture from the TextureCache based on the frameId
 * The frame ids are created when a Texture packer file has been loaded
 *
 * @static
 * @param frameId {string} The frame Id of the texture in the cache
 * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the frameId
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 * @return {PIXI.extras.TilingSprite} A new TilingSprite
 */
TilingSprite.fromFrame = function (frameId,width,height)
{
    var texture = core.utils.TextureCache[frameId];

    if (!texture)
    {
        throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ' + this);
    }

    return new TilingSprite(texture,width,height);
};

/**
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @static
 * @param imageId {string} The image url of the texture
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 * @param [crossorigin=(auto)] {boolean} if you want to specify the cross-origin parameter
 * @param [scaleMode=PIXI.SCALE_MODES.DEFAULT] {number} if you want to specify the scale mode, see {@link PIXI.SCALE_MODES} for possible values
 * @return {PIXI.extras.TilingSprite} A new TilingSprite using a texture from the texture cache matching the image id
 */
TilingSprite.fromImage = function (imageId, width, height, crossorigin, scaleMode)
{
    return new TilingSprite(core.Texture.fromImage(imageId, crossorigin, scaleMode),width,height);
};

},{"../core":97,"../core/sprites/canvas/CanvasTinter":135,"../core/textures/Texture":144,"./webgl/TilingShader":165}],161:[function(require,module,exports){
var core = require('../core'),
    DisplayObject = core.DisplayObject,
    _tempMatrix = new core.Matrix();

DisplayObject.prototype._cacheAsBitmap = false;
DisplayObject.prototype._cacheData = false;

// figured theres no point adding ALL the extra variables to prototype.
// this model can hold the information needed. This can also be generated on demand as
// most objects are not cached as bitmaps.
var CacheData = function(){

    this.originalRenderWebGL = null;
    this.originalRenderCanvas = null;

    this.originalUpdateTransform = null;
    this.originalHitTest = null;
    this.originalDestroy = null;
    this.originalMask = null;
    this.originalFilterArea = null;
    this.sprite = null;
};


Object.defineProperties(DisplayObject.prototype, {

    /**
     * Set this to true if you want this display object to be cached as a bitmap.
     * This basically takes a snap shot of the display object as it is at that moment. It can provide a performance benefit for complex static displayObjects.
     * To remove simply set this property to 'false'
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    cacheAsBitmap: {
        get: function ()
        {
            return this._cacheAsBitmap;
        },
        set: function (value)
        {
            if (this._cacheAsBitmap === value)
            {
                return;
            }

            this._cacheAsBitmap = value;

            var data;

            if (value)
            {

                if(!this._cacheData)
                {
                    this._cacheData = new CacheData();
                }

                data = this._cacheData;

                data.originalRenderWebGL = this.renderWebGL;
                data.originalRenderCanvas = this.renderCanvas;

                data.originalUpdateTransform = this.updateTransform;
                data.originalGetBounds = this.getBounds;

                data.originalDestroy = this.destroy;

                data.originalContainsPoint = this.containsPoint;

                data.originalMask = this._mask;
                data.originalFilterArea = this.filterArea;



                this.renderWebGL = this._renderCachedWebGL;
                this.renderCanvas = this._renderCachedCanvas;

                this.destroy = this._cacheAsBitmapDestroy;

            }
            else
            {
                data = this._cacheData;

                if (data.sprite)
                {
                    this._destroyCachedDisplayObject();
                }


                this.renderWebGL = data.originalRenderWebGL;
                this.renderCanvas = data.originalRenderCanvas;
                this.getBounds = data.originalGetBounds;

                this.destroy = data.originalDestroy;

                this.updateTransform = data.originalUpdateTransform;
                this.containsPoint = data.originalContainsPoint;

                this._mask = data.originalMask;
                this.filterArea = data.originalFilterArea;
            }
        }
    }
});
/**
* Renders a cached version of the sprite with WebGL
*
* @param renderer {PIXI.WebGLRenderer} the WebGL renderer
* @private
*/
DisplayObject.prototype._renderCachedWebGL = function (renderer)
{
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    this._initCachedDisplayObject( renderer );

    this._cacheData.sprite._transformID = -1;
    this._cacheData.sprite.worldAlpha = this.worldAlpha;
    this._cacheData.sprite._renderWebGL(renderer);
};

/**
* Prepares the WebGL renderer to cache the sprite
*
* @param renderer {PIXI.WebGLRenderer} the WebGL renderer
* @private
*/
DisplayObject.prototype._initCachedDisplayObject = function (renderer)
{
    if(this._cacheData && this._cacheData.sprite)
    {
        return;
    }

    // first we flush anything left in the renderer (otherwise it would get rendered to the cached texture)
    renderer.currentRenderer.flush();
    //this.filters= [];
    // next we find the dimensions of the untransformed object
    // this function also calls updatetransform on all its children as part of the measuring. This means we don't need to update the transform again in this function
    // TODO pass an object to clone too? saves having to create a new one each time!
    var bounds = this.getLocalBounds().clone();

    // add some padding!
    if(this._filters)
    {
        var padding = this._filters[0].padding;
        bounds.x -= padding;
        bounds.y -= padding;

        bounds.width += padding * 2;
        bounds.height += padding * 2;
    }

    // for now we cache the current renderTarget that the webGL renderer is currently using.
    // this could be more elegent..
    var cachedRenderTarget = renderer._activeRenderTarget;
    // We also store the filter stack - I will definitely look to change how this works a little later down the line.
    var stack = renderer.filterManager.filterStack;

    // this renderTexture will be used to store the cached DisplayObject

    var renderTexture = core.RenderTexture.create(bounds.width | 0, bounds.height | 0);

    // need to set //
    var m = _tempMatrix;
    m.tx = -bounds.x;
    m.ty = -bounds.y;

    // reset
    this.transform.worldTransform.identity();

    // set all properties to there original so we can render to a texture
    this.renderWebGL = this._cacheData.originalRenderWebGL;

    renderer.render(this, renderTexture, true, m, true);
    // now restore the state be setting the new properties

    renderer.bindRenderTarget(cachedRenderTarget);

    renderer.filterManager.filterStack = stack;

    this.renderWebGL     = this._renderCachedWebGL;
    this.updateTransform = this.displayObjectUpdateTransform;
    this.getBounds       = this._getCachedBounds;

    this._mask = null;
    this.filterArea = null;

    // create our cached sprite
    var cachedSprite = new core.Sprite(renderTexture);
    cachedSprite.transform.worldTransform = this.transform.worldTransform;
    cachedSprite.anchor.x = -( bounds.x / bounds.width );
    cachedSprite.anchor.y = -( bounds.y / bounds.height );

    this._cacheData.sprite = cachedSprite;

    this.transform._parentID = -1;
    // restore the transform of the cached sprite to avoid the nasty flicker..
    this.updateTransform();

    // map the hit test..
    this.containsPoint = cachedSprite.containsPoint.bind(cachedSprite);
};

/**
* Renders a cached version of the sprite with canvas
*
* @param renderer {PIXI.CanvasRenderer} the Canvas renderer
* @private
*/
DisplayObject.prototype._renderCachedCanvas = function (renderer)
{
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    this._initCachedDisplayObjectCanvas( renderer );

    this._cacheData.sprite.worldAlpha = this.worldAlpha;

    this._cacheData.sprite.renderCanvas(renderer);
};

//TODO this can be the same as the webGL verison.. will need to do a little tweaking first though..
/**
* Prepares the Canvas renderer to cache the sprite
*
* @param renderer {PIXI.CanvasRenderer} the Canvas renderer
* @private
*/
DisplayObject.prototype._initCachedDisplayObjectCanvas = function (renderer)
{
    if(this._cacheData && this._cacheData.sprite)
    {
        return;
    }

    //get bounds actually transforms the object for us already!
    var bounds = this.getLocalBounds();

    var cachedRenderTarget = renderer.context;

    var renderTexture = new core.RenderTexture.create(bounds.width | 0, bounds.height | 0);

    // need to set //
    var m = _tempMatrix;
    this.transform.worldTransform.copy(m);
    m.invert();

    m.tx -= bounds.x;
    m.ty -= bounds.y;

    //m.append(this.transform.worldTransform.)
     // set all properties to there original so we can render to a texture
    this.renderCanvas = this._cacheData.originalRenderCanvas;

    //renderTexture.render(this, m, true);
    renderer.render(this, renderTexture, true, m, false);

    // now restore the state be setting the new properties
    renderer.context = cachedRenderTarget;

    this.renderCanvas = this._renderCachedCanvas;
    this.updateTransform = this.displayObjectUpdateTransform;
    this.getBounds  = this._getCachedBounds;

    this._mask = null;
    this.filterArea = null;

    // create our cached sprite
    var cachedSprite = new core.Sprite(renderTexture);
    cachedSprite.transform.worldTransform = this.transform.worldTransform;
    cachedSprite.anchor.x = -( bounds.x / bounds.width );
    cachedSprite.anchor.y = -( bounds.y / bounds.height );

    this.updateTransform();

    this._cacheData.sprite = cachedSprite;

    this.containsPoint = cachedSprite.containsPoint.bind(cachedSprite);
};

/**
* Calculates the bounds of the cached sprite
*
* @private
*/
DisplayObject.prototype._getCachedBounds = function ()
{
    this._cacheData.sprite._currentBounds = null;

    return this._cacheData.sprite.getBounds();
};

/**
* Destroys the cached sprite.
*
* @private
*/
DisplayObject.prototype._destroyCachedDisplayObject = function ()
{
    this._cacheData.sprite._texture.destroy(true);
    this._cacheData.sprite = null;
};

DisplayObject.prototype._cacheAsBitmapDestroy = function ()
{
    this.cacheAsBitmap = false;
    this.destroy();
};

},{"../core":97}],162:[function(require,module,exports){
var core = require('../core');

/**
 * The instance name of the object.
 *
 * @memberof PIXI.DisplayObject#
 * @member {string}
 */
core.DisplayObject.prototype.name = null;

/**
* Returns the display object in the container
*
* @memberof PIXI.Container#
* @param name {string} instance name
* @return {PIXI.DisplayObject}
*/
core.Container.prototype.getChildByName = function (name)
{
    for (var i = 0; i < this.children.length; i++)
    {
        if (this.children[i].name === name)
        {
            return this.children[i];
        }
    }
    return null;
};

},{"../core":97}],163:[function(require,module,exports){
var core = require('../core');

/**
* Returns the global position of the displayObject
*
* @memberof PIXI.DisplayObject#
* @param point {Point} the point to write the global value to. If null a new point will be returned
* @return {Point}
*/
core.DisplayObject.prototype.getGlobalPosition = function (point)
{
    point = point || new core.Point();

    if(this.parent)
    {
        this.displayObjectUpdateTransform();

        point.x = this.worldTransform.tx;
        point.y = this.worldTransform.ty;
    }
    else
    {
        point.x = this.position.x;
        point.y = this.position.y;
    }

    return point;
};

},{"../core":97}],164:[function(require,module,exports){
/**
 * @file        Main export of the PIXI extras library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

require('./cacheAsBitmap');
require('./getChildByName');
require('./getGlobalPosition');

/**
 * @namespace PIXI.extras
 */
module.exports = {
    MovieClip:      require('./MovieClip'),
    TilingSprite:   require('./TilingSprite'),
    BitmapText:     require('./BitmapText')
};

},{"./BitmapText":158,"./MovieClip":159,"./TilingSprite":160,"./cacheAsBitmap":161,"./getChildByName":162,"./getGlobalPosition":163}],165:[function(require,module,exports){
var Shader = require('../../core/Shader');


/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function TilingShader(gl)
{
    Shader.call(this,
        gl,
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\n\nuniform vec4 uFrame;\nuniform vec4 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vec2 coord = aTextureCoord;\n    coord -= uTransform.xy;\n    coord /= uTransform.zw;\n    vTextureCoord = coord;\n}\n",
        "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform vec4 uFrame;\nuniform vec2 uPixelSize;\n\nvoid main(void)\n{\n\n   \tvec2 coord = mod(vTextureCoord, uFrame.zw);\n   \tcoord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);\n   \tcoord += uFrame.xy;\n\n   \tvec4 sample = texture2D(uSampler, coord);\n  \tvec4 color = vec4(uColor.rgb * uColor.a, uColor.a);\n\n   \tgl_FragColor = sample * color ;\n}\n"
    );
}

TilingShader.prototype = Object.create(Shader.prototype);
TilingShader.prototype.constructor = TilingShader;
module.exports = TilingShader;


},{"../../core/Shader":77}],166:[function(require,module,exports){
var core = require('../../core'),
    BlurXFilter = require('./BlurXFilter'),
    BlurYFilter = require('./BlurYFilter');

/**
 * The BlurFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function BlurFilter(strength, quality, resolution)
{
    core.Filter.call(this);

    this.blurXFilter = new BlurXFilter();
    this.blurYFilter = new BlurYFilter();
    this.resolution = 1;

    this.padding = 0;
    this.resolution = resolution || 1;
    this.quality = quality || 4;
    this.blur = strength || 8;
}

BlurFilter.prototype = Object.create(core.Filter.prototype);
BlurFilter.prototype.constructor = BlurFilter;
module.exports = BlurFilter;

BlurFilter.prototype.apply = function (filterManager, input, output)
{

    var renderTarget = filterManager.getRenderTarget(true);

    this.blurXFilter.apply(filterManager, input, renderTarget, true);
    this.blurYFilter.apply(filterManager, renderTarget, output, false);

    filterManager.returnRenderTarget(renderTarget);
};

Object.defineProperties(BlurFilter.prototype, {
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = this.blurYFilter.blur = value;
            this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
        }
    },

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYFilter#
     * @default 1
     */
    quality: {
        get: function ()
        {
            return  this.blurXFilter.quality;
        },
        set: function (value)
        {

            this.blurXFilter.quality = this.blurYFilter.quality = value;
        }
    },

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blurX: {
        get: function ()
        {
            return this.blurXFilter.blur;
        },
        set: function (value)
        {
            this.blurXFilter.blur = value;
            this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
        }
    },

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @memberOf PIXI.filters.BlurFilter#
     * @default 2
     */
    blurY: {
        get: function ()
        {
            return this.blurYFilter.blur;
        },
        set: function (value)
        {
            this.blurYFilter.blur = value;
            this.padding = Math.max( Math.abs(this.blurYFilter.strength),  Math.abs(this.blurYFilter.strength)) * 2;
        }
    }
});

},{"../../core":97,"./BlurXFilter":167,"./BlurYFilter":168}],167:[function(require,module,exports){
var core = require('../../core');
var generateBlurVertSource  = require('./generateBlurVertSource');
var generateBlurFragSource  = require('./generateBlurFragSource');
var getMaxBlurKernelSize    = require('./getMaxBlurKernelSize');

/**
 * The BlurXFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function BlurXFilter(strength, quality, resolution)
{
    var vertSrc = generateBlurVertSource(5, true);
    var fragSrc = generateBlurFragSource(5);

    core.Filter.call(this,
        // vertex shader
        vertSrc,
        // fragment shader
        fragSrc
    );

    this.resolution = resolution || 1;

    this._quality = 0;

    this.quality = quality || 4;
    this.strength = strength || 8;

    this.firstRun = true;

}

BlurXFilter.prototype = Object.create(core.Filter.prototype);
BlurXFilter.prototype.constructor = BlurXFilter;
module.exports = BlurXFilter;

BlurXFilter.prototype.apply = function (filterManager, input, output, clear)
{
    if(this.firstRun)
    {
        var gl = filterManager.renderer.gl;
        var kernelSize = getMaxBlurKernelSize(gl);

        this.vertexSrc = generateBlurVertSource(kernelSize, true);
        this.fragmentSrc = generateBlurFragSource(kernelSize);

        this.firstRun = false;
    }

    this.uniforms.strength = (1/output.size.width) * (output.size.width/input.size.width); /// // *  2 //4//this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    // screen space!
    this.uniforms.strength *= this.strength;
    this.uniforms.strength /= this.passes;// / this.passes//Math.pow(1, this.passes);

    if(this.passes === 1)
    {
        filterManager.applyFilter(this, input, output, clear);
    }
    else
    {
        var renderTarget = filterManager.getRenderTarget(true);
        var flip = input;
        var flop = renderTarget;

        for(var i = 0; i < this.passes-1; i++)
        {
            filterManager.applyFilter(this, flip, flop, true);

           var temp = flop;
           flop = flip;
           flip = temp;
        }

        filterManager.applyFilter(this, flip, output, clear);

        filterManager.returnRenderTarget(renderTarget);
    }
};


Object.defineProperties(BlurXFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurXFilter#
     * @default 16
     */
    blur: {
        get: function ()
        {
            return  this.strength;
        },
        set: function (value)
        {
            this.padding =  Math.abs(value) * 2;
            this.strength = value;
        }
    },

     /**
     * Sets the quality of the blur by modifying the number of passes. More passes means higher quaility bluring but the lower the performance.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurXFilter#
     * @default 4
     */
    quality: {
        get: function ()
        {
            return  this._quality;
        },
        set: function (value)
        {
            this._quality = value;
            this.passes = value;
        }
    }
});

},{"../../core":97,"./generateBlurFragSource":169,"./generateBlurVertSource":170,"./getMaxBlurKernelSize":171}],168:[function(require,module,exports){
var core = require('../../core');
var generateBlurVertSource  = require('./generateBlurVertSource');
var generateBlurFragSource  = require('./generateBlurFragSource');
var getMaxBlurKernelSize    = require('./getMaxBlurKernelSize');

/**
 * The BlurYFilter applies a horizontal Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function BlurYFilter(strength, quality, resolution)
{
    var vertSrc = generateBlurVertSource(5, false);
    var fragSrc = generateBlurFragSource(5);

    core.Filter.call(this,
        // vertex shader
        vertSrc,
        // fragment shader
        fragSrc
    );

    this.resolution = resolution || 1;

    this._quality = 0;

    this.quality = quality || 4;
    this.strength = strength || 8;

    this.firstRun = true;
}

BlurYFilter.prototype = Object.create(core.Filter.prototype);
BlurYFilter.prototype.constructor = BlurYFilter;
module.exports = BlurYFilter;

BlurYFilter.prototype.apply = function (filterManager, input, output, clear)
{
    if(this.firstRun)
    {
        var gl = filterManager.renderer.gl;
        var kernelSize = getMaxBlurKernelSize(gl);

        this.vertexSrc = generateBlurVertSource(kernelSize, false);
        this.fragmentSrc = generateBlurFragSource(kernelSize);

        this.firstRun = false;
    }

    this.uniforms.strength = (1/output.size.height) * (output.size.height/input.size.height); /// // *  2 //4//this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    this.uniforms.strength *= this.strength;
    this.uniforms.strength /= this.passes;

    if(this.passes === 1)
    {
        filterManager.applyFilter(this, input, output, clear);
    }
    else
    {
        var renderTarget = filterManager.getRenderTarget(true);
        var flip = input;
        var flop = renderTarget;

        for(var i = 0; i < this.passes-1; i++)
        {
            filterManager.applyFilter(this, flip, flop, true);

           var temp = flop;
           flop = flip;
           flip = temp;
        }

        filterManager.applyFilter(this, flip, output, clear);

        filterManager.returnRenderTarget(renderTarget);
    }
};


Object.defineProperties(BlurYFilter.prototype, {
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurYFilter#
     * @default 2
     */
    blur: {
        get: function ()
        {
            return  this.strength;
        },
        set: function (value)
        {
            this.padding = Math.abs(value) * 2;
            this.strength = value;
        }
    },

    /**
     * Sets the quality of the blur by modifying the number of passes. More passes means higher quaility bluring but the lower the performance.
     *
     * @member {number}
     * @memberof PIXI.filters.BlurXFilter#
     * @default 4
     */
    quality: {
        get: function ()
        {
            return  this._quality;
        },
        set: function (value)
        {
            this._quality = value;
            this.passes = value;
        }
    }
});

},{"../../core":97,"./generateBlurFragSource":169,"./generateBlurVertSource":170,"./getMaxBlurKernelSize":171}],169:[function(require,module,exports){
var GAUSSIAN_VALUES = {
	5:[0.153388, 0.221461, 0.250301],
	7:[0.071303, 0.131514, 0.189879, 0.214607],
	9:[0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
	11:[0.0093, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
	13:[0.002406, 0.009255, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
    15:[0.000489, 0.002403, 0.009246, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448]
};

var fragTemplate = [
	'varying vec2 vBlurTexCoords[%size%];',
	'uniform sampler2D uSampler;',

	'void main(void)',
	'{',
	'	gl_FragColor = vec4(0.0);',
	'	%blur%',
	'}'

].join('\n');

var generateFragBlurSource = function(kernelSize)
{
    var kernel = GAUSSIAN_VALUES[kernelSize];
    var halfLength = kernel.length;

    var fragSource = fragTemplate;

    var blurLoop = '';
    var template = 'gl_FragColor += texture2D(uSampler, vBlurTexCoords[%index%]) * %value%;';
		var value;

    for (var i = 0; i < kernelSize; i++)
    {
    	var blur = template.replace('%index%', i);

    	value = i;

    	if(i >= halfLength)
    	{
    		value = kernelSize - i - 1;
    	}


    	blur = blur.replace('%value%', kernel[value]);

    	blurLoop += blur;
    	blurLoop += '\n';
    }

    fragSource = fragSource.replace('%blur%', blurLoop);
    fragSource = fragSource.replace('%size%', kernelSize);


    return fragSource;
};



module.exports = generateFragBlurSource;

},{}],170:[function(require,module,exports){

var vertTemplate = [
	'attribute vec2 aVertexPosition;',
	'attribute vec2 aTextureCoord;',

	'uniform float strength;',
	'uniform mat3 projectionMatrix;',

	'varying vec2 vBlurTexCoords[%size%];',

	'void main(void)',
	'{',
	    'gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);',
		'%blur%',
	'}'
].join('\n');

var generateVertBlurSource = function(kernelSize, x)
{
    var halfLength = Math.ceil(kernelSize/2);

    var vertSource = vertTemplate;

    var blurLoop = '';
    var template;
    var value;

    if(x)
    {
    	template = 'vBlurTexCoords[%index%] = aTextureCoord + vec2(%sampleIndex% * strength, 0.0);';
    }
    else
    {
    	template = 'vBlurTexCoords[%index%] = aTextureCoord + vec2(0.0, %sampleIndex% * strength);';

    }


    for (var i = 0; i < kernelSize; i++)
    {
    	var blur = template.replace('%index%', i);

    	value = i;

    	if(i >= halfLength)
    	{
    		value = kernelSize - i - 1;
    	}

    	blur = blur.replace('%sampleIndex%', (i - (halfLength-1)) + '.0');

    	blurLoop += blur;
    	blurLoop += '\n';
    }

    vertSource = vertSource.replace('%blur%', blurLoop);
    vertSource = vertSource.replace('%size%', kernelSize);

    return vertSource;
};



module.exports = generateVertBlurSource;

},{}],171:[function(require,module,exports){


var getMaxKernelSize = function(gl)
{
    var maxVaryings = ( gl.getParameter(gl.MAX_VARYING_VECTORS) );
    var kernelSize = 15;

    while(kernelSize > maxVaryings)
    {
       kernelSize -= 2;
    }

    return kernelSize;
};

module.exports = getMaxKernelSize;

},{}],172:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * The ColorMatrixFilter class lets you apply a 5x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. It's pretty powerful!
 *
 * ```js
 *  var colorMatrix = new PIXI.ColorMatrixFilter();
 *  container.filters = [colorMatrix];
 *  colorMatrix.contrast(2);
 * ```
 * @author Clément Chenebault <clement@goodboydigital.com>
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function ColorMatrixFilter()
{
    core.Filter.call(this,
        // vertex shader
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",
        // fragment shader
        "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float m[20];\n\nvoid main(void)\n{\n\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    gl_FragColor.r = (m[0] * c.r);\n        gl_FragColor.r += (m[1] * c.g);\n        gl_FragColor.r += (m[2] * c.b);\n        gl_FragColor.r += (m[3] * c.a);\n        gl_FragColor.r += m[4] * c.a;\n\n    gl_FragColor.g = (m[5] * c.r);\n        gl_FragColor.g += (m[6] * c.g);\n        gl_FragColor.g += (m[7] * c.b);\n        gl_FragColor.g += (m[8] * c.a);\n        gl_FragColor.g += m[9] * c.a;\n\n     gl_FragColor.b = (m[10] * c.r);\n        gl_FragColor.b += (m[11] * c.g);\n        gl_FragColor.b += (m[12] * c.b);\n        gl_FragColor.b += (m[13] * c.a);\n        gl_FragColor.b += m[14] * c.a;\n\n     gl_FragColor.a = (m[15] * c.r);\n        gl_FragColor.a += (m[16] * c.g);\n        gl_FragColor.a += (m[17] * c.b);\n        gl_FragColor.a += (m[18] * c.a);\n        gl_FragColor.a += m[19] * c.a;\n\n//    gl_FragColor = vec4(m[0]);\n}\n"
    );

    this.uniforms.m = [
                    1, 0, 0, 0, 0,
                    0, 1, 0, 0, 0,
                    0, 0, 1, 0, 0,
                    0, 0, 0, 1, 0];


}

ColorMatrixFilter.prototype = Object.create(core.Filter.prototype);
ColorMatrixFilter.prototype.constructor = ColorMatrixFilter;
module.exports = ColorMatrixFilter;


/**
 * Transforms current matrix and set the new one
 *
 * @param matrix {number[]} (mat 5x4)
 * @param multiply {boolean} if true, current matrix and matrix are multiplied. If false, just set the current matrix with @param matrix
 */
ColorMatrixFilter.prototype._loadMatrix = function (matrix, multiply)
{
    multiply = !!multiply;

    var newMatrix = matrix;

    if (multiply) {
        this._multiply(newMatrix, this.uniforms.m, matrix);
        newMatrix = this._colorMatrix(newMatrix);
    }

    // set the new matrix
    this.uniforms.m = newMatrix;
};

/**
 * Multiplies two mat5's
 *
 * @param out {number[]} (mat 5x4) the receiving matrix
 * @param a {number[]} (mat 5x4) the first operand
 * @param b {number[]} (mat 5x4) the second operand
 * @returns out {number[]} (mat 5x4)
 */
ColorMatrixFilter.prototype._multiply = function (out, a, b)
{

    // Red Channel
    out[0] = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15]);
    out[1] = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16]);
    out[2] = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17]);
    out[3] = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18]);
    out[4] = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]);

    // Green Channel
    out[5] = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15]);
    out[6] = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16]);
    out[7] = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17]);
    out[8] = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18]);
    out[9] = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]);

    // Blue Channel
    out[10] = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15]);
    out[11] = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16]);
    out[12] = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17]);
    out[13] = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18]);
    out[14] = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]);

    // Alpha Channel
    out[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15]);
    out[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16]);
    out[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17]);
    out[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18]);
    out[19] = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]);

    return out;
};

/**
 * Create a Float32 Array and normalize the offset component to 0-1
 *
 * @param matrix {number[]} (mat 5x4)
 * @return m {number[]} (mat 5x4) with all values between 0-1
 */
ColorMatrixFilter.prototype._colorMatrix = function (matrix)
{
    // Create a Float32 Array and normalize the offset component to 0-1
    var m = new Float32Array(matrix);
    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;

    return m;
};

/**
 * Adjusts brightness
 *
 * @param b {number} value of the brigthness (0 is black)
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.brightness = function (b, multiply)
{
    var matrix = [
        b, 0, 0, 0, 0,
        0, b, 0, 0, 0,
        0, 0, b, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the matrices in grey scales
 *
 * @param scale {number} value of the grey (0 is black)
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.greyscale = function (scale, multiply)
{
    var matrix = [
        scale, scale, scale, 0, 0,
        scale, scale, scale, 0, 0,
        scale, scale, scale, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};
//Americanized alias
ColorMatrixFilter.prototype.grayscale = ColorMatrixFilter.prototype.greyscale;

/**
 * Set the black and white matrice
 * Multiply the current matrix
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.blackAndWhite = function (multiply)
{
    var matrix = [
        0.3, 0.6, 0.1, 0, 0,
        0.3, 0.6, 0.1, 0, 0,
        0.3, 0.6, 0.1, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the hue property of the color
 *
 * @param rotation {number} in degrees
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.hue = function (rotation, multiply)
{
    rotation = (rotation || 0) / 180 * Math.PI;

    var cosR = Math.cos(rotation),
        sinR = Math.sin(rotation),
        sqrt = Math.sqrt;

    /*a good approximation for hue rotation
    This matrix is far better than the versions with magic luminance constants
    formerly used here, but also used in the starling framework (flash) and known from this
    old part of the internet: quasimondo.com/archives/000565.php

    This new matrix is based on rgb cube rotation in space. Look here for a more descriptive
    implementation as a shader not a general matrix:
    https://github.com/evanw/glfx.js/blob/58841c23919bd59787effc0333a4897b43835412/src/filters/adjust/huesaturation.js

    This is the source for the code:
    see http://stackoverflow.com/questions/8507885/shift-hue-of-an-rgb-color/8510751#8510751
    */

    var w = 1/3, sqrW = sqrt(w);//weight is

    var a00 = cosR + (1.0 - cosR) * w;
    var a01 = w * (1.0 - cosR) - sqrW * sinR;
    var a02 = w * (1.0 - cosR) + sqrW * sinR;

    var a10 = w * (1.0 - cosR) + sqrW * sinR;
    var a11 = cosR + w*(1.0 - cosR);
    var a12 = w * (1.0 - cosR) - sqrW * sinR;

    var a20 = w * (1.0 - cosR) - sqrW * sinR;
    var a21 = w * (1.0 - cosR) + sqrW * sinR;
    var a22 = cosR + w * (1.0 - cosR);


    var matrix = [
      a00, a01, a02, 0, 0,
      a10, a11, a12, 0, 0,
      a20, a21, a22, 0, 0,
      0, 0, 0, 1, 0,
    ];

    this._loadMatrix(matrix, multiply);
};


/**
 * Set the contrast matrix, increase the separation between dark and bright
 * Increase contrast : shadows darker and highlights brighter
 * Decrease contrast : bring the shadows up and the highlights down
 *
 * @param amount {number} value of the contrast
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.contrast = function (amount, multiply)
{
    var v = (amount || 0) + 1;
    var o = -128 * (v - 1);

    var matrix = [
        v, 0, 0, 0, o,
        0, v, 0, 0, o,
        0, 0, v, 0, o,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Set the saturation matrix, increase the separation between colors
 * Increase saturation : increase contrast, brightness, and sharpness
 *
 * @param [amount=0] {number}
 * @param [multiply] {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.saturate = function (amount, multiply)
{
    var x = (amount || 0) * 2 / 3 + 1;
    var y = ((x - 1) * -0.5);

    var matrix = [
        x, y, y, 0, 0,
        y, x, y, 0, 0,
        y, y, x, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Desaturate image (remove color)
 *
 * Call the saturate function
 *
 */
ColorMatrixFilter.prototype.desaturate = function () // jshint unused:false
{
    this.saturate(-1);
};

/**
 * Negative image (inverse of classic rgb matrix)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.negative = function (multiply)
{
    var matrix = [
        0, 1, 1, 0, 0,
        1, 0, 1, 0, 0,
        1, 1, 0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Sepia image
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.sepia = function (multiply)
{
    var matrix = [
        0.393, 0.7689999, 0.18899999, 0, 0,
        0.349, 0.6859999, 0.16799999, 0, 0,
        0.272, 0.5339999, 0.13099999, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Color motion picture process invented in 1916 (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.technicolor = function (multiply)
{
    var matrix = [
        1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337,
        -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398,
        -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Polaroid filter
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.polaroid = function (multiply)
{
    var matrix = [
        1.438, -0.062, -0.062, 0, 0,
        -0.122, 1.378, -0.122, 0, 0,
        -0.016, -0.016, 1.483, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Filter who transforms : Red -> Blue and Blue -> Red
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.toBGR = function (multiply)
{
    var matrix = [
        0, 0, 1, 0, 0,
        0, 1, 0, 0, 0,
        1, 0, 0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Color reversal film introduced by Eastman Kodak in 1935. (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.kodachrome = function (multiply)
{
    var matrix = [
        1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502,
        -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203,
        -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/**
 * Brown delicious browni filter (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.browni = function (multiply)
{
    var matrix = [
        0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 47.43192855600873,
        -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -36.96841498319127,
        0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Vintage filter (thanks Dominic Szablewski)
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.vintage = function (multiply)
{
    var matrix = [
        0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 9.651285835294123,
        0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 7.462829176470591,
        0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * We don't know exactly what it does, kind of gradient map, but funny to play with!
 *
 * @param desaturation {number}
 * @param toned {number}
 * @param lightColor {string} (example : "0xFFE580")
 * @param darkColor {string}  (example : "0xFFE580")
 *
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.colorTone = function (desaturation, toned, lightColor, darkColor, multiply)
{
    desaturation = desaturation || 0.2;
    toned = toned || 0.15;
    lightColor = lightColor || 0xFFE580;
    darkColor = darkColor || 0x338000;

    var lR = ((lightColor >> 16) & 0xFF) / 255;
    var lG = ((lightColor >> 8) & 0xFF) / 255;
    var lB = (lightColor & 0xFF) / 255;

    var dR = ((darkColor >> 16) & 0xFF) / 255;
    var dG = ((darkColor >> 8) & 0xFF) / 255;
    var dB = (darkColor & 0xFF) / 255;

    var matrix = [
        0.3, 0.59, 0.11, 0, 0,
        lR, lG, lB, desaturation, 0,
        dR, dG, dB, toned, 0,
        lR - dR, lG - dG, lB - dB, 0, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Night effect
 *
 * @param intensity {number}
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.night = function (intensity, multiply)
{
    intensity = intensity || 0.1;
    var matrix = [
        intensity * ( -2.0), -intensity, 0, 0, 0,
        -intensity, 0, intensity, 0, 0,
        0, intensity, intensity * 2.0, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};


/*
 * Predator effect
 *
 * Erase the current matrix by setting a new indepent one
 *
 * @param amount {number} how much the predator feels his future victim
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.predator = function (amount, multiply)
{
    var matrix = [
        11.224130630493164 * amount, -4.794486999511719 * amount, -2.8746118545532227 * amount, 0 * amount, 0.40342438220977783 * amount,
        -3.6330697536468506 * amount, 9.193157196044922 * amount, -2.951810836791992 * amount, 0 * amount, -1.316135048866272 * amount,
        -3.2184197902679443 * amount, -4.2375030517578125 * amount, 7.476448059082031 * amount, 0 * amount, 0.8044459223747253 * amount,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * LSD effect
 *
 * Multiply the current matrix
 *
 * @param amount {number} How crazy is your effect
 * @param multiply {boolean} refer to ._loadMatrix() method
 */
ColorMatrixFilter.prototype.lsd = function (multiply)
{
    var matrix = [
        2, -0.4, 0.5, 0, 0,
        -0.5, 2, -0.4, 0, 0,
        -0.4, -0.5, 3, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, multiply);
};

/*
 * Erase the current matrix by setting the default one
 *
 */
ColorMatrixFilter.prototype.reset = function ()
{
    var matrix = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    this._loadMatrix(matrix, false);
};


Object.defineProperties(ColorMatrixFilter.prototype, {
    /**
     * Sets the matrix of the color matrix filter
     *
     * @member {number[]}
     * @memberof PIXI.filters.ColorMatrixFilter#
     * @default [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
     */
    matrix: {
        get: function ()
        {
            return this.uniforms.m;
        },
        set: function (value)
        {
            this.uniforms.m = value;
        }
    }
});

},{"../../core":97}],173:[function(require,module,exports){
var core = require('../../core');


/**
 * The DisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used to offset the x and the g property of the texture is used to offset the y.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param sprite {PIXI.Sprite} The sprite used for the displacement map. (make sure its added to the scene!)
 * @param scale {number} The scale of the displacement
 */
function DisplacementFilter(sprite, scale)
{
    var maskMatrix = new core.Matrix();
    sprite.renderable = false;

    core.Filter.call(this,
        // vertex shader
//        glslify('./displacement.vert'),
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 filterMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vFilterCoord;\n\nvoid main(void)\n{\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n   vTextureCoord = aTextureCoord;\n}",
        // fragment shader
        "#define GLSLIFY 1\nvarying vec2 vFilterCoord;\nvarying vec2 vTextureCoord;\n\nuniform vec2 scale;\n\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nuniform vec4 filterClamp;\n\nvoid main(void)\n{\n   vec4 map =  texture2D(mapSampler, vFilterCoord);\n\n   map -= 0.5;\n   map.xy *= scale;\n\n   gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), filterClamp.xy, filterClamp.zw));\n}\n"

    );

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;

    this.uniforms.mapSampler = sprite.texture;
    this.uniforms.filterMatrix = maskMatrix.toArray(true);
    this.uniforms.scale = { x: 1, y: 1 };

    if (scale === null || scale === undefined)
    {
        scale = 20;
    }

    this.scale = new core.Point(scale, scale);
}

DisplacementFilter.prototype = Object.create(core.Filter.prototype);
DisplacementFilter.prototype.constructor = DisplacementFilter;
module.exports = DisplacementFilter;

DisplacementFilter.prototype.apply = function (filterManager, input, output)
{
    var ratio =  (1/output.destinationFrame.width) * (output.size.width/input.size.width); /// // *  2 //4//this.strength / 4 / this.passes * (input.frame.width / input.size.width);

    this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
    this.uniforms.scale.x = this.scale.x * ratio;
    this.uniforms.scale.y = this.scale.y * ratio;

     // draw the filter...
    filterManager.applyFilter(this, input, output);
};


Object.defineProperties(DisplacementFilter.prototype, {
    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.filters.DisplacementFilter#
     */
    map: {
        get: function ()
        {
            return this.uniforms.mapSampler;
        },
        set: function (value)
        {
            this.uniforms.mapSampler = value;

        }
    }
});

},{"../../core":97}],174:[function(require,module,exports){
var core = require('../../core');


/**
 *
 * Basic FXAA implementation based on the code on geeks3d.com with the
 * modification that the texture2DLod stuff was removed since it's
 * unsupported by WebGL.
 *
 * @see https://github.com/mitsuhiko/webgl-meincraft
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI
 *
 */
function FXAAFilter()
{
    //TODO - needs work
    core.Filter.call(this,

        // vertex shader
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nuniform vec4 filterArea;\n\nvarying vec2 vTextureCoord;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvoid texcoords(vec2 fragCoord, vec2 resolution,\n               out vec2 v_rgbNW, out vec2 v_rgbNE,\n               out vec2 v_rgbSW, out vec2 v_rgbSE,\n               out vec2 v_rgbM) {\n    vec2 inverseVP = 1.0 / resolution.xy;\n    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n    v_rgbM = vec2(fragCoord * inverseVP);\n}\n\nvoid main(void) {\n\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n   vTextureCoord = aTextureCoord;\n\n   vec2 fragCoord = vTextureCoord * filterArea.xy;\n\n   texcoords(fragCoord, filterArea.xy, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n}",
        // fragment shader
        "#define GLSLIFY 1\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\n/**\n Basic FXAA implementation based on the code on geeks3d.com with the\n modification that the texture2DLod stuff was removed since it's\n unsupported by WebGL.\n \n --\n \n From:\n https://github.com/mitsuhiko/webgl-meincraft\n \n Copyright (c) 2011 by Armin Ronacher.\n \n Some rights reserved.\n \n Redistribution and use in source and binary forms, with or without\n modification, are permitted provided that the following conditions are\n met:\n \n * Redistributions of source code must retain the above copyright\n notice, this list of conditions and the following disclaimer.\n \n * Redistributions in binary form must reproduce the above\n copyright notice, this list of conditions and the following\n disclaimer in the documentation and/or other materials provided\n with the distribution.\n \n * The names of the contributors may not be used to endorse or\n promote products derived from this software without specific\n prior written permission.\n \n THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\n LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\n SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\n LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n */\n\n#ifndef FXAA_REDUCE_MIN\n#define FXAA_REDUCE_MIN   (1.0/ 128.0)\n#endif\n#ifndef FXAA_REDUCE_MUL\n#define FXAA_REDUCE_MUL   (1.0 / 8.0)\n#endif\n#ifndef FXAA_SPAN_MAX\n#define FXAA_SPAN_MAX     8.0\n#endif\n\n//optimized version for mobile, where dependent\n//texture reads can be a bottleneck\nvec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,\n          vec2 v_rgbNW, vec2 v_rgbNE,\n          vec2 v_rgbSW, vec2 v_rgbSE,\n          vec2 v_rgbM) {\n    vec4 color;\n    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);\n    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;\n    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;\n    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;\n    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;\n    vec4 texColor = texture2D(tex, v_rgbM);\n    vec3 rgbM  = texColor.xyz;\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n    \n    mediump vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n    \n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n    \n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n                  dir * rcpDirMin)) * inverseVP;\n    \n    vec3 rgbA = 0.5 * (\n                       texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n                       texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * 0.5 + 0.25 * (\n                                     texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n                                     texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n    \n    float lumaB = dot(rgbB, luma);\n    if ((lumaB < lumaMin) || (lumaB > lumaMax))\n        color = vec4(rgbA, texColor.a);\n    else\n        color = vec4(rgbB, texColor.a);\n    return color;\n}\n\nvoid main() {\n\n  \tvec2 fragCoord = vTextureCoord * filterArea.xy;\n\n  \tvec4 color;\n\n    color = fxaa(uSampler, fragCoord, filterArea.xy, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n\n  \tgl_FragColor = color;\n}\n"
    );

}

FXAAFilter.prototype = Object.create(core.Filter.prototype);
FXAAFilter.prototype.constructor = FXAAFilter;

module.exports = FXAAFilter;

},{"../../core":97}],175:[function(require,module,exports){
/**
 * @file        Main export of the PIXI filters library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.filters
 */
module.exports = {
    FXAAFilter:          require('./fxaa/FXAAFilter'),
    NoiseFilter:        require('./noise/NoiseFilter'),
    DisplacementFilter: require('./displacement/DisplacementFilter'),
    BlurFilter:         require('./blur/BlurFilter'),
    BlurXFilter:        require('./blur/BlurXFilter'),
    BlurYFilter:        require('./blur/BlurYFilter'),
    ColorMatrixFilter:  require('./colormatrix/ColorMatrixFilter'),
    VoidFilter:         require('./void/VoidFilter')
};

},{"./blur/BlurFilter":166,"./blur/BlurXFilter":167,"./blur/BlurYFilter":168,"./colormatrix/ColorMatrixFilter":172,"./displacement/DisplacementFilter":173,"./fxaa/FXAAFilter":174,"./noise/NoiseFilter":176,"./void/VoidFilter":177}],176:[function(require,module,exports){
var core = require('../../core');


/**
 * @author Vico @vicocotea
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 */

/**
 * A Noise effect filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function NoiseFilter()
{
    core.Filter.call(this,
        // vertex shader
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",
        // fragment shader
        "precision highp float;\n#define GLSLIFY 1\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform float noise;\nuniform sampler2D uSampler;\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main()\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    float diff = (rand(gl_FragCoord.xy) - 0.5) * noise;\n\n    color.r += diff;\n    color.g += diff;\n    color.b += diff;\n\n    gl_FragColor = color;\n}\n"
    );

    this.noise = 0.5;
}

NoiseFilter.prototype = Object.create(core.Filter.prototype);
NoiseFilter.prototype.constructor = NoiseFilter;
module.exports = NoiseFilter;

Object.defineProperties(NoiseFilter.prototype, {
    /**
     * The amount of noise to apply.
     *
     * @member {number}
     * @memberof PIXI.filters.NoiseFilter#
     * @default 0.5
     */
    noise: {
        get: function ()
        {
            return this.uniforms.noise;
        },
        set: function (value)
        {
            this.uniforms.noise = value;
        }
    }
});

},{"../../core":97}],177:[function(require,module,exports){
var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * Does nothing. Very handy.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
function VoidFilter()
{
    core.Filter.call(this,
        // vertex shader
        "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",
        // fragment shader
        "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n}\n"
    );

    this.glShaderKey = 'void';
}

VoidFilter.prototype = Object.create(core.Filter.prototype);
VoidFilter.prototype.constructor = VoidFilter;
module.exports = VoidFilter;

},{"../../core":97}],178:[function(require,module,exports){
var core = require('../core');

/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI.interaction
 */
function InteractionData()
{
    /**
     * This point stores the global coords of where the touch/mouse event happened
     *
     * @member {PIXI.Point}
     */
    this.global = new core.Point();

    /**
     * The target Sprite that was interacted with
     *
     * @member {PIXI.Sprite}
     */
    this.target = null;

    /**
     * When passed to an event handler, this will be the original DOM Event that was captured
     *
     * @member {Event}
     */
    this.originalEvent = null;
}

InteractionData.prototype.constructor = InteractionData;
module.exports = InteractionData;

/**
 * This will return the local coordinates of the specified displayObject for this InteractionData
 *
 * @param displayObject {PIXI.DisplayObject} The DisplayObject that you would like the local coords off
 * @param [point] {PIXI.Point} A Point object in which to store the value, optional (otherwise will create a new point)
 * @param [globalPos] {PIXI.Point} A Point object containing your custom global coords, optional (otherwise will use the current global coords)
 * @return {PIXI.Point} A point containing the coordinates of the InteractionData position relative to the DisplayObject
 */
InteractionData.prototype.getLocalPosition = function (displayObject, point, globalPos)
{
    return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
};

},{"../core":97}],179:[function(require,module,exports){
var core = require('../core'),
    InteractionData = require('./InteractionData'),
    EventEmitter = require('eventemitter3');

// Mix interactiveTarget into core.DisplayObject.prototype
Object.assign(
    core.DisplayObject.prototype,
    require('./interactiveTarget')
);

/**
 * The interaction manager deals with mouse and touch events. Any DisplayObject can be interactive
 * if its interactive parameter is set to true
 * This manager also supports multitouch.
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI.interaction
 * @param renderer {PIXI.CanvasRenderer|PIXI.WebGLRenderer} A reference to the current renderer
 * @param [options] {object}
 * @param [options.autoPreventDefault=true] {boolean} Should the manager automatically prevent default browser actions.
 * @param [options.interactionFrequency=10] {number} Frequency increases the interaction events will be checked.
 */
function InteractionManager(renderer, options)
{
    EventEmitter.call(this);

    options = options || {};

    /**
     * The renderer this interaction manager works for.
     *
     * @member {PIXI.SystemRenderer}
     */
    this.renderer = renderer;

    /**
     * Should default browser actions automatically be prevented.
     *
     * @member {boolean}
     * @default true
     */
    this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;

    /**
     * As this frequency increases the interaction events will be checked more often.
     *
     * @member {number}
     * @default 10
     */
    this.interactionFrequency = options.interactionFrequency || 10;

    /**
     * The mouse data
     *
     * @member {PIXI.interaction.InteractionData}
     */
    this.mouse = new InteractionData();

    // setting the pointer to start off far off screen will mean that mouse over does
    //  not get called before we even move the mouse.
    this.mouse.global.set(-999999);

    /**
     * An event data object to handle all the event tracking/dispatching
     *
     * @member {object}
     */
    this.eventData = {
        stopped: false,
        target: null,
        type: null,
        data: this.mouse,
        stopPropagation:function(){
            this.stopped = true;
        }
    };

    /**
     * Tiny little interactiveData pool !
     *
     * @member {PIXI.interaction.InteractionData[]}
     */
    this.interactiveDataPool = [];

    /**
     * The DOM element to bind to.
     *
     * @member {HTMLElement}
     * @private
     */
    this.interactionDOMElement = null;

    /**
     * This property determins if mousemove and touchmove events are fired only when the cursror is over the object
     * Setting to true will make things work more in line with how the DOM verison works.
     * Setting to false can make things easier for things like dragging
     * It is currently set to false as this is how pixi used to work. This will be set to true in future versions of pixi.
     * @member {boolean}
     * @private
     */
    this.moveWhenInside = false;

    /**
     * Have events been attached to the dom element?
     *
     * @member {boolean}
     * @private
     */
    this.eventsAdded = false;

    //this will make it so that you don't have to call bind all the time

    /**
     * @member {Function}
     * @private
     */
    this.onMouseUp = this.onMouseUp.bind(this);
    this.processMouseUp = this.processMouseUp.bind( this );


    /**
     * @member {Function}
     *  @private
     */
    this.onMouseDown = this.onMouseDown.bind(this);
    this.processMouseDown = this.processMouseDown.bind( this );

    /**
     * @member {Function}
     * @private
     */
    this.onMouseMove = this.onMouseMove.bind( this );
    this.processMouseMove = this.processMouseMove.bind( this );

    /**
     * @member {Function}
     * @private
     */
    this.onMouseOut = this.onMouseOut.bind(this);
    this.processMouseOverOut = this.processMouseOverOut.bind( this );

    /**
     * @member {Function}
     * @private
     */
    this.onMouseOver = this.onMouseOver.bind(this);


    /**
     * @member {Function}
     * @private
     */
    this.onTouchStart = this.onTouchStart.bind(this);
    this.processTouchStart = this.processTouchStart.bind(this);

    /**
     * @member {Function}
     * @private
     */
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.processTouchEnd = this.processTouchEnd.bind(this);

    /**
     * @member {Function}
     * @private
     */
    this.onTouchMove = this.onTouchMove.bind(this);
    this.processTouchMove = this.processTouchMove.bind(this);

    /**
     * Every update cursor will be reset to this value, if some element wont override it in its hitTest
     * @member {string}
     * @default 'inherit'
     */
    this.defaultCursorStyle = 'inherit';

    /**
     * The css style of the cursor that is being used
     * @member {string}
     */
    this.currentCursorStyle = 'inherit';

    /**
     * Internal cached var
     * @member {PIXI.Point}
     * @private
     */
    this._tempPoint = new core.Point();


    /**
     * The current resolution / device pixel ratio.
     * @member {number}
     * @default 1
     */
    this.resolution = 1;

    this.setTargetElement(this.renderer.view, this.renderer.resolution);

    /**
     * Fired when a pointing device button (usually a mouse button) is pressed on the display object.
     * 
     * @memberof PIXI.interaction.InteractionManager#
     * @event mousedown
     */

    /**
     * Fired when a pointing device secondary button (usually a mouse right-button) is pressed on the display object.
     * 
     * @memberof PIXI.interaction.InteractionManager#
     * @event rightdown
     */

    /**
     * Fired when a pointing device button (usually a mouse button) is released over the display object.
     * 
     * @memberof PIXI.interaction.InteractionManager#
     * @event mouseup
     */

    /**
     * Fired when a pointing device secondary button (usually a mouse right-button) is released over the display object.
     * 
     * @memberof PIXI.interaction.InteractionManager#
     * @event rightup
     */

    /**
     * Fired when a pointing device button (usually a mouse button) is pressed and released on the display object.
     * 
     * @event click
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a pointing device secondary button (usually a mouse right-button) is pressed and released on the display object.
     * 
     * @event rightclick
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a pointing device button (usually a mouse button) is released outside the display object that initially registered a [mousedown]{@link PIXI.interaction.InteractionManager#event:mousedown}.
     * 
     * @event mouseupoutside
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a pointing device secondary button (usually a mouse right-button) is released outside the display object that initially 
     * registered a [rightdown]{@link PIXI.interaction.InteractionManager#event:rightdown}.
     * 
     * @event rightupoutside
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a pointing device (usually a mouse) is moved while over the display object
     * 
     * @event mousemove
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a pointing device (usually a mouse) is moved onto the display object
     * 
     * @event mouseover
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a pointing device (usually a mouse) is moved off the display object
     * 
     * @event mouseout
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a touch point is placed on the display object.
     * 
     * @event touchstart
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a touch point is removed from the display object.
     * 
     * @event touchend
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a touch point is placed and removed from the display object.
     * 
     * @event tap
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a touch point is removed outside of the display object that initially registered a [touchstart]{@link PIXI.interaction.InteractionManager#event:touchstart}.
     * 
     * @event touchendoutside
     * @memberof PIXI.interaction.InteractionManager#
     */

    /**
     * Fired when a touch point is moved along the display object.
     * 
     * @event touchmove
     * @memberof PIXI.interaction.InteractionManager#
     */
}

InteractionManager.prototype = Object.create(EventEmitter.prototype);
InteractionManager.prototype.constructor = InteractionManager;
module.exports = InteractionManager;

/**
 * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
 * other DOM elements on top of the renderers Canvas element. With this you'll be bale to deletegate
 * another DOM element to receive those events.
 *
 * @param element {HTMLElement} the DOM element which will receive mouse and touch events.
 * @param [resolution=1] {number} The resolution / device pixel ratio of the new element (relative to the canvas).
 * @private
 */
InteractionManager.prototype.setTargetElement = function (element, resolution)
{
    this.removeEvents();

    this.interactionDOMElement = element;

    this.resolution = resolution || 1;

    this.addEvents();
};

/**
 * Registers all the DOM events
 *
 * @private
 */
InteractionManager.prototype.addEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    core.ticker.shared.add(this.update, this);

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
        this.interactionDOMElement.style['-ms-touch-action'] = 'none';
    }

    window.document.addEventListener('mousemove',    this.onMouseMove, true);
    this.interactionDOMElement.addEventListener('mousedown',    this.onMouseDown, true);
    this.interactionDOMElement.addEventListener('mouseout',     this.onMouseOut, true);
    this.interactionDOMElement.addEventListener('mouseover',    this.onMouseOver, true);

    this.interactionDOMElement.addEventListener('touchstart',   this.onTouchStart, true);
    this.interactionDOMElement.addEventListener('touchend',     this.onTouchEnd, true);
    this.interactionDOMElement.addEventListener('touchmove',    this.onTouchMove, true);

    window.addEventListener('mouseup',  this.onMouseUp, true);

    this.eventsAdded = true;
};

/**
 * Removes all the DOM events that were previously registered
 *
 * @private
 */
InteractionManager.prototype.removeEvents = function ()
{
    if (!this.interactionDOMElement)
    {
        return;
    }

    core.ticker.shared.remove(this.update);

    if (window.navigator.msPointerEnabled)
    {
        this.interactionDOMElement.style['-ms-content-zooming'] = '';
        this.interactionDOMElement.style['-ms-touch-action'] = '';
    }

    window.document.removeEventListener('mousemove', this.onMouseMove, true);
    this.interactionDOMElement.removeEventListener('mousedown', this.onMouseDown, true);
    this.interactionDOMElement.removeEventListener('mouseout',  this.onMouseOut, true);
    this.interactionDOMElement.removeEventListener('mouseover', this.onMouseOver, true);

    this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
    this.interactionDOMElement.removeEventListener('touchend',  this.onTouchEnd, true);
    this.interactionDOMElement.removeEventListener('touchmove', this.onTouchMove, true);

    this.interactionDOMElement = null;

    window.removeEventListener('mouseup',  this.onMouseUp, true);

    this.eventsAdded = false;
};

/**
 * Updates the state of interactive objects.
 * Invoked by a throttled ticker update from
 * {@link PIXI.ticker.shared}.
 *
 * @param deltaTime {number} time delta since last tick
 */
InteractionManager.prototype.update = function (deltaTime)
{
    this._deltaTime += deltaTime;

    if (this._deltaTime < this.interactionFrequency)
    {
        return;
    }

    this._deltaTime = 0;

    if (!this.interactionDOMElement)
    {
        return;
    }

    // if the user move the mouse this check has already been dfone using the mouse move!
    if(this.didMove)
    {
        this.didMove = false;
        return;
    }

    this.cursor = this.defaultCursorStyle;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, true );

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO
};

/**
 * Dispatches an event on the display object that was interacted with
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} the display object in question
 * @param eventString {string} the name of the event (e.g, mousedown)
 * @param eventData {object} the event data object
 * @private
 */
InteractionManager.prototype.dispatchEvent = function ( displayObject, eventString, eventData )
{
    if(!eventData.stopped)
    {
        eventData.target = displayObject;
        eventData.type = eventString;

        displayObject.emit( eventString, eventData );

        if( displayObject[eventString] )
        {
            displayObject[eventString]( eventData );
        }
    }
};

/**
 * Maps x and y coords from a DOM object and maps them correctly to the pixi view. The resulting value is stored in the point.
 * This takes into account the fact that the DOM element could be scaled and positioned anywhere on the screen.
 *
 * @param  {PIXI.Point} point the point that the result will be stored in
 * @param  {number} x     the x coord of the position to map
 * @param  {number} y     the y coord of the position to map
 */
InteractionManager.prototype.mapPositionToPoint = function ( point, x, y )
{
    var rect;
    // IE 11 fix
    if(!this.interactionDOMElement.parentElement)
    {
        rect = { x: 0, y: 0, width: 0, height: 0 };
    } else {
        rect = this.interactionDOMElement.getBoundingClientRect();
    }

    point.x = ( ( x - rect.left ) * (this.interactionDOMElement.width  / rect.width  ) ) / this.resolution;
    point.y = ( ( y - rect.top  ) * (this.interactionDOMElement.height / rect.height ) ) / this.resolution;
};

/**
 * This function is provides a neat way of crawling through the scene graph and running a specified function on all interactive objects it finds.
 * It will also take care of hit testing the interactive objects and passes the hit across in the function.
 *
 * @param point {PIXI.Point} the point that is tested for collision
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} the displayObject that will be hit test (recurcsivly crawls its children)
 * @param [func] {Function} the function that will be called on each interactive object. The displayObject and hit will be passed to the function
 * @param [hitTest] {boolean} this indicates if the objects inside should be hit test against the point
 * @param [interactive] {boolean} Whether the displayObject is interactive
 * @return {boolean} returns true if the displayObject hit the point
 */
InteractionManager.prototype.processInteractive = function (point, displayObject, func, hitTest, interactive)
{
    if(!displayObject || !displayObject.visible)
    {
        return false;
    }

    // Took a little while to rework this function correctly! But now it is done and nice and optimised. ^_^
    //
    // This function will now loop through all objects and then only hit test the objects it HAS to, not all of them. MUCH faster..
    // An object will be hit test if the following is true:
    //
    // 1: It is interactive.
    // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
    //
    // As another little optimisation once an interactive object has been hit we can carry on through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
    // A final optimisation is that an object is not hit test directly if a child has already been hit.

    var hit = false,
        interactiveParent = interactive = displayObject.interactive || interactive;




    // if the displayobject has a hitArea, then it does not need to hitTest children.
    if(displayObject.hitArea)
    {
        interactiveParent = false;
    }

    // it has a mask! Then lets hit test that before continuing..
    if(hitTest && displayObject._mask)
    {
        if(!displayObject._mask.containsPoint(point))
        {
            hitTest = false;
        }
    }

    // it has a filterArea! Same as mask but easier, its a rectangle
    if(hitTest && displayObject.filterArea)
    {
        if(!displayObject.filterArea.contains(point.x, point.y))
        {
            hitTest = false;
        }
    }

    // ** FREE TIP **! If an object is not interactive or has no buttons in it (such as a game scene!) set interactiveChildren to false for that displayObject.
    // This will allow pixi to completly ignore and bypass checking the displayObjects children.
    if(displayObject.interactiveChildren)
    {
        var children = displayObject.children;

        for (var i = children.length-1; i >= 0; i--)
        {
            var child = children[i];

            // time to get recursive.. if this function will return if somthing is hit..
            if(this.processInteractive(point, child, func, hitTest, interactiveParent))
            {
                // its a good idea to check if a child has lost its parent.
                // this means it has been removed whilst looping so its best
                if(!child.parent)
                {
                    continue;
                }

                hit = true;

                // we no longer need to hit test any more objects in this container as we we now know the parent has been hit
                interactiveParent = false;

                // If the child is interactive , that means that the object hit was actually interactive and not just the child of an interactive object.
                // This means we no longer need to hit test anything else. We still need to run through all objects, but we don't need to perform any hit tests.

                //{
                hitTest = false;
                //}

                // we can break now as we have hit an object.
            }
        }
    }



    // no point running this if the item is not interactive or does not have an interactive parent.
    if(interactive)
    {
        // if we are hit testing (as in we have no hit any objects yet)
        // We also don't need to worry about hit testing if once of the displayObjects children has already been hit!
        if(hitTest && !hit)
        {

            if(displayObject.hitArea)
            {
                displayObject.worldTransform.applyInverse(point,  this._tempPoint);
                hit = displayObject.hitArea.contains( this._tempPoint.x, this._tempPoint.y );
            }
            else if(displayObject.containsPoint)
            {
                hit = displayObject.containsPoint(point);
            }


        }

        if(displayObject.interactive)
        {
            func(displayObject, hit);
        }
    }

    return hit;

};


/**
 * Is called when the mouse button is pressed down on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being pressed down
 * @private
 */
InteractionManager.prototype.onMouseDown = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    if (this.autoPreventDefault)
    {
        this.mouse.originalEvent.preventDefault();
    }

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseDown, true );

    var isRightButton = event.button === 2 || event.which === 3;
    this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
};

/**
 * Processes the result of the mouse down check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the dispay object
 * @private
 */
InteractionManager.prototype.processMouseDown = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;

    if(hit)
    {
        displayObject[ isRightButton ? '_isRightDown' : '_isLeftDown' ] = true;
        this.dispatchEvent( displayObject, isRightButton ? 'rightdown' : 'mousedown', this.eventData );
    }
};

/**
 * Is called when the mouse button is released on the renderer element
 *
 * @param event {Event} The DOM event of a mouse button being released
 * @private
 */
InteractionManager.prototype.onMouseUp = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseUp, true );

    var isRightButton = event.button === 2 || event.which === 3;
    this.emit(isRightButton ? 'rightup' : 'mouseup', this.eventData);
};

/**
 * Processes the result of the mouse up check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseUp = function ( displayObject, hit )
{
    var e = this.mouse.originalEvent;

    var isRightButton = e.button === 2 || e.which === 3;
    var isDown =  isRightButton ? '_isRightDown' : '_isLeftDown';

    if(hit)
    {
        this.dispatchEvent( displayObject, isRightButton ? 'rightup' : 'mouseup', this.eventData );

        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightclick' : 'click', this.eventData );
        }
    }
    else
    {
        if( displayObject[ isDown ] )
        {
            displayObject[ isDown ] = false;
            this.dispatchEvent( displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', this.eventData );
        }
    }
};


/**
 * Is called when the mouse moves across the renderer element
 *
 * @param event {Event} The DOM event of the mouse moving
 * @private
 */
InteractionManager.prototype.onMouseMove = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.didMove = true;

    this.cursor = this.defaultCursorStyle;

    this.processInteractive(this.mouse.global, this.renderer._lastObjectRendered, this.processMouseMove, true );

    this.emit('mousemove', this.eventData);

    if (this.currentCursorStyle !== this.cursor)
    {
        this.currentCursorStyle = this.cursor;
        this.interactionDOMElement.style.cursor = this.cursor;
    }

    //TODO BUG for parents ineractive object (border order issue)
};

/**
 * Processes the result of the mouse move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseMove = function ( displayObject, hit )
{
    this.processMouseOverOut(displayObject, hit);

    // only display on mouse over
    if(!this.moveWhenInside || hit)
    {
        this.dispatchEvent( displayObject, 'mousemove', this.eventData);
    }
};


/**
 * Is called when the mouse is moved out of the renderer element
 *
 * @param event {Event} The DOM event of a mouse being moved out
 * @private
 */
InteractionManager.prototype.onMouseOut = function (event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

    // Update internal mouse reference
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY);

    this.interactionDOMElement.style.cursor = this.defaultCursorStyle;

    // TODO optimize by not check EVERY TIME! maybe half as often? //
    this.mapPositionToPoint( this.mouse.global, event.clientX, event.clientY );

    this.processInteractive( this.mouse.global, this.renderer._lastObjectRendered, this.processMouseOverOut, false );

    this.emit('mouseout', this.eventData);
};

/**
 * Processes the result of the mouse over/out check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processMouseOverOut = function ( displayObject, hit )
{
    if(hit)
    {
        if(!displayObject._over)
        {
            displayObject._over = true;
            this.dispatchEvent( displayObject, 'mouseover', this.eventData );
        }

        if (displayObject.buttonMode)
        {
            this.cursor = displayObject.defaultCursor;
        }
    }
    else
    {
        if(displayObject._over)
        {
            displayObject._over = false;
            this.dispatchEvent( displayObject, 'mouseout', this.eventData);
        }
    }
};

/**
 * Is called when the mouse enters the renderer element area
 *
 * @param event {Event} The DOM event of the mouse moving into the renderer view
 * @private
 */
InteractionManager.prototype.onMouseOver = function(event)
{
    this.mouse.originalEvent = event;
    this.eventData.data = this.mouse;
    this.eventData.stopped = false;

	this.emit('mouseover', this.eventData);
};


/**
 * Is called when a touch is started on the renderer element
 *
 * @param event {Event} The DOM event of a touch starting on the renderer view
 * @private
 */
InteractionManager.prototype.onTouchStart = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];
        //TODO POOL
        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.eventData.data = touchData;
        this.eventData.stopped = false;

        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchStart, true );

        this.emit('touchstart', this.eventData);

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of a touch check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchStart = function ( displayObject, hit )
{
    if(hit)
    {
        displayObject._touchDown = true;
        this.dispatchEvent( displayObject, 'touchstart', this.eventData );
    }
};


/**
 * Is called when a touch ends on the renderer element
 *
 * @param event {Event} The DOM event of a touch ending on the renderer view
 * @private
 */
InteractionManager.prototype.onTouchEnd = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        //TODO this should be passed along.. no set
        this.eventData.data = touchData;
        this.eventData.stopped = false;


        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchEnd, true );

        this.emit('touchend', this.eventData);

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of the end of a touch and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchEnd = function ( displayObject, hit )
{
    if(hit)
    {
        this.dispatchEvent( displayObject, 'touchend', this.eventData );

        if( displayObject._touchDown )
        {
            displayObject._touchDown = false;
            this.dispatchEvent( displayObject, 'tap', this.eventData );
        }
    }
    else
    {
        if( displayObject._touchDown )
        {
            displayObject._touchDown = false;
            this.dispatchEvent( displayObject, 'touchendoutside', this.eventData );
        }
    }
};

/**
 * Is called when a touch is moved across the renderer element
 *
 * @param event {Event} The DOM event of a touch moving across the renderer view
 * @private
 */
InteractionManager.prototype.onTouchMove = function (event)
{
    if (this.autoPreventDefault)
    {
        event.preventDefault();
    }

    var changedTouches = event.changedTouches;
    var cLength = changedTouches.length;

    for (var i=0; i < cLength; i++)
    {
        var touchEvent = changedTouches[i];

        var touchData = this.getTouchData( touchEvent );

        touchData.originalEvent = event;

        this.eventData.data = touchData;
        this.eventData.stopped = false;

        this.processInteractive( touchData.global, this.renderer._lastObjectRendered, this.processTouchMove, this.moveWhenInside );

        this.emit('touchmove', this.eventData);

        this.returnTouchData( touchData );
    }
};

/**
 * Processes the result of a touch move check and dispatches the event if need be
 *
 * @param displayObject {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} The display object that was tested
 * @param hit {boolean} the result of the hit test on the display object
 * @private
 */
InteractionManager.prototype.processTouchMove = function ( displayObject, hit )
{
    if(!this.moveWhenInside || hit)
    {
        this.dispatchEvent( displayObject, 'touchmove', this.eventData);
    }
};

/**
 * Grabs an interaction data object from the internal pool
 *
 * @param touchEvent {object} The touch event we need to pair with an interactionData object
 *
 * @private
 */
InteractionManager.prototype.getTouchData = function (touchEvent)
{
    var touchData = this.interactiveDataPool.pop();

    if(!touchData)
    {
        touchData = new InteractionData();
    }

    touchData.identifier = touchEvent.identifier;
    this.mapPositionToPoint( touchData.global, touchEvent.clientX, touchEvent.clientY );

    if(navigator.isCocoonJS)
    {
        touchData.global.x = touchData.global.x / this.resolution;
        touchData.global.y = touchData.global.y / this.resolution;
    }

    touchEvent.globalX = touchData.global.x;
    touchEvent.globalY = touchData.global.y;

    return touchData;
};

/**
 * Returns an interaction data object to the internal pool
 *
 * @param touchData {PIXI.interaction.InteractionData} The touch data object we want to return to the pool
 *
 * @private
 */
InteractionManager.prototype.returnTouchData = function ( touchData )
{
    this.interactiveDataPool.push( touchData );
};

/**
 * Destroys the interaction manager
 *
 */
InteractionManager.prototype.destroy = function () {
    this.removeEvents();

    this.removeAllListeners();

    this.renderer = null;

    this.mouse = null;

    this.eventData = null;

    this.interactiveDataPool = null;

    this.interactionDOMElement = null;

    this.onMouseUp = null;
    this.processMouseUp = null;


    this.onMouseDown = null;
    this.processMouseDown = null;

    this.onMouseMove = null;
    this.processMouseMove = null;

    this.onMouseOut = null;
    this.processMouseOverOut = null;

    this.onMouseOver = null;

    this.onTouchStart = null;
    this.processTouchStart = null;

    this.onTouchEnd = null;
    this.processTouchEnd = null;

    this.onTouchMove = null;
    this.processTouchMove = null;

    this._tempPoint = null;
};

core.WebGLRenderer.registerPlugin('interaction', InteractionManager);
core.CanvasRenderer.registerPlugin('interaction', InteractionManager);

},{"../core":97,"./InteractionData":178,"./interactiveTarget":181,"eventemitter3":32}],180:[function(require,module,exports){
/**
 * @file        Main export of the PIXI interactions library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.interaction
 */
module.exports = {
    InteractionData:    require('./InteractionData'),
    InteractionManager: require('./InteractionManager'),
    interactiveTarget:  require('./interactiveTarget')
};

},{"./InteractionData":178,"./InteractionManager":179,"./interactiveTarget":181}],181:[function(require,module,exports){
/**
 * Default property values of interactive objects
 * Used by {@link PIXI.interaction.InteractionManager} to automatically give all DisplayObjects these properties
 *
 * @mixin
 * @memberof PIXI.interaction
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          MyObject.prototype,
 *          PIXI.interaction.interactiveTarget
 *      );
 */
var interactiveTarget = {
    /**
     * Determines if the displayObject be clicked/touched
     * 
     * @inner {boolean}
     */
    interactive: false,
    
    /**
     * Determines if the children to the displayObject can be clicked/touched
     * Setting this to false allows pixi to bypass a recursive hitTest function 
     * 
     * @inner {boolean}
     */
    interactiveChildren: true,
    
    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
     * 
     * @inner {PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle}
     */
    hitArea: null,
    
    /**
     * If enabled, the mouse cursor will change when hovered over the displayObject if it is interactive 
     *
     * @inner {boolean}
     */
    buttonMode: false,
    
    /**
     * If buttonMode is enabled, this defines what CSS cursor property is used when the mouse cursor is hovered over the displayObject
     * https://developer.mozilla.org/en/docs/Web/CSS/cursor
     *  
     * @inner {string}
     */
    defaultCursor: 'pointer',

    // some internal checks..
    /**
     * Internal check to detect if the mouse cursor is hovered over the displayObject
     * 
     * @inner {boolean}
     * @private
     */
    _over: false,
        
    /**
     * Internal check to detect if the left mouse button is pressed on the displayObject
     * 
     * @inner {boolean}
     * @private
     */
    _isLeftDown: false,
    
    /**
     * Internal check to detect if the right mouse button is pressed on the displayObject
     * 
     * @inner {boolean}
     * @private
     */
    _isRightDown: false,
    
    /**
     * Internal check to detect if a user has touched the displayObject
     * 
     * @inner {boolean}
     * @private
     */
    _touchDown: false
 };

module.exports = interactiveTarget;

},{}],182:[function(require,module,exports){
var Resource = require('resource-loader').Resource,
    core = require('../core'),
    extras = require('../extras'),
    path = require('path');


function parse(resource, texture) {
    var data = {};
    var info = resource.data.getElementsByTagName('info')[0];
    var common = resource.data.getElementsByTagName('common')[0];

    data.font = info.getAttribute('face');
    data.size = parseInt(info.getAttribute('size'), 10);
    data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
    data.chars = {};

    //parse letters
    var letters = resource.data.getElementsByTagName('char');

    for (var i = 0; i < letters.length; i++)
    {
        var charCode = parseInt(letters[i].getAttribute('id'), 10);

        var textureRect = new core.Rectangle(
            parseInt(letters[i].getAttribute('x'), 10) + texture.frame.x,
            parseInt(letters[i].getAttribute('y'), 10) + texture.frame.y,
            parseInt(letters[i].getAttribute('width'), 10),
            parseInt(letters[i].getAttribute('height'), 10)
        );

        data.chars[charCode] = {
            xOffset: parseInt(letters[i].getAttribute('xoffset'), 10),
            yOffset: parseInt(letters[i].getAttribute('yoffset'), 10),
            xAdvance: parseInt(letters[i].getAttribute('xadvance'), 10),
            kerning: {},
            texture: new core.Texture(texture.baseTexture, textureRect)

        };
    }

    //parse kernings
    var kernings = resource.data.getElementsByTagName('kerning');
    for (i = 0; i < kernings.length; i++)
    {
        var first = parseInt(kernings[i].getAttribute('first'), 10);
        var second = parseInt(kernings[i].getAttribute('second'), 10);
        var amount = parseInt(kernings[i].getAttribute('amount'), 10);

        if(data.chars[second])
        {
            data.chars[second].kerning[first] = amount;
        }
    }

    resource.bitmapFont = data;

    // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
    // but it's very likely to change
    extras.BitmapText.fonts[data.font] = data;
}


module.exports = function ()
{
    return function (resource, next)
    {
        // skip if no data or not xml data
        if (!resource.data || !resource.isXml)
        {
            return next();
        }

        // skip if not bitmap font data, using some silly duck-typing
        if (
            resource.data.getElementsByTagName('page').length === 0 ||
            resource.data.getElementsByTagName('info').length === 0 ||
            resource.data.getElementsByTagName('info')[0].getAttribute('face') === null
            )
        {
            return next();
        }

        var xmlUrl = !resource.isDataUrl ? path.dirname(resource.url) : '';

        if (resource.isDataUrl) {
            if (xmlUrl === '.') {
                xmlUrl = '';
            }

            if (this.baseUrl && xmlUrl) {
                // if baseurl has a trailing slash then add one to xmlUrl so the replace works below
                if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/') {
                    xmlUrl += '/';
                }

                // remove baseUrl from xmlUrl
                xmlUrl = xmlUrl.replace(this.baseUrl, '');
            }
        }
        
        // if there is an xmlUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/') {
            xmlUrl += '/';
        }
        
        var textureUrl = xmlUrl + resource.data.getElementsByTagName('page')[0].getAttribute('file');
        if (core.utils.TextureCache[textureUrl]) {
            //reuse existing texture
            parse(resource, core.utils.TextureCache[textureUrl]);
            next();
        }
        else {
            var loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: Resource.LOAD_TYPE.IMAGE,
                metadata: resource.metadata.imageMetadata
            };
            // load the texture for the font
            this.add(resource.name + '_image', textureUrl, loadOptions, function (res) {
                parse(resource, res.texture);
                next();
            });
        }
    };
};

},{"../core":97,"../extras":164,"path":60,"resource-loader":69}],183:[function(require,module,exports){
/**
 * @file        Main export of the PIXI loaders library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.loaders
 */
module.exports = {
    Loader:             require('./loader'),

    // parsers
    bitmapFontParser:   require('./bitmapFontParser'),
    spritesheetParser:  require('./spritesheetParser'),
    textureParser:      require('./textureParser'),
    Resource:           require('resource-loader').Resource
};

},{"./bitmapFontParser":182,"./loader":184,"./spritesheetParser":185,"./textureParser":186,"resource-loader":69}],184:[function(require,module,exports){
var ResourceLoader = require('resource-loader'),
    textureParser = require('./textureParser'),
    spritesheetParser = require('./spritesheetParser'),
    bitmapFontParser = require('./bitmapFontParser');

/**
 *
 * The new loader, extends Resource Loader by Chad Engler : https://github.com/englercj/resource-loader
 *
 * ```js
 * var loader = PIXI.loader; // pixi exposes a premade instance for you to use.
 * //or
 * var loader = new PIXI.loaders.Loader(); // you can also create your own if you want
 *
 * loader.add('bunny',"data/bunny.png");
 *
 * loader.once('complete',onAssetsLoaded);
 *
 * loader.load();
 * ```
 *
 * @class
 * @extends module:resource-loader.ResourceLoader
 * @memberof PIXI.loaders
 * @param [baseUrl=''] {string} The base url for all resources loaded by this loader.
 * @param [concurrency=10] {number} The number of resources to load concurrently.
 * @see https://github.com/englercj/resource-loader
 */
function Loader(baseUrl, concurrency)
{
    ResourceLoader.call(this, baseUrl, concurrency);

    for (var i = 0; i < Loader._pixiMiddleware.length; ++i) {
        this.use(Loader._pixiMiddleware[i]());
    }
}

Loader.prototype = Object.create(ResourceLoader.prototype);
Loader.prototype.constructor = Loader;

module.exports = Loader;

Loader._pixiMiddleware = [
    // parse any blob into more usable objects (e.g. Image)
    ResourceLoader.middleware.parsing.blob,
    // parse any Image objects into textures
    textureParser,
    // parse any spritesheet data into multiple textures
    spritesheetParser,
    // parse any spritesheet data into multiple textures
    bitmapFontParser
];

Loader.addPixiMiddleware = function (fn) {
    Loader._pixiMiddleware.push(fn);
};

// Add custom extentions
var Resource = ResourceLoader.Resource;

Resource.setExtensionXhrType('fnt', Resource.XHR_RESPONSE_TYPE.DOCUMENT);

},{"./bitmapFontParser":182,"./spritesheetParser":185,"./textureParser":186,"resource-loader":69}],185:[function(require,module,exports){
var Resource = require('resource-loader').Resource,
    path = require('path'),
    core = require('../core');

var BATCH_SIZE = 1000;

module.exports = function ()
{
    return function (resource, next)
    {
        var resourcePath;
        var imageResourceName = resource.name + '_image';

        // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
        if (!resource.data || !resource.isJson || !resource.data.frames || this.resources[imageResourceName])
        {
            return next();
        }

        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: Resource.LOAD_TYPE.IMAGE,
            metadata: resource.metadata.imageMetadata
        };

        // Prepend url path unless the resource image is a data url
        if (resource.isDataUrl)
        {
            resourcePath = resource.data.meta.image;
        }
        else
        {
            resourcePath = path.dirname(resource.url.replace(this.baseUrl, '')) + '/' + resource.data.meta.image;
        }

        // load the image for this sheet
        this.add(imageResourceName, resourcePath, loadOptions, function (res)
        {
            resource.textures = {};

            var frames = resource.data.frames;
            var frameKeys = Object.keys(frames);
            var resolution = core.utils.getResolutionOfUrl(resource.url);
            var batchIndex = 0;

            function processFrames(initialFrameIndex, maxFrames)
            {
                var frameIndex = initialFrameIndex;

                while (frameIndex - initialFrameIndex < maxFrames && frameIndex < frameKeys.length)
                {
                    var i = frameKeys[frameIndex];
                    var rect = frames[i].frame;

                    if (rect)
                    {

                        var frame = null;
                        var trim = null;
                        var orig = new core.Rectangle(0, 0, frames[i].sourceSize.w / resolution, frames[i].sourceSize.h / resolution);

                        if (frames[i].rotated) {
                            frame = new core.Rectangle(rect.x / resolution, rect.y / resolution, rect.h / resolution, rect.w / resolution);
                        }
                        else {
                            frame = new core.Rectangle(rect.x / resolution, rect.y / resolution, rect.w / resolution, rect.h / resolution);
                        }

                        //  Check to see if the sprite is trimmed
                        if (frames[i].trimmed)
                        {
                            trim = new core.Rectangle(
                                frames[i].spriteSourceSize.x / resolution,
                                frames[i].spriteSourceSize.y / resolution,
                                frames[i].spriteSourceSize.w / resolution,
                                frames[i].spriteSourceSize.h / resolution
                             );
                        }

                        resource.textures[i] = new core.Texture(res.texture.baseTexture, frame, orig, trim, frames[i].rotated ? 2 : 0);

                        // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                        core.utils.TextureCache[i] = resource.textures[i];

                    }

                    frameIndex++;
                }
            }

            function shouldProcessNextBatch()
            {
                return batchIndex * BATCH_SIZE < frameKeys.length;
            }

            function processNextBatch(done)
            {
                processFrames(batchIndex * BATCH_SIZE, BATCH_SIZE);
                batchIndex++;
                setTimeout(done, 0);
            }

            function iteration() {
                processNextBatch(function() {
                    if (shouldProcessNextBatch()) {
                        iteration();
                    } else {
                        next();
                    }
                });
            }

            if (frameKeys.length <= BATCH_SIZE)
            {
                processFrames(0, BATCH_SIZE);
                next();
            }
            else
            {
                iteration();
            }
        });
    };
};

},{"../core":97,"path":60,"resource-loader":69}],186:[function(require,module,exports){
var core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // create a new texture if the data is an Image object
        if (resource.data && resource.isImage)
        {
            var baseTexture = new core.BaseTexture(resource.data, null, core.utils.getResolutionOfUrl(resource.url));
            baseTexture.imageUrl = resource.url;
            resource.texture = new core.Texture(baseTexture);
            // lets also add the frame to pixi's global cache for fromFrame and fromImage fucntions
            core.utils.BaseTextureCache[resource.url] = baseTexture;
            core.utils.TextureCache[resource.url] = resource.texture;
        }

        next();
    };
};

},{"../core":97}],187:[function(require,module,exports){
var core = require('../core'),
    glCore = require('pixi-gl-core'),
    Shader = require('./webgl/MeshShader'),
    tempPoint = new core.Point(),
    tempPolygon = new core.Polygon();

/**
 * Base mesh class
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.mesh
 * @param texture {PIXI.Texture} The texture to use
 * @param [vertices] {Float32Array} if you want to specify the vertices
 * @param [uvs] {Float32Array} if you want to specify the uvs
 * @param [indices] {Uint16Array} if you want to specify the indices
 * @param [drawMode] {number} the drawMode, can be any of the Mesh.DRAW_MODES consts
 */
function Mesh(texture, vertices, uvs, indices, drawMode)
{
    core.Container.call(this);

    /**
     * The texture of the Mesh
     *
     * @member {PIXI.Texture}
     * @private
     */
    this._texture = null;

    /**
     * The Uvs of the Mesh
     *
     * @member {Float32Array}
     */
    this.uvs = uvs || new Float32Array([0, 0,
        1, 0,
        1, 1,
        0, 1]);

    /**
     * An array of vertices
     *
     * @member {Float32Array}
     */
    this.vertices = vertices || new Float32Array([0, 0,
        100, 0,
        100, 100,
        0, 100]);

    /*
     * @member {Uint16Array} An array containing the indices of the vertices
     */
    //  TODO auto generate this based on draw mode!
    this.indices = indices || new Uint16Array([0, 1, 3, 2]);

    /**
     * Whether the Mesh is dirty or not
     *
     * @member {number}
     */
    this.dirty = 0;
    this.indexDirty = 0;

    /**
     * The blend mode to be applied to the sprite. Set to `PIXI.BLEND_MODES.NORMAL` to remove any blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = core.BLEND_MODES.NORMAL;

    /**
     * Triangles in canvas mode are automatically antialiased, use this value to force triangles to overlap a bit with each other.
     *
     * @member {number}
     */
    this.canvasPadding = 0;

    /**
     * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.Mesh.DRAW_MODES} consts
     *
     * @member {number}
     * @see PIXI.mesh.Mesh.DRAW_MODES
     */
    this.drawMode = drawMode || Mesh.DRAW_MODES.TRIANGLE_MESH;

    // run texture setter;
    this.texture = texture;

     /**
     * The default shader that is used if a mesh doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;


    /**
     * The tint applied to the mesh. This is a [r,g,b] value. A value of [1,1,1] will remove any tint effect.
     *
     * @member {number}
     * @memberof PIXI.mesh.Mesh#
     */
    this.tintRgb = new Float32Array([1, 1, 1]);

    this._glDatas = [];
}

// constructor
Mesh.prototype = Object.create(core.Container.prototype);
Mesh.prototype.constructor = Mesh;
module.exports = Mesh;

Object.defineProperties(Mesh.prototype, {
    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     * @memberof PIXI.mesh.Mesh#
     */
    texture: {
        get: function ()
        {
            return  this._texture;
        },
        set: function (value)
        {
            if (this._texture === value)
            {
                return;
            }

            this._texture = value;

            if (value)
            {
                // wait for the texture to load
                if (value.baseTexture.hasLoaded)
                {
                    this._onTextureUpdate();
                }
                else
                {
                    value.once('update', this._onTextureUpdate, this);
                }
            }
        }
    },
    /**
     * The tint applied to the mesh. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @memberof PIXI.mesh.Mesh#
     * @default 0xFFFFFF
     */
    tint: {
        get: function() {
            return core.utils.rgb2hex(this.tintRgb);
        },
        set: function(value) {
            this.tintRgb = core.utils.hex2rgb(value, this.tintRgb);
        }
    }
});

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} a reference to the WebGL renderer
 * @private
 */
Mesh.prototype._renderWebGL = function (renderer)
{
    // get rid of any thing that may be batching.
    renderer.flush();

    //  renderer.plugins.mesh.render(this);
    var gl = renderer.gl;
    var glData = this._glDatas[renderer.CONTEXT_UID];

    if(!glData)
    {
        glData = {
            shader:new Shader(gl),
            vertexBuffer:glCore.GLBuffer.createVertexBuffer(gl, this.vertices, gl.STREAM_DRAW),
            uvBuffer:glCore.GLBuffer.createVertexBuffer(gl, this.uvs, gl.STREAM_DRAW),
            indexBuffer:glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW),
            // build the vao object that will render..
            vao:new glCore.VertexArrayObject(gl),
            dirty:this.dirty,
            indexDirty:this.indexDirty
        };

        // build the vao object that will render..
        glData.vao = new glCore.VertexArrayObject(gl)
        .addIndex(glData.indexBuffer)
        .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
        .addAttribute(glData.uvBuffer, glData.shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);

        this._glDatas[renderer.CONTEXT_UID] = glData;


    }

    if(this.dirty !== glData.dirty)
    {
        glData.dirty = this.dirty;
        glData.uvBuffer.upload();

    }

    if(this.indexDirty !== glData.indexDirty)
    {
        glData.indexDirty = this.indexDirty;
        glData.indexBuffer.upload();
    }

    glData.vertexBuffer.upload();

    renderer.bindShader(glData.shader);
    renderer.bindTexture(this._texture, 0);
    renderer.state.setBlendMode(this.blendMode);

    glData.shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
    glData.shader.uniforms.alpha = this.worldAlpha;
    glData.shader.uniforms.tint = this.tintRgb;

    var drawMode = this.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

    glData.vao.bind()
    .draw(drawMode, this.indices.length)
    .unbind();
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
Mesh.prototype._renderCanvas = function (renderer)
{
    var context = renderer.context;

    var transform = this.worldTransform;
    var res = renderer.resolution;

    if (renderer.roundPixels)
    {
        context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, (transform.tx * res) | 0, (transform.ty * res) | 0);
    }
    else
    {
        context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res, transform.ty * res);
    }

    if (this.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH)
    {
        this._renderCanvasTriangleMesh(context);
    }
    else
    {
        this._renderCanvasTriangles(context);
    }
};

/**
 * Draws the object in Triangle Mesh mode using canvas
 *
 * @param context {CanvasRenderingContext2D} the current drawing context
 * @private
 */
Mesh.prototype._renderCanvasTriangleMesh = function (context)
{
    // draw triangles!!
    var vertices = this.vertices;
    var uvs = this.uvs;

    var length = vertices.length / 2;
    // this.count++;

    for (var i = 0; i < length - 2; i++)
    {
        // draw some triangles!
        var index = i * 2;
        this._renderCanvasDrawTriangle(context, vertices, uvs, index, (index + 2), (index + 4));
    }
};

/**
 * Draws the object in triangle mode using canvas
 *
 * @param context {CanvasRenderingContext2D} the current drawing context
 * @private
 */
Mesh.prototype._renderCanvasTriangles = function (context)
{
    // draw triangles!!
    var vertices = this.vertices;
    var uvs = this.uvs;
    var indices = this.indices;

    var length = indices.length;
    // this.count++;

    for (var i = 0; i < length; i += 3)
    {
        // draw some triangles!
        var index0 = indices[i] * 2, index1 = indices[i + 1] * 2, index2 = indices[i + 2] * 2;
        this._renderCanvasDrawTriangle(context, vertices, uvs, index0, index1, index2);
    }
};

/**
 * Draws one of the triangles that form this Mesh
 *
 * @param context {CanvasRenderingContext2D} the current drawing context
 * @param vertices {Float32Array} a reference to the vertices of the Mesh
 * @param uvs {Float32Array} a reference to the uvs of the Mesh
 * @param index0 {number} the index of the first vertex
 * @param index1 {number} the index of the second vertex
 * @param index2 {number} the index of the third vertex
 * @private
 */
Mesh.prototype._renderCanvasDrawTriangle = function (context, vertices, uvs, index0, index1, index2)
{
    var base = this._texture.baseTexture;
    var textureSource = base.source;
    var textureWidth = base.width;
    var textureHeight = base.height;

    var x0 = vertices[index0], x1 = vertices[index1], x2 = vertices[index2];
    var y0 = vertices[index0 + 1], y1 = vertices[index1 + 1], y2 = vertices[index2 + 1];

    var u0 = uvs[index0] * base.width, u1 = uvs[index1] * base.width, u2 = uvs[index2] * base.width;
    var v0 = uvs[index0 + 1] * base.height, v1 = uvs[index1 + 1] * base.height, v2 = uvs[index2 + 1] * base.height;

    if (this.canvasPadding > 0)
    {
        var paddingX = this.canvasPadding / this.worldTransform.a;
        var paddingY = this.canvasPadding / this.worldTransform.d;
        var centerX = (x0 + x1 + x2) / 3;
        var centerY = (y0 + y1 + y2) / 3;

        var normX = x0 - centerX;
        var normY = y0 - centerY;

        var dist = Math.sqrt(normX * normX + normY * normY);
        x0 = centerX + (normX / dist) * (dist + paddingX);
        y0 = centerY + (normY / dist) * (dist + paddingY);

        //

        normX = x1 - centerX;
        normY = y1 - centerY;

        dist = Math.sqrt(normX * normX + normY * normY);
        x1 = centerX + (normX / dist) * (dist + paddingX);
        y1 = centerY + (normY / dist) * (dist + paddingY);

        normX = x2 - centerX;
        normY = y2 - centerY;

        dist = Math.sqrt(normX * normX + normY * normY);
        x2 = centerX + (normX / dist) * (dist + paddingX);
        y2 = centerY + (normY / dist) * (dist + paddingY);
    }

    context.save();
    context.beginPath();


    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);

    context.closePath();

    context.clip();

    // Compute matrix transform
    var delta =  (u0 * v1)      + (v0 * u2)      + (u1 * v2)      - (v1 * u2)      - (v0 * u1)      - (u0 * v2);
    var deltaA = (x0 * v1)      + (v0 * x2)      + (x1 * v2)      - (v1 * x2)      - (v0 * x1)      - (x0 * v2);
    var deltaB = (u0 * x1)      + (x0 * u2)      + (u1 * x2)      - (x1 * u2)      - (x0 * u1)      - (u0 * x2);
    var deltaC = (u0 * v1 * x2) + (v0 * x1 * u2) + (x0 * u1 * v2) - (x0 * v1 * u2) - (v0 * u1 * x2) - (u0 * x1 * v2);
    var deltaD = (y0 * v1)      + (v0 * y2)      + (y1 * v2)      - (v1 * y2)      - (v0 * y1)      - (y0 * v2);
    var deltaE = (u0 * y1)      + (y0 * u2)      + (u1 * y2)      - (y1 * u2)      - (y0 * u1)      - (u0 * y2);
    var deltaF = (u0 * v1 * y2) + (v0 * y1 * u2) + (y0 * u1 * v2) - (y0 * v1 * u2) - (v0 * u1 * y2) - (u0 * y1 * v2);

    context.transform(deltaA / delta, deltaD / delta,
        deltaB / delta, deltaE / delta,
        deltaC / delta, deltaF / delta);

    context.drawImage(textureSource, 0, 0, textureWidth * base.resolution, textureHeight * base.resolution, 0, 0, textureWidth, textureHeight);
    context.restore();
};



/**
 * Renders a flat Mesh
 *
 * @param Mesh {PIXI.mesh.Mesh} The Mesh to render
 * @private
 */
Mesh.prototype.renderMeshFlat = function (Mesh)
{
    var context = this.context;
    var vertices = Mesh.vertices;

    var length = vertices.length/2;
    // this.count++;

    context.beginPath();
    for (var i=1; i < length-2; i++)
    {
        // draw some triangles!
        var index = i*2;

        var x0 = vertices[index],   x1 = vertices[index+2], x2 = vertices[index+4];
        var y0 = vertices[index+1], y1 = vertices[index+3], y2 = vertices[index+5];

        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
    }

    context.fillStyle = '#FF0000';
    context.fill();
    context.closePath();
};

/**
 * When the texture is updated, this event will fire to update the scale and frame
 *
 * @private
 */
Mesh.prototype._onTextureUpdate = function ()
{

};

/**
 * Returns the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @param [matrix=this.worldTransform] {PIXI.Matrix} the transformation matrix of the sprite
 * @return {PIXI.Rectangle} the framing rectangle
 */
Mesh.prototype._calculateBounds = function ()
{
    //TODO - we can cache local bounds and use them if they are dirty (like graphics)
    this._bounds.addVertices(this.transform, this.vertices, 0, this.vertices.length);
};

/**
 * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
 *
 * @param point {PIXI.Point} the point to test
 * @return {boolean} the result of the test
 */
Mesh.prototype.containsPoint = function( point ) {
    if (!this.getBounds().contains(point.x, point.y)) {
        return false;
    }
    this.worldTransform.applyInverse(point,  tempPoint);

    var vertices = this.vertices;
    var points = tempPolygon.points;

    var indices = this.indices;
    var len = this.indices.length;
    var step = this.drawMode === Mesh.DRAW_MODES.TRIANGLES ? 3 : 1;
    for (var i=0;i+2<len;i+=step) {
        var ind0 = indices[i]*2, ind1 = indices[i+1]*2, ind2 = indices[i+2]*2;
        points[0] = vertices[ind0];
        points[1] = vertices[ind0+1];
        points[2] = vertices[ind1];
        points[3] = vertices[ind1+1];
        points[4] = vertices[ind2];
        points[5] = vertices[ind2+1];
        if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
            return true;
        }
    }
    return false;
};

/**
 * Different drawing buffer modes supported
 *
 * @static
 * @constant
 * @property {object} DRAW_MODES
 * @property {number} DRAW_MODES.TRIANGLE_MESH
 * @property {number} DRAW_MODES.TRIANGLES
 */
Mesh.DRAW_MODES = {
    TRIANGLE_MESH: 0,
    TRIANGLES: 1
};

},{"../core":97,"./webgl/MeshShader":192,"pixi-gl-core":7}],188:[function(require,module,exports){
var DEFAULT_BORDER_SIZE= 10;

var Plane = require('./Plane');

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *  
 *```js
 * var Plane9 = new PIXI.NineSlicePlane(PIXI.Texture.fromImage('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 *  ```
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+

 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 *
 * @class
 * @extends PIXI.mesh.Plane
 * @memberof PIXI.mesh
 * @param {PIXI.Texture} texture - The texture to use on the NineSlicePlane.
 * @param {int} [leftWidth=10] size of the left vertical bar (A)
 * @param {int} [topHeight=10] size of the top horizontal bar (C)
 * @param {int} [rightWidth=10] size of the right vertical bar (B)
 * @param {int} [bottomHeight=10] size of the bottom horizontal bar (D)
 *
 */
function NineSlicePlane(texture, leftWidth, topHeight, rightWidth, bottomHeight)
{
    Plane.call(this, texture, 4, 4);

    var uvs = this.uvs;
    // right and bottom uv's are always 1
    uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
    uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;

    this._origWidth = texture.width;
    this._origHeight = texture.height;
    this._uvw = 1 / this._origWidth;
    this._uvh = 1 / this._origHeight;
    /**
     * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     * @memberof PIXI.NineSlicePlane#
     * @override
     */
    this.width = texture.width;
    /**
     * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     * @memberof PIXI.NineSlicePlane#
     * @override
     */
    this.height = texture.height;

    uvs[2] = uvs[10] = uvs[18] = uvs[26] = this._uvw * leftWidth;
    uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - this._uvw * rightWidth;
    uvs[9] = uvs[11] = uvs[13] = uvs[15] = this._uvh * topHeight;
    uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - this._uvh * bottomHeight;

    /**
     * The width of the left column (a)
     *
     * @member {number}
     */
    this.leftWidth = typeof leftWidth !== 'undefined' ? leftWidth : DEFAULT_BORDER_SIZE;
    /**
     * The width of the right column (b)
     *
     * @member {number}
     */
    this.rightWidth = typeof rightWidth !== 'undefined' ? rightWidth : DEFAULT_BORDER_SIZE;
    /**
     * The height of the top row (c)
     *
     * @member {number}
     */
    this.topHeight = typeof topHeight !== 'undefined' ? topHeight : DEFAULT_BORDER_SIZE;
    /**
     * The height of the bottom row (d)
     *
     * @member {number}
     */
    this.bottomHeight = typeof bottomHeight !== 'undefined' ? bottomHeight : DEFAULT_BORDER_SIZE;
}


// constructor
NineSlicePlane.prototype = Object.create( Plane.prototype );
NineSlicePlane.prototype.constructor = NineSlicePlane;
module.exports = NineSlicePlane;

Object.defineProperties(NineSlicePlane.prototype, {
    /**
     * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     * @memberof PIXI.NineSlicePlane#
     * @override
     */
    width: {
        get: function ()
        {
            return this._width;
        },
        set: function (value)
        {
            this._width = value;
            this.updateVerticalVertices();
        }
    },

    /**
     * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     * @memberof PIXI.NineSlicePlane#
     * @override
     */
    height: {
        get: function ()
        {
            return  this._height;
        },
        set: function (value)
        {
            this._height = value;
            this.updateHorizontalVertices();
        }
    },

    /**
     * The width of the left column
     *
     * @member {number}
     */
    leftWidth: {
        get: function()
        {
            return this._leftWidth;
        },
        set: function (value)
        {
            this._leftWidth = value;
            var uvs = this.uvs;
            var vertices = this.vertices;
            uvs[2] = uvs[10] = uvs[18] = uvs[26] = this._uvw * value;
            vertices[2] = vertices[10] = vertices[18] = vertices[26] = value;
            this.dirty=true;
        }
    },
    /**
     * The width of the right column
     *
     * @member {number}
     */
    rightWidth: {
        get: function()
        {
            return this._rightWidth;
        },
        set: function (value)
        {
            this._rightWidth = value;
            var uvs = this.uvs;
            var vertices = this.vertices;
            uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - this._uvw * value;
            vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - value;
            this.dirty=true;
        }
    },
    /**
     * The height of the top row
     *
     * @member {number}
     */
    topHeight: {
        get: function()
        {
            return this._topHeight;
        },
        set: function (value)
        {
            this._topHeight = value;
            var uvs = this.uvs;
            var vertices = this.vertices;
            uvs[9] = uvs[11] = uvs[13] = uvs[15] = this._uvh * value;
            vertices[9] = vertices[11] = vertices[13] = vertices[15] = value;
            this.dirty=true;
        }
    },
    /**
     * The height of the bottom row
     *
     * @member {number}
     */
    bottomHeight: {
        get: function()
        {
            return this._bottomHeight;
        },
        set: function (value)
        {
            this._bottomHeight = value;
            var uvs = this.uvs;
            var vertices = this.vertices;
            uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - this._uvh * value;
            vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - value;
            this.dirty=true;
        }
    }
});

NineSlicePlane.prototype.updateHorizontalVertices = function() {
    var vertices = this.vertices;
    vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight;
    vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - this._bottomHeight;
    vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
};

NineSlicePlane.prototype.updateVerticalVertices = function() {
    var vertices = this.vertices;
    vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth;
    vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - this._rightWidth;
    vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width ;
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer}
 * @private
 */
NineSlicePlane.prototype._renderCanvas= function (renderer)
{
    var context = renderer.context;
    context.globalAlpha = this.worldAlpha;

    var transform = this.worldTransform;
    var res = renderer.resolution;

    if (renderer.roundPixels)
    {
        context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, (transform.tx * res) | 0, (transform.ty * res) | 0);
    }
    else
    {
        context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res, transform.ty * res);
    }
        
    var base = this._texture.baseTexture;
    var textureSource = base.source;
    var w = base.width;
    var h = base.height;
    
    this.drawSegment(context, textureSource, w, h, 0, 1, 10, 11);
    this.drawSegment(context, textureSource, w, h, 2, 3, 12, 13);
    this.drawSegment(context, textureSource, w, h, 4, 5, 14, 15);
    this.drawSegment(context, textureSource, w, h, 8, 9, 18, 19);
    this.drawSegment(context, textureSource, w, h, 10, 11, 20, 21);
    this.drawSegment(context, textureSource, w, h, 12, 13, 22, 23);
    this.drawSegment(context, textureSource, w, h, 16, 17, 26, 27);
    this.drawSegment(context, textureSource, w, h, 18, 19, 28, 29);
    this.drawSegment(context, textureSource, w, h, 20, 21, 30, 31);
};

/**
 * Renders one segment of the plane.
 * to mimic the exact drawing behavior of stretching the image like WebGL does, we need to make sure
 * that the source area is at least 1 pixel in size, otherwise nothing gets drawn when a slice size of 0 is used.
 *
 * @param context
 * @param textureSource
 * @param w	width of the texture
 * @param h height of the texture
 * @param x1 
 * @param y1	
 * @param x2
 * @param y2
 * @private
 */
NineSlicePlane.prototype.drawSegment= function (context, textureSource, w, h, x1, y1, x2, y2)
{
    // otherwise you get weird results when using slices of that are 0 wide or high.
    var uvs = this.uvs;
    var vertices = this.vertices;
    
    var sw = (uvs[x2]-uvs[x1]) * w;
    var sh = (uvs[y2]-uvs[y1]) * h;
    var dw = vertices[x2] - vertices[x1];
    var dh = vertices[y2] - vertices[y1];
    
    // make sure the source is at least 1 pixel wide and high, otherwise nothing will be drawn.
    if (sw<1) {
        sw=1;
    }
    if (sh<1) {
        sh=1;
    }
    // make sure destination is at least 1 pixel wide and high, otherwise you get lines when rendering close to original size.
    if (dw<1) {
        dw=1;
    }
    if (dh<1) {
        dh=1;
    }
    context.drawImage(textureSource, uvs[x1] * w, uvs[y1] * h, sw, sh, vertices[x1], vertices[y1], dw, dh);
};

},{"./Plane":189}],189:[function(require,module,exports){
var Mesh = require('./Mesh');

/**
 * The Plane allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (var i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * var Plane = new PIXI.Plane(PIXI.Texture.fromImage("snake.png"), points);
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
function Plane(texture, verticesX, verticesY)
{
    Mesh.call(this, texture);

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


// constructor
Plane.prototype = Object.create( Mesh.prototype );
Plane.prototype.constructor = Plane;
module.exports = Plane;

/**
 * Refreshes
 *
 */
Plane.prototype.refresh = function()
{
    var total = this.verticesX * this.verticesY;
    var verts = [];
    var colors = [];
    var uvs = [];
    var indices = [];
    var texture = this.texture;

    var segmentsX = this.verticesX - 1;
    var segmentsY = this.verticesY - 1;
    var i = 0;

    var sizeX = texture.width / segmentsX;
    var sizeY = texture.height / segmentsY;

    for (i = 0; i < total; i++) {

        var x = (i % this.verticesX);
        var y = ( (i / this.verticesX ) | 0 );


        verts.push((x * sizeX),
                   (y * sizeY));

        // this works for rectangular textures.
        uvs.push(texture._uvs.x0 + (texture._uvs.x1 - texture._uvs.x0) * (x / (this.verticesX-1)), texture._uvs.y0 + (texture._uvs.y3-texture._uvs.y0) * (y/ (this.verticesY-1)));
      }

    //  cons

    var totalSub = segmentsX * segmentsY;

    for (i = 0; i < totalSub; i++) {

        var xpos = i % segmentsX;
        var ypos = (i / segmentsX ) | 0;


        var  value = (ypos * this.verticesX) + xpos;
        var  value2 = (ypos * this.verticesX) + xpos + 1;
        var  value3 = ((ypos+1) * this.verticesX) + xpos;
        var  value4 = ((ypos+1) * this.verticesX) + xpos + 1;

        indices.push(value, value2, value3);
        indices.push(value2, value4, value3);
    }


    //console.log(indices)
    this.vertices = new Float32Array(verts);
    this.uvs = new Float32Array(uvs);
    this.colors = new Float32Array(colors);
    this.indices = new Uint16Array(indices);

    this.indexDirty = true;
};

/**
 * Clear texture UVs when new texture is set
 *
 * @private
 */
Plane.prototype._onTextureUpdate = function ()
{
    Mesh.prototype._onTextureUpdate.call(this);

    // wait for the Plane ctor to finish before calling refresh
    if (this._ready) {
        this.refresh();
    }
};

},{"./Mesh":187}],190:[function(require,module,exports){
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

},{"../core":97,"./Mesh":187}],191:[function(require,module,exports){
/**
 * @file        Main export of the PIXI extras library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.mesh
 */
module.exports = {
    Mesh:           require('./Mesh'),
    Plane:           require('./Plane'),
    NineSlicePlane: require('./NineSlicePlane'),
    Rope:           require('./Rope'),
    MeshShader:     require('./webgl/MeshShader')
};

},{"./Mesh":187,"./NineSlicePlane":188,"./Plane":189,"./Rope":190,"./webgl/MeshShader":192}],192:[function(require,module,exports){
var Shader = require('../../core/Shader');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.mesh
 * @param gl {PIXI.Shader} TODO: Find a good explanation for this.
 */
function MeshShader(gl)
{
    Shader.call(this,
        gl,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',

            'uniform mat3 translationMatrix;',
            'uniform mat3 projectionMatrix;',

            'varying vec2 vTextureCoord;',

            'void main(void){',
            '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '   vTextureCoord = aTextureCoord;',
            '}'
        ].join('\n'),
        [
            'varying vec2 vTextureCoord;',
            'uniform float alpha;',
            'uniform vec3 tint;',

            'uniform sampler2D uSampler;',

            'void main(void){',
            '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(tint * alpha, alpha);',
           // '   gl_FragColor = vec4(1.0);',
            '}'
        ].join('\n')
    );
}

MeshShader.prototype = Object.create(Shader.prototype);
MeshShader.prototype.constructor = MeshShader;
module.exports = MeshShader;


},{"../../core/Shader":77}],193:[function(require,module,exports){
var core = require('../core');

/**
 * The ParticleContainer class is a really fast version of the Container built solely for speed,
 * so use when you need a lot of sprites or particles. The tradeoff of the ParticleContainer is that advanced
 * functionality will not work. ParticleContainer implements only the basic object transform (position, scale, rotation).
 * Any other functionality like tinting, masking, etc will not work on sprites in this batch.
 *
 * It's extremely easy to use :
 *
 * ```js
 * var container = new ParticleContainer();
 *
 * for (var i = 0; i < 100; ++i)
 * {
 *     var sprite = new PIXI.Sprite.fromImage("myImage.png");
 *     container.addChild(sprite);
 * }
 * ```
 *
 * And here you have a hundred sprites that will be renderer at the speed of light.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.particles
 * @param [maxSize=15000] {number} The maximum number of particles that can be renderer by the container.
 * @param [properties] {object} The properties of children that should be uploaded to the gpu and applied.
 * @param [properties.scale=false] {boolean} When true, scale be uploaded and applied.
 * @param [properties.position=true] {boolean} When true, position be uploaded and applied.
 * @param [properties.rotation=false] {boolean} When true, rotation be uploaded and applied.
 * @param [properties.uvs=false] {boolean} When true, uvs be uploaded and applied.
 * @param [properties.alpha=false] {boolean} When true, alpha be uploaded and applied.
 * @param [batchSize=15000] {number} Number of particles per batch.
 */
function ParticleContainer(maxSize, properties, batchSize)
{
    core.Container.call(this);

    batchSize = batchSize || 15000; //CONST.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop
    maxSize = maxSize || 15000;

    // Making sure the batch size is valid
    // 65535 is max vertex index in the index buffer (see ParticleRenderer)
    // so max number of particles is 65536 / 4 = 16384
    var maxBatchSize = 16384;
    if (batchSize > maxBatchSize) {
        batchSize = maxBatchSize;
    }

    if (batchSize > maxSize) {
        batchSize = maxSize;
    }

    /**
     * Set properties to be dynamic (true) / static (false)
     *
     * @member {boolean[]}
     * @private
     */
    this._properties = [false, true, false, false, false];

    /**
     * @member {number}
     * @private
     */
    this._maxSize = maxSize;

    /**
     * @member {number}
     * @private
     */
    this._batchSize = batchSize;

    /**
     * @member {WebGLBuffer}
     * @private
     */
    this._glBuffers = [];

    /**
     * @member {number}
     * @private
     */
    this._bufferToUpdate = 0;

    /**
     * @member {boolean}
     *
     */
    this.interactiveChildren = false;

    /**
     * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     * @see PIXI.BLEND_MODES
     */
    this.blendMode = core.BLEND_MODES.NORMAL;

    /**
     * Used for canvas renderering. If true then the elements will be positioned at the nearest pixel. This provides a nice speed boost.
     *
     * @member {boolean}
     * @default true;
     */
    this.roundPixels = true;

    this.baseTexture = null;

    this.setProperties(properties);
}

ParticleContainer.prototype = Object.create(core.Container.prototype);
ParticleContainer.prototype.constructor = ParticleContainer;
module.exports = ParticleContainer;

/**
 * Sets the private properties array to dynamic / static based on the passed properties object
 *
 * @param properties {object} The properties to be uploaded
 */
ParticleContainer.prototype.setProperties = function(properties)
{
    if ( properties ) {
        this._properties[0] = 'scale' in properties ? !!properties.scale : this._properties[0];
        this._properties[1] = 'position' in properties ? !!properties.position : this._properties[1];
        this._properties[2] = 'rotation' in properties ? !!properties.rotation : this._properties[2];
        this._properties[3] = 'uvs' in properties ? !!properties.uvs : this._properties[3];
        this._properties[4] = 'alpha' in properties ? !!properties.alpha : this._properties[4];
    }
};

/**
 * Updates the object transform for rendering
 *
 * @private
 */
ParticleContainer.prototype.updateTransform = function ()
{

    // TODO don't need to!
    this.displayObjectUpdateTransform();
    //  PIXI.Container.prototype.updateTransform.call( this );
};

/**
 * Renders the container using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer} The webgl renderer
 * @private
 */
ParticleContainer.prototype.renderWebGL = function (renderer)
{
    if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable)
    {
        return;
    }


    if(!this.baseTexture)
    {
        this.baseTexture = this.children[0]._texture.baseTexture;
        if(!this.baseTexture.hasLoaded)
        {
            this.baseTexture.once('update', function(){
                this.onChildrenChange(0);
            }, this);
        }
    }


    renderer.setObjectRenderer( renderer.plugins.particle );
    renderer.plugins.particle.render( this );
};

/**
 * Set the flag that static data should be updated to true
 *
 * @private
 */
ParticleContainer.prototype.onChildrenChange = function (smallestChildIndex)
{
    var bufferIndex = Math.floor(smallestChildIndex / this._batchSize);
    if (bufferIndex < this._bufferToUpdate) {
        this._bufferToUpdate = bufferIndex;
    }
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderer {PIXI.CanvasRenderer} The canvas renderer
 * @private
 */
ParticleContainer.prototype.renderCanvas = function (renderer)
{
    if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable)
    {
        return;
    }

    var context = renderer.context;
    var transform = this.worldTransform;
    var isRotated = true;

    var positionX = 0;
    var positionY = 0;

    var finalWidth = 0;
    var finalHeight = 0;

    var compositeOperation = renderer.blendModes[this.blendMode];
    if (compositeOperation !== context.globalCompositeOperation)
    {
        context.globalCompositeOperation = compositeOperation;
    }

    context.globalAlpha = this.worldAlpha;

    this.displayObjectUpdateTransform();

    for (var i = 0; i < this.children.length; ++i)
    {
        var child = this.children[i];

        if (!child.visible)
        {
            continue;
        }

        var frame = child.texture.frame;

        context.globalAlpha = this.worldAlpha * child.alpha;

        if (child.rotation % (Math.PI * 2) === 0)
        {
            // this is the fastest  way to optimise! - if rotation is 0 then we can avoid any kind of setTransform call
            if (isRotated)
            {
                context.setTransform(
                    transform.a,
                    transform.b,
                    transform.c,
                    transform.d,
                    transform.tx * renderer.resolution,
                    transform.ty * renderer.resolution
                );

                isRotated = false;
            }

            positionX = ((child.anchor.x) * (-frame.width * child.scale.x) + child.position.x  + 0.5);
            positionY = ((child.anchor.y) * (-frame.height * child.scale.y) + child.position.y  + 0.5);

            finalWidth = frame.width * child.scale.x;
            finalHeight = frame.height * child.scale.y;

        }
        else
        {
            if (!isRotated)
            {
                isRotated = true;
            }

            child.displayObjectUpdateTransform();

            var childTransform = child.worldTransform;

            if (renderer.roundPixels)
            {
                context.setTransform(
                    childTransform.a,
                    childTransform.b,
                    childTransform.c,
                    childTransform.d,
                    (childTransform.tx * renderer.resolution) | 0,
                    (childTransform.ty * renderer.resolution) | 0
                );
            }
            else
            {
                context.setTransform(
                    childTransform.a,
                    childTransform.b,
                    childTransform.c,
                    childTransform.d,
                    childTransform.tx * renderer.resolution,
                    childTransform.ty * renderer.resolution
                );
            }

            positionX = ((child.anchor.x) * (-frame.width) + 0.5);
            positionY = ((child.anchor.y) * (-frame.height) + 0.5);

            finalWidth = frame.width;
            finalHeight = frame.height;
        }

        var resolution = child.texture.baseTexture.resolution;

        context.drawImage(
            child.texture.baseTexture.source,
            frame.x * resolution,
            frame.y * resolution,
            frame.width * resolution,
            frame.height * resolution,
            positionX * resolution,
            positionY * resolution,
            finalWidth * resolution,
            finalHeight * resolution
        );
    }
};

/**
 * Destroys the container
 *
 */
ParticleContainer.prototype.destroy = function () {
    core.Container.prototype.destroy.apply(this, arguments);

    if (this._buffers) {
        for (var i = 0; i < this._buffers.length; ++i) {
            this._buffers[i].destroy();
        }
    }

    this._properties = null;
    this._buffers = null;
};

},{"../core":97}],194:[function(require,module,exports){
/**
 * @file        Main export of the PIXI extras library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.particles
 */
module.exports = {
	ParticleContainer:           require('./ParticleContainer'),
    ParticleRenderer: 			 require('./webgl/ParticleRenderer')
};

},{"./ParticleContainer":193,"./webgl/ParticleRenderer":196}],195:[function(require,module,exports){
var glCore = require('pixi-gl-core'),
    createIndicesForQuads = require('../../core/utils/createIndicesForQuads');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleBuffer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleBuffer.java
 */

/**
 * The particle buffer manages the static and dynamic buffers for a particle container.
 *
 * @class
 * @private
 * @memberof PIXI
 */
function ParticleBuffer(gl, properties, dynamicPropertyFlags, size)
{
    /**
     * The current WebGL drawing context.
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    /**
     * Size of a single vertex.
     *
     * @member {number}
     */
    this.vertSize = 2;

    /**
     * Size of a single vertex in bytes.
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of particles the buffer can hold
     *
     * @member {number}
     */
    this.size = size;

    /**
     * A list of the properties that are dynamic.
     *
     * @member {object[]}
     */
    this.dynamicProperties = [];

    /**
     * A list of the properties that are static.
     *
     * @member {object[]}
     */
    this.staticProperties = [];

    for (var i = 0; i < properties.length; i++)
    {
        var property = properties[i];

        // Make copy of properties object so that when we edit the offset it doesn't
        // change all other instances of the object literal
        property = 
        {
            attribute:property.attribute,
            size:property.size,
            uploadFunction:property.uploadFunction,
            offset:property.offset
        };

        if(dynamicPropertyFlags[i])
        {
            this.dynamicProperties.push(property);
        }
        else
        {
            this.staticProperties.push(property);
        }
    }

    this.staticStride = 0;
    this.staticBuffer = null;
    this.staticData = null;

    this.dynamicStride = 0;
    this.dynamicBuffer = null;
    this.dynamicData = null;

    this.initBuffers();

}

ParticleBuffer.prototype.constructor = ParticleBuffer;
module.exports = ParticleBuffer;

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 */
ParticleBuffer.prototype.initBuffers = function ()
{
    var gl = this.gl;
    var i;
    var property;

    var dynamicOffset = 0;


    /**
     * Holds the indices of the geometry (quads) to draw
     *
     * @member {Uint16Array}
     */
    this.indices = createIndicesForQuads(this.size);
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);


    this.dynamicStride = 0;

    for (i = 0; i < this.dynamicProperties.length; i++)
    {
        property = this.dynamicProperties[i];

        property.offset = dynamicOffset;
        dynamicOffset += property.size;
        this.dynamicStride += property.size;
    }

    this.dynamicData = new Float32Array( this.size * this.dynamicStride * 4);
    this.dynamicBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.dynamicData, gl.STREAM_DRAW);

    // static //
    var staticOffset = 0;
    this.staticStride = 0;

    for (i = 0; i < this.staticProperties.length; i++)
    {
        property = this.staticProperties[i];

        property.offset = staticOffset;
        staticOffset += property.size;
        this.staticStride += property.size;


    }

    this.staticData = new Float32Array( this.size * this.staticStride * 4);
    this.staticBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.staticData, gl.STATIC_DRAW);


    this.vao = new glCore.VertexArrayObject(gl)
    .addIndex(this.indexBuffer);

    for (i = 0; i < this.dynamicProperties.length; i++)
    {
        property = this.dynamicProperties[i];
        this.vao.addAttribute(this.dynamicBuffer, property.attribute, gl.FLOAT, false, this.dynamicStride * 4, property.offset * 4);
    }

    for (i = 0; i < this.staticProperties.length; i++)
    {
        property = this.staticProperties[i];
        this.vao.addAttribute(this.staticBuffer, property.attribute, gl.FLOAT, false, this.staticStride * 4, property.offset * 4);
    }
};

/**
 * Uploads the dynamic properties.
 *
 */
ParticleBuffer.prototype.uploadDynamic = function(children, startIndex, amount)
{
    for (var i = 0; i < this.dynamicProperties.length; i++)
    {
        var property = this.dynamicProperties[i];
        property.uploadFunction(children, startIndex, amount, this.dynamicData, this.dynamicStride, property.offset);
    }

    this.dynamicBuffer.upload();
};

/**
 * Uploads the static properties.
 *
 */
ParticleBuffer.prototype.uploadStatic = function(children, startIndex, amount)
{
    for (var i = 0; i < this.staticProperties.length; i++)
    {
        var property = this.staticProperties[i];
        property.uploadFunction(children, startIndex, amount, this.staticData, this.staticStride, property.offset);
    }

    this.staticBuffer.upload();
};

/**
 * Binds the buffers to the GPU
 *
 */
ParticleBuffer.prototype.bind = function ()
{
    this.vao.bind();
};

/**
 * Destroys the ParticleBuffer.
 *
 */
ParticleBuffer.prototype.destroy = function ()
{
    this.dynamicProperties = null;
    this.dynamicData = null;
    this.dynamicBuffer.destroy();

    this.staticProperties = null;
    this.staticData = null;
    this.staticBuffer.destroy();
};

},{"../../core/utils/createIndicesForQuads":149,"pixi-gl-core":7}],196:[function(require,module,exports){
var core = require('../../core'),
    ParticleShader = require('./ParticleShader'),
    ParticleBuffer = require('./ParticleBuffer');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleRenderer.java
 */

/**
 *
 * @class
 * @private
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function ParticleRenderer(renderer)
{
    core.ObjectRenderer.call(this, renderer);

    // 65535 is max vertex index in the index buffer (see ParticleRenderer)
    // so max number of particles is 65536 / 4 = 16384
    // and max number of element in the index buffer is 16384 * 6 = 98304
    // Creating a full index buffer, overhead is 98304 * 2 = 196Ko
    // var numIndices = 98304;

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;

    this.indexBuffer = null;

    this.properties = null;

    this.tempMatrix = new core.Matrix();

    this.CONTEXT_UID = 0;
}

ParticleRenderer.prototype = Object.create(core.ObjectRenderer.prototype);
ParticleRenderer.prototype.constructor = ParticleRenderer;
module.exports = ParticleRenderer;

core.WebGLRenderer.registerPlugin('particle', ParticleRenderer);

/**
 * When there is a WebGL context change
 *
 * @private
 */
ParticleRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    this.CONTEXT_UID = this.renderer.CONTEXT_UID;

    // setup default shader
    this.shader = new ParticleShader(gl);

    this.properties = [
        // verticesData
        {
            attribute:this.shader.attributes.aVertexPosition,
            size:2,
            uploadFunction:this.uploadVertices,
            offset:0
        },
        // positionData
        {
            attribute:this.shader.attributes.aPositionCoord,
            size:2,
            uploadFunction:this.uploadPosition,
            offset:0
        },
        // rotationData
        {
            attribute:this.shader.attributes.aRotation,
            size:1,
            uploadFunction:this.uploadRotation,
            offset:0
        },
        // uvsData
        {
            attribute:this.shader.attributes.aTextureCoord,
            size:2,
            uploadFunction:this.uploadUvs,
            offset:0
        },
        // alphaData
        {
            attribute:this.shader.attributes.aColor,
            size:1,
            uploadFunction:this.uploadAlpha,
            offset:0
        }
    ];

};

/**
 * Starts a new particle batch.
 *
 */
ParticleRenderer.prototype.start = function ()
{
    this.renderer.bindShader(this.shader);
};


/**
 * Renders the particle container object.
 *
 * @param container {PIXI.ParticleContainer} The container to render using this ParticleRenderer
 */
ParticleRenderer.prototype.render = function (container)
{
    var children = container.children,
        totalChildren = children.length,
        maxSize = container._maxSize,
        batchSize = container._batchSize;

    if(totalChildren === 0)
    {
        return;
    }
    else if(totalChildren > maxSize)
    {
        totalChildren = maxSize;
    }

    var buffers = container._glBuffers[this.renderer.CONTEXT_UID];

    if(!buffers)
    {
        buffers = container._glBuffers[this.renderer.CONTEXT_UID] = this.generateBuffers( container );
    }

    // if the uvs have not updated then no point rendering just yet!
    this.renderer.setBlendMode(container.blendMode);

    var gl = this.renderer.gl;

    var m = container.worldTransform.copy( this.tempMatrix );
    m.prepend( this.renderer._activeRenderTarget.projectionMatrix );
    this.shader.uniforms.projectionMatrix = m.toArray(true);
    this.shader.uniforms.uAlpha = container.worldAlpha;


    // make sure the texture is bound..
    var baseTexture = children[0]._texture.baseTexture;

    this.renderer.bindTexture(baseTexture);

    // now lets upload and render the buffers..
    for (var i = 0, j = 0; i < totalChildren; i += batchSize, j += 1)
    {
        var amount = ( totalChildren - i);
        if(amount > batchSize)
        {
            amount = batchSize;
        }

        var buffer = buffers[j];

        // we always upload the dynamic
        buffer.uploadDynamic(children, i, amount);

        // we only upload the static content when we have to!
        if(container._bufferToUpdate === j)
        {
            buffer.uploadStatic(children, i, amount);
            container._bufferToUpdate = j + 1;
        }

        // bind the buffer
        buffer.vao.bind()
        .draw(gl.TRIANGLES, amount * 6)
        .unbind();

         // now draw those suckas!
       // gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
       //  this.renderer.drawCount++;
    }
};

/**
 * Creates one particle buffer for each child in the container we want to render and updates internal properties
 *
 * @param container {PIXI.ParticleContainer} The container to render using this ParticleRenderer
 */
ParticleRenderer.prototype.generateBuffers = function (container)
{
    var gl = this.renderer.gl,
        buffers = [],
        size = container._maxSize,
        batchSize = container._batchSize,
        dynamicPropertyFlags = container._properties,
        i;

    for (i = 0; i < size; i += batchSize)
    {
        buffers.push(new ParticleBuffer(gl, this.properties, dynamicPropertyFlags, batchSize));
    }

    return buffers;
};

/**
 * Uploads the verticies.
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their vertices uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadVertices = function (children, startIndex, amount, array, stride, offset)
{
    var sprite,
        texture,
        trim,
        orig,
        sx,
        sy,
        w0, w1, h0, h1;

    for (var i = 0; i < amount; i++) {

        sprite = children[startIndex + i];
        texture = sprite._texture;
        sx = sprite.scale.x;
        sy = sprite.scale.y;
        trim = texture.trim;
        orig = texture.orig;

        if (trim)
        {
            // if the sprite is trimmed and is not a tilingsprite then we need to add the extra space before transforming the sprite coords..
            w1 = trim.x - sprite.anchor.x * orig.width;
            w0 = w1 + trim.width;

            h1 = trim.y - sprite.anchor.y * orig.height;
            h0 = h1 + trim.height;

        }
        else
        {
            w0 = (orig.width ) * (1-sprite.anchor.x);
            w1 = (orig.width ) * -sprite.anchor.x;

            h0 = orig.height * (1-sprite.anchor.y);
            h1 = orig.height * -sprite.anchor.y;
        }

        array[offset] = w1 * sx;
        array[offset + 1] = h1 * sy;

        array[offset + stride] = w0 * sx;
        array[offset + stride + 1] = h1 * sy;

        array[offset + stride * 2] = w0 * sx;
        array[offset + stride * 2 + 1] = h0 * sy;

        array[offset + stride * 3] = w1 * sx;
        array[offset + stride * 3 + 1] = h0 * sy;

        offset += stride * 4;
    }

};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their positions uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadPosition = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var spritePosition = children[startIndex + i].position;

        array[offset] = spritePosition.x;
        array[offset + 1] = spritePosition.y;

        array[offset + stride] = spritePosition.x;
        array[offset + stride + 1] = spritePosition.y;

        array[offset + stride * 2] = spritePosition.x;
        array[offset + stride * 2 + 1] = spritePosition.y;

        array[offset + stride * 3] = spritePosition.x;
        array[offset + stride * 3 + 1] = spritePosition.y;

        offset += stride * 4;
    }

};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their rotation uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadRotation = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var spriteRotation = children[startIndex + i].rotation;


        array[offset] = spriteRotation;
        array[offset + stride] = spriteRotation;
        array[offset + stride * 2] = spriteRotation;
        array[offset + stride * 3] = spriteRotation;

        offset += stride * 4;
    }
};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their Uvs uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadUvs = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var textureUvs = children[startIndex + i]._texture._uvs;

        if (textureUvs)
        {
            array[offset] = textureUvs.x0;
            array[offset + 1] = textureUvs.y0;

            array[offset + stride] = textureUvs.x1;
            array[offset + stride + 1] = textureUvs.y1;

            array[offset + stride * 2] = textureUvs.x2;
            array[offset + stride * 2 + 1] = textureUvs.y2;

            array[offset + stride * 3] = textureUvs.x3;
            array[offset + stride * 3 + 1] = textureUvs.y3;

            offset += stride * 4;
        }
        else
        {
            //TODO you know this can be easier!
            array[offset] = 0;
            array[offset + 1] = 0;

            array[offset + stride] = 0;
            array[offset + stride + 1] = 0;

            array[offset + stride * 2] = 0;
            array[offset + stride * 2 + 1] = 0;

            array[offset + stride * 3] = 0;
            array[offset + stride * 3 + 1] = 0;

            offset += stride * 4;
        }
    }
};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their alpha uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadAlpha = function (children,startIndex, amount, array, stride, offset)
{
     for (var i = 0; i < amount; i++)
     {
        var spriteAlpha = children[startIndex + i].alpha;

        array[offset] = spriteAlpha;
        array[offset + stride] = spriteAlpha;
        array[offset + stride * 2] = spriteAlpha;
        array[offset + stride * 3] = spriteAlpha;

        offset += stride * 4;
    }
};


/**
 * Destroys the ParticleRenderer.
 *
 */
ParticleRenderer.prototype.destroy = function ()
{
    if (this.renderer.gl) {
        this.renderer.gl.deleteBuffer(this.indexBuffer);
    }
    core.ObjectRenderer.prototype.destroy.apply(this, arguments);

    this.shader.destroy();

    this.indices = null;
    this.tempMatrix = null;
};

},{"../../core":97,"./ParticleBuffer":195,"./ParticleShader":197}],197:[function(require,module,exports){
var Shader = require('../../core/Shader');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI
 * @param gl {PIXI.Shader} The webgl shader manager this shader works for.
 */
function ParticleShader(gl)
{
    Shader.call(this,
        gl,
        // vertex shader
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'attribute float aColor;',

            'attribute vec2 aPositionCoord;',
            'attribute vec2 aScale;',
            'attribute float aRotation;',

            'uniform mat3 projectionMatrix;',

            'varying vec2 vTextureCoord;',
            'varying float vColor;',

            'void main(void){',
            '   vec2 v = aVertexPosition;',

            '   v.x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);',
            '   v.y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);',
            '   v = v + aPositionCoord;',

            '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);',

            '   vTextureCoord = aTextureCoord;',
            '   vColor = aColor;',
            '}'
        ].join('\n'),
        // hello
         [
            'varying vec2 vTextureCoord;',
            'varying float vColor;',

            'uniform sampler2D uSampler;',
            'uniform float uAlpha;',

            'void main(void){',
            '  vec4 color = texture2D(uSampler, vTextureCoord) * vColor * uAlpha;',
            '  if (color.a == 0.0) discard;',
            '  gl_FragColor = color;',
            '}'
        ].join('\n')
    );

    // TEMP HACK

}

ParticleShader.prototype = Object.create(Shader.prototype);
ParticleShader.prototype.constructor = ParticleShader;

module.exports = ParticleShader;

},{"../../core/Shader":77}],198:[function(require,module,exports){
// References:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

if (!Math.sign)
{
    Math.sign = function (x) {
        x = +x;
        if (x === 0 || isNaN(x))
        {
            return x;
        }
        return x > 0 ? 1 : -1;
    };
}

},{}],199:[function(require,module,exports){
// References:
// https://github.com/sindresorhus/object-assign
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

if (!Object.assign)
{
    Object.assign = require('object-assign');
}

},{"object-assign":59}],200:[function(require,module,exports){
require('./Object.assign');
require('./requestAnimationFrame');
require('./Math.sign');

if(!window.ArrayBuffer){
  window.ArrayBuffer = Array;
}
if(!window.Float32Array) {
  window.Float32Array = Array;
}
if(!window.Uint32Array){
  window.Uint32Array = Array;
}
if(!window.Uint16Array){
  window.Uint16Array = Array;
}

},{"./Math.sign":198,"./Object.assign":199,"./requestAnimationFrame":201}],201:[function(require,module,exports){
(function (global){
// References:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// https://gist.github.com/1579671
// http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
// https://gist.github.com/timhall/4078614
// https://github.com/Financial-Times/polyfill-service/tree/master/polyfills/requestAnimationFrame

// Expected to be used with Browserfiy
// Browserify automatically detects the use of `global` and passes the
// correct reference of `global`, `self`, and finally `window`

// Date.now
if (!(Date.now && Date.prototype.getTime)) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// performance.now
if (!(global.performance && global.performance.now)) {
    var startTime = Date.now();
    if (!global.performance) {
        global.performance = {};
    }
    global.performance.now = function () {
        return Date.now() - startTime;
    };
}

// requestAnimationFrame
var lastTime = Date.now();
var vendors = ['ms', 'moz', 'webkit', 'o'];

for(var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
    global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
    global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'] ||
        global[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = function (callback) {
        if (typeof callback !== 'function') {
            throw new TypeError(callback + 'is not a function');
        }

        var currentTime = Date.now(),
            delay = 16 + lastTime - currentTime;

        if (delay < 0) {
            delay = 0;
        }

        lastTime = currentTime;

        return setTimeout(function () {
            lastTime = Date.now();
            callback(performance.now());
        }, delay);
    };
}

if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],202:[function(require,module,exports){
var core = require('../../core');

/**
 * Prepare uploads elements to the GPU. The CanvasRenderer version of prepare
 * provides the same APIs as the WebGL version, but doesn't do anything.
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.CanvasRenderer} A reference to the current renderer
 */
function CanvasPrepare()
{
}

CanvasPrepare.prototype.constructor = CanvasPrepare;
module.exports = CanvasPrepare;

/**
 * Stub method for upload.
 * @param {Function|PIXI.DisplayObject|PIXI.Container} item Either
 *        the container or display object to search for items to upload or
 *        the callback function, if items have been added using `prepare.add`.
 * @param {Function} done When completed
 */
CanvasPrepare.prototype.upload = function(displayObject, done)
{
    if (typeof displayObject === 'function')
    {
        done = displayObject;
        displayObject = null;
    }
    done();
};

/**
 * Stub method for registering hooks.
 * @return {PIXI.CanvasPrepare} Instance of plugin for chaining.
 */
CanvasPrepare.prototype.register = function()
{
    return this;
};

/**
 * Stub method for adding items.
 * @return {PIXI.CanvasPrepare} Instance of plugin for chaining.
 */
CanvasPrepare.prototype.add = function()
{
    return this;
};

/**
 * Stub method for destroying plugin.
 */
CanvasPrepare.prototype.destroy = function()
{
};

core.CanvasRenderer.registerPlugin('prepare', CanvasPrepare);
},{"../../core":97}],203:[function(require,module,exports){

module.exports = {
    webGL: require('./webgl/WebGLPrepare'),
    canvas: require('./canvas/CanvasPrepare')
};
},{"./canvas/CanvasPrepare":202,"./webgl/WebGLPrepare":204}],204:[function(require,module,exports){
var core = require('../../core'),
    SharedTicker = core.ticker.shared;

/**
 * The prepare manager provides functionality to upload content to the GPU
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} A reference to the current renderer
 */
function WebGLPrepare(renderer)
{
    /**
     * Reference to the renderer.
     * @type {PIXI.WebGLRenderer}
     * @private
     */
    this.renderer = renderer;

    /**
     * Collection of items to uploads at once.
     * @type {Array<*>}
     * @private
     */
    this.queue = [];

    /**
     * Collection of additional hooks for finding assets.
     * @type {Array<Function>}
     * @private
     */
    this.addHooks = [];

    /**
     * Collection of additional hooks for processing assets.
     * @type {Array<Function>}
     * @private
     */
    this.uploadHooks = [];

    /**
     * Callback to call after completed.
     * @type {Array<Function>}
     * @private
     */
    this.completes = [];

    /**
     * If prepare is ticking (running).
     * @type {boolean}
     * @private
     */
    this.ticking = false;

    // Add textures and graphics to upload
    this.register(findBaseTextures, uploadBaseTextures)
        .register(findGraphics, uploadGraphics);
}

/**
 * The number of graphics or textures to upload to the GPU
 * @property {number} UPLOADS_PER_FRAME
 * @static
 * @default 4
 */
WebGLPrepare.UPLOADS_PER_FRAME = 4;

WebGLPrepare.prototype.constructor = WebGLPrepare;
module.exports = WebGLPrepare;

/**
 * Upload all the textures and graphics to the GPU.
 * @param {Function|PIXI.DisplayObject|PIXI.Container} item Either
 *        the container or display object to search for items to upload or
 *        the callback function, if items have been added using `prepare.add`.
 * @param {Function} done When completed
 */
WebGLPrepare.prototype.upload = function(item, done)
{
    if (typeof item === 'function')
    {
        done = item;
        item = null;
    }

    // If a display object, search for items
    // that we could upload
    if (item)
    {
        this.add(item);
    }

    // Get the items for upload from the display
    if (this.queue.length)
    {
        this.numLeft = WebGLPrepare.UPLOADS_PER_FRAME;
        this.completes.push(done);
        if (!this.ticking)
        {
            this.ticking = true;
            SharedTicker.add(this.tick, this);
        }
    }
    else
    {
        done();
    }
};

/**
 * Handle tick update
 * @private
 */
WebGLPrepare.prototype.tick = function()
{
    var i, len;

    // Upload the graphics
    while(this.queue.length && this.numLeft > 0)
    {
        var item = this.queue[0];
        var uploaded = false;
        for (i = 0, len = this.uploadHooks.length; i < len; i++)
        {
            if (this.uploadHooks[i](this.renderer, item))
            {
                this.numLeft--;
                this.queue.shift();
                uploaded = true;
                break;
            }
        }
        if (!uploaded)
        {
            this.queue.shift();
        }
    }

    // We're finished
    if (this.queue.length)
    {
        this.numLeft = WebGLPrepare.UPLOADS_PER_FRAME;
    }
    else
    {
        this.ticking = false;
        SharedTicker.remove(this.tick, this);
        var completes = this.completes.slice(0);
        this.completes.length = 0;
        for (i = 0, len = completes.length; i < len; i++)
        {
            completes[i]();
        }
    }
};

/**
 * Adds hooks for finding and uploading items.
 * @param {Function} [addHook] Function call that takes two parameters: `item:*, queue:Array`
          function must return `true` if it was able to add item to the queue.
 * @param {Function} [uploadHook] Function call that takes two parameters: `renderer:WebGLRenderer, item:*` and
 *        function must return `true` if it was able to handle upload of item.
 * @return {PIXI.WebGLPrepare} Instance of plugin for chaining.
 */
WebGLPrepare.prototype.register = function(addHook, uploadHook)
{
    if (addHook)
    {
        this.addHooks.push(addHook);
    }
    if (uploadHook)
    {
        this.uploadHooks.push(uploadHook);
    }
    return this;
};

/**
 * Manually add an item to the uploading queue.
 * @param {PIXI.DisplayObject|PIXI.Container|*} item Object to add to the queue
 * @return {PIXI.WebGLPrepare} Instance of plugin for chaining.
 */
WebGLPrepare.prototype.add = function(item)
{
    var i, len;

    // Add additional hooks for finding elements on special
    // types of objects that
    for (i = 0, len = this.addHooks.length; i < len; i++)
    {
        if (this.addHooks[i](item, this.queue))
        {
            break;
        }
    }

    // Get childen recursively
    if (item instanceof core.Container)
    {
        for (i = item.children.length - 1; i >= 0; i--)
        {
            this.add(item.children[i]);
        }
    }
    return this;
};

/**
 * Destroys the plugin, don't use after this.
 */
WebGLPrepare.prototype.destroy = function()
{
    if (this.ticking)
    {
        SharedTicker.remove(this.tick, this);
    }
    this.ticking = false;
    this.addHooks = null;
    this.uploadHooks = null;
    this.renderer = null;
    this.completes = null;
    this.queue = null;
};

/**
 * Built-in hook to upload PIXI.Texture objects to the GPU
 * @private
 * @param {*} item Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadBaseTextures(renderer, item)
{
    if (item instanceof core.BaseTexture)
    {
        renderer.textureManager.updateTexture(item);
        return true;
    }
    return false;
}

/**
 * Built-in hook to upload PIXI.Graphics to the GPU
 * @private
 * @param {*} item Item to check
 * @return {boolean} If item was uploaded.
 */
function uploadGraphics(renderer, item)
{
    if (item instanceof core.Graphics)
    {
        renderer.plugins.graphics.updateGraphics(item);
        return true;
    }
    return false;
}

/**
 * Built-in hook to find textures from Sprites
 * @private
 * @param {PIXI.DisplayObject} item Display object to check
 * @param {Array<*>} queue Collection of items to upload
 * @return {boolean} if a PIXI.Texture object was found.
 */
function findBaseTextures(item, queue)
{
    // Objects with textures, like Sprites/Text
    if (item instanceof core.BaseTexture)
    {
        if (queue.indexOf(item) === -1)
        {
            queue.push(item);
        }
        return true;
    }
    else if (item._texture && item._texture instanceof core.Texture)
    {
        var texture = item._texture.baseTexture;
        if (queue.indexOf(texture) === -1)
        {
            queue.push(texture);
        }
        return true;
    }
    return false;
}

/**
 * Built-in hook to find graphics
 * @private
 * @param {PIXI.DisplayObject} item Display object to check
 * @param {Array<*>} queue Collection of items to upload
 * @return {boolean} if a PIXI.Graphics object was found.
 */
function findGraphics(item, queue)
{
    if (item instanceof core.Graphics)
    {
        queue.push(item);
        return true;
    }
    return false;
}

core.WebGLRenderer.registerPlugin('prepare', WebGLPrepare);
},{"../../core":97}],205:[function(require,module,exports){
(function (global){
// run the polyfills
require('./polyfill');

var core = module.exports = require('./core');

// add core plugins.
core.extras         = require('./extras');
core.filters        = require('./filters');
core.interaction    = require('./interaction');
core.loaders        = require('./loaders');
core.mesh           = require('./mesh');
core.particles      = require('./particles');
core.accessibility  = require('./accessibility');
core.extract        = require('./extract');
core.prepare        = require('./prepare');

// export a premade loader instance
/**
 * A premade instance of the loader that can be used to loader resources.
 *
 * @name loader
 * @memberof PIXI
 * @property {PIXI.loaders.Loader}
 */
core.loader = new core.loaders.Loader();

// mixin the deprecation features.
Object.assign(core, require('./deprecation'));

// Always export pixi globally.
global.PIXI = core;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./accessibility":76,"./core":97,"./deprecation":154,"./extract":156,"./extras":164,"./filters":175,"./interaction":180,"./loaders":183,"./mesh":191,"./particles":194,"./polyfill":200,"./prepare":203}]},{},[205])(205)
});


//# sourceMappingURL=pixi.js.map
