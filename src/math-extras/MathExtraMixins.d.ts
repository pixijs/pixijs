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
            /**
             * Determines whether the `other` Rectangle is contained within `this` Rectangle object.
             * Rectangles that occupy the same space are considered to be containing each other.
             * Rectangles without area (width or height equal to zero) can't contain anything,
             * not even other arealess rectangles.
             *
             * _Note: Only available with **pixi.js/math-extras**._
             * @param {Rectangle} other - The Rectangle to fit inside `this`.
             * @returns {boolean} A value of `true` if `this` Rectangle contains `other`; otherwise `false`.
             */
            containsRect(other: import('../maths/shapes/Rectangle').Rectangle): boolean;
            /**
             * Accepts `other` Rectangle and returns true if the given Rectangle is equal to `this` Rectangle.
             *
             * _Note: Only available with **pixi.js/math-extras**._
             * @param {Rectangle} other - The Rectangle to compare with `this`
             * @returns {boolean} Returns true if all `x`, `y`, `width`, and `height` are equal.
             */
            equals(other: import('../maths/shapes/Rectangle').Rectangle): boolean;

            /**
             * If the area of the intersection between the Rectangles `other` and `this` is not zero,
             * returns the area of intersection as a Rectangle object. Otherwise, return an empty Rectangle
             * with its properties set to zero.
             * Rectangles without area (width or height equal to zero) can't intersect or be intersected
             * and will always return an empty rectangle with its properties set to zero.
             *
             * _Note: Only available with **pixi.js/math-extras**._
             * @param {Rectangle} other - The Rectangle to intersect with `this`.
             * @param {Rectangle} [outRect] - A Rectangle object in which to store the value,
             * optional (otherwise will create a new Rectangle).
             * @returns {Rectangle} The intersection of `this` and `other`.
             */
            intersection<
                T extends import('../maths/shapes/Rectangle').Rectangle = import('../maths/shapes/Rectangle').Rectangle>(
                other: import('../maths/shapes/Rectangle').Rectangle,
                outRect?: T
            ): T;
            /**
             * Adds `this` and `other` Rectangles together to create a new Rectangle object filling
             * the horizontal and vertical space between the two rectangles.
             *
             * _Note: Only available with **pixi.js/math-extras**._
             * @param {Rectangle} other - The Rectangle to unite with `this`.
             * @param {Rectangle} [outRect] - A Rectangle object in which to store the value,
             * optional (otherwise will create a new Rectangle).
             * @returns {Rectangle} The union of `this` and `other`.
             */
            union<T extends import('../maths/shapes/Rectangle').Rectangle = import('../maths/shapes/Rectangle').Rectangle>(
                other: import('../maths/shapes/Rectangle').Rectangle,
                outRect?: T
            ): T;
        }
    }

    interface Vector2Math
    {
        /**
         * Adds `other` to `this` point and outputs into `outPoint` or a new Point.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {PointData} other - The point to add to `this`.
         * @param {PointData} [outPoint] - A Point-like object in which to store the value,
         * optional (otherwise will create a new Point).
         * @returns {PointData} The `outPoint` reference or a new Point, with the result of the addition.
         */
        add<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            other: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;
        /**
         * Subtracts `other` from `this` point and outputs into `outPoint` or a new Point.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {PointData} other - The point to subtract to `this`.
         * @param {PointData} [outPoint] - A Point-like object in which to store the value,
         * optional (otherwise will create a new Point).
         * @returns {PointData} The `outPoint` reference or a new Point, with the result of the subtraction.
         */
        subtract<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            other: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;

        /**
         * Multiplies component-wise `other` and `this` points and outputs into `outPoint` or a new Point.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {PointData} other - The point to multiply with `this`.
         * @param {PointData} [outPoint] - A Point-like object in which to store the value,
         * optional (otherwise will create a new Point).
         * @returns {PointData} The `outPoint` reference or a new Point, with the component-wise multiplication.
         */
        multiply<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            other: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;

        /**
         * Multiplies each component of `this` point with the number `scalar` and outputs into `outPoint` or a new Point.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {number} scalar - The number to multiply both components of `this`.
         * @param {PointData} [outPoint] - A Point-like object in which to store the value,
         * optional (otherwise will create a new Point).
         * @returns {PointData} The `outPoint` reference or a new Point, with the multiplication.
         */
        multiplyScalar<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            scalar: number,
            outPoint?: T
        ): T;

        /**
         * Computes the dot product of `other` with `this` point.
         * The dot product is the sum of the products of the corresponding components of two vectors.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {PointData} other - The other point to calculate the dot product with `this`.
         * @returns {number} The result of the dot product. This is an scalar value.
         */
        dot(other: import('../maths/point/PointData').PointData): number;

        /**
         * Computes the cross product of `other` with `this` point.
         * Given two linearly independent R3 vectors a and b, the cross product, a × b (read "a cross b"),
         * is a vector that is perpendicular to both a and b, and thus normal to the plane containing them.
         * While cross product only exists on 3D space, we can assume the z component of 2D to be zero and
         * the result becomes a vector that will only have magnitude on the z axis.
         *
         * This function returns the z component of the cross product of the two points.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {PointData} other - The other point to calculate the cross product with `this`.
         * @returns {number} The z component of the result of the cross product.
         */
        cross(other: import('../maths/point/PointData').PointData): number;

        /**
         * Computes a normalized version of `this` point.
         *
         * A normalized vector is a vector of magnitude (length) 1
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {PointData} [outPoint] - A Point-like object in which to store the value,
         * optional (otherwise will create a new Point).
         * @returns {PointData} The normalized point.
         */
        normalize<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            outPoint?: T
        ): T;

        /**
         * Computes the magnitude of this point (Euclidean distance from 0, 0).
         *
         * Defined as the square root of the sum of the squares of each component.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @returns {number} The magnitude (length) of the vector.
         */
        magnitude(): number;

        /**
         * Computes the square magnitude of this point.
         * If you are comparing the lengths of vectors, you should compare the length squared instead
         * as it is slightly more efficient to calculate.
         *
         * Defined as the sum of the squares of each component.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @returns {number} The magnitude squared (length squared) of the vector.
         */
        magnitudeSquared(): number;

        /**
         * Computes vector projection of `this` on `onto`.
         *
         * Imagine a light source, parallel to `onto`, above `this`.
         * The light would cast rays perpendicular to `onto`.
         * `this.project(onto)` is the shadow cast by `this` on the line defined by `onto` .
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {PointData} onto - A non zero vector describing a line on which to project `this`.
         * @param {PointData} [outPoint] - A Point-like object in which to store the value,
         * optional (otherwise will create a new Point).
         * @returns {PointData} The `this` on `onto` projection.
         */
        project<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            onto: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;

        /**
         * Reflects `this` vector off of a plane orthogonal to `normal`.
         * `normal` is not normalized during this process. Consider normalizing your `normal` before use.
         *
         * Imagine a light source bouncing onto a mirror.
         * `this` vector is the light and `normal` is a vector perpendicular to the mirror.
         * `this.reflect(normal)` is the reflection of `this` on that mirror.
         *
         * _Note: Only available with **pixi.js/math-extras**._
         * @param {PointData} normal - The normal vector of your reflecting plane.
         * @param {PointData} [outPoint] - A Point-like object in which to store the value,
         * optional (otherwise will create a new Point).
         * @returns {PointData} The reflection of `this` on your reflecting plane.
         */
        reflect<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            normal: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;
    }
}

export {};
