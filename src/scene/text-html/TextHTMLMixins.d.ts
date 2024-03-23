declare global
{
    namespace PixiMixins
    {
        interface RendererSystems
        {
            htmlText: import('./HTMLTextSystem').HTMLTextSystem;
        }

        interface RendererPipes
        {
            htmlText: import('./HTMLTextPipe').HTMLTextPipe;
        }
    }
}
export {};
