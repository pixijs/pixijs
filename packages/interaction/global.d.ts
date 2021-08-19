declare namespace GlobalMixins
{
    type InteractiveTarget = import('@pixi/interaction').InteractiveTarget;
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends InteractiveTarget
    {

    }
}
