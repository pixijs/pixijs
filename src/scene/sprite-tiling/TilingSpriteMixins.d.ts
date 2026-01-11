declare global
{
    namespace PixiMixins
    {
        interface RendererPipes
        {
            tilingSprite: import('../../rendering/renderers/shared/instructions/RenderPipe').RenderPipe<
                import('./TilingSprite').TilingSprite
            >;
        }
    }
}
export {};
