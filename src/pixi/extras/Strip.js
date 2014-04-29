/**
 * @author Mat Groves http://matgroves.com/
 */

 /**
 * 
 * @class Strip
 * @extends DisplayObjectContainer
 * @constructor
 * @param texture {Texture} The texture to use
 * @param width {Number} the width 
 * @param height {Number} the height
 * 
 */
PIXI.Strip = function(texture)
{
    PIXI.DisplayObjectContainer.call( this );
    
    this.texture = texture;

    // set up the main bits..
    this.uvs = new PIXI.Float32Array([0, 1,
                                    1, 1,
                                    1, 0,
                                    0,1]);

    this.verticies = new PIXI.Float32Array([0, 0,
                      100,0,
                      100,100,
                      0, 100]);

    this.colors = new PIXI.Float32Array([1, 1, 1, 1]);

    this.indices = new PIXI.Uint16Array([0, 1, 2, 3]);
    

    this.dirty = true;
};

// constructor
PIXI.Strip.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PIXI.Strip.prototype.constructor = PIXI.Strip;

PIXI.Strip.prototype._renderWebGL = function(renderSession)
{
    // if the sprite is not visible or the alpha is 0 then no need to render this element
    if(!this.visible || this.alpha <= 0)return;
    // render triangle strip..

    renderSession.spriteBatch.stop();

    // init! init!
    if(!this._vertexBuffer)this._initWebGL(renderSession);
    
    renderSession.shaderManager.activateStripShader();

    this._renderStrip(renderSession);

    renderSession.shaderManager.activateDefaultShader();

    renderSession.spriteBatch.start();

    //TODO check culling  
};

PIXI.Strip.prototype._initWebGL = function(renderSession)
{
    // build the strip!
    var gl = renderSession.gl;
    
    this._vertexBuffer = gl.createBuffer();
    this._indexBuffer = gl.createBuffer();
    this._uvBuffer = gl.createBuffer();
    this._colorBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,  this.uvs, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
};

PIXI.Strip.prototype._renderStrip = function(renderSession)
{
    var gl = renderSession.gl;
    var projection = renderSession.projection,
        offset = renderSession.offset,
        shader = renderSession.shaderManager.stripShader;


    // gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mat4Real);

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // set uniforms
    gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
    gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
    gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
    gl.uniform1f(shader.alpha, 1);

    if(!this.dirty)
    {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verticies);
        gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
        
        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
        gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            
        gl.activeTexture(gl.TEXTURE0);
         // bind the current texture
        gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(this.texture.baseTexture, gl));
    
        // dont need to upload!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    
    
    }
    else
    {

        this.dirty = false;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
        
        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(this.texture.baseTexture, gl));
    
        // dont need to upload!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        
    }
    //console.log(gl.TRIANGLE_STRIP)
    //
    //
    gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
    
  
};

/*
 * Sets the texture that the Strip will use 
 *
 * @method setTexture
 * @param texture {Texture} the texture that will be used
 * @private
 */

/*
PIXI.Strip.prototype.setTexture = function(texture)
{
    //TODO SET THE TEXTURES
    //TODO VISIBILITY

    // stop current texture
    this.texture = texture;
    this.width   = texture.frame.width;
    this.height  = texture.frame.height;
    this.updateFrame = true;
};
*/

/**
 * When the texture is updated, this event will fire to update the scale and frame
 *
 * @method onTextureUpdate
 * @param event
 * @private
 */

PIXI.Strip.prototype.onTextureUpdate = function()
{
    this.updateFrame = true;
};