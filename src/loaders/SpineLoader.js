var core = require('../core'),
    JsonLoader = require('./JsonLoader');

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
 * To generate the data you need to use http://esotericsoftware.com/ and export in the "JSON" format
 * Due to a clash of names  You will need to change the extension of the spine file from *.json to *.anim for it to load
 * See example 12 (http://www.goodboydigital.com/pixijs/examples/12/) to see a working example and check out the source
 * You will need to generate a sprite sheet to accompany the spine data
 * When loaded this class will dispatch a "loaded" event
 *
 * @class
 * @mixes eventTarget
 * @namespace PIXI
 * @param url {String} The url of the JSON file
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 */
function SpineLoader(url, crossorigin)
{
    /**
     * The url of the bitmap font data
     *
     * @member {String}
     */
    this.url = url;

    /**
     * Whether the requests should be treated as cross origin
     *
     * @member {boolean}
     */
    this.crossorigin = crossorigin;

    /**
     * Whether the data has loaded yet
     *
     * @member {boolean}
     * @readOnly
     */
    this.loaded = false;
}

SpineLoader.prototype.constructor = SpineLoader;
module.exports = SpineLoader;

core.utils.eventTarget.mixin(SpineLoader.prototype);

/**
 * Loads the JSON data
 *
 */
SpineLoader.prototype.load = function ()
{
    var scope = this;
    var jsonLoader = new JsonLoader(this.url, this.crossorigin);

    jsonLoader.on('loaded', function (event)
    {
        scope.json = event.data.content.json;
        scope.onLoaded();
    });

    jsonLoader.load();
};

/**
 * Invoked when JSON file is loaded.
 *
 * @private
 */
SpineLoader.prototype.onLoaded = function ()
{
    this.loaded = true;
    this.emit('loaded', { content: this });
};
