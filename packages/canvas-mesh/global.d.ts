declare namespace GlobalMixins
{
    interface Mesh
    {
        _renderCanvas(renderer: import('@pixi/canvas-renderer').CanvasRenderer): void;
        _canvasPadding: number;
        canvasPadding: number;
        _cachedTint: number;
        _tintedCanvas: import('@pixi/settings').ICanvas | HTMLImageElement;
        _cachedTexture: import('@pixi/core').Texture;
    }

    interface MeshMaterial
    {
        _renderCanvas(renderer: import('@pixi/canvas-renderer').CanvasRenderer, mesh: import('@pixi/mesh').Mesh): void;
    }

    interface NineSlicePlane
    {
        _cachedTint: number;
        _tintedCanvas: import('@pixi/settings').ICanvas | HTMLImageElement;
        _canvasUvs: number[];
    }

    interface Settings
    {
        /** @deprecated since 7.1.0 */
        MESH_CANVAS_PADDING: number;
    }
}
