declare namespace GlobalMixins
{
    interface BaseTexture
    {
        getDrawableSource?(): CanvasImageSource;
    }

    interface Texture
    {
        patternCache?: { [key: string]: CanvasPattern };
        tintCache?: { [key: string]: HTMLCanvasElement | HTMLImageElement };
    }

    interface BaseRenderTexture
    {
        _canvasRenderTarget: import('@pixi/utils').CanvasRenderTarget;
    }

    interface GlobalTintable
    {
        tintId?: number;
    }

    interface DisplayObject
    {
        renderCanvas?(renderer: import('@pixi/canvas-renderer').CanvasRenderer): void;
    }

    interface IRendererOptions
    {
        forceCanvas?: boolean;
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface CanvasPattern extends GlobalMixins.GlobalTintable
{

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface HTMLCanvasElement extends GlobalMixins.GlobalTintable
{

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface HTMLImageElement extends GlobalMixins.GlobalTintable
{

}
