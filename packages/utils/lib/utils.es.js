/*!
 * @pixi/utils - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/utils is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { settings } from '@pixi/settings';
export { isMobile } from '@pixi/settings';
export { default as EventEmitter } from 'eventemitter3';
export { default as earcut } from 'earcut';
import { parse } from 'url';
export { default as url } from 'url';
import cssColorNames from 'css-color-names';
import { BLEND_MODES } from '@pixi/constants';

/**
 * The prefix that denotes a URL is for a retina asset.
 *
 * @static
 * @name RETINA_PREFIX
 * @memberof PIXI.settings
 * @type {RegExp}
 * @default /@([0-9\.]+)x/
 * @example `@2x`
 */
settings.RETINA_PREFIX = /@([0-9\.]+)x/;
/**
 * Should the `failIfMajorPerformanceCaveat` flag be enabled as a context option used in the `isWebGLSupported` function.
 * For most scenarios this should be left as true, as otherwise the user may have a poor experience.
 * However, it can be useful to disable under certain scenarios, such as headless unit tests.
 *
 * @static
 * @name FAIL_IF_MAJOR_PERFORMANCE_CAVEAT
 * @memberof PIXI.settings
 * @type {boolean}
 * @default true
 */
settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = true;

var saidHello = false;
var VERSION = '5.3.2';
/**
 * Skips the hello message of renderers that are created after this is run.
 *
 * @function skipHello
 * @memberof PIXI.utils
 */
function skipHello() {
    saidHello = true;
}
/**
 * Logs out the version and renderer information for this running instance of PIXI.
 * If you don't want to see this message you can run `PIXI.utils.skipHello()` before
 * creating your renderer. Keep in mind that doing that will forever make you a jerk face.
 *
 * @static
 * @function sayHello
 * @memberof PIXI.utils
 * @param {string} type - The string renderer type to log.
 */
function sayHello(type) {
    var _a;
    if (saidHello) {
        return;
    }
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
        var args = [
            "\n %c %c %c PixiJS " + VERSION + " - \u2730 " + type + " \u2730  %c  %c  http://www.pixijs.com/  %c %c \u2665%c\u2665%c\u2665 \n\n",
            'background: #ff66a5; padding:5px 0;',
            'background: #ff66a5; padding:5px 0;',
            'color: #ff66a5; background: #030307; padding:5px 0;',
            'background: #ff66a5; padding:5px 0;',
            'background: #ffc3dc; padding:5px 0;',
            'background: #ff66a5; padding:5px 0;',
            'color: #ff2424; background: #fff; padding:5px 0;',
            'color: #ff2424; background: #fff; padding:5px 0;',
            'color: #ff2424; background: #fff; padding:5px 0;' ];
        (_a = window.console).log.apply(_a, args);
    }
    else if (window.console) {
        window.console.log("PixiJS " + VERSION + " - " + type + " - http://www.pixijs.com/");
    }
    saidHello = true;
}

var supported;
/**
 * Helper for checking for WebGL support.
 *
 * @memberof PIXI.utils
 * @function isWebGLSupported
 * @return {boolean} Is WebGL supported.
 */
function isWebGLSupported() {
    if (typeof supported === 'undefined') {
        supported = (function supported() {
            var contextOptions = {
                stencil: true,
                failIfMajorPerformanceCaveat: settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT,
            };
            try {
                if (!window.WebGLRenderingContext) {
                    return false;
                }
                var canvas = document.createElement('canvas');
                var gl = (canvas.getContext('webgl', contextOptions)
                    || canvas.getContext('experimental-webgl', contextOptions));
                var success = !!(gl && gl.getContextAttributes().stencil);
                if (gl) {
                    var loseContext = gl.getExtension('WEBGL_lose_context');
                    if (loseContext) {
                        loseContext.loseContext();
                    }
                }
                gl = null;
                return success;
            }
            catch (e) {
                return false;
            }
        })();
    }
    return supported;
}

/**
 * Converts a hexadecimal color number to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
 *
 * @example
 * PIXI.utils.hex2rgb(0xffffff); // returns [1, 1, 1]
 * @memberof PIXI.utils
 * @function hex2rgb
 * @param {number} hex - The hexadecimal number to convert
 * @param  {number[]} [out=[]] - If supplied, this array will be used rather than returning a new one
 * @return {number[]} An array representing the [R, G, B] of the color where all values are floats.
 */
function hex2rgb(hex, out) {
    if (out === void 0) { out = []; }
    out[0] = ((hex >> 16) & 0xFF) / 255;
    out[1] = ((hex >> 8) & 0xFF) / 255;
    out[2] = (hex & 0xFF) / 255;
    return out;
}
/**
 * Converts a hexadecimal color number to a string.
 *
 * @example
 * PIXI.utils.hex2string(0xffffff); // returns "#ffffff"
 * @memberof PIXI.utils
 * @function hex2string
 * @param {number} hex - Number in hex (e.g., `0xffffff`)
 * @return {string} The string color (e.g., `"#ffffff"`).
 */
function hex2string(hex) {
    var hexString = hex.toString(16);
    hexString = '000000'.substr(0, 6 - hexString.length) + hexString;
    return "#" + hexString;
}
/**
 * Converts a string to a hexadecimal color number.
 * It can handle:
 *  hex strings starting with #: "#ffffff"
 *  hex strings starting with 0x: "0xffffff"
 *  hex strings without prefix: "ffffff"
 *  css colors: "black"
 *
 * @example
 * PIXI.utils.string2hex("#ffffff"); // returns 0xffffff
 * @memberof PIXI.utils
 * @function string2hex
 * @param {string} string - The string color (e.g., `"#ffffff"`)
 * @return {number} Number in hexadecimal.
 */
function string2hex(string) {
    if (typeof string === 'string') {
        string = cssColorNames[string.toLowerCase()] || string;
        if (string[0] === '#') {
            string = string.substr(1);
        }
    }
    return parseInt(string, 16);
}
/**
 * Converts a color as an [R, G, B] array of normalized floats to a hexadecimal number.
 *
 * @example
 * PIXI.utils.rgb2hex([1, 1, 1]); // returns 0xffffff
 * @memberof PIXI.utils
 * @function rgb2hex
 * @param {number[]} rgb - Array of numbers where all values are normalized floats from 0.0 to 1.0.
 * @return {number} Number in hexadecimal.
 */
function rgb2hex(rgb) {
    return (((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
}

/**
 * Corrects PixiJS blend, takes premultiplied alpha into account
 *
 * @memberof PIXI.utils
 * @function mapPremultipliedBlendModes
 * @private
 * @return {Array<number[]>} Mapped modes.
 */
function mapPremultipliedBlendModes() {
    var pm = [];
    var npm = [];
    for (var i = 0; i < 32; i++) {
        pm[i] = i;
        npm[i] = i;
    }
    pm[BLEND_MODES.NORMAL_NPM] = BLEND_MODES.NORMAL;
    pm[BLEND_MODES.ADD_NPM] = BLEND_MODES.ADD;
    pm[BLEND_MODES.SCREEN_NPM] = BLEND_MODES.SCREEN;
    npm[BLEND_MODES.NORMAL] = BLEND_MODES.NORMAL_NPM;
    npm[BLEND_MODES.ADD] = BLEND_MODES.ADD_NPM;
    npm[BLEND_MODES.SCREEN] = BLEND_MODES.SCREEN_NPM;
    var array = [];
    array.push(npm);
    array.push(pm);
    return array;
}
/**
 * maps premultiply flag and blendMode to adjusted blendMode
 * @memberof PIXI.utils
 * @const premultiplyBlendMode
 * @type {Array<number[]>}
 */
var premultiplyBlendMode = mapPremultipliedBlendModes();
/**
 * changes blendMode according to texture format
 *
 * @memberof PIXI.utils
 * @function correctBlendMode
 * @param {number} blendMode - supposed blend mode
 * @param {boolean} premultiplied - whether source is premultiplied
 * @returns {number} true blend mode for this texture
 */
function correctBlendMode(blendMode, premultiplied) {
    return premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
}
/**
 * combines rgb and alpha to out array
 *
 * @memberof PIXI.utils
 * @function premultiplyRgba
 * @param {Float32Array|number[]} rgb - input rgb
 * @param {number} alpha - alpha param
 * @param {Float32Array} [out] - output
 * @param {boolean} [premultiply=true] - do premultiply it
 * @returns {Float32Array} vec4 rgba
 */
function premultiplyRgba(rgb, alpha, out, premultiply) {
    out = out || new Float32Array(4);
    if (premultiply || premultiply === undefined) {
        out[0] = rgb[0] * alpha;
        out[1] = rgb[1] * alpha;
        out[2] = rgb[2] * alpha;
    }
    else {
        out[0] = rgb[0];
        out[1] = rgb[1];
        out[2] = rgb[2];
    }
    out[3] = alpha;
    return out;
}
/**
 * premultiplies tint
 *
 * @memberof PIXI.utils
 * @function premultiplyTint
 * @param {number} tint - integer RGB
 * @param {number} alpha - floating point alpha (0.0-1.0)
 * @returns {number} tint multiplied by alpha
 */
function premultiplyTint(tint, alpha) {
    if (alpha === 1.0) {
        return (alpha * 255 << 24) + tint;
    }
    if (alpha === 0.0) {
        return 0;
    }
    var R = ((tint >> 16) & 0xFF);
    var G = ((tint >> 8) & 0xFF);
    var B = (tint & 0xFF);
    R = ((R * alpha) + 0.5) | 0;
    G = ((G * alpha) + 0.5) | 0;
    B = ((B * alpha) + 0.5) | 0;
    return (alpha * 255 << 24) + (R << 16) + (G << 8) + B;
}
/**
 * converts integer tint and float alpha to vec4 form, premultiplies by default
 *
 * @memberof PIXI.utils
 * @function premultiplyTintToRgba
 * @param {number} tint - input tint
 * @param {number} alpha - alpha param
 * @param {Float32Array} [out] - output
 * @param {boolean} [premultiply=true] - do premultiply it
 * @returns {Float32Array} vec4 rgba
 */
function premultiplyTintToRgba(tint, alpha, out, premultiply) {
    out = out || new Float32Array(4);
    out[0] = ((tint >> 16) & 0xFF) / 255.0;
    out[1] = ((tint >> 8) & 0xFF) / 255.0;
    out[2] = (tint & 0xFF) / 255.0;
    if (premultiply || premultiply === undefined) {
        out[0] *= alpha;
        out[1] *= alpha;
        out[2] *= alpha;
    }
    out[3] = alpha;
    return out;
}

/**
 * Generic Mask Stack data structure
 *
 * @memberof PIXI.utils
 * @function createIndicesForQuads
 * @param {number} size - Number of quads
 * @param {Uint16Array|Uint32Array} [outBuffer] - Buffer for output, length has to be `6 * size`
 * @return {Uint16Array|Uint32Array} - Resulting index buffer
 */
function createIndicesForQuads(size, outBuffer) {
    if (outBuffer === void 0) { outBuffer = null; }
    // the total number of indices in our array, there are 6 points per quad.
    var totalIndices = size * 6;
    outBuffer = outBuffer || new Uint16Array(totalIndices);
    if (outBuffer.length !== totalIndices) {
        throw new Error("Out buffer length is incorrect, got " + outBuffer.length + " and expected " + totalIndices);
    }
    // fill the indices with the quads to draw
    for (var i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
        outBuffer[i + 0] = j + 0;
        outBuffer[i + 1] = j + 1;
        outBuffer[i + 2] = j + 2;
        outBuffer[i + 3] = j + 0;
        outBuffer[i + 4] = j + 2;
        outBuffer[i + 5] = j + 3;
    }
    return outBuffer;
}

function getBufferType(array) {
    if (array.BYTES_PER_ELEMENT === 4) {
        if (array instanceof Float32Array) {
            return 'Float32Array';
        }
        else if (array instanceof Uint32Array) {
            return 'Uint32Array';
        }
        return 'Int32Array';
    }
    else if (array.BYTES_PER_ELEMENT === 2) {
        if (array instanceof Uint16Array) {
            return 'Uint16Array';
        }
    }
    else if (array.BYTES_PER_ELEMENT === 1) {
        if (array instanceof Uint8Array) {
            return 'Uint8Array';
        }
    }
    // TODO map out the rest of the array elements!
    return null;
}

/* eslint-disable object-shorthand */
var map = { Float32Array: Float32Array, Uint32Array: Uint32Array, Int32Array: Int32Array, Uint8Array: Uint8Array };
function interleaveTypedArrays(arrays, sizes) {
    var outSize = 0;
    var stride = 0;
    var views = {};
    for (var i = 0; i < arrays.length; i++) {
        stride += sizes[i];
        outSize += arrays[i].length;
    }
    var buffer = new ArrayBuffer(outSize * 4);
    var out = null;
    var littleOffset = 0;
    for (var i = 0; i < arrays.length; i++) {
        var size = sizes[i];
        var array = arrays[i];
        /*
        @todo This is unsafe casting but consistent with how the code worked previously. Should it stay this way
              or should and `getBufferTypeUnsafe` function be exposed that throws an Error if unsupported type is passed?
         */
        var type = getBufferType(array);
        if (!views[type]) {
            views[type] = new map[type](buffer);
        }
        out = views[type];
        for (var j = 0; j < array.length; j++) {
            var indexStart = ((j / size | 0) * stride) + littleOffset;
            var index = j % size;
            out[indexStart + index] = array[j];
        }
        littleOffset += size;
    }
    return new Float32Array(buffer);
}

// Taken from the bit-twiddle package
/**
 * Rounds to next power of two.
 *
 * @function nextPow2
 * @memberof PIXI.utils
 * @param {number} v - input value
 * @return {number}
 */
function nextPow2(v) {
    v += v === 0 ? 1 : 0;
    --v;
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;
    return v + 1;
}
/**
 * Checks if a number is a power of two.
 *
 * @function isPow2
 * @memberof PIXI.utils
 * @param {number} v - input value
 * @return {boolean} `true` if value is power of two
 */
function isPow2(v) {
    return !(v & (v - 1)) && (!!v);
}
/**
 * Computes ceil of log base 2
 *
 * @function log2
 * @memberof PIXI.utils
 * @param {number} v - input value
 * @return {number} logarithm base 2
 */
function log2(v) {
    var r = (v > 0xFFFF ? 1 : 0) << 4;
    v >>>= r;
    var shift = (v > 0xFF ? 1 : 0) << 3;
    v >>>= shift;
    r |= shift;
    shift = (v > 0xF ? 1 : 0) << 2;
    v >>>= shift;
    r |= shift;
    shift = (v > 0x3 ? 1 : 0) << 1;
    v >>>= shift;
    r |= shift;
    return r | (v >> 1);
}

/**
 * Remove items from a javascript array without generating garbage
 *
 * @function removeItems
 * @memberof PIXI.utils
 * @param {Array<any>} arr - Array to remove elements from
 * @param {number} startIdx - starting index
 * @param {number} removeCount - how many to remove
 */
function removeItems(arr, startIdx, removeCount) {
    var length = arr.length;
    var i;
    if (startIdx >= length || removeCount === 0) {
        return;
    }
    removeCount = (startIdx + removeCount > length ? length - startIdx : removeCount);
    var len = length - removeCount;
    for (i = startIdx; i < len; ++i) {
        arr[i] = arr[i + removeCount];
    }
    arr.length = len;
}

/**
 * Returns sign of number
 *
 * @memberof PIXI.utils
 * @function sign
 * @param {number} n - the number to check the sign of
 * @returns {number} 0 if `n` is 0, -1 if `n` is negative, 1 if `n` is positive
 */
function sign(n) {
    if (n === 0)
        { return 0; }
    return n < 0 ? -1 : 1;
}

var nextUid = 0;
/**
 * Gets the next unique identifier
 *
 * @memberof PIXI.utils
 * @function uid
 * @return {number} The next unique identifier to use.
 */
function uid() {
    return ++nextUid;
}

// A map of warning messages already fired
var warnings = {};
/**
 * Helper for warning developers about deprecated features & settings.
 * A stack track for warnings is given; useful for tracking-down where
 * deprecated methods/properties/classes are being used within the code.
 *
 * @memberof PIXI.utils
 * @function deprecation
 * @param {string} version - The version where the feature became deprecated
 * @param {string} message - Message should include what is deprecated, where, and the new solution
 * @param {number} [ignoreDepth=3] - The number of steps to ignore at the top of the error stack
 *        this is mostly to ignore internal deprecation calls.
 */
function deprecation(version, message, ignoreDepth) {
    if (ignoreDepth === void 0) { ignoreDepth = 3; }
    // Ignore duplicat
    if (warnings[message]) {
        return;
    }
    /* eslint-disable no-console */
    var stack = new Error().stack;
    // Handle IE < 10 and Safari < 6
    if (typeof stack === 'undefined') {
        console.warn('PixiJS Deprecation Warning: ', message + "\nDeprecated since v" + version);
    }
    else {
        // chop off the stack trace which includes PixiJS internal calls
        stack = stack.split('\n').splice(ignoreDepth).join('\n');
        if (console.groupCollapsed) {
            console.groupCollapsed('%cPixiJS Deprecation Warning: %c%s', 'color:#614108;background:#fffbe6', 'font-weight:normal;color:#614108;background:#fffbe6', message + "\nDeprecated since v" + version);
            console.warn(stack);
            console.groupEnd();
        }
        else {
            console.warn('PixiJS Deprecation Warning: ', message + "\nDeprecated since v" + version);
            console.warn(stack);
        }
    }
    /* eslint-enable no-console */
    warnings[message] = true;
}

/**
 * @todo Describe property usage
 *
 * @static
 * @name ProgramCache
 * @memberof PIXI.utils
 * @type {Object}
 */
var ProgramCache = {};
/**
 * @todo Describe property usage
 *
 * @static
 * @name TextureCache
 * @memberof PIXI.utils
 * @type {Object}
 */
var TextureCache = Object.create(null);
/**
 * @todo Describe property usage
 *
 * @static
 * @name BaseTextureCache
 * @memberof PIXI.utils
 * @type {Object}
 */
var BaseTextureCache = Object.create(null);
/**
 * Destroys all texture in the cache
 *
 * @memberof PIXI.utils
 * @function destroyTextureCache
 */
function destroyTextureCache() {
    var key;
    for (key in TextureCache) {
        TextureCache[key].destroy();
    }
    for (key in BaseTextureCache) {
        BaseTextureCache[key].destroy();
    }
}
/**
 * Removes all textures from cache, but does not destroy them
 *
 * @memberof PIXI.utils
 * @function clearTextureCache
 */
function clearTextureCache() {
    var key;
    for (key in TextureCache) {
        delete TextureCache[key];
    }
    for (key in BaseTextureCache) {
        delete BaseTextureCache[key];
    }
}

/**
 * Creates a Canvas element of the given size to be used as a target for rendering to.
 *
 * @class
 * @memberof PIXI.utils
 */
var CanvasRenderTarget = /** @class */ (function () {
    /**
     * @param {number} width - the width for the newly created canvas
     * @param {number} height - the height for the newly created canvas
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the canvas
     */
    function CanvasRenderTarget(width, height, resolution) {
        /**
         * The Canvas object that belongs to this CanvasRenderTarget.
         *
         * @member {HTMLCanvasElement}
         */
        this.canvas = document.createElement('canvas');
        /**
         * A CanvasRenderingContext2D object representing a two-dimensional rendering context.
         *
         * @member {CanvasRenderingContext2D}
         */
        this.context = this.canvas.getContext('2d');
        this.resolution = resolution || settings.RESOLUTION;
        this.resize(width, height);
    }
    /**
     * Clears the canvas that was created by the CanvasRenderTarget class.
     *
     * @private
     */
    CanvasRenderTarget.prototype.clear = function () {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    /**
     * Resizes the canvas to the specified width and height.
     *
     * @param {number} width - the new width of the canvas
     * @param {number} height - the new height of the canvas
     */
    CanvasRenderTarget.prototype.resize = function (width, height) {
        this.canvas.width = width * this.resolution;
        this.canvas.height = height * this.resolution;
    };
    /**
     * Destroys this canvas.
     *
     */
    CanvasRenderTarget.prototype.destroy = function () {
        this.context = null;
        this.canvas = null;
    };
    Object.defineProperty(CanvasRenderTarget.prototype, "width", {
        /**
         * The width of the canvas buffer in pixels.
         *
         * @member {number}
         */
        get: function () {
            return this.canvas.width;
        },
        set: function (val) {
            this.canvas.width = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CanvasRenderTarget.prototype, "height", {
        /**
         * The height of the canvas buffer in pixels.
         *
         * @member {number}
         */
        get: function () {
            return this.canvas.height;
        },
        set: function (val) {
            this.canvas.height = val;
        },
        enumerable: false,
        configurable: true
    });
    return CanvasRenderTarget;
}());

/**
 * Trim transparent borders from a canvas
 *
 * @memberof PIXI.utils
 * @function trimCanvas
 * @param {HTMLCanvasElement} canvas - the canvas to trim
 * @returns {object} Trim data
 */
function trimCanvas(canvas) {
    // https://gist.github.com/remy/784508
    var width = canvas.width;
    var height = canvas.height;
    var context = canvas.getContext('2d');
    var imageData = context.getImageData(0, 0, width, height);
    var pixels = imageData.data;
    var len = pixels.length;
    var bound = {
        top: null,
        left: null,
        right: null,
        bottom: null,
    };
    var data = null;
    var i;
    var x;
    var y;
    for (i = 0; i < len; i += 4) {
        if (pixels[i + 3] !== 0) {
            x = (i / 4) % width;
            y = ~~((i / 4) / width);
            if (bound.top === null) {
                bound.top = y;
            }
            if (bound.left === null) {
                bound.left = x;
            }
            else if (x < bound.left) {
                bound.left = x;
            }
            if (bound.right === null) {
                bound.right = x + 1;
            }
            else if (bound.right < x) {
                bound.right = x + 1;
            }
            if (bound.bottom === null) {
                bound.bottom = y;
            }
            else if (bound.bottom < y) {
                bound.bottom = y;
            }
        }
    }
    if (bound.top !== null) {
        width = bound.right - bound.left;
        height = bound.bottom - bound.top + 1;
        data = context.getImageData(bound.left, bound.top, width, height);
    }
    return {
        height: height,
        width: width,
        data: data,
    };
}

/**
 * Regexp for data URI.
 * Based on: {@link https://github.com/ragingwind/data-uri-regex}
 *
 * @static
 * @constant {RegExp|string} DATA_URI
 * @memberof PIXI
 * @example data:image/png;base64
 */
var DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;

/**
 * @memberof PIXI.utils
 * @interface DecomposedDataUri
 */
/**
 * type, eg. `image`
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} mediaType
 */
/**
 * Sub type, eg. `png`
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} subType
 */
/**
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} charset
 */
/**
 * Data encoding, eg. `base64`
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} encoding
 */
/**
 * The actual data
 * @memberof PIXI.utils.DecomposedDataUri#
 * @member {string} data
 */
/**
 * Split a data URI into components. Returns undefined if
 * parameter `dataUri` is not a valid data URI.
 *
 * @memberof PIXI.utils
 * @function decomposeDataUri
 * @param {string} dataUri - the data URI to check
 * @return {PIXI.utils.DecomposedDataUri|undefined} The decomposed data uri or undefined
 */
function decomposeDataUri(dataUri) {
    var dataUriMatch = DATA_URI.exec(dataUri);
    if (dataUriMatch) {
        return {
            mediaType: dataUriMatch[1] ? dataUriMatch[1].toLowerCase() : undefined,
            subType: dataUriMatch[2] ? dataUriMatch[2].toLowerCase() : undefined,
            charset: dataUriMatch[3] ? dataUriMatch[3].toLowerCase() : undefined,
            encoding: dataUriMatch[4] ? dataUriMatch[4].toLowerCase() : undefined,
            data: dataUriMatch[5],
        };
    }
    return undefined;
}

var tempAnchor;
/**
 * Sets the `crossOrigin` property for this resource based on if the url
 * for this resource is cross-origin. If crossOrigin was manually set, this
 * function does nothing.
 * Nipped from the resource loader!
 *
 * @ignore
 * @param {string} url - The url to test.
 * @param {object} [loc=window.location] - The location object to test against.
 * @return {string} The crossOrigin value to use (or empty string for none).
 */
function determineCrossOrigin(url, loc) {
    if (loc === void 0) { loc = window.location; }
    // data: and javascript: urls are considered same-origin
    if (url.indexOf('data:') === 0) {
        return '';
    }
    // default is window.location
    loc = loc || window.location;
    if (!tempAnchor) {
        tempAnchor = document.createElement('a');
    }
    // let the browser determine the full href for the url of this resource and then
    // parse with the node url lib, we can't use the properties of the anchor element
    // because they don't work in IE9 :(
    tempAnchor.href = url;
    var parsedUrl = parse(tempAnchor.href);
    var samePort = (!parsedUrl.port && loc.port === '') || (parsedUrl.port === loc.port);
    // if cross origin
    if (parsedUrl.hostname !== loc.hostname || !samePort || parsedUrl.protocol !== loc.protocol) {
        return 'anonymous';
    }
    return '';
}

/**
 * get the resolution / device pixel ratio of an asset by looking for the prefix
 * used by spritesheets and image urls
 *
 * @memberof PIXI.utils
 * @function getResolutionOfUrl
 * @param {string} url - the image path
 * @param {number} [defaultValue=1] - the defaultValue if no filename prefix is set.
 * @return {number} resolution / device pixel ratio of an asset
 */
function getResolutionOfUrl(url, defaultValue) {
    var resolution = settings.RETINA_PREFIX.exec(url);
    if (resolution) {
        return parseFloat(resolution[1]);
    }
    return defaultValue !== undefined ? defaultValue : 1;
}

/**
 * Generalized convenience utilities for PIXI.
 * @example
 * // Extend PIXI's internal Event Emitter.
 * class MyEmitter extends PIXI.utils.EventEmitter {
 *   constructor() {
 *      super();
 *      console.log("Emitter created!");
 *   }
 * }
 *
 * // Get info on current device
 * console.log(PIXI.utils.isMobile);
 *
 * // Convert hex color to string
 * console.log(PIXI.utils.hex2string(0xff00ff)); // returns: "#ff00ff"
 * @namespace PIXI.utils
 */

export { BaseTextureCache, CanvasRenderTarget, DATA_URI, ProgramCache, TextureCache, clearTextureCache, correctBlendMode, createIndicesForQuads, decomposeDataUri, deprecation, destroyTextureCache, determineCrossOrigin, getBufferType, getResolutionOfUrl, hex2rgb, hex2string, interleaveTypedArrays, isPow2, isWebGLSupported, log2, nextPow2, premultiplyBlendMode, premultiplyRgba, premultiplyTint, premultiplyTintToRgba, removeItems, rgb2hex, sayHello, sign, skipHello, string2hex, trimCanvas, uid };
//# sourceMappingURL=utils.es.js.map
