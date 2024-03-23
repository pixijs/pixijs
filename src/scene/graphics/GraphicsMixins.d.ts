declare global
{
    namespace PixiMixins
    {
        interface RendererSystems
        {
            graphicsContext: import('./shared/GraphicsContextSystem').GraphicsContextSystem;
        }

        interface RendererPipes
        {
            graphics: import('./shared/GraphicsPipe').GraphicsPipe;
        }

        interface RendererOptions
        {
        /**
         * A value from 0 to 1 that controls the smoothness of bezier curves (the higher the smoother)
         * @default 0.5
         */
            bezierSmoothness: number
        }
    }
}
export {};
