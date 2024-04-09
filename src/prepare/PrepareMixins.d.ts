declare global
{
    namespace PixiMixins
    {
        interface RendererSystems
        {
            prepare: import('./PrepareBase').PrepareBase;
        }
    }
}

export {};
