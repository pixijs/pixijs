declare namespace GlobalMixins
{
    interface Sprite
    {
        _tintedCanvas: import('@pixi/settings').ICanvas | HTMLImageElement;
        _renderCanvas(renderer: import('@pixi/canvas-renderer').CanvasRenderer): void;
    }
}
