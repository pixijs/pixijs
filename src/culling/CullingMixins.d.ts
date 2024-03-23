declare global
{
    namespace PixiMixins
    {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Container extends Partial<import('./cullingMixin').CullingMixinConstructor> {}
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface ContainerOptions extends Partial<import('./cullingMixin').CullingMixinConstructor> {}
    }
}

export {};
