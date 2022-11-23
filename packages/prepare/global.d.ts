declare namespace GlobalMixins
{
    interface Renderer
    {
        readonly prepare: import('@pixi/prepare').Prepare;
    }

    interface Settings
    {
        /** @deprecated */
        UPLOADS_PER_FRAME: number;
    }
}
