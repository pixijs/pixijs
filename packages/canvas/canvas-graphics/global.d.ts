declare namespace GlobalMixins {
    interface Graphics {
        _renderCanvas(renderer: import('@pixi/canvas-renderer').CanvasRenderer): void;
        generateCanvasTexture(scaleMode: import('@pixi/constants').SCALE_MODES, resolution?: number): Texture;
        cachedGraphicsData: import('@pixi/graphics').GraphicsData[];
    }
}
