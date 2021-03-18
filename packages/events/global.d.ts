declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends Required<Partial<import('@pixi/events').FederatedEventTarget>>
    {

    }
}
