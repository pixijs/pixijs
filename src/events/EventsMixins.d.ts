declare namespace PixiMixins
{
    type FederatedEventEmitterTypes = import('./FederatedEventMap').FederatedEventEmitterTypes;
    type FederatedEventTarget = import('./FederatedEventTarget').FederatedEventTarget;
    type IFederatedContainer = import('./FederatedEventTarget').IFederatedContainer;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Container extends Omit<FederatedEventTarget, keyof IFederatedContainer>, IFederatedContainer
    {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ContainerEvents extends FederatedEventEmitterTypes
    {

    }

    interface SharedRendererOptions
    {
        /**
         * The default event mode for all display objects.
         * @since 7.2.0
         */
        eventMode?: import('./FederatedEventTarget').EventMode;
        /**
         * The event features that are enabled by the EventSystem.
         * @since 7.2.0
         */
        eventFeatures?: import('./EventSystem').EventSystemOptions['eventFeatures']
    }

    // TODO: Add `events` to WebGLRenderer and WebGPURenderer
}
