declare namespace GlobalMixins
{
    interface DisplayObject {
        cacheAsBitmap: boolean;
        cacheAsBitmapResolution: number;
        cacheAsBitmapMultisample: import('@pixi/constants').MSAA_QUALITY;
        _cacheAsBitmapResolution: number;
        _cacheAsBitmapMultisample: import('@pixi/constants').MSAA_QUALITY;
        _cacheAsBitmap: boolean;
        _cacheData: import('@pixi/mixin-cache-as-bitmap').CacheData;
        _renderCached(renderer: import('@pixi/core').Renderer): void;
        _initCachedDisplayObject(renderer: import('@pixi/core').Renderer): void;
        _calculateCachedBounds(): void;
        _getCachedLocalBounds(): import('@pixi/math').Rectangle;
        _renderCachedCanvas(renderer: import('@pixi/core').AbstractRenderer): void;
        _initCachedDisplayObjectCanvas(renderer: import('@pixi/core').AbstractRenderer): void;
        _destroyCachedDisplayObject(): void;
        _cacheAsBitmapDestroy(options?: import('@pixi/display').IDestroyOptions|boolean): void;
    }
}
