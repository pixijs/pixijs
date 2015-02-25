/**
 * @author Mat Groves http://matgroves.com/
 */

/**
 * The SpriteBatch class is a really fast version of the DisplayObjectContainer
 * built solely for speed, so use when you need a lot of sprites or particles.
 * And it's extremely easy to use :

    var container = new PIXI.SpriteBatch();

    stage.addChild(container);

    for(var i  = 0; i < 100; i++)
    {
        var sprite = new PIXI.Sprite.fromImage("myImage.png");
        container.addChild(sprite);
    }
 * And here you have a hundred sprites that will be renderer at the speed of light
 *
 * @class SpriteBatch
 * @constructor
 * @param texture {Texture}
 */

//TODO RENAME to PARTICLE CONTAINER?
PIXI.SpriteBatch = function(texture)
{
    PIXI.DisplayObjectContainer.call( this);

    this.textureThing = texture;

    this.ready = false;
};

PIXI.SpriteBatch.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PIXI.SpriteBatch.prototype.constructor = PIXI.SpriteBatch;

/*
 * Initialises the spriteBatch
 *
 * @method initWebGL
 * @param gl {WebGLContext} the current WebGL drawing context
 */
PIXI.SpriteBatch.prototype.initWebGL = function(gl)
{
    // TODO only one needed for the whole engine really?
    this.fastSpriteBatch = new PIXI.WebGLFastSpriteBatch(gl);

    this.ready = true;
};

/*
 * Updates the object transform for rendering
 *
 * @method updateTransform
 * @private
 */
PIXI.SpriteBatch.prototype.updateTransform = function()
{
    // TODO don't need to!
    this.displayObjectUpdateTransform();
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

    if(this.fastSpriteBatch.gl !== renderSession.gl) this.fastSpriteBatch.setContext(renderSession.gl);

    renderSession.spriteBatch.stop();

    renderSession.shaderManager.setShader(renderSession.shaderManager.fastShader);

    this.fastSpriteBatch.begin(this, renderSession);
    this.fastSpriteBatch.render(this);

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
    if(!this.visible || this.alpha <= 0 || !this.children.length)return;

    var context = renderSession.context;
    context.globalAlpha = this.worldAlpha;

    this.displayObjectUpdateTransform();

    var transform = this.worldTransform;
    // alow for trimming

    var isRotated = true;

    for (var i = 0; i < this.children.length; i++) {

        var child = this.children[i];

        if(!child.visible)continue;

        var texture = child.texture;
        var frame = texture.frame;

        context.globalAlpha = this.worldAlpha * child.alpha;

        if(child.rotation % (Math.PI * 2) === 0)
        {
            if(isRotated)
            {
                context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
                isRotated = false;
            }

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
            if(!isRotated)isRotated = true;

            child.displayObjectUpdateTransform();

            var childTransform = child.worldTransform;

            // allow for trimming

            if (renderSession.roundPixels)
            {
                context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx | 0, childTransform.ty | 0);
            }
            else
            {
                context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx, childTransform.ty);
            }

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

       // context.restore();
    }

//    context.restore();
};
