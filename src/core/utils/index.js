import CONST from '../const';
import EventEmitter from 'eventemitter3';
import pluginTarget from './pluginTarget';

/**
 * @namespace PIXI.utils
 */
const utils = {
    _uid: 0,
    _saidHello: false,

    EventEmitter,
    pluginTarget,

    /**
     * Gets the next unique identifier
     *
     * @memberof PIXI.utils
     * @return {number} The next unique identifier to use.
     */
    uid ()
    {
        return ++utils._uid;
    },

    /**
     * Converts a hex color number to an [R, G, B] array
     *
     * @memberof PIXI.utils
     * @param hex {number}
     * @param  {number[]} [out=[]] If supplied, this array will be used rather than returning a new one
     * @return {number[]} An array representing the [R, G, B] of the color.
     */
    hex2rgb (hex, out)
    {
        out = out || [];

        out[0] = (hex >> 16 & 0xFF) / 255;
        out[1] = (hex >> 8 & 0xFF) / 255;
        out[2] = (hex & 0xFF) / 255;

        return out;
    },

    /**
     * Converts a hex color number to a string.
     *
     * @memberof PIXI.utils
     * @param hex {number} Number in hex
     * @return {string} The string color.
     */
    hex2string (hex)
    {
        hex = hex.toString(16);
        hex = '000000'.substr(0, 6 - hex.length) + hex;

        return '#' + hex;
    },

    /**
     * Converts a color as an [R, G, B] array to a hex number
     *
     * @memberof PIXI.utils
     * @param rgb {number[]} rgb array
     * @return {number} The color number
     */
    rgb2hex (rgb)
    {
        return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
    },


    /**
     * get the resolution / device pixel ratio of an asset by looking for the prefix
     * used by spritesheets and image urls
     *
     * @memberof PIXI.utils
     * @param url {string} the image path
     * @return {number} resolution / device pixel ratio of an asset
     */
    getResolutionOfUrl (url)
    {
        const resolution = CONST.RETINA_PREFIX.exec(url);

        if (resolution)
        {
           return parseFloat(resolution[1]);
        }

        return 1;
    },

    /**
     * Typedef for decomposeDataUri return object.
     *
     * @typedef {object} DecomposedDataUri
     * @property {mediaType} Media type, eg. `image`
     * @property {subType} Sub type, eg. `png`
     * @property {encoding} Data encoding, eg. `base64`
     * @property {data} The actual data
     */

    /**
     * Split a data URI into components. Returns undefined if
     * parameter `dataUri` is not a valid data URI.
     *
     * @memberof PIXI.utils
     * @param dataUri {string} the data URI to check
     * @return {DecomposedDataUri|undefined} The decomposed data uri or undefined
     */
    decomposeDataUri (dataUri)
    {
        const dataUriMatch = CONST.DATA_URI.exec(dataUri);

        if (dataUriMatch)
        {
            return {
                mediaType: dataUriMatch[1] ? dataUriMatch[1].toLowerCase() : undefined,
                subType: dataUriMatch[2] ? dataUriMatch[2].toLowerCase() : undefined,
                encoding: dataUriMatch[3] ? dataUriMatch[3].toLowerCase() : undefined,
                data: dataUriMatch[4]
            };
        }

        return undefined;
    },

    /**
     * Get type of the image by regexp for extension. Returns undefined for unknown extensions.
     *
     * @memberof PIXI.utils
     * @param url {string} the image path
     * @return {string|undefined} image extension
     */
    getImageTypeOfUrl (url)
    {
        const extension = CONST.IMAGE_TYPE.exec(url);

        if (extension)
        {
            return extension[1].toLowerCase();
        }

        return undefined;
    },

    /**
     * Typedef for Size object.
     *
     * @typedef {object} Size
     * @property {width} Width component
     * @property {height} Height component
     */

    /**
     * Get size from an svg string using regexp.
     *
     * @memberof PIXI.utils
     * @param svgString {string} a serialized svg element
     * @return {Size|undefined} image extension
     */
    getSvgSize (svgString)
    {
        const sizeMatch = CONST.SVG_SIZE.exec(svgString);
        const size = {};

        if (sizeMatch)
        {
            size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[2]));
            size[sizeMatch[3]] = Math.round(parseFloat(sizeMatch[4]));
        }

        return size;
    },

    /**
     * Logs out the version and renderer information for this running instance of PIXI.
     * If you don't want to see this message you can set `PIXI.utils._saidHello = true;`
     * so the library thinks it already said it. Keep in mind that doing that will forever
     * makes you a jerk face.
     *
     * @memberof PIXI.utils
     * @param {string} type - The string renderer type to log.
     * @constant
     * @static
     */
    sayHello (type)
    {
        if (utils._saidHello)
        {
            return;
        }

        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
        {
            const args = [
                `\n %c %c %c Pixi.js ${CONST.VERSION} - ✰ ${type} ✰  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n`,
                'background: #ff66a5; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff66a5; background: #030307; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'background: #ffc3dc; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;'
            ];

            window.console.log.apply(console, args);
        }
        else if (window.console)
        {
            window.console.log(`Pixi.js ${CONST.VERSION} - ${type} - http://www.pixijs.com/`);
        }

        utils._saidHello = true;
    },

    /**
     * Helper for checking for webgl support
     *
     * @memberof PIXI.utils
     * @return {boolean} is webgl supported
     */
    isWebGLSupported ()
    {
        const contextOptions = { stencil: true, failIfMajorPerformanceCaveat: true };
        try
        {
            if (!window.WebGLRenderingContext)
            {
                return false;
            }

            const canvas = document.createElement('canvas');
            let gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);

            const success = !!(gl && gl.getContextAttributes().stencil);
            if (gl)
            {
                const loseContext = gl.getExtension('WEBGL_lose_context');

                if(loseContext)
                {
                    loseContext.loseContext();
                }
            }
            gl = null;

            return success;
        }
        catch (e)
        {
            return false;
        }
    },

    /**
     * Returns sign of number
     *
     * @memberof PIXI.utils
     * @param n {number}
     * @returns {number} 0 if n is 0, -1 if n is negative, 1 if n i positive
     */
    sign (n)
    {
        return n ? (n < 0 ? -1 : 1) : 0;
    },

    /**
     * Remove a range of items from an array
     *
     * @memberof PIXI.utils
     * @param {Array<*>} arr The target array
     * @param {number} startIdx The index to begin removing from (inclusive)
     * @param {number} removeCount How many items to remove
     */
    removeItems (arr, startIdx, removeCount)
    {
        const length = arr.length;

        if (startIdx >= length || removeCount === 0)
        {
            return;
        }

        removeCount = (startIdx+removeCount > length ? length-startIdx : removeCount);
        const len = length-removeCount;
        for (let i = startIdx; i < len; ++i)
        {
            arr[i] = arr[i + removeCount];
        }

        arr.length = len;
    },

    /**
     * @todo Describe property usage
     *
     * @memberof PIXI.utils
     * @private
     */
    TextureCache: {},

    /**
     * @todo Describe property usage
     *
     * @memberof PIXI.utils
     * @private
     */
    BaseTextureCache: {}
};

export default utils;
