declare namespace GlobalMixins
{
    interface IBitmapFontResource {
        bitmapFont: import('@pixi/text-bitmap').BitmapFont;
    }

    interface IBitmapFontResourceMetadata {
        pageFile: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ILoaderResource extends Partial<IBitmapFontResource>
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IResourceMetadata extends Partial<IBitmapFontResourceMetadata>
    {

    }
}
