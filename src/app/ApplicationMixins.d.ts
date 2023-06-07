declare namespace PixiMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Application
    {
        resizeTo: Window | HTMLElement;
        resize(): void;
        queueResize: () => void;
        cancelResize: () => void;
    }

    type ResizePluginOptions = import('./ResizePlugin').ResizePluginOptions;

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ApplicationOptions extends ResizePluginOptions
    {
    }
}
