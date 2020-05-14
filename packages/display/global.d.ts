declare namespace GlobalMixins
{
    interface DisplayObject
    {
        name?: string;
        getChildByName?(name: string): DisplayObject;
    }
}
