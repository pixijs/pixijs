/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 * @author Richard Davey http://www.photonstorm.com @photonstorm
 */

/**
* @class PIXI.PixiShader
* @constructor
*/
PIXI.PixiShader = function()
{
    /**
    * @property {any} program - The WebGL program.
    */
    this.program;
    
    /**
    * @property {array} fragmentSrc - The fragment shader.
    */
    this.fragmentSrc = [
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        "varying float vColor;",
        "uniform sampler2D uSampler;",
        "void main(void) {",
            "gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;",
        "}"
    ];

    /**
    * @property {number} textureCount - A local texture counter for multi-texture shaders.
    */
    this.textureCount = 0;
    
};

/**
* @method PIXI.PixiShader#init
*/
PIXI.PixiShader.prototype.init = function()
{
    var program = PIXI.compileProgram(this.vertexSrc || PIXI.PixiShader.defaultVertexSrc, this.fragmentSrc)
    
    var gl = PIXI.gl;

    gl.useProgram(program);
    
    // get and store the uniforms for the shader
    this.uSampler = gl.getUniformLocation(program, "uSampler");
    this.projectionVector = gl.getUniformLocation(program, "projectionVector");
    this.offsetVector = gl.getUniformLocation(program, "offsetVector");
    this.dimensions = gl.getUniformLocation(program, "dimensions");
    
    // get and store the attributes
    this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    this.colorAttribute = gl.getAttribLocation(program, "aColor");
    this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
      
    // add those custom shaders!
    for (var key in this.uniforms)
    {
        // get the uniform locations..
        this.uniforms[key].uniformLocation = gl.getUniformLocation(program, key);
    }

    this.initUniforms();
  
    this.program = program;
};

/**
* Initialises the shader uniform values.
* Uniforms are specified in the GLSL_ES Specification: http://www.khronos.org/registry/webgl/specs/latest/1.0/
* http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf
*
* @method PIXI.PixiShader#initUniforms
*/
PIXI.PixiShader.prototype.initUniforms = function()
{
    this.textureCount = 1;

    var uniform;
    
    for (var key in this.uniforms) 
    {
        var uniform = this.uniforms[key];
        var type = uniform.type;

        if (type == 'sampler2D')
        {
            uniform._init = false;

            if (uniform.value !== null)
            {
                this.initSampler2D(uniform);
            }
        }
        else if (type == 'mat2' || type == 'mat3' || type == 'mat4')
        {
            //  These require special handling
            uniform.glMatrix = true;
            uniform.glValueLength = 1;

            if (type == 'mat2')
            {
                uniform.glFunc = PIXI.gl.uniformMatrix2fv;
            }
            else if (type == 'mat3')
            {
                uniform.glFunc = PIXI.gl.uniformMatrix3fv;
            }
            else if (type == 'mat4')
            {
                uniform.glFunc = PIXI.gl.uniformMatrix4fv;
            }
        }
        else
        {
            //  GL function reference
            uniform.glFunc = PIXI.gl['uniform' + type];

            if (type == '2f' || type == '2i')
            {
                uniform.glValueLength = 2;
            }
            else if (type == '3f' || type == '3i')
            {
                uniform.glValueLength = 3;
            }
            else if (type == '4f' || type == '4i')
            {
                uniform.glValueLength = 4;
            }
            else
            {
                uniform.glValueLength = 1;
            }
        }
    }
    
};

/**
* Initialises a Sampler2D uniform (which may only be available later on after initUniforms once the texture is has loaded)
*
* @method PIXI.PixiShader#initSampler2D
*/
PIXI.PixiShader.prototype.initSampler2D = function(uniform)
{
    if (!uniform.value || !uniform.value.baseTexture || !uniform.value.baseTexture.hasLoaded)
    {
        return;
    }

    PIXI.gl.activeTexture(PIXI.gl['TEXTURE' + this.textureCount]);
    PIXI.gl.bindTexture(PIXI.gl.TEXTURE_2D, uniform.value.baseTexture._glTexture);

    //  Extended texture data
    if (uniform.textureData)
    {
        var data = uniform.textureData;

        // GLTexture = mag linear, min linear_mipmap_linear, wrap repeat + gl.generateMipmap(gl.TEXTURE_2D);
        // GLTextureLinear = mag/min linear, wrap clamp
        // GLTextureNearestRepeat = mag/min NEAREST, wrap repeat
        // GLTextureNearest = mag/min nearest, wrap clamp
        // AudioTexture = whatever + luminance + width 512, height 2, border 0
        // KeyTexture = whatever + luminance + width 256, height 2, border 0

        //  magFilter can be: gl.LINEAR, gl.LINEAR_MIPMAP_LINEAR or gl.NEAREST
        //  wrapS/T can be: gl.CLAMP_TO_EDGE or gl.REPEAT

        var magFilter = (data.magFilter) ? data.magFilter : PIXI.gl.LINEAR;
        var minFilter = (data.minFilter) ? data.minFilter : PIXI.gl.LINEAR;
        var wrapS = (data.wrapS) ? data.wrapS : PIXI.gl.CLAMP_TO_EDGE;
        var wrapT = (data.wrapT) ? data.wrapT : PIXI.gl.CLAMP_TO_EDGE;
        var format = (data.luminance) ? PIXI.gl.LUMINANCE : PIXI.gl.RGBA;

        if (data.repeat)
        {
            wrapS = PIXI.gl.REPEAT;
            wrapT = PIXI.gl.REPEAT;
        }

        PIXI.gl.pixelStorei(PIXI.gl.UNPACK_FLIP_Y_WEBGL, false);

        if (data.width)
        {
            var width = (data.width) ? data.width : 512;
            var height = (data.height) ? data.height : 2;
            var border = (data.border) ? data.border : 0;

            // void texImage2D(GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLint border, GLenum format, GLenum type, ArrayBufferView? pixels);
            PIXI.gl.texImage2D(PIXI.gl.TEXTURE_2D, 0, format, width, height, border, format, PIXI.gl.UNSIGNED_BYTE, null);
        }
        else
        {
            //  void texImage2D(GLenum target, GLint level, GLenum internalformat, GLenum format, GLenum type, ImageData? pixels);
            PIXI.gl.texImage2D(PIXI.gl.TEXTURE_2D, 0, format, PIXI.gl.RGBA, PIXI.gl.UNSIGNED_BYTE, uniform.value.baseTexture.source);
        }

        PIXI.gl.texParameteri(PIXI.gl.TEXTURE_2D, PIXI.gl.TEXTURE_MAG_FILTER, magFilter);
        PIXI.gl.texParameteri(PIXI.gl.TEXTURE_2D, PIXI.gl.TEXTURE_MIN_FILTER, minFilter);
        PIXI.gl.texParameteri(PIXI.gl.TEXTURE_2D, PIXI.gl.TEXTURE_WRAP_S, wrapS);
        PIXI.gl.texParameteri(PIXI.gl.TEXTURE_2D, PIXI.gl.TEXTURE_WRAP_T, wrapT);
    }

    PIXI.gl.uniform1i(uniform.uniformLocation, this.textureCount);

    uniform._init = true;

    this.textureCount++;

};

/**
* Updates the shader uniform values.
*
* @method PIXI.PixiShader#syncUniforms
*/
PIXI.PixiShader.prototype.syncUniforms = function()
{
    this.textureCount = 1;
    var uniform;

    //  This would probably be faster in an array and it would guarantee key order
    for (var key in this.uniforms) 
    {

        uniform = this.uniforms[key];

        if (uniform.glValueLength == 1)
        {
            if (uniform.glMatrix === true)
            {
                uniform.glFunc.call(PIXI.gl, uniform.uniformLocation, uniform.transpose, uniform.value);
            }
            else
            {
                uniform.glFunc.call(PIXI.gl, uniform.uniformLocation, uniform.value);
            }
        }
        else if (uniform.glValueLength == 2)
        {
            uniform.glFunc.call(PIXI.gl, uniform.uniformLocation, uniform.value.x, uniform.value.y);
        }
        else if (uniform.glValueLength == 3)
        {
            uniform.glFunc.call(PIXI.gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z);
        }
        else if (uniform.glValueLength == 4)
        {
            uniform.glFunc.call(PIXI.gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z, uniform.value.w);
        }
        else if (uniform.type == 'sampler2D')
        {
            if (uniform._init)
            {
                PIXI.gl.activeTexture(PIXI.gl['TEXTURE' + this.textureCount]);
                PIXI.gl.bindTexture(PIXI.gl.TEXTURE_2D, uniform.value.baseTexture._glTexture);
                PIXI.gl.uniform1i(uniform.uniformLocation, this.textureCount);
                this.textureCount++;
            }
            else
            {
                this.initSampler2D(uniform);
            }
        }
    }
    
};

PIXI.PixiShader.defaultVertexSrc = [
    
    "attribute vec2 aVertexPosition;",
    "attribute vec2 aTextureCoord;",
    "attribute float aColor;",

    "uniform vec2 projectionVector;",
    "uniform vec2 offsetVector;",
    "varying vec2 vTextureCoord;",

    "varying float vColor;",

    "const vec2 center = vec2(-1.0, 1.0);",
    
    "void main(void) {",
        "gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);",
        "vTextureCoord = aTextureCoord;",
        "vColor = aColor;",
    "}"
];
