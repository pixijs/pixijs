declare global
{
    namespace PixiMixins
    {
        interface RendererPipes
        {
            tilingSprite: import('./TilingSpritePipe').TilingSpritePipe;
        }
    }
}

export {};
