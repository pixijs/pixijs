declare global
{
    namespace PixiMixins
    {
        interface RendererSystems
        {
            filter: import('./FilterSystem').FilterSystem;
        }

        interface RendererPipes
        {
            filter: import('./FilterPipe').FilterPipe;
        }
    }
}

export {};
