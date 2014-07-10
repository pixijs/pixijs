/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
* @class WebGLShaderManager
* @constructor
* @param gl {WebGLContext} the current WebGL drawing context
* @private
*/
PIXI.WebGLShaderManager = function(gl)
{

    this.maxAttibs = 10;
    this.attribState = [];
    this.tempAttribState = [];
    this.shaderMap = [];

    for (var i = 0; i < this.maxAttibs; i++) {
        this.attribState[i] = false;
    }

    this.setContext(gl);
    // the final one is used for the rendering strips
};


/**
* Initialises the context and the properties
* @method setContext 
* @param gl {WebGLContext} the current WebGL drawing context
* @param transparent {Boolean} Whether or not the drawing context should be transparent
*/
PIXI.WebGLShaderManager.prototype.setContext = function(gl)
{
    this.gl = gl;
    
    // the next one is used for rendering primatives
    this.primitiveShader = new PIXI.PrimitiveShader(gl);

    // the next one is used for rendering triangle strips
    this.complexPrimativeShader = new PIXI.ComplexPrimitiveShader(gl);

    // this shader is used for the default sprite rendering
    this.defaultShader = new PIXI.PixiShader(gl);

    // this shader is used for the fast sprite rendering
    this.fastShader = new PIXI.PixiFastShader(gl);

    // the next one is used for rendering triangle strips
    this.stripShader = new PIXI.StripShader(gl);
    this.setShader(this.defaultShader);
};


/**
* Takes the attributes given in parameters 
* @method setAttribs
* @param attribs {Array} attribs 
*/
PIXI.WebGLShaderManager.prototype.setAttribs = function(attribs)
{
    // reset temp state

    var i;

    for (i = 0; i < this.tempAttribState.length; i++)
    {
        this.tempAttribState[i] = false;
    }

    // set the new attribs
    for (i = 0; i < attribs.length; i++)
    {
        var attribId = attribs[i];
        this.tempAttribState[attribId] = true;
    }

    var gl = this.gl;

    for (i = 0; i < this.attribState.length; i++)
    {
        if(this.attribState[i] !== this.tempAttribState[i])
        {
            this.attribState[i] = this.tempAttribState[i];

            if(this.tempAttribState[i])
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

PIXI.WebGLShaderManager.prototype.setShader = function(shader)
{
    if(this._currentId === shader._UID)return false;
    
    this._currentId = shader._UID;

    this.currentShader = shader;

    this.gl.useProgram(shader.program);
    this.setAttribs(shader.attributes);

    return true;
};

/**
* Destroys
* @method destroy
*/
PIXI.WebGLShaderManager.prototype.destroy = function()
{
    this.attribState = null;

    this.tempAttribState = null;

    this.primitiveShader.destroy();

    this.defaultShader.destroy();

    this.fastShader.destroy();

    this.stripShader.destroy();

    this.gl = null;
};

