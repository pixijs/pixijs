declare namespace GlobalMixins
{
    interface DisplayObject
    {
        name: string;
    }

    interface Container
    {
        getChildByName(name: string, isRecursive?: boolean): import('@pixi/display').DisplayObject;
    }
}
