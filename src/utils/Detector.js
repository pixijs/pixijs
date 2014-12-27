//TODO: Replace this code with external modules!

/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot faster. If webGL is not supported by
 * the browser then this function will return a canvas renderer
 *
 * @static
 * @namespace PIXI
 * @param width=800 {number} the width of the renderers view
 * @param height=600 {number} the height of the renderers view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you need to call toDataUrl on the webgl context
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 *
 */
function autoDetectRenderer(width, height, options) {
    width = width || 800;
    height = height || 600;

    // BORROWED from Mr Doob (mrdoob.com)
    var webgl = ( function () { try {
                                    var canvas = document.createElement( 'canvas' );
                                    return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
                                } catch( e ) {
                                    return false;
                                }
                            } )();

    if (webgl) {
        return new WebGLRenderer(width, height, options);
    }

    return new CanvasRenderer(width, height, options);
}

/**
 * This helper function will automatically detect which renderer you should be using.
 * This function is very similar to the autoDetectRenderer function except that is will return a canvas renderer for android.
 * Even thought both android chrome supports webGL the canvas implementation perform better at the time of writing.
 * This function will likely change and update as webGL performance improves on these devices.
 *
 * @static
 * @namespace PIXI
 * @param width=800 {number} the width of the renderers view
 * @param height=600 {number} the height of the renderers view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.antialias=false] {boolean} sets antialias (only applicable in chrome at the moment)
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if you need to call toDataUrl on the webgl context
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 *
 */
function autoDetectRecommendedRenderer(width, height, options) {
    width = width || 800;
    height = height || 600;

    // BORROWED from Mr Doob (mrdoob.com)
    var webgl = ( function () { try {
                                    var canvas = document.createElement( 'canvas' );
                                    return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
                                } catch( e ) {
                                    return false;
                                }
                            } )();

    var isAndroid = /Android/i.test(navigator.userAgent);

    if (webgl && !isAndroid) {
        return new WebGLRenderer(width, height, options);
    }

    return new CanvasRenderer(width, height, options);
}
