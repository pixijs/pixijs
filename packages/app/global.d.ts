declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Application
    {
        resizeTo: Window|HTMLElement;
        resize(): void;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IApplicationOptions
    {
        resizeTo?: Window|HTMLElement;
    }
}
