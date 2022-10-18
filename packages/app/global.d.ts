declare namespace GlobalMixins
{
    interface Application
    {
        resizeTo: Window | HTMLElement;
        resize(): void;
        queueResize: () => void;
        cancelResize: () => void;
    }

    interface IApplicationOptions
    {
        resizeTo?: Window | HTMLElement;
    }
}
