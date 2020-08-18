declare namespace GlobalMixins {
    interface Mesh {
        _renderCanvas?: (renderer: import('@pixi/canvas-renderer').CanvasRenderer) => void;
        _canvasPadding: number;
        canvasPadding: number;
        _cachedTint: number;
        _tintedCanvas: HTMLCanvasElement;
    }

    interface MeshMaterial {
        _renderCanvas: (renderer: import('@pixi/canvas-renderer').CanvasRenderer, mesh: import('@pixi/mesh').Mesh) => void;
    }

    interface NineSlicePlane {
        _cachedTint: number;
        _tintedCanvas: HTMLCanvasElement;
        _canvasUvs: number[];
    }
}
