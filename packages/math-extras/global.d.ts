declare namespace GlobalMixins
{
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Point extends Vector2Math
    {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ObservablePoint extends Vector2Math
    {
    }

    interface Rectangle
    {
        intersects(other: Rectangle): boolean;

        containsRect(other: Rectangle): boolean;

        equals(other: Rectangle): boolean;

        intersection(other: Rectangle): Rectangle;
        intersection<T extends Rectangle>(other: Rectangle, outRect: T): T;

        union(other: Rectangle): Rectangle;
        union<T extends Rectangle>(other: Rectangle, outRect: T): T;
    }
}

interface Vector2Math {
    add(other: import('@pixi/math').IPointData): import('@pixi/math').Point;
    add<T extends import('@pixi/math').IPointData>(other: import('@pixi/math').IPointData, outPoint: T): T;

    subtract(other: import('@pixi/math').IPointData): import('@pixi/math').Point;
    subtract<T extends import('@pixi/math').IPointData>(other: import('@pixi/math').IPointData, outPoint: T): T;

    multiply(other: import('@pixi/math').IPointData): import('@pixi/math').Point;
    multiply<T extends import('@pixi/math').IPointData>(other: import('@pixi/math').IPointData, outPoint: T): T;

    divide(other: import('@pixi/math').IPointData): import('@pixi/math').Point;
    divide<T extends import('@pixi/math').IPointData>(other: import('@pixi/math').IPointData, outPoint: T): T;

    multiplyScalar(scalar: number): import('@pixi/math').Point;
    multiplyScalar<T extends import('@pixi/math').IPointData>(scalar: number, outPoint: T): T;

    dot(other: import('@pixi/math').IPointData): number;

    cross(other: import('@pixi/math').IPointData): number;

    normalize(): import('@pixi/math').Point;
    normalize<T extends import('@pixi/math').IPointData>(outPoint: T): T;

    magnitude(): number;

    magnitudeSquared(): number;

    project(onto: import('@pixi/math').IPointData): import('@pixi/math').Point;
    project<T extends import('@pixi/math').IPointData>(onto: import('@pixi/math').IPointData, outPoint: T): T;

    reflect(normal: import('@pixi/math').IPointData): import('@pixi/math').Point;
    reflect<T extends import('@pixi/math').IPointData>(normal: import('@pixi/math').IPointData, outPoint: T): T;
}
