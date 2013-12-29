/**
 * @author Mat Groves
 * 
 * 
 */

PIXI.CanvasTinter = function()
{
   /// this.textureCach
}

PIXI.CanvasTinter.getTintedTexture = function(texture, color)
{ 
    var stringColor = '#' + ('00000' + ( color | 0).toString(16)).substr(-6);
    
     // clone texture..
    var canvas = document.createElement("canvas");
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