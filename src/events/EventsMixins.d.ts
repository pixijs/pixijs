import type { FederatedEventEmitterTypes } from './FederatedEventMap';
import type { FederatedOptions, IFederatedContainer } from './FederatedEventTarget';

declare global
{
    namespace PixiMixins
    {

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Container extends IFederatedContainer {}

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ContainerOptions extends FederatedOptions {}

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ContainerEvents extends FederatedEventEmitterTypes {}

        interface RendererOptions
        {
            /**
             * The type of interaction behavior for a Container. This is set via the {@link Container#eventMode} property.
             * @example
             * ```ts
             * // Basic event mode setup
             * const sprite = new Sprite(texture);
             * sprite.eventMode = 'static';    // Enable standard interaction
             * sprite.on('pointerdown', () => { console.log('clicked!'); });
             *
             * // Different event modes
             * sprite.eventMode = 'none';      // Disable all interaction
             * sprite.eventMode = 'passive';   // Only allow interaction on children
             * sprite.eventMode = 'auto';      // Like DOM pointer-events: auto
             * sprite.eventMode = 'dynamic';   // For moving/animated objects
             * ```
             *
             * Available modes:
             * - `'none'`: Ignores all interaction events, even on its children
             * - `'passive'`: **(default)** Does not emit events and ignores hit testing on itself and
             * non-interactive children. Interactive children will still emit events.
             * - `'auto'`: Does not emit events but is hit tested if parent is interactive.
             * Same as `interactive = false` in v7
             * - `'static'`: Emit events and is hit tested. Same as `interactive = true` in v7
             * - `'dynamic'`: Emits events and is hit tested but will also receive mock interaction events fired from
             * a ticker to allow for interaction when the mouse isn't moving
             *
             * Performance tips:
             * - Use `'none'` for pure visual elements
             * - Use `'passive'` for containers with some interactive children
             * - Use `'static'` for standard buttons/controls
             * - Use `'dynamic'` only for moving/animated interactive elements
             * @since 7.2.0
             */
            eventMode?: import('./FederatedEventTarget').EventMode;
            /**
             * Configuration for enabling/disabling specific event features.
             * Use this to optimize performance by turning off unused functionality.
             * @example
             * ```ts
             * const app = new Application();
             * await app.init({
             *     eventFeatures: {
             *         // Core interaction events
             *         move: true,        // Pointer/mouse/touch movement
             *         click: true,       // Click/tap events
             *         wheel: true,       // Mouse wheel/scroll events
             *         // Global tracking
             *         globalMove: false  // Global pointer movement
             *     }
             * });
             * ```
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
