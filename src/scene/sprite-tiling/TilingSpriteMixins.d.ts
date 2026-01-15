declare global
{
    namespace PixiMixins
    {
        interface CanvasPipes
        {
            tilingSprite: import('./canvas/CanvasTilingSpritePipe').CanvasTilingSpritePipe;
        }
        interface WebGLPipes
        {
            tilingSprite: import('./TilingSpritePipe').TilingSpritePipe;
        }
        interface WebGPUPipes
        {
            tilingSprite: import('./TilingSpritePipe').TilingSpritePipe;
        }
    }
}
export {};
