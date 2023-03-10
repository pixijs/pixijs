declare namespace GlobalMixins
{
    type FederatedEventEmitterTypes = import('@pixi/events').FederatedEventEmitterTypes;
    type FederatedEventTarget = import('@pixi/events').FederatedEventTarget;
    type IFederatedDisplayObject = import('@pixi/events').IFederatedDisplayObject;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DisplayObject extends Omit<FederatedEventTarget, keyof IFederatedDisplayObject>, IFederatedDisplayObject
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

    interface IRendererOptions
    {
        /**
         * The default event mode for all display objects.
         * @since 7.2.0
         */
        eventMode?: import('@pixi/events').EventMode;
        /**
         * The event features that are enabled by the EventSystem.
         * @since 7.2.0
         */
        eventFeatures?: import('@pixi/events').EventSystemOptions['eventFeatures']
    }

    interface CanvasRenderer
    {
        readonly events: import('@pixi/events').EventSystem;
    }
}
