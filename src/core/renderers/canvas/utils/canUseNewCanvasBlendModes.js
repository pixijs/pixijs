

/**
 * Creates a little colored canvas
 * @return {canvas} a small canvas element
 */
let createColoredCanvas = function(color)
{
    let canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;

    let context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0,0,6,1);
    return canvas;
};


/**
 * Checks whether the Canvas BlendModes are supported by the current browser
 *
 * @return {boolean} whether they are supported
 */
let canUseNewCanvasBlendModes = function ()
{
    if (typeof document === 'undefined')
    {
        return false;
    }

    let magenta = createColoredCanvas('#ff00ff');
    let yellow = createColoredCanvas('#ffff00');

    let canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;

    let context = canvas.getContext('2d');
    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta, 0, 0);
    context.drawImage(yellow, 2, 0);

    let imageData = context.getImageData(2,0,1,1);

    if (!imageData)
    {
        return false;
    }

    let data = imageData.data;

    return (data[0] === 255 && data[1] === 0 && data[2] === 0);
};


module.exports = canUseNewCanvasBlendModes;
