declare global
{
    namespace PixiMixins
    {
        interface RendererPipes
        {
            nineSliceSprite: import('../../rendering/renderers/shared/instructions/RenderPipe').RenderPipe<
                import('./NineSliceSprite').NineSliceSprite
            >;
        }
    }
}
export {};
