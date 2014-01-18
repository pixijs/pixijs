

PIXI.SpriteBatch = function(texture)
{
    PIXI.DisplayObjectContainer.call( this);

    this.textureThing = texture;

    this.ready = false;
};

PIXI.SpriteBatch.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
PIXI.SpriteBatch.constructor = PIXI.SpriteBatch;

PIXI.SpriteBatch.prototype.initWebGL = function(gl)
{
   

    this.fastSpriteBatch = new PIXI.WebGLFastSpriteBatch(gl);

    this.ready = true;
  //  alert("!")
};

PIXI.SpriteBatch.prototype.updateTransform = function()
{
   // dont need to!
        
  //  PIXI.DisplayObjectContainer.prototype.updateTransform.call( this );
};

PIXI.SpriteBatch.prototype._renderWebGL = function(renderSession)
{
    if(!this.visible)return;

  //  renderSession.shaderManager.deactivateDefaultShader()
    if(!this.ready)this.initWebGL( renderSession.gl );
    
    renderSession.spriteBatch.stop();
    
    renderSession.shaderManager.activateShader(renderSession.shaderManager.fastShader);

    this.fastSpriteBatch.begin(renderSession);
    this.fastSpriteBatch.render(this.children);

    //console.log("!!")

//  renderSession.shaderManager.activateDefaultShader()
    
    renderSession.shaderManager.activateShader(renderSession.shaderManager.defaultShader);

    renderSession.spriteBatch.start();
  /*
  gl.useProgram(PIXI.defaultShader.program);

  gl.enableVertexAttribArray(PIXI.defaultShader.aVertexPosition);
  gl.enableVertexAttribArray(PIXI.defaultShader.colorAttribute);
  gl.enableVertexAttribArray(PIXI.defaultShader.aTextureCoord);
*/
   
};

PIXI.SpriteBatch.prototype._renderCanvas = function(renderSession)
{
    PIXI.DisplayObjectContainer.prototype.updateTransform.call( this );
    PIXI.DisplayObjectContainer.prototype._renderCanvas.call(this, renderSession);
};

