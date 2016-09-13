import CONST from '../../const';

/**
 * TextureGarbageCollector. This class manages the GPU and ensures that it does not get clogged up with textures that are no longer being used.
 *
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
class TextureGarbageCollector
{
    constructor(renderer)
    {
        this.renderer = renderer;

        this.count = 0;
        this.checkCount = 0;
        this.maxIdle = 60 * 60;
        this.checkCountMax = 60 * 10;

        this.mode = CONST.GC_MODES.DEFAULT;
    }

    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */
    update()
    {
        this.count++;

        if(this.mode === CONST.GC_MODES.MANUAL)
        {
            return;
        }

        this.checkCount++;


        if(this.checkCount > this.checkCountMax)
        {
            this.checkCount = 0;

            this.run();
        }
    }

    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */
    run()
    {
        let tm = this.renderer.textureManager;
        let managedTextures =  tm._managedTextures;
        let wasRemoved = false;
        let i,j;

        for (i = 0; i < managedTextures.length; i++)
        {
            let texture = managedTextures[i];

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

    /**
     * Removes all the textures within the specified displayObject and its children from the GPU
     *
     * @param displayObject {PIXI.DisplayObject} the displayObject to remove the textures from.
     */
    unload( displayObject )
    {
        let tm = this.renderer.textureManager;

        if(displayObject._texture)
        {
            tm.destroyTexture(displayObject._texture, true);
        }

        for (let i = displayObject.children.length - 1; i >= 0; i--) {

            this.unload(displayObject.children[i]);

        }
    }
}

export default TextureGarbageCollector;