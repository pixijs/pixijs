declare namespace GlobalMixins
{
    interface Renderer
    {
        readonly extract: import('@pixi/extract').Extract;
    }

    interface IRenderer
    {
        readonly extract: import('@pixi/extract').IExtract;
    }
}
