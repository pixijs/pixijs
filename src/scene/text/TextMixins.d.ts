declare global
{
    namespace PixiMixins
    {
        interface RendererSystems
        {
            canvasText: import('./canvas/CanvasTextSystem').CanvasTextSystem;
        }

        interface RendererPipes
        {
            text: import('./canvas/CanvasTextPipe').CanvasTextPipe;
        }
    }
}
export {};
