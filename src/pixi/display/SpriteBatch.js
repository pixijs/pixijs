/**
 * @author Mat Groves http://matgroves.com/
 */

/**
 * TODO-Alvin
 *
 * @class SpriteBatch
 * @constructor
 * @param texture {Texture}
 */
PIXI.SpriteBatch = function(texture)
{
    PIXI.DisplayObjectContainer.call( this);

    this.textureThing = texture;

    this.ready = false;
};

PIXI.SpriteBatch.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
PIXI.SpriteBatch.constructor = PIXI.SpriteBatch;


/*
 * Initialises the spriteBatch
 *
 * @method initWebGL
 * @param gl {WebGLContext} the current WebGL drawing context
 */
PIXI.SpriteBatch.prototype.initWebGL = function(gl)
{
    this.fastSpriteBatch = new PIXI.WebGLFastSpriteBatch(gl);

    this.ready = true;
  //  alert("!")
};

/*
 * Updates the object transform for rendering
 *
 * @method updateTransform
 * @private
 */
PIXI.SpriteBatch.prototype.updateTransform = function()
{
   // dont need to!
    PIXI.DisplayObject.prototype.updateTransform.call( this );
  //  PIXI.DisplayObjectContainer.prototype.updateTransform.call( this );
};

/**
* Renders the object using the WebGL renderer
*
* @method _renderWebGL
* @param renderSession {RenderSession} 
* @private
*/
PIXI.SpriteBatch.prototype._renderWebGL = function(renderSession)
{
    if(!this.visible || this.alpha <= 0 || !this.children.length)return;

    if(!this.ready)this.initWebGL( renderSession.gl );
    
    renderSession.spriteBatch.stop();
    
    renderSession.shaderManager.activateShader(renderSession.shaderManager.fastShader);
    
    this.fastSpriteBatch.begin(this, renderSession);
    this.fastSpriteBatch.render(this);

    renderSession.shaderManager.activateShader(renderSession.shaderManager.defaultShader);

    renderSession.spriteBatch.start();
 
};

/**
* Renders the object using the Canvas renderer
*
* @method _renderCanvas
* @param renderSession {RenderSession} 
* @private
*/
PIXI.SpriteBatch.prototype._renderCanvas = function(renderSession)
{
    var context = renderSession.context;
    context.globalAlpha = this.worldAlpha;

    var transform = this.worldTransform;

    // alow for trimming
       
    if (PIXI.canvas.PX_ROUND)
    {
        context.setTransform(transform.a, transform.c, transform.b, transform.d, Math.floor(transform.tx), Math.floor(transform.ty));
    }
    else
    {
        context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
    }

    context.save();

    for (var i = 0; i < this.children.length; i++) {
       
        var child = this.children[i];
        var texture = child.texture;
        var frame = texture.frame;

        context.globalAlpha = this.worldAlpha * child.alpha;

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

            if(this.rotation !== this.rotationCache)
            {
                this.rotationCache = this.rotation;
                this._sr =  Math.sin(this.rotation);
                this._cr =  Math.cos(this.rotation);
            }

            var a = child._cr * child.scale.x,
                b = -child._sr * child.scale.y,
                c = child._sr * child.scale.x,
                d = child._cr * child.scale.y;
                
            context.setTransform(a, c, b, d, child.position.x, child.position.y);

            //context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
            
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

