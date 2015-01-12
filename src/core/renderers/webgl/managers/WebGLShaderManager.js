var WebGLManager = require('./WebGLManager'),
    PrimitiveShader = require('../shaders/PrimitiveShader'),
    ComplexPrimitiveShader = require('../shaders/ComplexPrimitiveShader'),
    Shader = require('../shaders/Shader'),
    FastShader = require('../shaders/FastShader'),
    StripShader = require('../shaders/StripShader');

/**
 * @class
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this manager works for.
 */
function WebGLShaderManager(renderer)
{
    WebGLManager.call(this, renderer);

    /**
     * @member {number}
     */
    this.maxAttibs = 10;

    /**
     * @member {any[]}
     */
    this.attribState = [];

    /**
     * @member {any[]}
     */
    this.tempAttribState = [];

    for (var i = 0; i < this.maxAttibs; i++)
    {
        this.attribState[i] = false;
    }

    /**
     * @member {any[]}
     */
    this.stack = [];

    /**
     * @member {number}
     * @private
     */
    this._currentId = -1;

    /**
     * @member {Shader}
     * @private
     */
    this.currentShader = null;

    // this shader is used for rendering primitives
    this.primitiveShader = null;

    // this shader is used for rendering triangle strips
    this.complexPrimitiveShader = null;

    // this shader is used for the default sprite rendering
    this.defaultShader = null;

    // this shader is used for the fast sprite rendering
    this.fastShader = null;

    // the next one is used for rendering triangle strips
    this.stripShader = null;

    // listen for context and update necessary shaders
    var self = this;
    this.renderer.on('context', function (event)
    {
        var gl = event.data;

        // this shader is used for rendering primitives
        self.primitiveShader = new PrimitiveShader(gl);

        // this shader is used for rendering triangle strips
        self.complexPrimitiveShader = new ComplexPrimitiveShader(gl);

        // this shader is used for the default sprite rendering
        self.defaultShader = new Shader(gl);

        // this shader is used for the fast sprite rendering
        self.fastShader = new FastShader(gl);

        // the next one is used for rendering triangle strips
        self.stripShader = new StripShader(gl);

        self.setShader(self.defaultShader);
    });
}

WebGLShaderManager.prototype = Object.create(WebGLManager.prototype);
WebGLShaderManager.prototype.constructor = WebGLShaderManager;
module.exports = WebGLShaderManager;

/**
 * Takes the attributes given in parameters.
 *
 * @param attribs {Array} attribs
 */
WebGLShaderManager.prototype.setAttribs = function (attribs)
{
    // reset temp state
    var i;

    for (i = 0; i < this.tempAttribState.length; i++)
    {
        this.tempAttribState[i] = false;
    }

    // set the new attribs
    for (var a in attribs)
    {
        this.tempAttribState[attribs[a]] = true;
    }

    var gl = this.renderer.gl;

    for (i = 0; i < this.attribState.length; i++)
    {
        if (this.attribState[i] !== this.tempAttribState[i])
        {
            this.attribState[i] = this.tempAttribState[i];

            if (this.attribState[i])
            {
                gl.enableVertexAttribArray(i);
            }
            else
            {
                gl.disableVertexAttribArray(i);
            }
        }
    }
};

/**
 * Sets the current shader.
 *
 * @param shader {Any}
 */
WebGLShaderManager.prototype.setShader = function (shader)
{
    if (this._currentId === shader.uuid)
    {
        return false;
    }

    this._currentId = shader.uuid;

    this.currentShader = shader;

    this.renderer.gl.useProgram(shader.program);
    this.setAttribs(shader.attributes);

    return true;
};

/**
 * Destroys this object.
 *
 */
WebGLShaderManager.prototype.destroy = function ()
{
    this.attribState = null;

    this.tempAttribState = null;

    this.primitiveShader.destroy();
    this.primitiveShader = null;

    this.complexPrimitiveShader.destroy();
    this.complexPrimitiveShader = null;

    this.defaultShader.destroy();
    this.defaultShader = null;

    this.fastShader.destroy();
    this.fastShader = null;

    this.stripShader.destroy();
    this.stripShader = null;

    this.renderer = null;
};
