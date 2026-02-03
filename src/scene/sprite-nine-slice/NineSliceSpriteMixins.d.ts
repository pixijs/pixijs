declare global
{
    namespace PixiMixins
    {
        interface RendererPipes
        {
            nineSliceSprite: import('./NineSliceSpritePipe').NineSliceSpritePipe;
        }
    }
}

export {};
