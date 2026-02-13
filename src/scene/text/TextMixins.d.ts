declare global
{
    namespace PixiMixins
    {
        interface RendererSystems
        {
            canvasText: import('./shared/AbstractTextSystem').AbstractTextSystem;
        }

        interface RendererPipes
        {
            text: import('./canvas/CanvasTextPipe').CanvasTextPipe;
        }
    }
}
export {};
