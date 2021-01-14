declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ILoaderResource
    {

    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IResourceMetadata
    {

    }

    interface Application
    {
        loader: import('@pixi/loaders').Loader;
    }

    interface IApplicationOptions
    {
        sharedLoader?: boolean;
    }
}
