/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot fastest. If webGL is not supported by
 * the browser then this function will return a canvas renderer
 *
 * @method autoDetectRenderer
 * @static
 * @param width {Number} the width of the renderers view
 * @param height {Number} the height of the renderers view
 * @param view {Canvas} the canvas to use as a view, optional
 * @param transparent=false {Boolean} the transparency of the render view, default false
 * @param antialias=false {Boolean} sets antialias (only applicable in webGL chrome at the moment)
 * @param targetFrameRate {Number}=60 target framerate for MovieClip animations and other time based animations
 * @param minFrameRate {Number}=12 minimum framerate update for MovieClips and other time based animations
 * 
 * antialias
 */
PIXI.autoDetectRenderer = function(width, height, view, transparent, antialias, targetFrameRate, minFrameRate )
{
	if(!width)width = 800;
	if(!height)height = 600;

	// BORROWED from Mr Doob (mrdoob.com)
	var webgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

	//console.log(webgl);
	if( webgl )
	{
		return new PIXI.WebGLRenderer(width, height, view, transparent, antialias, targetFrameRate, minFrameRate );
	}

	return new PIXI.CanvasRenderer(width, height, view, transparent, targetFrameRate, minFrameRate );
};


