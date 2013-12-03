/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * This is the base class for  creating a pixi.js filter. Currently only webGL supports filters.
 * If you want to make a custom filter this should be your base class.
 * @class AbstractFilter
 * @constructor
 * @param fragmentSrc
 * @param uniforms  
 */
PIXI.AbstractFilter = function(fragmentSrc, uniforms)
{
	/**
	* An array of passes - some filters contain a few steps this array simply stores the steps in a liniear fashion.
	* For example the blur filter has two passes blurX and blurY.
	* @property passes
	* @type Array an array of filter objects
	* @private
	*/
	this.passes = [this];


	this.dirty = true;
	this.padding = 0;

	/**
	@property uniforms
	@private
	*/
	this.uniforms = uniforms || {};
	
	this.fragmentSrc = fragmentSrc || [];
}

