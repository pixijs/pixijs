declare global
{
    namespace PixiMixins
    {
        interface WebGLPipes
        {
            bitmapText: import('./GpuBitmapTextPipe').BitmapTextPipe;
        }

        interface WebGPUPipes
        {
            bitmapText: import('./GpuBitmapTextPipe').BitmapTextPipe;
        }

        interface CanvasPipes
        {
            bitmapText: import('./CanvasBitmapTextPipe').CanvasBitmapTextPipe;
        }
    }
}
export {};
