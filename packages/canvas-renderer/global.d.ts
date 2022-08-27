declare namespace GlobalMixins
{
    interface BaseTexture
    {
        getDrawableSource?(): CanvasImageSource;
    }

    interface Texture
    {
        patternCache?: { [key: string]: CanvasPattern };
        tintCache?: { [key: string]: import('@pixi/core').ICanvas | HTMLImageElement };
    }

    interface BaseRenderTexture
    {
        _canvasRenderTarget: import('@pixi/utils').CanvasRenderTarget;
    }

    interface GlobalTintable
    {
        tintId?: number;
    }

    interface IRendererOptions
    {
        forceCanvas?: boolean;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CanvasRenderer
    {

    }

    interface IRenderableObject
    {
        renderCanvas?(renderer: import('@pixi/canvas-renderer').CanvasRenderer): void;
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface CanvasPattern extends GlobalMixins.GlobalTintable
{

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface ICanvas extends GlobalMixins.GlobalTintable
{

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface HTMLImageElement extends GlobalMixins.GlobalTintable
{

}
