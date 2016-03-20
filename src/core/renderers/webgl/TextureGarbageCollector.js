
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

    this.mode = CONST.GC_MODES.DEFAULT;
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
    var tm = this.renderer.textureManager;
    var managedTextures =  tm._managedTextures;
    var wasRemoved = false;
    var i,j;

    for (i = 0; i < managedTextures.length; i++) 
    {
        var texture = managedTextures[i];

        // only supports non generated textures at the moment!
        if (!texture._glRenderTargets && this.count - texture.touched > this.maxIdle) 
        {
            tm.destroyTexture(texture, true);
            managedTextures[i] = null;
            wasRemoved = true;
        }
    }
    
    if (wasRemoved) 
    {
        j = 0;

        for (i = 0; i < managedTextures.length; i++) 
        {
            if (managedTextures[i] !== null) 
            {
                managedTextures[j++] = managedTextures[i];
            }
        }

        managedTextures.length = j;
    }
}
