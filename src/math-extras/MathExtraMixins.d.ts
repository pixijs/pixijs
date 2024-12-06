/* eslint-disable max-len */
declare global
{
    namespace PixiMixins
    {

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface Point extends Vector2Math
        {
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface ObservablePoint extends Vector2Math
        {
        }

        interface Rectangle
        {
            containsRect(other: import('../maths/shapes/Rectangle').Rectangle): boolean;

            equals(other: import('../maths/shapes/Rectangle').Rectangle): boolean;

            intersection(other: import('../maths/shapes/Rectangle').Rectangle): import('../maths/shapes/Rectangle').Rectangle;
            intersection<T extends import('../maths/shapes/Rectangle').Rectangle>(other: import('../maths/shapes/Rectangle').Rectangle, outRect: T): T;

            union(other: import('../maths/shapes/Rectangle').Rectangle): import('../maths/shapes/Rectangle').Rectangle;
            union<T extends import('../maths/shapes/Rectangle').Rectangle>(other: import('../maths/shapes/Rectangle').Rectangle, outRect: T): T;
        }
    }

    interface Vector2Math
    {
        add(other: import('../maths/point/PointData').PointData): import('../maths/point/Point').Point;
        add<T extends import('../maths/point/PointData').PointData>(other: import('../maths/point/PointData').PointData, outPoint: T): T;

        subtract(other: import('../maths/point/PointData').PointData): import('../maths/point/Point').Point;
        subtract<T extends import('../maths/point/PointData').PointData>(other: import('../maths/point/PointData').PointData, outPoint: T): T;

        multiply(other: import('../maths/point/PointData').PointData): import('../maths/point/Point').Point;
        multiply<T extends import('../maths/point/PointData').PointData>(other: import('../maths/point/PointData').PointData, outPoint: T): T;

        // divide(other: import('../maths/point/PointData').PointData): import('../maths/point/Point').Point;
        // divide<T extends import('../maths/point/PointData').PointData>(other: import('../maths/point/PointData').PointData, outPoint: T): T;

        multiplyScalar(scalar: number): import('../maths/point/Point').Point;
        multiplyScalar<T extends import('../maths/point/PointData').PointData>(scalar: number, outPoint: T): T;

        dot(other: import('../maths/point/PointData').PointData): number;

        cross(other: import('../maths/point/PointData').PointData): number;

        normalize(): import('../maths/point/Point').Point;
        normalize<T extends import('../maths/point/PointData').PointData>(outPoint: T): T;

        magnitude(): number;

        magnitudeSquared(): number;

        project(onto: import('../maths/point/PointData').PointData): import('../maths/point/Point').Point;
        project<T extends import('../maths/point/PointData').PointData>(onto: import('../maths/point/PointData').PointData, outPoint: T): T;

        reflect(normal: import('../maths/point/PointData').PointData): import('../maths/point/Point').Point;
        reflect<T extends import('../maths/point/PointData').PointData>(normal: import('../maths/point/PointData').PointData, outPoint: T): T;
    }
}

export {};
