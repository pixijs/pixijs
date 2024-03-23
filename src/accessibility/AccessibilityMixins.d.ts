declare global
{
    namespace PixiMixins
    {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Container extends Partial<import('./accessibilityTarget').AccessibleTarget> {}

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface ContainerOptions extends Partial<import('./accessibilityTarget').AccessibleOptions> {}

        interface RendererSystems
        {
            accessibility: import('./AccessibilitySystem').AccessibilitySystem;
        }
    }
}

export {};
