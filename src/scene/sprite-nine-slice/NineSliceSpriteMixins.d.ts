declare global
{
    namespace PixiMixins
    {
        interface CanvasPipes
        {
            nineSliceSprite: import('./canvas/CanvasNineSliceSpritePipe').CanvasNineSliceSpritePipe;
        }
        interface WebGLPipes
        {
            nineSliceSprite: import('./NineSliceSpritePipe').NineSliceSpritePipe;
        }
        interface WebGPUPipes
        {
            nineSliceSprite: import('./NineSliceSpritePipe').NineSliceSpritePipe;
        }
    }
}
export {};
