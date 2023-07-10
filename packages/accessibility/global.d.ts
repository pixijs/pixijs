declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends Partial<import('@pixi/accessibility').IAccessibleTarget>
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IDisplayObjectOptions extends Partial<import('@pixi/accessibility').IAccessibleOptions>
    {

    }
}
