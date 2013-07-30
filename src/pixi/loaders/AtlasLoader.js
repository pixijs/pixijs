/**
 * @author Martin Kelm http://mkelm.github.com
 */

/**
 * The atlas file loader is used to load in Atlas data and parsing it
 * When loaded this class will dispatch a "loaded" event
 * If load failed this class will dispatch a "error" event
 * @class JsonLoader
 * @extends EventTarget
 * @constructor
 * @param {String} url the url of the JSON file
 * @param {Boolean} crossorigin
 */

PIXI.AtlasLoader = function (url, crossorigin) {
  PIXI.EventTarget.call(this);
  this.url = url;
  this.baseUrl = url.replace(/[^\/]*$/, "");
  this.crossorigin = crossorigin;
  this.loaded = false;

};

// constructor
PIXI.AtlasLoader.constructor = PIXI.AtlasLoader;

/**
 * This will begin loading the JSON file
 */
PIXI.AtlasLoader.prototype.load = function () {
  this.ajaxRequest = new AjaxRequest();
  var scope = this;
  this.ajaxRequest.onreadystatechange = function () {
    scope.onAtlasLoaded();
  };

  this.ajaxRequest.open("GET", this.url, true);
  if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/json");
  this.ajaxRequest.send(null);
};

/**
 * Invoke when JSON file is loaded
 * @private
 */
PIXI.AtlasLoader.prototype.onAtlasLoaded = function () {
  if (this.ajaxRequest.readyState == 4) {
    if (this.ajaxRequest.status == 200 || window.location.href.indexOf("http") == -1) {
      this.atlas = {
        meta : {
          image : ""
        },
        frames : {}
      };
      var result = this.ajaxRequest.responseText.split(/\r?\n/);
      var lineCount = -3;

      var currentFrame = null;
      // parser without rotation support yet!
      for (var i = 0; i < result.length; i++) {
        result[i] = result[i].replace(/^\s+|\s+$/g, '');
        if (result[i].length > 0) {
          if (lineCount == -3) {
            this.atlas.meta.image = result[i];
          } else if (lineCount > 0) {
            if (lineCount % 7 == 1) {
              if (currentFrame != null) {
                this.atlas.frames[currentFrame.name] = currentFrame;
              }
              currentFrame = { name: result[i], frame : {} };
            } else {
              var text = result[i].split(" ");
              if (lineCount % 7 == 3) {
                currentFrame.frame.x = Number(text[1].replace(",", ""));
                currentFrame.frame.y = Number(text[2]);
              } else if (lineCount % 7 == 4) {
                currentFrame.frame.w = Number(text[1].replace(",", ""));
                currentFrame.frame.h = Number(text[2]);
              }
            }
          }
          lineCount++;
        }
      }
      if (currentFrame != null) {
        this.atlas.frames[currentFrame.name] = currentFrame;
      }

      if(this.atlas.frames)
      {
        // sprite sheet
        var scope = this;
        var textureUrl = this.baseUrl + this.atlas.meta.image;
        var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
        var frameData = this.atlas.frames;

        this.texture = image.texture.baseTexture;
        image.addEventListener("loaded", function (event) {
          scope.onLoaded();
        });

        for (var i in frameData) {
          var rect = frameData[i].frame;
          if (rect) {
            PIXI.TextureCache[i] = new PIXI.Texture(this.texture, {
              x: rect.x,
              y: rect.y,
              width: rect.w,
              height: rect.h
            });
          }
        }
        image.load();

      }
      else
      {
        this.onLoaded();
      }

    } else {
      this.onError();
    }
  }
};

/**
 * Invoke when json file loaded
 * @private
 */
PIXI.AtlasLoader.prototype.onLoaded = function () {
  this.loaded = true;
  this.dispatchEvent({
    type: "loaded",
    content: this
  });
};

/**
 * Invoke when error occured
 * @private
 */
PIXI.AtlasLoader.prototype.onError = function () {
  this.dispatchEvent({
    type: "error",
    content: this
  });
};