declare namespace GlobalMixins
{
    type FederatedEventTarget = import('@pixi/events').FederatedEventTarget;
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends FederatedEventTarget
    {

    }

    interface Renderer
    {
        readonly events: import('@pixi/events').EventSystem;
    }

    interface CanvasRenderer
    {
        readonly events: import('@pixi/events').EventSystem;
    }
}
