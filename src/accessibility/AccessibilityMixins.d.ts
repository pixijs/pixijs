declare global
{
    namespace PixiMixins
    {

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Container extends Partial<import('./accessibilityTarget').AccessibleTarget> {}

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ContainerOptions extends Partial<import('./accessibilityTarget').AccessibleOptions> {}

        interface RendererSystems
        {
            accessibility: import('./AccessibilitySystem').AccessibilitySystem;
        }
    }
}

export {};
