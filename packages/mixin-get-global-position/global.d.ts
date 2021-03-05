declare namespace GlobalMixins
{
    interface DisplayObject
    {
        getGlobalPosition?: (point?: import('@pixi/math').Point, skipUpdate?: boolean) => import('@pixi/math').Point;
    }
}
