var webglEnabled = requrire('webgl-enabled')();

/**
 * @namespace PIXI
 */
var utils = module.exports = {
    /**
     * Converts a hex color number to an [R, G, B] array
     *
     * @param hex {number}
     * @return {number[]} An array representing the [R, G, B] of the color.
     */
    hex2rgb: function (hex) {
        return [(hex >> 16 & 0xFF) / 255, ( hex >> 8 & 0xFF) / 255, (hex & 0xFF)/ 255];
    },

    /**
     * Converts a color as an [R, G, B] array to a hex number
     *
     * @param rgb {number[]}
     * @return {number} The color number
     */
    rgb2hex: function (rgb) {
        return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
    },

    /**
     * Checks whether the Canvas BlendModes are supported by the current browser
     *
     * @return {boolean} whether they are supported
     */
    canUseNewCanvasBlendModes: function () {
        if (typeof document === 'undefined') {
            return false;
        }

        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');

        canvas.width = 1;
        canvas.height = 1;

        context.fillStyle = '#000';
        context.fillRect(0, 0, 1, 1);

        context.globalCompositeOperation = 'multiply';

        context.fillStyle = '#fff';
        context.fillRect(0, 0, 1, 1);

        return context.getImageData(0,0,1,1).data[0] === 0;
    },

    /**
     * Given a number, this function returns the closest number that is a power of two
     * this function is taken from Starling Framework as its pretty neat ;)
     *
     * @param number {number}
     * @return {number} the closest number that is a power of two
     */
    getNextPowerOfTwo: function (number) {
        // see: http://en.wikipedia.org/wiki/Power_of_two#Fast_algorithm_to_check_if_a_positive_number_is_a_power_of_two
        if (number > 0 && (number & (number - 1)) === 0) {
            return number;
        }
        else {
            var result = 1;

            while (result < number) {
                result <<= 1;
            }

            return result;
        }
    },

    /**
     * checks if the given width and height make a power of two rectangle
     *
     * @param width {number}
     * @param height {number}
     * @return {boolean}
     */
    isPowerOfTwo: function (width, height) {
        return (width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);
    },

    /**
     * This helper function will automatically detect which renderer you should be using.
     * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
     * the browser then this function will return a canvas renderer
     *
     * @param width=800 {number} the width of the renderers view
     * @param height=600 {number} the height of the renderers view
     * @param [options] {object} The optional renderer parameters
     * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
     * @param [options.transparent=false] {boolean} If the render view is transparent, default false
     * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
     * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you
     *      need to call toDataUrl on the webgl context
     * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
     * @return {WebGLRenderer|CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
     */
    autoDetectRenderer: function (width, height, options) {
        width = width || 800;
        height = height || 600;

        if (webglEnabled) {
            return new WebGLRenderer(width, height, options);
        }

        return new CanvasRenderer(width, height, options);
    },

    PolyK:      require('./PolyK'),
    Event:      require('./Event'),
    EventTarget: require('./EventTarget')
};
