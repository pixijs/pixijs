declare global
{
    namespace PixiMixins
    {

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Container extends Partial<import('./accessibilityTarget').AccessibleTarget> {}

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ContainerOptions extends Partial<import('./accessibilityTarget').AccessibleOptions> {}

        interface RendererOptions
        {
            /**
             * Options for the accessibility system. The accessibility system is registered as an
             * extension rather than as a shared system, so its options are declared here to make
             * them part of the public renderer and application options.
             * @example
             * ```ts
             * const app = new Application();
             *
             * await app.init({
             *     accessibilityOptions: {
             *         // Enable immediately instead of waiting for tab
             *         enabledByDefault: true,
             *         // Prevent accessibility from being deactivated when mouse moves
             *         deactivateOnMouseMove: false,
             *     },
             * });
             * ```
             */
            accessibilityOptions?: import('./AccessibilitySystem').AccessibilityOptions;
        }

        interface RendererSystems
        {
            accessibility: import('./AccessibilitySystem').AccessibilitySystem;
        }
    }
}

export {};
