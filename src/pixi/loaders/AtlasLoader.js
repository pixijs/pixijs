/**
 * @author Martin Kelm http://mkelm.github.com
 */

/**
 * The atlas file loader is used to load in Texture Atlas data and parse it. When loaded this class will dispatch a 'loaded' event. If loading fails this class will dispatch an 'error' event.
 *
 * To generate the data you can use http://www.codeandweb.com/texturepacker and publish in the 'JSON' format.
 * 
 * It is highly recommended to use texture atlases (also know as 'sprite sheets') as it allowed sprites to be batched and drawn together for highly increased rendering speed.
 * Once the data has been loaded the frames are stored in the PIXI texture cache and can be accessed though PIXI.Texture.fromFrameId() and PIXI.Sprite.fromFrameId()
 * 
 * @class AtlasLoader
 * @uses EventTarget
 * @constructor
 * @param url {String} The url of the JSON file
 * @param crossorigin {Boolean} Whether requests should be treated as crossorigin
 */
PIXI.AtlasLoader = function (url, crossorigin) {
    this.url = url;
    this.baseUrl = url.replace(/[^\/]*$/, '');
    this.crossorigin = crossorigin;
    this.loaded = false;

};

// constructor
PIXI.AtlasLoader.constructor = PIXI.AtlasLoader;

PIXI.EventTarget.mixin(PIXI.AtlasLoader.prototype);

 /**
 * Starts loading the JSON file
 *
 * @method load
 */
PIXI.AtlasLoader.prototype.load = function () {
    this.ajaxRequest = new PIXI.AjaxRequest();
    this.ajaxRequest.onreadystatechange = this.onAtlasLoaded.bind(this);

    this.ajaxRequest.open('GET', this.url, true);
    if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType('application/json');
    this.ajaxRequest.send(null);
};

/**
 * Invoked when the Atlas has fully loaded. Parses the JSON and builds the texture frames.
 * 
 * @method onAtlasLoaded
 * @private
 */
PIXI.AtlasLoader.prototype.onAtlasLoaded = function () {
    if (this.ajaxRequest.readyState === 4) {
        if (this.ajaxRequest.status === 200 || window.location.href.indexOf('http') === -1) {
            this.atlas = {
                meta : {
                    image : []
                },
                frames : []
            };
            var result = this.ajaxRequest.responseText.split(/\r?\n/);
            var lineCount = -3;

            var currentImageId = 0;
            var currentFrame = null;
            var nameInNextLine = false;

            var i = 0,
                j = 0,
                selfOnLoaded = this.onLoaded.bind(this);

            // parser without rotation support yet!
            for (i = 0; i < result.length; i++) {
                result[i] = result[i].replace(/^\s+|\s+$/g, '');
                if (result[i] === '') {
                    nameInNextLine = i+1;
                }
                if (result[i].length > 0) {
                    if (nameInNextLine === i) {
                        this.atlas.meta.image.push(result[i]);
                        currentImageId = this.atlas.meta.image.length - 1;
                        this.atlas.frames.push({});
                        lineCount = -3;
                    } else if (lineCount > 0) {
                        if (lineCount % 7 === 1) { // frame name
                            if (currentFrame != null) { //jshint ignore:line
                                this.atlas.frames[currentImageId][currentFrame.name] = currentFrame;
                            }
                            currentFrame = { name: result[i], frame : {} };
                        } else {
                            var text = result[i].split(' ');
                            if (lineCount % 7 === 3) { // position
                                currentFrame.frame.x = Number(text[1].replace(',', ''));
                                currentFrame.frame.y = Number(text[2]);
                            } else if (lineCount % 7 === 4) { // size
                                currentFrame.frame.w = Number(text[1].replace(',', ''));
                                currentFrame.frame.h = Number(text[2]);
                            } else if (lineCount % 7 === 5) { // real size
                                var realSize = {
                                    x : 0,
                                    y : 0,
                                    w : Number(text[1].replace(',', '')),
                                    h : Number(text[2])
                                };

                                if (realSize.w > currentFrame.frame.w || realSize.h > currentFrame.frame.h) {
                                    currentFrame.trimmed = true;
                                    currentFrame.realSize = realSize;
                                } else {
                                    currentFrame.trimmed = false;
                                }
                            }
                        }
                    }
                    lineCount++;
                }
            }

            if (currentFrame != null) { //jshint ignore:line
                this.atlas.frames[currentImageId][currentFrame.name] = currentFrame;
            }

            if (this.atlas.meta.image.length > 0) {
                this.images = [];
                for (j = 0; j < this.atlas.meta.image.length; j++) {
                    // sprite sheet
                    var textureUrl = this.baseUrl + this.atlas.meta.image[j];
                    var frameData = this.atlas.frames[j];
                    this.images.push(new PIXI.ImageLoader(textureUrl, this.crossorigin));

                    for (i in frameData) {
                        var rect = frameData[i].frame;
                        if (rect) {
                            PIXI.TextureCache[i] = new PIXI.Texture(this.images[j].texture.baseTexture, {
                                x: rect.x,
                                y: rect.y,
                                width: rect.w,
                                height: rect.h
                            });
                            if (frameData[i].trimmed) {
                                PIXI.TextureCache[i].realSize = frameData[i].realSize;
                                // trim in pixi not supported yet, todo update trim properties if it is done ...
                                PIXI.TextureCache[i].trim.x = 0;
                                PIXI.TextureCache[i].trim.y = 0;
                            }
                        }
                    }
                }

                this.currentImageId = 0;
                for (j = 0; j < this.images.length; j++) {
                    this.images[j].on('loaded', selfOnLoaded);
                }
                this.images[this.currentImageId].load();

            } else {
                this.onLoaded();
            }

        } else {
            this.onError();
        }
    }
};

/**
 * Invoked when json file has loaded.
 * 
 * @method onLoaded
 * @private
 */
PIXI.AtlasLoader.prototype.onLoaded = function () {
    if (this.images.length - 1 > this.currentImageId) {
        this.currentImageId++;
        this.images[this.currentImageId].load();
    } else {
        this.loaded = true;
        this.emit('loaded', { content: this });
    }
};

/**
 * Invoked when an error occurs.
 * 
 * @method onError
 * @private
 */
PIXI.AtlasLoader.prototype.onError = function () {
    this.emit('error', { content: this });
};
