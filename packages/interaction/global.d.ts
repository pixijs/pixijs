declare namespace GlobalMixins
{
    // @deprecated
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends Omit<
        Partial<import('@pixi/interaction').InteractiveTarget>,
        'cursor' | 'interactive' | 'interactiveChildren' | 'hitArea'
    >
    {

    }
}
