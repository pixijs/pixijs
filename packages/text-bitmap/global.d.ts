declare namespace PixiGlobalMixins
{
    interface IBitmapFontResource {
        bitmapFont: import('@pixi/text-bitmap').BitmapFont;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ILoaderResource extends Partial<IBitmapFontResource>
    {

    }
}
