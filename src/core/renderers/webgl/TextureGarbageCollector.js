    
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

    this.enabled = true;
}

TextueGarbageCollector.prototype.constructor = TextueGarbageCollector;
module.exports = TextueGarbageCollector;

TextueGarbageCollector.prototype.update = function()
{
    if(! this.enabled )return;

    this.count++;
    this.checkCount++;

    var managedTextures =  this.renderer.textureManager._managedTextures;

    if(this.checkCount > this.checkCountMax)
    {
        this.checkCount = 0;

        for (var i = 0; i < managedTextures.length; i++) {
            
            var texture = managedTextures[i];

            // only supports non generated textures at the moment!
            if( !texture._glRenderTargets && this.count  - texture.touched > this.maxIdle)
            {
                texture.dispose();
                i--;
            }
            
        };
    }    
}