/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */
 
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

/**
 * A polyfill for requestAnimationFrame
 * You can actually use both requestAnimationFrame and requestAnimFrame, 
 * you will still benefit from the polyfill
 *
 * @method requestAnimationFrame
 */
/**
 * A polyfill for cancelAnimationFrame
 *
 * @method cancelAnimationFrame
 */
var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
        window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}

window.requestAnimFrame = window.requestAnimationFrame;

/**
 * Converts a hex color number to an [R, G, B] array
 *
 * @method hex2rgb
 * @param hex {Number}
 */
PIXI.hex2rgb = function(hex) {
    return [(hex >> 16 & 0xFF) / 255, ( hex >> 8 & 0xFF) / 255, (hex & 0xFF)/ 255];
};

/**
 * Converts a color as an [R, G, B] array to a hex number
 *
 * @method rgb2hex
 * @param rgb {Array}
 */
PIXI.rgb2hex = function(rgb) {
    return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
};

/**
 * A polyfill for Function.prototype.bind
 *
 * @method bind
 */
if (typeof Function.prototype.bind !== 'function') {
    Function.prototype.bind = (function () {
        var slice = Array.prototype.slice;
        return function (thisArg) {
            var target = this, boundArgs = slice.call(arguments, 1);

            if (typeof target !== 'function') throw new TypeError();

            function bound() {
                var args = boundArgs.concat(slice.call(arguments));
                target.apply(this instanceof bound ? this : thisArg, args);
            }

            bound.prototype = (function F(proto) {
                if (proto) F.prototype = proto;
                if (!(this instanceof F)) return new F();
            })(target.prototype);

            return bound;
        };
    })();
}

/**
 * A wrapper for ajax requests to be handled cross browser
 *
 * @class AjaxRequest
 * @constructor
 */
PIXI.AjaxRequest = function()
{
    var activexmodes = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Microsoft.XMLHTTP']; //activeX versions to check for in IE

    if (window.ActiveXObject)
    { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
        for (var i=0; i<activexmodes.length; i++)
        {
            try{
                return new window.ActiveXObject(activexmodes[i]);
            }
            catch(e) {
                //suppress error
            }
        }
    }
    else if (window.XMLHttpRequest) // if Mozilla, Safari etc
    {
        return new window.XMLHttpRequest();
    }
    else
    {
        return false;
    }
};
/*
PIXI.packColorRGBA = function(r, g, b, a)//r, g, b, a)
{
  //  console.log(r, b, c, d)
  return (Math.floor((r)*63) << 18) | (Math.floor((g)*63) << 12) | (Math.floor((b)*63) << 6);// | (Math.floor((a)*63))
  //  i = i | (Math.floor((a)*63));
   // return i;
   // var r = (i / 262144.0 ) / 64;
   // var g = (i / 4096.0)%64 / 64;
  //  var b = (i / 64.0)%64 / 64;
  //  var a = (i)%64 / 64;
     
  //  console.log(r, g, b, a);
  //  return i;

};
*/
/*
PIXI.packColorRGB = function(r, g, b)//r, g, b, a)
{
    return (Math.floor((r)*255) << 16) | (Math.floor((g)*255) << 8) | (Math.floor((b)*255));
};

PIXI.unpackColorRGB = function(r, g, b)//r, g, b, a)
{
    return (Math.floor((r)*255) << 16) | (Math.floor((g)*255) << 8) | (Math.floor((b)*255));
};
*/

/**
 * Checks whether the Canvas BlendModes are supported by the current browser
 *
 * @method canUseNewCanvasBlendModes
 * @return {Boolean} whether they are supported
 */
PIXI.canUseNewCanvasBlendModes = function()
{
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0,0,1,1);
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = '#fff';
    context.fillRect(0,0,1,1);
    return context.getImageData(0,0,1,1).data[0] === 0;
};

/**
 * Given a number, this function returns the closest number that is a power of two
 * this function is taken from Starling Framework as its pretty neat ;)
 *
 * @method getNextPowerOfTwo
 * @param number {Number}
 * @return {Number} the closest number that is a power of two
 */
PIXI.getNextPowerOfTwo = function(number)
{
    if (number > 0 && (number & (number - 1)) === 0) // see: http://goo.gl/D9kPj
        return number;
    else
    {
        var result = 1;
        while (result < number) result <<= 1;
        return result;
    }
};
