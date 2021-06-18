declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends Partial<import('@pixi/accessibility').IAccessibleTarget>
    {

    }

    interface IRendererPlugins
    {
        accessibility: import('@pixi/accessibility').AccessibilityManager;
    }
}
