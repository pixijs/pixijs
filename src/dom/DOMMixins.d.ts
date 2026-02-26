declare global
{
    namespace PixiMixins
    {
        interface RendererOptions
        {
            dom?: import('./DOMPipe').DOMPipeOptions;
        }

        interface RendererPipes
        {
            dom: import('./DOMPipe').DOMPipe;
        }
    }
}

export {};
