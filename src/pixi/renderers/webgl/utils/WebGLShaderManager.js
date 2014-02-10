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

    for (var i = 0; i < this.maxAttibs; i++) {
        this.attribState[i] = false;
    }

    this.setContext(gl);
    // the final one is used for the rendering strips
    //this.stripShader = new PIXI.StripShader(gl);
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

    // this shader is used for the default sprite rendering
    this.defaultShader = new PIXI.PixiShader(gl);

    // this shader is used for the fast sprite rendering
    this.fastShader = new PIXI.PixiFastShader(gl);


    this.activateShader(this.defaultShader);
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

/**
* Sets-up the given shader 
*
* @method activateShader
* @param shader {Object} the shader that is going to be activated
*/
PIXI.WebGLShaderManager.prototype.activateShader = function(shader)
{
    //if(this.currentShader == shader)return;

    this.currentShader = shader;

    this.gl.useProgram(shader.program);
    this.setAttribs(shader.attributes);
  
};

/**
* Triggers the primitive shader
* @method activatePrimitiveShader
*/
PIXI.WebGLShaderManager.prototype.activatePrimitiveShader = function()
{
    var gl = this.gl;

    gl.useProgram(this.primitiveShader.program);

    this.setAttribs(this.primitiveShader.attributes);
    
};

/**
* Disable the primitive shader
* @method deactivatePrimitiveShader
*/
PIXI.WebGLShaderManager.prototype.deactivatePrimitiveShader = function()
{
    var gl = this.gl;

    gl.useProgram(this.defaultShader.program);

    this.setAttribs(this.defaultShader.attributes);
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

    this.gl = null;
};

