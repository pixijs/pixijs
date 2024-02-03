declare global
{
    namespace GlobalMixins
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface BaseTexture
        {
            ktxKeyValueData: Map<string, DataView>;
        }
    }
}

export {};
