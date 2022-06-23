declare namespace GlobalMixins
{
    interface CanvasRenderer
    {
        readonly prepare: import('@pixi/canvas-prepare').CanvasPrepare;
    }
}
