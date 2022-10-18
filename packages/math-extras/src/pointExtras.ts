import type { IPointData } from '@pixi/core';
import { Point, ObservablePoint } from '@pixi/core';

const mixins: any = {
    /**
     * Adds `other` to `this` point and outputs into `outPoint` or a new Point.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method add
     * @memberof PIXI.Point#
     * @param {IPointData} other - The point to add to `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `outPoint` reference or a new Point, with the result of the addition.
     */
    /**
     * Adds `other` to `this` point and outputs into `outPoint` or a new Point.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method add
     * @memberof PIXI.ObservablePoint#
     * @param {IPointData} other - The point to add to `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `outPoint` reference or a new Point, with the result of the addition.
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

    /**
     * Subtracts `other` from `this` point and outputs into `outPoint` or a new Point.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method subtract
     * @memberof PIXI.Point#
     * @param {IPointData} other - The point to subtract to `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `outPoint` reference or a new Point, with the result of the subtraction.
     */
    /**
     * Subtracts `other` from `this` point and outputs into `outPoint` or a new Point.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method subtract
     * @memberof PIXI.ObservablePoint#
     * @param {IPointData} other - The point to subtract to `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `outPoint` reference or a new Point, with the result of the subtraction.
     */
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

    /**
     * Multiplies component-wise `other` and `this` points and outputs into `outPoint` or a new Point.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method multiply
     * @memberof PIXI.Point#
     * @param {IPointData} other - The point to multiply with `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `outPoint` reference or a new Point, with the component-wise multiplication.
     */
    /**
     * Multiplies component-wise `other` and `this` points and outputs into `outPoint` or a new Point.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method multiply
     * @memberof PIXI.ObservablePoint#
     * @param {IPointData} other - The point to multiply with `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `outPoint` reference or a new Point, with the component-wise multiplication.
     */
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

    /**
     * Multiplies each component of `this` point with the number `scalar` and outputs into `outPoint` or a new Point.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method multiplyScalar
     * @memberof PIXI.Point#
     * @param {number} scalar - The number to multiply both components of `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `outPoint` reference or a new Point, with the multiplication.
     */
    /**
     * Multiplies each component of `this` point with the number `scalar` and outputs into `outPoint` or a new Point.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method multiplyScalar
     * @memberof PIXI.ObservablePoint#
     * @param {number} scalar - The number to multiply both components of `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `outPoint` reference or a new Point, with the multiplication.
     */
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

    /**
     * Computes the dot product of `other` with `this` point.
     * The dot product is the sum of the products of the corresponding components of two vectors.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method dot
     * @memberof PIXI.Point#
     * @param {IPointData} other - The other point to calculate the dot product with `this`.
     * @returns {number} The result of the dot product. This is an scalar value.
     */
    /**
     * Computes the dot product of `other` with `this` point.
     * The dot product is the sum of the products of the corresponding components of two vectors.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method dot
     * @memberof PIXI.ObservablePoint#
     * @param {IPointData} other - The other point to calculate the dot product with `this`.
     * @returns {number} The result of the dot product. This is an scalar value.
     */
    dot(other: IPointData): number
    {
        return (this.x * other.x) + (this.y * other.y);
    },

    /**
     * Computes the cross product of `other` with `this` point.
     * Given two linearly independent R3 vectors a and b, the cross product, a × b (read "a cross b"),
     * is a vector that is perpendicular to both a and b, and thus normal to the plane containing them.
     * While cross product only exists on 3D space, we can assume the z component of 2D to be zero and
     * the result becomes a vector that will only have magnitude on the z axis.
     *
     * This function returns the z component of the cross product of the two points.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method cross
     * @memberof PIXI.Point#
     * @param {IPointData} other - The other point to calculate the cross product with `this`.
     * @returns {number} The z component of the result of the cross product.
     */
    /**
     * Computes the cross product of `other` with `this` point.
     * Given two linearly independent R3 vectors a and b, the cross product, a × b (read "a cross b"),
     * is a vector that is perpendicular to both a and b, and thus normal to the plane containing them.
     * While cross product only exists on 3D space, we can assume the z component of 2D to be zero and
     * the result becomes a vector that will only have magnitude on the z axis.
     *
     * This function returns the z component of the cross product of the two points.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method cross
     * @memberof PIXI.ObservablePoint#
     * @param {IPointData} other - The other point to calculate the cross product with `this`.
     * @returns {number} The z component of the result of the cross product.
     */
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

    /**
     * Computes a normalized version of `this` point.
     *
     * A normalized vector is a vector of magnitude (length) 1
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method normalize
     * @memberof PIXI.Point#
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The normalized point.
     */
    /**
     * Computes a normalized version of `this` point.
     *
     * A normalized vector is a vector of magnitude (length) 1
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method normalize
     * @memberof PIXI.ObservablePoint#
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The normalized point.
     */
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

    /**
     * Computes the magnitude of this point (Euclidean distance from 0, 0).
     *
     * Defined as the square root of the sum of the squares of each component.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method magnitude
     * @memberof PIXI.Point#
     * @returns {number} The magnitude (length) of the vector.
     */
    /**
     * Computes the magnitude of this point (Euclidean distance from 0, 0).
     *
     * Defined as the square root of the sum of the squares of each component.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method magnitude
     * @memberof PIXI.ObservablePoint#
     * @returns {number} The magnitude (length) of the vector.
     */
    magnitude(): number
    {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },

    /**
     * Computes the square magnitude of this point.
     * If you are comparing the lengths of vectors, you should compare the length squared instead
     * as it is slightly more efficient to calculate.
     *
     * Defined as the sum of the squares of each component.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method magnitudeSquared
     * @memberof PIXI.Point#
     * @returns {number} The magnitude squared (length squared) of the vector.
     */
    /**
     * Computes the square magnitude of this point.
     * If you are comparing the lengths of vectors, you should compare the length squared instead
     * as it is slightly more efficient to calculate.
     *
     * Defined as the sum of the squares of each component.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method magnitudeSquared
     * @memberof PIXI.ObservablePoint#
     * @returns {number} The magnitude squared (length squared) of the vector.
     */
    magnitudeSquared(): number
    {
        return (this.x * this.x) + (this.y * this.y);
    },

    /**
     * Computes vector projection of `this` on `onto`.
     *
     * Imagine a light source, parallel to `onto`, above `this`.
     * The light would cast rays perpendicular to `onto`.
     * `this.project(onto)` is the shadow cast by `this` on the line defined by `onto` .
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method project
     * @memberof PIXI.Point#
     * @param {IPointData} onto - A non zero vector describing a line on which to project `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `this` on `onto` projection.
     */
    /**
     * Computes vector projection of `this` on `onto`.
     *
     * Imagine a light source, parallel to `onto`, above `this`.
     * The light would cast rays perpendicular to `onto`.
     * `this.project(onto)` is the shadow cast by `this` on the line defined by `onto` .
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method project
     * @memberof PIXI.ObservablePoint#
     * @param {IPointData} onto - A non zero vector describing a line on which to project `this`.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The `this` on `onto` projection.
     */
    project<T extends IPointData>(onto: IPointData, outPoint?: T): T
    {
        if (!outPoint)
        {
            (outPoint as any) = new Point();
        }
        // Math says: a Projected over b = [(a·b) / (b·b)] * b;
        const normalizedScalarProjection = ((this.x * onto.x) + (this.y * onto.y)) / ((onto.x * onto.x) + (onto.y * onto.y));

        outPoint.x = onto.x * normalizedScalarProjection;
        outPoint.y = onto.y * normalizedScalarProjection;

        return outPoint;
    },

    /**
     * Reflects `this` vector off of a plane orthogonal to `normal`.
     * `normal` is not normalized during this process. Consider normalizing your `normal` before use.
     *
     * Imagine a light source bouncing onto a mirror.
     * `this` vector is the light and `normal` is a vector perpendicular to the mirror.
     * `this.reflect(normal)` is the reflection of `this` on that mirror.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method reflect
     * @memberof PIXI.Point#
     * @param {IPointData} normal - The normal vector of your reflecting plane.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The reflection of `this` on your reflecting plane.
     */
    /**
     * Reflects `this` vector off of a plane orthogonal to `normal`.
     * `normal` is not normalized during this process. Consider normalizing your `normal` before use.
     *
     * Imagine a light source bouncing onto a mirror.
     * `this` vector is the light and `normal` is a vector perpendicular to the mirror.
     * `this.reflect(normal)` is the reflection of `this` on that mirror.
     *
     * _Note: Only available with **@pixi/math-extras**._
     * @method reflect
     * @memberof PIXI.ObservablePoint#
     * @param {IPointData} normal - The normal vector of your reflecting plane.
     * @param {IPointData} [outPoint] - A Point-like object in which to store the value,
     * optional (otherwise will create a new Point).
     * @returns {IPointData} The reflection of `this` on your reflecting plane.
     */
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
    }
};

Object.assign(Point.prototype, mixins);
Object.assign(ObservablePoint.prototype, mixins);
