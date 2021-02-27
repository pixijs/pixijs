declare namespace GlobalMixins
{
    interface DisplayObject {
        cacheAsBitmap?: boolean;
        cacheAsBitmapResolution?: number;
        _cacheAsBitmapResolution?: number;
        _cacheAsBitmap?: boolean;
        _cacheData?: import('@pixi/mixin-cache-as-bitmap').CacheData;
        _renderCached?: (renderer: import('@pixi/core').Renderer) => void;
        _initCachedDisplayObject?: (renderer: import('@pixi/core').Renderer) => void;
        _calculateCachedBounds?: () => void;
        _getCachedLocalBounds?: () => import('@pixi/math').Rectangle;
        _renderCachedCanvas?: (renderer: import('@pixi/canvas-renderer').CanvasRenderer) => void;
        _initCachedDisplayObjectCanvas?: (renderer: import('@pixi/canvas-renderer').CanvasRenderer) => void;
        _destroyCachedDisplayObject?: () => void;
        _cacheAsBitmapDestroy?: (options?: import('@pixi/display').IDestroyOptions|boolean) => void;
    }
}
