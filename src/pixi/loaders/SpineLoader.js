/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 * based on pixi impact spine implementation made by Eemeli Kelokorpi (@ekelokorpi) https://github.com/ekelokorpi
 * 
 * Awesome JS run time provided by EsotericSoftware
 * https://github.com/EsotericSoftware/spine-runtimes
 * 
 */

/**
 * The Spine loader is used to load in JSON spine data
 * To generate the data you need to use http://esotericsoftware.com/ and export the "JSON" format
 * Due to a clash of names  You will need to change the extension of the spine file from *.json to *.anim for it to load
 * See example 12 (http://www.goodboydigital.com/pixijs/examples/12/) to see a working example and check out the source
 * You will need to generate a sprite sheet to accompany the spine data 
 * When loaded this class will dispatch a "loaded" event
 * @class Spine
 * @constructor
 * @extends EventTarget
 * @param {String} url the url of the sprite sheet JSON file
 * @param {Boolean} crossorigin
 */
PIXI.SpineLoader = function(url, crossorigin) 
{
	PIXI.EventTarget.call(this);
	this.url = url;
	this.crossorigin = crossorigin;
	this.loaded = false;
}

PIXI.SpineLoader.constructor = PIXI.SpineLoader;

PIXI.SpineLoader.prototype.load = function()
{
	new PIXI.JsonLoader(this.url, this.crossorigin);
		jsonLoader.addEventListener("loaded", function (event) {
			scope.json = event.content.json;
			scope.onJSONLoaded();
		});
		jsonLoader.load();
};

PIXI.SpineLoader.prototype.load = function () {
	
	var scope = this;
	var jsonLoader = new PIXI.JsonLoader(this.url, this.crossorigin);
	jsonLoader.addEventListener("loaded", function (event) {
		scope.json = event.content.json;
		scope.onJSONLoaded();
	});
	jsonLoader.load();
};

/**
 * Invoke when JSON file is loaded
 * @private
 */
PIXI.SpineLoader.prototype.onJSONLoaded = function (event) {
	
	var spineJsonParser = new spine.SkeletonJson();
	
	var skeletonData = spineJsonParser.readSkeletonData(this.json);
	
	PIXI.AnimCache[this.url] = skeletonData;

	this.onLoaded();
};


			
PIXI.SpineLoader.prototype.onLoaded = function()
{
	this.loaded = true;
    this.dispatchEvent({type: "loaded", content: this});
};

