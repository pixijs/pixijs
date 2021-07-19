declare namespace GlobalMixins
{
    interface IBitmapFontResource {
        bitmapFont: import('@pixi/text-bitmap').BitmapFont;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface LoaderResource extends Partial<IBitmapFontResource>
    {

    }

    interface IBitmapFontResourceMetadata {
        pageFile: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IResourceMetadata extends Partial<IBitmapFontResourceMetadata>
    {

    }
}
