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
             * Accepts `other` Rectangle and returns true if the given Rectangle is equal to `this` Rectangle.
             * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
             * @example
             * ```ts
             * // Basic equality check
             * const rect1 = new Rectangle(0, 0, 100, 100);
             * const rect2 = new Rectangle(0, 0, 100, 100);
             * console.log(rect1.equals(rect2)); // true
             *
             * // Check after modifications
             * rect2.width = 200;
             * console.log(rect1.equals(rect2)); // false
             *
             * // Compare with offset rectangle
             * const offset = new Rectangle(10, 10, 100, 100);
             * console.log(rect1.equals(offset)); // false
             * ```
             * @param {Rectangle} other - The Rectangle to compare with `this`
             * @returns {boolean} Returns true if all `x`, `y`, `width`, and `height` are equal.
             */
            equals(other: import('../maths/shapes/Rectangle').Rectangle): boolean;

            /**
             * If the area of the intersection between the Rectangles `other` and `this` is not zero,
             * returns the area of intersection as a Rectangle object. Otherwise, return an empty Rectangle
             * with its properties set to zero.
             *
             * Rectangles without area (width or height equal to zero) can't intersect or be intersected
             * and will always return an empty rectangle with its properties set to zero.
             *
             * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
             * @example
             * ```ts
             * // Basic intersection check
             * const rect1 = new Rectangle(0, 0, 100, 100);
             * const rect2 = new Rectangle(50, 50, 100, 100);
             *
             * const overlap = rect1.intersection(rect2);
             * console.log(overlap); // Rectangle(50, 50, 50, 50)
             *
             * // Using output rectangle
             * const out = new Rectangle();
             * rect1.intersection(rect2, out);
             *
             * // Zero-area rectangles
             * const empty = new Rectangle(0, 0, 0, 100);
             * const result = rect1.intersection(empty);
             * console.log(result); // Rectangle(0, 0, 0, 0)
             * ```
             * @param {Rectangle} other - The Rectangle to intersect with `this`.
             * @param {Rectangle} [outRect] - A Rectangle object in which to store the value,
             * optional (otherwise will create a new Rectangle).
             * @returns {Rectangle} The intersection of `this` and `other`.
             * @see {@link Rectangle.intersects} For boolean intersection test
             * @see {@link Rectangle.union} For combining rectangles
             */
            intersection<
                T extends import('../maths/shapes/Rectangle').Rectangle = import('../maths/shapes/Rectangle').Rectangle>(
                other: import('../maths/shapes/Rectangle').Rectangle,
                outRect?: T
            ): T;
            /**
             * Adds `this` and `other` Rectangles together to create a new Rectangle object filling
             * the horizontal and vertical space between the two rectangles.
             * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
             * @example
             * ```ts
             * // Basic union
             * const rect1 = new Rectangle(0, 0, 100, 100);
             * const rect2 = new Rectangle(50, 50, 100, 100);
             * const combined = rect1.union(rect2);
             * console.log(combined); // Rectangle(0, 0, 150, 150)
             *
             * // Using output rectangle
             * const out = new Rectangle();
             * rect1.union(rect2, out);
             *
             * // Chain multiple unions
             * const rect3 = new Rectangle(200, 200, 50, 50);
             * const result = rect1.union(rect2).union(rect3);
             * ```
             * @param {Rectangle} other - The Rectangle to unite with `this`
             * @param {Rectangle} [outRect] - Optional Rectangle to store the result
             * @returns The union of `this` and `other`
             * @see {@link Rectangle.intersection} For overlap area
             * @see {@link Rectangle.containsRect} For containment testing
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
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic point addition
         * const point = new Point(10, 20);
         * const other = new Point(5, 10);
         * const result = point.add(other);
         * console.log(result); // Point(15, 30)
         *
         * // Using output point for efficiency
         * const output = new Point();
         * point.add(other, output);
         * console.log(output); // Point(15, 30)
         *
         * // Chain multiple additions
         * const final = point.add(other).add(new Point(2, 3));
         * ```
         * @param {PointData} other - The point to add to `this`
         * @param {PointData} [outPoint] - Optional Point-like object to store result
         * @returns The outPoint or a new Point with addition result
         * @see {@link Point.subtract} For point subtraction
         * @see {@link Point.multiply} For point multiplication
         */
        add<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            other: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;
        /**
         * Subtracts `other` from `this` point and outputs into `outPoint` or a new Point.
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic point subtraction
         * const point = new Point(10, 20);
         * const other = new Point(5, 10);
         * const result = point.subtract(other);
         * console.log(result); // Point(5, 10)
         *
         * // Using output point for efficiency
         * const output = new Point();
         * point.subtract(other, output);
         * console.log(output); // Point(5, 10)
         *
         * // Chain multiple subtractions
         * const final = point.subtract(other).subtract(new Point(2, 3));
         * ```
         * @param {PointData} other - The point to subtract from `this`
         * @param {PointData} [outPoint] - Optional Point-like object to store result
         * @returns The outPoint or a new Point with subtraction result
         * @see {@link Point.add} For point addition
         * @see {@link Point.multiply} For point multiplication
         */
        subtract<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            other: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;

        /**
         * Multiplies component-wise `other` and `this` points and outputs into `outPoint` or a new Point.
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic point multiplication
         * const point = new Point(10, 20);
         * const other = new Point(2, 3);
         * const result = point.multiply(other);
         * console.log(result); // Point(20, 60)
         *
         * // Using output point for efficiency
         * const output = new Point();
         * point.multiply(other, output);
         * console.log(output); // Point(20, 60)
         *
         * // Chain multiple operations
         * const final = point.multiply(other).add(new Point(5, 5));
         * ```
         * @param {PointData} other - The point to multiply with `this`
         * @param {PointData} [outPoint] - Optional Point-like object to store result
         * @returns The outPoint or a new Point with multiplication result
         * @see {@link Point.add} For point addition
         * @see {@link Point.multiplyScalar} For scalar multiplication
         */
        multiply<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            other: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;

        /**
         * Multiplies each component of `this` point with the number `scalar` and outputs into `outPoint` or a new Point.
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic scalar multiplication
         * const point = new Point(10, 20);
         * const result = point.multiplyScalar(2);
         * console.log(result); // Point(20, 40)
         *
         * // Using output point for efficiency
         * const output = new Point();
         * point.multiplyScalar(0.5, output);
         * console.log(output); // Point(5, 10)
         *
         * // Chain with other operations
         * const final = point.multiplyScalar(2).add(new Point(5, 5));
         * ```
         * @param {number} scalar - The number to multiply both components with
         * @param {PointData} [outPoint] - Optional Point-like object to store result
         * @returns The outPoint or a new Point with multiplication result
         * @see {@link Point.multiply} For point multiplication
         * @see {@link Point.normalize} For unit vector conversion
         */
        multiplyScalar<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            scalar: number,
            outPoint?: T
        ): T;

        /**
         * Computes the dot product of `other` with `this` point.
         * The dot product is the sum of the products of the corresponding components of two vectors.
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic dot product
         * const v1 = new Point(2, 3);
         * const v2 = new Point(4, 5);
         * const result = v1.dot(v2); // 2*4 + 3*5 = 23
         *
         * // Check if vectors are perpendicular
         * const isOrthogonal = v1.dot(v2) === 0;
         *
         * // Get angle between vectors
         * const cosTheta = v1.dot(v2) / (v1.magnitude() * v2.magnitude());
         * ```
         * @param {PointData} other - The other point to calculate the dot product with
         * @returns The scalar result of the dot product
         * @see {@link Point.cross} For cross product calculation
         * @see {@link Point.magnitude} For vector length
         */
        dot(other: import('../maths/point/PointData').PointData): number;

        /**
         * Computes the cross product of `other` with `this` point.
         * Returns the z-component of the 3D cross product, assuming z=0 for both vectors.
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic cross product
         * const v1 = new Point(2, 3);
         * const v2 = new Point(4, 5);
         * const result = v1.cross(v2); // 2*5 - 3*4 = -2
         *
         * // Check if vectors are parallel
         * const isParallel = v1.cross(v2) === 0;
         *
         * // Get signed area of parallelogram
         * const area = Math.abs(v1.cross(v2));
         * ```
         * @remarks
         * - Returns z-component only (x,y assumed in 2D plane)
         * - Positive result means counter-clockwise angle from this to other
         * - Magnitude equals area of parallelogram formed by vectors
         * @param {PointData} other - The other point to calculate the cross product with
         * @returns The z-component of the cross product
         * @see {@link Point.dot} For dot product calculation
         * @see {@link Point.normalize} For unit vector conversion
         */
        cross(other: import('../maths/point/PointData').PointData): number;

        /**
         * Computes a normalized version of `this` point.
         *
         * A normalized vector is a vector of magnitude (length) 1
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic normalization
         * const vector = new Point(3, 4);
         * const normalized = vector.normalize();
         * console.log(normalized.magnitude()); // 1
         *
         * // Using output point
         * const out = new Point();
         * vector.normalize(out);
         *
         * // Chain with other operations
         * const scaled = vector.normalize().multiplyScalar(5);
         * ```
         * @param {PointData} outPoint - Optional Point-like object to store result
         * @returns The normalized point
         * @see {@link Point.magnitude} For vector length
         * @see {@link Point.multiplyScalar} For scaling
         */
        normalize<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            outPoint?: T
        ): T;

        /**
         * Computes the magnitude (length) of this point as Euclidean distance from origin.
         *
         * Defined as the square root of the sum of the squares of each component.
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic length calculation
         * const vector = new Point(3, 4);
         * console.log(vector.magnitude()); // 5
         *
         * // Check if unit vector
         * const isUnit = Math.abs(vector.magnitude() - 1) < 0.0001;
         *
         * // Compare vector lengths
         * const longer = v1.magnitude() > v2.magnitude();
         * ```
         * @returns The magnitude (length) of the vector
         * @see {@link Point.magnitudeSquared} For efficient length comparison
         * @see {@link Point.normalize} For unit vector conversion
         */
        magnitude(): number;

        /**
         * Computes the squared magnitude of this point.
         * More efficient than magnitude() for length comparisons.
         *
         * Defined as the sum of the squares of each component.
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Efficient length comparison
         * const v1 = new Point(3, 4);
         * const v2 = new Point(1, 2);
         *
         * // Better than: v1.magnitude() > v2.magnitude()
         * const longer = v1.magnitudeSquared() > v2.magnitudeSquared();
         *
         * // Check if vector is longer than 5 units
         * const isLong = v1.magnitudeSquared() > 25; // 5 * 5
         * ```
         * @returns The squared magnitude of the vector
         * @see {@link Point.magnitude} For actual vector length
         * @see {@link Point.dot} For dot product calculation
         */
        magnitudeSquared(): number;

        /**
         * Computes vector projection of `this` on `onto`.
         * Projects one vector onto another, creating a parallel vector with the length of the projection.
         *
         * Imagine a light source, parallel to `onto`, above `this`.
         * The light would cast rays perpendicular to `onto`.
         * `this.project(onto)` is the shadow cast by `this` on the line defined by `onto` .
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @remarks
         * - Results in zero vector if projecting onto zero vector
         * - Length depends on angle between vectors
         * - Result is parallel to `onto` vector
         * - Useful for physics and collision responses
         * @param {PointData} onto - Vector to project onto (should be non-zero)
         * @param {PointData} [outPoint] - Optional Point-like object to store result
         * @returns The projection of `this` onto `onto`
         * @see {@link Point.dot} For angle calculations
         * @see {@link Point.normalize} For unit vector conversion
         */
        project<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            onto: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;

        /**
         * Reflects `this` vector off of a plane orthogonal to `normal`.
         *
         * Like a light ray bouncing off a mirror surface.
         * `this` vector is the light and `normal` is a vector perpendicular to the mirror.
         * `this.reflect(normal)` is the reflection of `this` on that mirror.
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic reflection
         * const ray = new Point(1, 1);
         * const surfaceNormal = new Point(0, 1).normalize();
         * const reflection = ray.reflect(surfaceNormal);
         *
         * // Using output point
         * const out = new Point();
         * ray.reflect(surfaceNormal, out);
         *
         * // Reflect off angled surface
         * const slope = new Point(1, 1).normalize();
         * const bounced = ray.reflect(slope);
         * ```
         * @remarks
         * - Normal vector should be normalized for accurate results
         * - Preserves vector magnitude
         * - Useful for physics simulations
         * - Common in light/particle effects
         * @param {PointData} normal - The normal vector of the reflecting plane
         * @param {PointData} outPoint - Optional Point-like object to store result
         * @returns The reflection of `this` off the plane
         * @see {@link Point.normalize} For normalizing vectors
         * @see {@link Point.dot} For angle calculations
         */
        reflect<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            normal: import('../maths/point/PointData').PointData,
            outPoint?: T
        ): T;

        /**
         * Rotates `this` vector.
         *
         * Like a light ray bouncing off a mirror surface.
         * `this` vector is the light and `normal` is a vector perpendicular to the mirror.
         * `this.reflect(normal)` is the reflection of `this` on that mirror.
         *
         * > [!IMPORTANT] Only available with **pixi.js/math-extras**.
         * @example
         * ```ts
         * // Basic point rotation
         * const point = new Point(10, 20);
         * const degrees = 45
         * const radians = degrees * (Math.PI / 180)
         * const result = point.rotate(radians);
         * console.log(result); // {x: -7.071067811865474, y: 21.213203435596427}
         *
         * // Using output point for efficiency
         * const output = new Point(10, 20);
         * point.rotate(90 * (Math.PI / 180), output);
         * console.log(result); // {x: -7.071067811865474, y: 21.213203435596427}
         *
         * // Chain multiple additions
         * const final = point.rotate(radians).rotate(radians2);
         * ```
         * @remarks
         * convert degrees to radians with const radians = degrees * (Math.PI / 180)
         * @param {PointData} radians - The rotation angle in radians
         * @param {PointData} outPoint - Optional Point-like object to store result
         * @returns The outPoint or a new Point with rotated result
         */
        rotate<T extends import('../maths/point/PointData').PointData = import('../maths/point/Point').Point>(
            radians: number,
            outPoint?: T
        ): T;
    }
}

export {};
