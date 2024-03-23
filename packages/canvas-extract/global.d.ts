declare global
{
    namespace GlobalMixins
    {
        interface CanvasRenderer
        {
            readonly extract: import('@pixi/canvas-extract').CanvasExtract;
        }
    }
}

export {};
