declare namespace GlobalMixins
{
    interface Renderer
    {
        readonly prepare: import('@pixi/prepare').Prepare;
    }
}
