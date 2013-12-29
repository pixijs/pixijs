/**
 * @author Mat Groves
 * 
 * 
 */

PIXI.CanvasTinter = function()
{
   /// this.textureCach
}

//PIXI.CanvasTinter.cachTint = true;
PIXI.CanvasTinter.cacheStepsPerColorChannel = 8;
PIXI.CanvasTinter.convertTintToImage = false;

PIXI.CanvasTinter.getTintedTexture = function(sprite, color, canvas)
{
    var cacheMode = 0;

    //
    // cach on sprite
    // cach on texture
    // no cache

    var texture = sprite.texture;

    color = PIXI.CanvasTinter.roundColor(color);

    var stringColor = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);
   
    texture.tintCache = texture.tintCache || {};

    if(texture.tintCache[stringColor]) return texture.tintCache[stringColor];

     // clone texture..
    var canvas = PIXI.CanvasTinter.canvas || document.createElement("canvas");
    var context = canvas.getContext( '2d' );

    var frame = texture.frame;

    canvas.width = frame.width;
    canvas.height = frame.height;

    context.fillStyle = stringColor;
    
    context.fillRect(0, 0, frame.width, frame.height);
    
    context.globalCompositeOperation = 'multiply';

    context.drawImage(texture.baseTexture.source,
                           frame.x,
                           frame.y,
                           frame.width,
                           frame.height,
                           0,
                           0,
                           frame.width,
                           frame.height);

    context.globalCompositeOperation = 'destination-atop';
    
    context.drawImage(texture.baseTexture.source,
                           frame.x,
                           frame.y,
                           frame.width,
                           frame.height,
                           0,
                           0,
                           frame.width,
                           frame.height);
    
    if(PIXI.CanvasTinter.convertTintToImage)
    {
      // is this better?
      var tintImage = new Image();
      tintImage.src = canvas.toDataURL();
              
      texture.tintCache[stringColor] = tintImage;
    }
    else
    {
      
      texture.tintCache[stringColor] = canvas;
      // if we are not converting the texture to an image then we need to lose the refferance to the canvas
      PIXI.CanvasTinter.canvas = null;

    }

    return canvas;
}

PIXI.CanvasTinter._getTintedTextureFast = function(texture, color, canvas)
{ 
    var context = canvas.getContext( '2d' );

    var frame = texture.frame;

    canvas.width = frame.width;
    canvas.height = frame.height;

    context.fillStyle = stringColor;

    context.fillRect(0, 0, frame.width, frame.height);

    context.globalCompositeOperation = 'multiply';

    context.drawImage(texture.baseTexture.source,
                         frame.x,
                         frame.y,
                         frame.width,
                         frame.height,
                         0,
                         0,
                         frame.width,
                         frame.height);

    context.globalCompositeOperation = 'destination-in';

    context.drawImage(texture.baseTexture.source,
                         frame.x,
                         frame.y,
                         frame.width,
                         frame.height,
                         0,
                         0,
                         frame.width,
                         frame.height);



    texture.tintCache[stringColor] = canvas;

    return canvas;
}

PIXI.CanvasTinter.roundColor = function(color)
{
    var step = PIXI.CanvasTinter.cacheStepsPerColorChannel;

    var rgbValues = PIXI.hex2rgb(color);

    rgbValues[0] = Math.round(rgbValues[0] * step) / step;
    rgbValues[1] = Math.round(rgbValues[1] * step) / step;
    rgbValues[2] = Math.round(rgbValues[2] * step) / step;

    return PIXI.rgb2hex(rgbValues)
}

PIXI.CanvasTinter._getTintedTextureFast = function(texture, color, canvas)
{ 
    var stringColor = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);
    
     // clone texture..
    var canvas = canvas || document.createElement("canvas");
    var context = canvas.getContext( '2d' );

    var frame = texture.frame;

    context.width = frame.width;
    context.height = frame.height;

    context.fillStyle = stringColor;
    
    context.fillRect(0, 0, frame.width, frame.height);
    
    context.globalCompositeOperation = 'multiply';

    context.drawImage(texture.baseTexture.source,
                           frame.x,
                           frame.y,
                           frame.width,
                           frame.height,
                           0,
                           0,
                           frame.width,
                           frame.height);

    context.globalCompositeOperation = 'destination-in';
    
    context.drawImage(texture.baseTexture.source,
                           frame.x,
                           frame.y,
                           frame.width,
                           frame.height,
                           0,
                           0,
                           frame.width,
                           frame.height);
    
    return canvas;
}