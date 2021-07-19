declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface LoaderResource
    {
        /**
         * Texture reference for loading images and other textures.
         */
        texture?: Texture;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IResourceMetadata
    {

    }

    /** @deprecated Use LoaderResource instead */
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ILoaderResource
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
