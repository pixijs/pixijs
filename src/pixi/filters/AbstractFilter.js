/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */



PIXI.AbstractFilter = function(fragmentSrc, unifroms)
{
	this.passes = [this];
	this.dirty = true;
	this.padding = 0;

	// set the uniforms
	this.uniforms = unifroms || {};
	
	this.fragmentSrc = fragmentSrc || [];
}

