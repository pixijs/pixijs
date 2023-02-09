declare namespace GlobalMixins
{
    interface Renderer
    {
        readonly prepare: import('@pixi/prepare').Prepare;
    }

    interface Settings
    {
        /** @deprecated since 7.1.0 */
        UPLOADS_PER_FRAME: number;
    }
}
