declare namespace PixiMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Container extends Partial<import('./culling').CullingTarget> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ContainerOptions extends Partial<import('./culling').CullingTarget> {}
}
