declare namespace GlobalMixins
{
    type FederatedEventTarget = import('@pixi/events').FederatedEventTarget;
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends FederatedEventTarget
    {

    }
}
