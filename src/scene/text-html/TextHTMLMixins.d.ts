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

        interface RendererOptions
        {
            /**
             * How long to wait in milliseconds before drawing an HTMLText in Safari when it uses a font family.
             * Set it to 0 if every font is already loaded in the document.
             * @default 100
             */
            safariFontDelay: number
        }
    }
}
export {};
