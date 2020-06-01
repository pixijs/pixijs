declare namespace GlobalMixins {
    interface Sprite {
        _tintedCanvas?: HTMLCanvasElement|HTMLImageElement;
        _renderCanvas?: (renderer: import('@pixi/canvas-renderer').CanvasRenderer) => void;
    }
}
