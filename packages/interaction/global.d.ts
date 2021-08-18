declare namespace GlobalMixins
{
    type InteractiveTarget = import('@pixi/interaction').InteractiveTarget;
    type InteractionEventEmitterTypes = import('@pixi/interaction').InteractionEventEmitterTypes;
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends InteractiveTarget
    {

    }
}
