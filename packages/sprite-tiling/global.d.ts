declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface TilingSprite
    {

    }

    interface IRendererPlugins
    {
        tilingSprite: import('@pixi/sprite-tiling').TilingSpriteRenderer;
    }
}
