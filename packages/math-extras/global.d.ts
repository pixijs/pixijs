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
    addition(other: import('@pixi/math').IPointData): Point;
    addition<T extends import('@pixi/math').IPointData>(other: import('@pixi/math').IPointData, outPoint: T): T;

    subtraction(other: import('@pixi/math').IPointData): Point;
    subtraction<T extends import('@pixi/math').IPointData>(other: import('@pixi/math').IPointData, outPoint: T): T;

    multiplication(other: import('@pixi/math').IPointData): Point;
    multiplication<T extends import('@pixi/math').IPointData>(other: import('@pixi/math').IPointData, outPoint: T): T;

    division(other: import('@pixi/math').IPointData): Point;
    division<T extends import('@pixi/math').IPointData>(other: import('@pixi/math').IPointData, outPoint: T): T;

    scalarMultiplication(scalar: number): Point;
    scalarMultiplication<T extends import('@pixi/math').IPointData>(scalar: number, outPoint: T): T;

    dotProduct(other: import('@pixi/math').IPointData): number;

    crossProduct(other: import('@pixi/math').IPointData): number;

    normalized(): Point;
    normalized<T extends import('@pixi/math').IPointData>(outPoint: T): T;

    magnitude(): number;

    magnitudeSquared(): number;

    projection(onto: import('@pixi/math').IPointData): Point;
    projection<T extends import('@pixi/math').IPointData>(onto: import('@pixi/math').IPointData, outPoint: T): T;

    reflection(normal: Point): Point;
    reflection<T extends import('@pixi/math').IPointData>(normal: Point, outPoint: T): T;

    equals(other: import('@pixi/math').IPointData): boolean;
}
