declare global
{
    namespace PixiMixins
    {
        interface RendererSystems
        {
            canvasText: import('./shared/TextSystemBase').TextSystemBase;
        }

        interface RendererPipes
        {
            text: import('./canvas/CanvasTextPipe').CanvasTextPipe;
        }
    }
}
export {};
