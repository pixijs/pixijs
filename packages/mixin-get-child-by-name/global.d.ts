declare namespace GlobalMixins
{
    interface DisplayObject
    {
        name?: string;
    }

    interface Container
    {
        getChildByName?(name: string): import('@pixi/display').DisplayObject;
    }
}
