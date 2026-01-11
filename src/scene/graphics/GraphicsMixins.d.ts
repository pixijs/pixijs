declare global
{
    namespace PixiMixins
    {
        interface WebGLSystems
        {
            graphicsContext: import('./shared/GraphicsContextSystem').GraphicsContextSystem;
        }
        interface WebGPUSystems
        {
            graphicsContext: import('./shared/GraphicsContextSystem').GraphicsContextSystem;
        }
        interface CanvasSystems
        {
            graphicsContext: import('./canvas/CanvasGraphicsContextSystem').CanvasGraphicsContextSystem;
        }
        interface RendererPipes
        {
            graphics: import('../../rendering/renderers/shared/instructions/RenderPipe').RenderPipe<
                import('./shared/Graphics').Graphics
            >;
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
