declare global
{
    namespace PixiMixins
    {
        interface RendererPipes
        {
            bitmapText: import('./BitmapTextPipe').BitmapTextPipe;
        }
    }
}
export {};
