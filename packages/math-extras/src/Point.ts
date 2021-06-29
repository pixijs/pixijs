import { Point, IPointData, ObservablePoint } from '@pixi/math';

ObservablePoint.prototype.addition
= Point.prototype.addition
= function addition<T extends IPointData>(other: IPointData, outPoint?: T): T
        {
            if (!outPoint)
            {
                outPoint = new Point();
            }
            outPoint.x = this.x + other.x;
            outPoint.y = this.y + other.y;

            return outPoint;
        };

ObservablePoint.prototype.subtraction
        = Point.prototype.subtraction
        = function subtraction<T extends IPointData>(other: IPointData, outPoint?: T): T
        {
            if (!outPoint)
            {
                outPoint = new Point();
            }
            outPoint.x = this.x - other.x;
            outPoint.y = this.y - other.y;

            return outPoint;
        };

ObservablePoint.prototype.multiplication
        = Point.prototype.multiplication
        = function multiplication<T extends IPointData>(other: IPointData, outPoint?: T): T
        {
            if (!outPoint)
            {
                outPoint = new Point();
            }
            outPoint.x = this.x * other.x;
            outPoint.y = this.y * other.y;

            return outPoint;
        };

ObservablePoint.prototype.scalarMultiplication
        = Point.prototype.scalarMultiplication
        = function scalarMultiplication<T extends IPointData>(scalar: number, outPoint?: T): T
        {
            if (!outPoint)
            {
                outPoint = new Point();
            }
            outPoint.x = this.x * scalar;
            outPoint.y = this.y * scalar;

            return outPoint;
        };

ObservablePoint.prototype.dotProduct
        = Point.prototype.dotProduct
        = function dotProduct(other: IPointData): number
        {
            return (this.x * other.x) + (this.y * other.y);
        };

ObservablePoint.prototype.crossProduct
        = Point.prototype.crossProduct
        = function crossProduct(other: IPointData): number
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
        };

ObservablePoint.prototype.normalized
= Point.prototype.normalized
= function normalized<T extends IPointData>(outPoint?: T): T
        {
            if (!outPoint)
            {
                outPoint = new Point();
            }
            const magnitude = Math.sqrt((this.x * this.x) + (this.y * this.y));

            outPoint.x = this.x / magnitude;
            outPoint.y = this.y / magnitude;

            return outPoint;
        };

ObservablePoint.prototype.magnitude
= Point.prototype.magnitude
= function magnitude(): number
        {
            return Math.sqrt((this.x * this.x) + (this.y * this.y));
        };

ObservablePoint.prototype.magnitudeSquared
= Point.prototype.magnitudeSquared
= function magnitudeSquared(): number
        {
            return (this.x * this.x) + (this.y * this.y);
        };

ObservablePoint.prototype.projection
= Point.prototype.projection
= function projection<T extends IPointData>(onto: IPointData, outPoint?: T): T
        {
            if (!outPoint)
            {
                outPoint = new Point();
            }
            // Math says: a Projected over b = [(a·b) / (b·b)] * b;
            const scalarProjection = ((this.x * onto.x) + (this.y * onto.y)) / ((onto.x * onto.x) + (onto.y * onto.y));

            outPoint.x = onto.x * scalarProjection;
            outPoint.y = onto.y * scalarProjection;

            return outPoint;
        };

ObservablePoint.prototype.reflection
        = Point.prototype.reflection
        = function reflection<T extends IPointData>(onto: IPointData, outPoint?: T): T
        {
            if (!outPoint)
            {
                outPoint = new Point();
            }

            // brain.exe stopped working...

            return outPoint;
        };

ObservablePoint.prototype.equals
        = Point.prototype.equals
        = function equals(other: IPointData): boolean
        {
            return this.x === other.x && this.y === other.y;
        };
