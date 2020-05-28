declare namespace GlobalMixins {
    interface TilingSprite {
        _renderCanvas: (renderer: import('@pixi/canvas-renderer').CanvasRenderer) => void;
        _tintedCanvas: HTMLCanvasElement;
        _canvasPattern: CanvasPattern;
    }
}
