
var CONST = require('../../const');

/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function TextueGarbageCollector(renderer)
{
    this.renderer = renderer;

    this.count = 0;
    this.checkCount = 0;
    this.maxIdle = 60 * 60;
    this.checkCountMax = 60 * 10;

    this.mode = CONST.GC_MODES.DEFAULT

    this._removedIndices = [];
}

TextueGarbageCollector.prototype.constructor = TextueGarbageCollector;
module.exports = TextueGarbageCollector;

TextueGarbageCollector.prototype.update = function()
{
    if(this.mode === CONST.GC_MODES.MANUAL)return;

    this.count++;
    this.checkCount++;


    if(this.checkCount > this.checkCountMax)
    {
        this.checkCount = 0;

        this.run();
    }
}

TextueGarbageCollector.prototype.run = function()
{
    var managedTextures =  this.renderer.textureManager._managedTextures;

    var removed = this._removedIndices;
    removed.length = 0;
    var i,j;
    try {
        this.renderer.textureManager._cleaning = true;
        for (i = 0; i < managedTextures.length; i++) {
            var texture = managedTextures[i];
            // only supports non generated textures at the moment!
            if (!texture._glRenderTargets && this.count - texture.touched > this.maxIdle) {
                removed.push(i);
                texture.dispose();
            }
        }
    } finally {
        this.renderer.textureManager._cleaning = false;
        if (removed.length>0) {
            for (i = 0; i < removed.length; i++) {
                managedTextures[i] = null;
            }
            j = 0;
            for (var i = 0; i < managedTextures.length; i++) {
                if (managedTextures[i] != null) {
                    managedTextures[j++] = managedTextures[i];
                }
            }
            managedTextures.length = j;
            removed.length = 0;
        }
    }
}
