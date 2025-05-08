declare global
{
    namespace PixiMixins
    {
        interface RendererPipes
        {
            dom: import('./DOMPipe').DOMPipe;
        }
    }
}

export {};
