var utils = require('../../../utils');

/**
 * @class
 * @namespace PIXI
 * @param [fragmentSrc] {string} The source of the fragment shader.
 * @param [vertexSrc] {string} The source of the vertex shader.
 */
function Shader(gl, fragmentSrc, vertexSrc, customUniforms, customAttributes) {
    /**
     * @member {number}
     * @readonly
     */
    this.uuid = utils.uuid();

    /**
     * @member {WebGLContext}
     * @readonly
     */
    this.gl = gl;

    /**
     * The WebGL program.
     * @member {WebGLProgram}
     * @readonly
     */
    this.program = null;

    this.uniforms = {
        uSampler:           { type: 'sampler2D', value: 0 },
        projectionVector:   { type: '2f', value: { x: 0, y: 0 } },
        offsetVector:       { type: '2f', value: { x: 0, y: 0 } },
        dimensions:         { type: '4f', value: new Float32Array(4) }
    };

    for (var u in customUniforms) {
        this.uniforms[u] = customUniforms[u];
    }

    this.attributes = {
        aVertexPosition:    0,
        aTextureCoord:      0,
        aColor:             0
    };

    for (var a in customAttributes) {
        this.attributes[a] = customAttributes[a];
    }

    this.textureCount = 0;

    /**
     * The vertex shader.
     * @member {Array}
     */
    this.vertexSrc = vertexSrc || [
        'attribute vec2 aVertexPosition;',
        'attribute vec2 aTextureCoord;',
        'attribute vec4 aColor;',

        'uniform vec2 projectionVector;',
        'uniform vec2 offsetVector;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'const vec2 center = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);',
        '   vTextureCoord = aTextureCoord;',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ].join('\n');

    /**
     * The fragment shader.
     * @member {Array}
     */
    this.fragmentSrc = fragmentSrc || [
        'precision lowp float;',

        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',

        'uniform sampler2D uSampler;',

        'void main(void) {',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;',
        '}'
    ].join('\n');

    this.init();
}

Shader.prototype.constructor = Shader;
module.exports = Shader;

Shader.prototype.init = function () {
    this.compile();

    this.gl.useProgram(this.program);

    this.cacheUniformLocations(Object.keys(this.uniforms));
    this.cacheAttributeLocations(Object.keys(this.attributes));
};

Shader.prototype.cacheUniformLocations = function (keys) {
    for (var i = 0; i < keys.length; ++i) {
        this.uniforms[keys[i]]._location = this.gl.getUniformLocation(this.program, keys[i]);
    }
};

Shader.prototype.cacheAttributeLocations = function (keys) {
    for (var i = 0; i < keys.length; ++i) {
        this.attributes[keys[i]] = this.gl.getAttribLocation(this.program, keys[i]);
    }

    // TODO: Check if this is needed anymore...
    // Begin worst hack eva //

    // WHY??? ONLY on my chrome pixel the line above returns -1 when using filters?
    // maybe its something to do with the current state of the gl context.
    // I'm convinced this is a bug in the chrome browser as there is NO reason why this should be returning -1 especially as it only manifests on my chrome pixel
    // If theres any webGL people that know why could happen please help :)
    if (this.attributes.aColor === -1) {
        this.attributes.aColor = 2;
    }

    // End worst hack eva //
};

Shader.prototype.compile = function () {
    var gl = this.gl;

    var glVertShader = this._glCompile(gl.VERTEX_SHADER, this.vertexSrc);
    var glFragShader = this._glCompile(gl.FRAGMENT_SHADER, this.fragmentSrc);

    var program = gl.createProgram();

    gl.attachShader(program, glVertShader);
    gl.attachShader(program, glFragShader);
    gl.linkProgram(program);

    // if linking fails, then log and cleanup
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        window.console.error('Pixi.js Error: Could not initialize shader.');
        window.console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS));
        window.console.error('gl.getError()', gl.getError());

        gl.deleteProgram(program);
        program = null;
    }

    // if there is a program info log, log it
    if (gl.getProgramInfoLog(program) !== '') {
        window.console.warn('Pixi.js Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
    }

    // clean up some shaders
    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    return (this.program = program);
};

Shader.prototype.syncUniforms = function () {
    var gl = this.gl;

    this.textureCount = 1;

    for (var key in this.uniforms) {
        var uniform = this.uniforms[key],
            location = uniform._location,
            value = uniform.value,
            i, il;

        switch (uniform.type) {
            case 'i':
            case '1i':
                gl.uniform1i(location, value);
                break;

            case 'f':
            case '1f':
                gl.uniform1f(location, value);
                break;

            case '2f':
                gl.uniform2f(location, value[0], value[1]);
                break;

            case '3f':
                gl.uniform3f(location, value[0], value[1], value[2]);
                break;

            case '4f':
                gl.uniform4f(location, value[0], value[1], value[2], value[3]);
                break;

            // a 2D Point object
            case 'v2':
                gl.uniform2f(location, value.x, value.y);
                break;

            // a 3D Point object
            case 'v3':
                gl.uniform3f(location, value.x, value.y, value.z);
                break;

            // a 4D Point object
            case 'v4':
                gl.uniform4f(location, value.x, value.y, value.z, value.w);
                break;

            case '1iv':
                gl.uniform1iv(location, value);
                break;

            case '3iv':
                gl.uniform3iv(location, value);
                break;

            case '1fv':
                gl.uniform1fv(location, value);
                break;

            case '2fv':
                gl.uniform2fv(location, value);
                break;

            case '3fv':
                gl.uniform3fv(location, value);
                break;

            case '4fv':
                gl.uniform4fv(location, value);
                break;

            case 'm2':
            case 'mat2':
            case 'Matrix2fv':
                gl.uniformMatrix2fv(location, uniform.transpose, value);
                break;

            case 'm3':
            case 'mat3':
            case 'Matrix3fv':
                gl.uniformMatrix3fv(location, uniform.transpose, value);
                break;

            case 'm4':
            case 'mat4':
            case 'Matrix4fv':
                gl.uniformMatrix4fv(location, uniform.transpose, value);
                break;

            // a Color Value
            case 'c':
                if (typeof value === 'number') {
                    value = utils.hex2rgb(value);
                }

                gl.uniform3f(location, value[0], value[1], value[2]);
                break;

            // flat array of integers (JS or typed array)
            case 'iv1':
                gl.uniform1iv(location, value);
                break;

            // flat array of integers with 3 x N size (JS or typed array)
            case 'iv':
                gl.uniform3iv(location, value);
                break;

            // flat array of floats (JS or typed array)
            case 'fv1':
                gl.uniform1fv(location, value);
                break;

            // flat array of floats with 3 x N size (JS or typed array)
            case 'fv':
                gl.uniform3fv(location, value);
                break;

            // array of 2D Point objects
            case 'v2v':
                if (!uniform._array) {
                    uniform._array = new Float32Array(2 * value.length);
                }

                for (i = 0, il = value.length; i < il; ++i) {
                    uniform._array[i * 2]       = value[i].x;
                    uniform._array[i * 2 + 1]   = value[i].y;
                }

                gl.uniform2fv(location, uniform._array);
                break;

            // array of 3D Point objects
            case 'v3v':
                if (!uniform._array) {
                    uniform._array = new Float32Array(3 * value.length);
                }

                for (i = 0, il = value.length; i < il; ++i) {
                    uniform._array[i * 3]       = value[i].x;
                    uniform._array[i * 3 + 1]   = value[i].y;
                    uniform._array[i * 3 + 2]   = value[i].z;

                }

                gl.uniform3fv(location, uniform._array);
                break;

            // array of 4D Point objects
            case 'v4v':
                if (!uniform._array) {
                    uniform._array = new Float32Array(4 * value.length);
                }

                for (i = 0, il = value.length; i < il; ++i) {
                    uniform._array[i * 4]       = value[i].x;
                    uniform._array[i * 4 + 1]   = value[i].y;
                    uniform._array[i * 4 + 2]   = value[i].z;
                    uniform._array[i * 4 + 3]   = value[i].w;

                }

                gl.uniform4fv(location, uniform._array);
                break;

            case 't':
            case 'sampler2D':
                if (!uniform.value || !uniform.value.baseTexture || !uniform.value.baseTexture.hasLoaded) {
                    break;
                }

                // activate this texture
                gl.activeTexture(gl['TEXTURE' + this.textureCount]);

                // bind the texture
                gl.bindTexture(gl.TEXTURE_2D, uniform.value.baseTexture._glTextures[gl.id]);

                // set uniform to texture index
                gl.uniform1i(uniform._location, this.textureCount);

                // increment next texture id
                this.textureCount++;

                // initialize the texture if we haven't yet
                if (!uniform._init) {
                    this.initSampler2D(uniform);

                    uniform._init = true;
                }
                break;

            default:
                window.console.warn('Pixi.js Shader Warning: Unknown uniform type: ' + uniform.type);
        }
    }
};


/**
 * Initialises a Sampler2D uniform (which may only be available later on after initUniforms once the texture has loaded)
 *
 */
Shader.prototype.initSampler2D = function (uniform) {
    var gl = this.gl;

    //  Extended texture data
    if (uniform.textureData) {
        var data = uniform.textureData;

        // GLTexture = mag linear, min linear_mipmap_linear, wrap repeat + gl.generateMipmap(gl.TEXTURE_2D);
        // GLTextureLinear = mag/min linear, wrap clamp
        // GLTextureNearestRepeat = mag/min NEAREST, wrap repeat
        // GLTextureNearest = mag/min nearest, wrap clamp
        // AudioTexture = whatever + luminance + width 512, height 2, border 0
        // KeyTexture = whatever + luminance + width 256, height 2, border 0

        //  magFilter can be: gl.LINEAR, gl.LINEAR_MIPMAP_LINEAR or gl.NEAREST
        //  wrapS/T can be: gl.CLAMP_TO_EDGE or gl.REPEAT

        var magFilter = (data.magFilter) ? data.magFilter : gl.LINEAR;
        var minFilter = (data.minFilter) ? data.minFilter : gl.LINEAR;
        var wrapS = (data.wrapS) ? data.wrapS : gl.CLAMP_TO_EDGE;
        var wrapT = (data.wrapT) ? data.wrapT : gl.CLAMP_TO_EDGE;
        var format = (data.luminance) ? gl.LUMINANCE : gl.RGBA;

        if (data.repeat) {
            wrapS = gl.REPEAT;
            wrapT = gl.REPEAT;
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!data.flipY);

        if (data.width) {
            var width = (data.width) ? data.width : 512;
            var height = (data.height) ? data.height : 2;
            var border = (data.border) ? data.border : 0;

            // void texImage2D(GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height, GLint border, GLenum format, GLenum type, ArrayBufferView? pixels);
            gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, border, format, gl.UNSIGNED_BYTE, null);
        }
        else {
            //  void texImage2D(GLenum target, GLint level, GLenum internalformat, GLenum format, GLenum type, ImageData? pixels);
            gl.texImage2D(gl.TEXTURE_2D, 0, format, gl.RGBA, gl.UNSIGNED_BYTE, uniform.value.baseTexture.source);
        }

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    }
};

/**
 * Destroys the shader.
 *
 */
Shader.prototype.destroy = function () {
    this.gl.deleteProgram(this.program);

    this.gl = null;
    this.uniforms = null;
    this.attributes = null;

    this.vertexSrc = null;
    this.fragmentSrc = null;
};

Shader.prototype._glCompile = function (type, src) {
    var shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        window.console.log(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};
