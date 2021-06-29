declare namespace GlobalMixins
{
    interface Point
    {
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
}
