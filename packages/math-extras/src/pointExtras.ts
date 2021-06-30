import { Point, IPointData, ObservablePoint } from '@pixi/math';

const mixins: any = {
    /**
     * Adds `other` to `this` point and outputs into `outPoint` or a new Point
     * @method add
     * @memberof PIXI.Point#
     * @alias PIXI.ObservablePoint.add
     * @param other The point to add to `this`
     * @param [outPoint] A Point-like object in which to store the value, optional (otherwise will create a new Point).
     * @returns The `outPoint` reference or a new Point, with the result of the addition.
     */
    add<T extends IPointData>(other: IPointData, outPoint?: T): T
    {
        if (!outPoint)
        {
            (outPoint as any) = new Point();
        }
        outPoint.x = this.x + other.x;
        outPoint.y = this.y + other.y;

        return outPoint;
    },

    subtract<T extends IPointData>(other: IPointData, outPoint?: T): T
    {
        if (!outPoint)
        {
            (outPoint as any) = new Point();
        }
        outPoint.x = this.x - other.x;
        outPoint.y = this.y - other.y;

        return outPoint;
    },

    multiply<T extends IPointData>(other: IPointData, outPoint?: T): T
    {
        if (!outPoint)
        {
            (outPoint as any) = new Point();
        }
        outPoint.x = this.x * other.x;
        outPoint.y = this.y * other.y;

        return outPoint;
    },

    multiplyScalar<T extends IPointData>(scalar: number, outPoint?: T): T
    {
        if (!outPoint)
        {
            (outPoint as any) = new Point();
        }
        outPoint.x = this.x * scalar;
        outPoint.y = this.y * scalar;

        return outPoint;
    },

    dot(other: IPointData): number
    {
        return (this.x * other.x) + (this.y * other.y);
    },

    cross(other: IPointData): number
    {
        /*
             * Returns the magnitude of the vector that would result
             * from a regular 3D cross product of the input vectors,
             * taking their Z values implicitly as 0
             * (i.e. treating the 2D space as a plane in the 3D space).
             * The 3D cross product will be perpendicular to that plane,
             * and thus have 0 X & Y components
             * (thus the scalar returned is the Z value of the 3D cross product vector).
             */
        return (this.x * other.y) - (this.y * other.x);
    },

    normalize<T extends IPointData>(outPoint?: T): T
    {
        if (!outPoint)
        {
            (outPoint as any) = new Point();
        }
        const magnitude = Math.sqrt((this.x * this.x) + (this.y * this.y));

        outPoint.x = this.x / magnitude;
        outPoint.y = this.y / magnitude;

        return outPoint;
    },

    magnitude(): number
    {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },

    magnitudeSquared(): number
    {
        return (this.x * this.x) + (this.y * this.y);
    },

    project<T extends IPointData>(onto: IPointData, outPoint?: T): T
    {
        if (!outPoint)
        {
            (outPoint as any) = new Point();
        }
        // Math says: a Projected over b = [(a·b) / (b·b)] * b;
        const scalarProjection = ((this.x * onto.x) + (this.y * onto.y)) / ((onto.x * onto.x) + (onto.y * onto.y));

        outPoint.x = onto.x * scalarProjection;
        outPoint.y = onto.y * scalarProjection;

        return outPoint;
    },

    reflect<T extends IPointData>(normal: IPointData, outPoint?: T): T
    {
        if (!outPoint)
        {
            (outPoint as any) = new Point();
        }

        // Given an incident vector i and a normal vector n, returns the reflection vector r = i - 2 * dot(i, n) * n

        const dotProduct = (this.x * normal.x) + (this.y * normal.y);

        outPoint.x = this.x - (2 * dotProduct * normal.x);
        outPoint.y = this.y - (2 * dotProduct * normal.y);

        return outPoint;
    },

    equals(other: IPointData): boolean
    {
        return this.x === other.x && this.y === other.y;
    },
};

Object.assign(Point.prototype, mixins);
Object.assign(ObservablePoint.prototype, mixins);
