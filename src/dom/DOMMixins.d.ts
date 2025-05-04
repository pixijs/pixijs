declare global
{
    namespace PixiMixins
    {

        interface RendererSystems
        {
            dom: import('./DOMPipe').DOMPipe;
        }
    }
}

export {};
