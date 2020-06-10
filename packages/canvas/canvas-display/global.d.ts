declare namespace GlobalMixins {
    interface Container {
        _renderCanvas?: (renderer: import('@pixi/canvas-renderer').CanvasRenderer) => void;
    }
}
