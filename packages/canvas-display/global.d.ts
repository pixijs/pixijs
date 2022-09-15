declare namespace GlobalMixins
{
    interface DisplayObject
    {
        renderCanvas?(renderer: import('@pixi/canvas-renderer').CanvasRenderer): void;
    }

    interface Container
    {
        _renderCanvas(renderer: import('@pixi/canvas-renderer').CanvasRenderer): void;
    }
}
