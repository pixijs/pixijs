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
    
}

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
    //this.dimensions = gl.getUniformLocation(this.program, "dimensions");
    
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
  
    this.program = program;
}

/**
* Updates the shader uniform values.
* Uniforms are specified in the GLSL_ES Specification: http://www.khronos.org/registry/webgl/specs/latest/1.0/
* http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf
*
* @method PIXI.PixiShader#syncUniforms
*/
PIXI.PixiShader.prototype.syncUniforms = function()
{
    this.textureCount = 1;

    var gl = PIXI.gl;
    
    for (var key in this.uniforms) 
    {
        var type = this.uniforms[key].type;
        var transpose = false;

        if (this.uniforms[key].transpose)
        {
            transpose = this.uniforms[key].transpose;
        }

        if (type == "1f")
        {
            // void uniform1f(WebGLUniformLocation? location, GLfloat x);
            gl.uniform1f(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "1fv")
        {
            // void uniform1fv(WebGLUniformLocation? location, Float32Array v);
            // void uniform1fv(WebGLUniformLocation? location, sequence<GLfloat> v);
            gl.uniform1fv(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "1i")
        {
            // void uniform1i(WebGLUniformLocation? location, GLint x);
            gl.uniform1i(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "1iv")
        {
            // void uniform1iv(WebGLUniformLocation? location, Int32Array v);
            // void uniform1iv(WebGLUniformLocation? location, sequence<long> v);
            gl.uniform1i(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "2f")
        {
            // void uniform2f(WebGLUniformLocation? location, GLfloat x, GLfloat y);
            gl.uniform2f(this.uniforms[key].uniformLocation, this.uniforms[key].value.x, this.uniforms[key].value.y);
        }
        else if (type == "2fv")
        {
            // void uniform2fv(WebGLUniformLocation? location, Float32Array v);
            // void uniform2fv(WebGLUniformLocation? location, sequence<GLfloat> v);
            gl.uniform2fv(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "2i")
        {
            // void uniform2i(WebGLUniformLocation? location, GLint x, GLint y);
            gl.uniform2i(this.uniforms[key].uniformLocation, this.uniforms[key].value.x, this.uniforms[key].value.y);
        }
        else if (type == "2iv")
        {
            // void uniform2iv(WebGLUniformLocation? location, Int32Array v);
            // void uniform2iv(WebGLUniformLocation? location, sequence<long> v);
            gl.uniform2iv(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "3f")
        {
            // void uniform3f(WebGLUniformLocation? location, GLfloat x, GLfloat y, GLfloat z);
            gl.uniform3f(this.uniforms[key].uniformLocation, this.uniforms[key].value.x, this.uniforms[key].value.y, this.uniforms[key].value.z);
        }
        else if (type == "3fv")
        {
            // void uniform3fv(WebGLUniformLocation? location, Float32Array v);
            // void uniform3fv(WebGLUniformLocation? location, sequence<GLfloat> v);
            gl.uniform3fv(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "3i")
        {
            // void uniform3i(WebGLUniformLocation? location, GLint x, GLint y, GLint z);
            gl.uniform3i(this.uniforms[key].uniformLocation, this.uniforms[key].value.x, this.uniforms[key].value.y, this.uniforms[key].value.z);
        }
        else if (type == "3iv")
        {
            // void uniform3iv(WebGLUniformLocation? location, Int32Array v);
            // void uniform3iv(WebGLUniformLocation? location, sequence<long> v);
            gl.uniform3iv(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "4f")
        {
            // void uniform4f(WebGLUniformLocation? location, GLfloat x, GLfloat y, GLfloat z, GLfloat w);
            gl.uniform4f(this.uniforms[key].uniformLocation, this.uniforms[key].value.x, this.uniforms[key].value.y, this.uniforms[key].value.z, this.uniforms[key].value.w);
        }
        else if (type == "4fv")
        {
            // void uniform4fv(WebGLUniformLocation? location, Float32Array v);
            // void uniform4fv(WebGLUniformLocation? location, sequence<GLfloat> v);
            gl.uniform4fv(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "4i")
        {
            // void uniform4i(WebGLUniformLocation? location, GLint x, GLint y, GLint z, GLint w);
            gl.uniform4i(this.uniforms[key].uniformLocation, this.uniforms[key].value.x, this.uniforms[key].value.y, this.uniforms[key].value.z, this.uniforms[key].value.w);
        }
        else if (type == "4iv")
        {
            // void uniform4iv(WebGLUniformLocation? location, Int32Array v);
            // void uniform4iv(WebGLUniformLocation? location, sequence<long> v);
            gl.uniform4iv(this.uniforms[key].uniformLocation, this.uniforms[key].value);
        }
        else if (type == "mat2")
        {
            // void uniformMatrix2fv(WebGLUniformLocation? location, GLboolean transpose, Float32Array value);
            // void uniformMatrix2fv(WebGLUniformLocation? location, GLboolean transpose, sequence<GLfloat> value);
            gl.uniformMatrix2fv(this.uniforms[key].uniformLocation, transpose, this.uniforms[key].value);
        }
        else if (type == "mat3")
        {
            // void uniformMatrix3fv(WebGLUniformLocation? location, GLboolean transpose, Float32Array value);
            // void uniformMatrix3fv(WebGLUniformLocation? location, GLboolean transpose, sequence<GLfloat> value);
            gl.uniformMatrix3fv(this.uniforms[key].uniformLocation, transpose, this.uniforms[key].value);
        }
        else if (type == "mat4")
        {
            // void uniformMatrix4fv(WebGLUniformLocation? location, GLboolean transpose, Float32Array value);
            // void uniformMatrix4fv(WebGLUniformLocation? location, GLboolean transpose, sequence<GLfloat> value);
            gl.uniformMatrix4fv(this.uniforms[key].uniformLocation, transpose, this.uniforms[key].value);
        }
        else if (type == "sampler2D")
        {
            if (this.uniforms[key].value && this.uniforms[key].value.baseTexture.hasLoaded)
            {
                var texture = this.uniforms[key].value.baseTexture._glTexture;
                var image = this.uniforms[key].value.baseTexture.source;
                var format = gl.RGBA;

                if (this.uniforms[key].format && this.uniforms[key].format == 'luminance')
                {
                    format = gl.LUMINANCE;
                }

                gl.activeTexture(gl['TEXTURE' + this.textureCount]);

                if (this.uniforms[key].wrap)
                {
                    if (this.uniforms[key].wrap == 'no-repeat' || this.uniforms[key].wrap === false)
                    {
                        this.createGLTextureLinear(gl, image, texture);
                    }
                    else if (this.uniforms[key].wrap == 'repeat' || this.uniforms[key].wrap === true)
                    {
                        this.createGLTexture(gl, image, format, texture);
                    }
                    else if (this.uniforms[key].wrap == 'nearest-repeat')
                    {
                        this.createGLTextureNearestRepeat(gl, image, texture);
                    }
                    else if (this.uniforms[key].wrap == 'nearest')
                    {
                        this.createGLTextureNearest(gl, image, texture);
                    }
                    else if (this.uniforms[key].wrap == 'audio')
                    {
                        this.createAudioTexture(gl, texture);
                    }
                    else if (this.uniforms[key].wrap == 'keyboard')
                    {
                        this.createKeyboardTexture(gl, texture);
                    }
                }
                else
                {
                    this.createGLTextureLinear(gl, image, texture);
                }

                gl.uniform1i(this.uniforms[key].uniformLocation, this.textureCount);

                this.textureCount++;
            }
        }
    }
    
};

/**
* Binds the given texture and image data. The texture is set to REPEAT.
* Code based on Effects.js from ShaderToy.com
* @method PIXI.PixiShader#createGLTexture
*/
PIXI.PixiShader.prototype.createGLTexture = function(gl, image, format, texture)
{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
}

/**
* Binds the given texture and image data. The texture is set to CLAMP_TO_EDGE.
* Code based on Effects.js from ShaderToy.com
* @method PIXI.PixiShader#createGLTextureLinear
*/
PIXI.PixiShader.prototype.createGLTextureLinear = function(gl, image, texture)
{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

/**
* Binds the given texture and image data. The texture is set to REPEAT with NEAREST.
* Code based on Effects.js from ShaderToy.com
* @method PIXI.PixiShader#createGLTextureNearestRepeat
*/
PIXI.PixiShader.prototype.createGLTextureNearestRepeat = function(gl, image, texture)
{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

/**
* Binds the given texture and image data. The texture is set to CLAMP_TO_EDGE with NEAREST.
* Code based on Effects.js from ShaderToy.com
* @method PIXI.PixiShader#createGLTextureNearest
*/
PIXI.PixiShader.prototype.createGLTextureNearest = function(gl, image, texture)
{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

/**
* Binds the given texture data. The texture is set to CLAMP_TO_EDGE with LUMINANCE. Designed for use with real-time audio data.
* Code based on Effects.js from ShaderToy.com
* @method PIXI.PixiShader#createAudioTexture
*/
PIXI.PixiShader.prototype.createAudioTexture = function(gl, texture)
{
    gl.bindTexture(gl.TEXTURE_2D, texture );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE) ;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 512, 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, null);
}

/**
* Binds the given texture data. The texture is set to CLAMP_TO_EDGE with LUMINANCE. Designed for use with keyboard input data.
* Code based on Effects.js from ShaderToy.com
* @method PIXI.PixiShader#createKeyboardTexture
*/
PIXI.PixiShader.prototype.createKeyboardTexture = function(gl, texture)
{
    gl.bindTexture(gl.TEXTURE_2D, texture );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE) ;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 256, 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, null);
}

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
