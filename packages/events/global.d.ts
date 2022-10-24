declare namespace GlobalMixins
{
    type FederatedEventEmitterTypes = import('@pixi/events').FederatedEventEmitterTypes;
    type FederatedEventTarget = import('@pixi/events').FederatedEventTarget;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends FederatedEventTarget
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObjectEvents extends FederatedEventEmitterTypes
    {

    }

    interface IRenderer
    {
        readonly events: import('@pixi/events').EventSystem;
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
