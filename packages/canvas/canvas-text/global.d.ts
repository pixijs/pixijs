declare namespace GlobalMixins {
    interface Text {
        _renderCanvas: (renderer: import('@pixi/canvas-renderer').CanvasRenderer) => void;
    }
}
