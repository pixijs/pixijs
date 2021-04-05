declare namespace GlobalMixins
{
    interface ILoaderResource
    {
        /** Reference to Spritesheet object created. */
        spritesheet?: import('@pixi/spritesheet').Spritesheet;

        /** Dictionary of textures from Spritesheet. */
        textures?: {[name: string]: import('@pixi/core').Texture};
    }
}
