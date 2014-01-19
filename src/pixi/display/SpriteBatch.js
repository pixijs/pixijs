

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
    PIXI.DisplayObject.prototype.updateTransform.call( this );
  //  PIXI.DisplayObjectContainer.prototype.updateTransform.call( this );
};

PIXI.SpriteBatch.prototype._renderWebGL = function(renderSession)
{
    if(!this.visible)return;

    if(!this.ready)this.initWebGL( renderSession.gl );
    
    renderSession.spriteBatch.stop();
    
    renderSession.shaderManager.activateShader(renderSession.shaderManager.fastShader);
    
    this.fastSpriteBatch.begin(this, renderSession);
    this.fastSpriteBatch.render(this);

    renderSession.shaderManager.activateShader(renderSession.shaderManager.defaultShader);

    renderSession.spriteBatch.start();
 
};

PIXI.SpriteBatch.prototype._renderCanvas = function(renderSession)
{
    var context = renderSession.context;
    context.globalAlpha = this.worldAlpha;

    var transform = this.worldTransform;

    // alow for trimming
       
    context.setTransform(transform[0], transform[3], transform[1], transform[4], transform[2], transform[5]);
    context.save();

    for (var i = 0; i < this.children.length; i++) {
       
        var child = this.children[i];
        var texture = child.texture;
        var frame = texture.frame;

        if(child.rotation % (Math.PI * 2) === 0)
        {
          
          // this is the fastest  way to optimise! - if rotation is 0 then we can avoid any kind of setTransform call
            context.drawImage(texture.baseTexture.source,
                                 frame.x,
                                 frame.y,
                                 frame.width,
                                 frame.height,
                                 ((child.anchor.x) * (-frame.width * child.scale.x) + child.position.x  + 0.5) | 0,
                                 ((child.anchor.y) * (-frame.height * child.scale.y) + child.position.y  + 0.5) | 0,
                                 frame.width * child.scale.x,
                                 frame.height * child.scale.y);
        }
        else
        {
            PIXI.DisplayObject.prototype.updateTransform.call(child);
           
            transform = child.localTransform;
            context.setTransform(transform[0], transform[3], transform[1], transform[4], transform[2], transform[5]);
            
            context.drawImage(texture.baseTexture.source,
                                 frame.x,
                                 frame.y,
                                 frame.width,
                                 frame.height,
                                 ((child.anchor.x) * (-frame.width) + 0.5) | 0,
                                 ((child.anchor.y) * (-frame.height) + 0.5) | 0,
                                 frame.width,
                                 frame.height);

        }
    }

    context.restore();
};

