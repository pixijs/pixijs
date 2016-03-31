
/**
 * Checks whether the Canvas BlendModes are supported by the current browser
 *
 * @return {boolean} whether they are supported
 */
var canUseNewCanvasBlendModes = function ()
{
    if (typeof document === 'undefined')
    {
        return false;
    }

    var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
    var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';

    var magenta = new Image();
    magenta.src = pngHead + 'AP804Oa6' + pngEnd;

    var yellow = new Image();
    yellow.src = pngHead + '/wCKxvRF' + pngEnd;

    var canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;

    var context = canvas.getContext('2d');
    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta, 0, 0);
    context.drawImage(yellow, 2, 0);

    var data = context.getImageData(2,0,1,1).data;

    return (data[0] === 255 && data[1] === 0 && data[2] === 0);
};

module.exports = canUseNewCanvasBlendModes;
