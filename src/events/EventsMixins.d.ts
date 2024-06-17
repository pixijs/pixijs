import type { FederatedEventEmitterTypes } from './FederatedEventMap';
import type { FederatedOptions, IFederatedContainer } from './FederatedEventTarget';

declare global
{
    namespace PixiMixins
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Container extends IFederatedContainer {}
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface ContainerOptions extends FederatedOptions {}

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface ContainerEvents extends FederatedEventEmitterTypes {}

        interface RendererOptions
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
            eventFeatures?: import('./EventSystem').EventSystemOptions['eventFeatures'];
        }

        interface RendererSystems
        {
            events: import('./EventSystem').EventSystem;
        }
    }
}

export {};
