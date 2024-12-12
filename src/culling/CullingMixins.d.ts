declare global
{
    namespace PixiMixins
    {

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Container extends Partial<import('./cullingMixin').CullingMixinConstructor> {}

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ContainerOptions extends Partial<import('./cullingMixin').CullingMixinConstructor> {}
    }
}

export {};
