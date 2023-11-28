// a shape lets you build out a shape with lines and curves and primitives..

import { Circle } from '../../../../maths/shapes/Circle';
import { Ellipse } from '../../../../maths/shapes/Ellipse';
import { Polygon } from '../../../../maths/shapes/Polygon';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { RoundedRectangle } from '../../../../maths/shapes/RoundedRectangle';
import { Bounds } from '../../../container/bounds/Bounds';
import { buildAdaptiveBezier } from '../buildCommands/buildAdaptiveBezier';
import { buildAdaptiveQuadratic } from '../buildCommands/buildAdaptiveQuadratic';
import { buildArc } from '../buildCommands/buildArc';
import { buildArcTo } from '../buildCommands/buildArcTo';
import { buildArcToSvg } from '../buildCommands/buildArcToSvg';
import { roundedShapeArc, roundedShapeQuadraticCurve } from './roundShape';

import type { Matrix } from '../../../../maths/matrix/Matrix';
import type { ShapePrimitive } from '../../../../maths/shapes/ShapePrimitive';
import type { GraphicsPath } from './GraphicsPath';
import type { RoundedPoint } from './roundShape';

const tempRectangle = new Rectangle();

export class ShapePath
{
    public shapePrimitives: { shape: ShapePrimitive, transform?: Matrix }[] = [];
    private _currentPoly: Polygon | null = null;
    private readonly _graphicsPath2D: GraphicsPath;
    private readonly _bounds = new Bounds();

    constructor(graphicsPath2D: GraphicsPath)
    {
        this._graphicsPath2D = graphicsPath2D;
    }

    public moveTo(x: number, y: number): this
    {
        this.startPoly(x, y);

        return this;
    }

    public lineTo(x: number, y: number): this
    {
        this._ensurePoly();

        const points = this._currentPoly.points;

        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];

        if (fromX !== x || fromY !== y)
        {
            points.push(x, y);
        }

        return this;
    }

    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): this
    {
        // TODO - if its 360 degrees.. make it a circle object?

        this._ensurePoly(false);

        const points = this._currentPoly.points;

        buildArc(points, x, y, radius, startAngle, endAngle, anticlockwise);

        return this;
    }

    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): this
    {
        this._ensurePoly();

        const points = this._currentPoly.points;

        buildArcTo(points, x1, y1, x2, y2, radius);

        return this;
    }

    public arcToSvg(
        rx: number, ry: number,
        xAxisRotation: number, largeArcFlag: number, sweepFlag: number,
        x: number, y: number
    ): this
    {
        const points = this._currentPoly.points;

        // this needs to work on both canvas and GPU backends so might want to move this to the Graphics2D path..
        buildArcToSvg(
            points,
            this._currentPoly.lastX,
            this._currentPoly.lastY,
            x,
            y,
            rx,
            ry,
            xAxisRotation,
            largeArcFlag,
            sweepFlag,
        );

        return this;
    }

    public bezierCurveTo(
        cp1x: number, cp1y: number, cp2x: number, cp2y: number,
        x: number, y: number,
        smoothness?: number
    ): this
    {
        this._ensurePoly();

        const currentPoly = this._currentPoly;

        // ensure distance from last point to first control point is not too small

        // TODO - make this a plugin that people can override..
        buildAdaptiveBezier(
            this._currentPoly.points,
            currentPoly.lastX, currentPoly.lastY,
            cp1x, cp1y, cp2x, cp2y, x, y,
            smoothness,
        );

        return this;
    }

    public quadraticCurveTo(cp1x: number, cp1y: number, x: number, y: number, smoothing?: number): this
    {
        this._ensurePoly();

        const currentPoly = this._currentPoly;

        // ensure distance from last point to first control point is not too small

        // TODO - make this a plugin that people can override..
        buildAdaptiveQuadratic(
            this._currentPoly.points,
            currentPoly.lastX, currentPoly.lastY,
            cp1x, cp1y, x, y,
            smoothing,
        );

        return this;
    }

    public closePath(): this
    {
        this.endPoly(true);

        return this;
    }

    public addPath(path: GraphicsPath, transform?: Matrix): this
    {
        this.endPoly();

        if (transform && !transform.isIdentity())
        {
            path = path.clone(true);
            path.transform(transform);
        }

        for (let i = 0; i < path.instructions.length; i++)
        {
            const instruction = path.instructions[i];

            // Sorry TS! this is the best we could do...
            this[instruction.action](...(instruction.data as [never, never, never, never, never, never, never]));
            // build out the path points
        }

        return this;
    }

    public finish(closePath = false)
    {
        this.endPoly(closePath);
    }

    public rect(x: number, y: number, w: number, h: number, transform?: Matrix): this
    {
        this.drawShape(new Rectangle(x, y, w, h), transform);

        return this;
    }

    public circle(x: number, y: number, radius: number, transform?: Matrix): this
    {
        this.drawShape(new Circle(x, y, radius), transform);

        return this;
    }

    public poly(points: number[], close?: boolean, transform?: Matrix): this
    {
        const polygon = new Polygon(points);

        polygon.closePath = close;

        this.drawShape(polygon, transform);

        return this;
    }

    public regularPoly(x: number, y: number, radius: number, sides: number, rotation = 0, transform?: Matrix): this
    {
        sides = Math.max(sides | 0, 3);
        const startAngle = (-1 * Math.PI / 2) + rotation;
        const delta = (Math.PI * 2) / sides;
        const polygon = [];

        for (let i = 0; i < sides; i++)
        {
            const angle = (i * delta) + startAngle;

            polygon.push(
                x + (radius * Math.cos(angle)),
                y + (radius * Math.sin(angle))
            );
        }

        this.poly(polygon, false, transform);

        return this;
    }

    public roundPoly(
        x: number, y: number,
        radius: number,
        sides: number, corner: number,
        rotation = 0,
        smoothness?: number,
    ): this
    {
        sides = Math.max((sides | 0), 3);

        if (corner <= 0)
        {
            return this.regularPoly(x, y, radius, sides, rotation);
        }

        const sideLength = (radius * Math.sin(Math.PI / sides)) - 0.001;

        corner = Math.min(corner, sideLength);

        const startAngle = (-1 * Math.PI / 2) + rotation;
        const delta = (Math.PI * 2) / sides;
        const internalAngle = ((sides - 2) * Math.PI) / sides / 2;

        for (let i = 0; i < sides; i++)
        {
            const angle = (i * delta) + startAngle;
            const x0 = x + (radius * Math.cos(angle));
            const y0 = y + (radius * Math.sin(angle));
            const a1 = angle + (Math.PI) + internalAngle;
            const a2 = angle - (Math.PI) - internalAngle;
            const x1 = x0 + (corner * Math.cos(a1));
            const y1 = y0 + (corner * Math.sin(a1));
            const x3 = x0 + (corner * Math.cos(a2));
            const y3 = y0 + (corner * Math.sin(a2));

            if (i === 0)
            {
                this.moveTo(x1, y1);
            }
            else
            {
                this.lineTo(x1, y1);
            }
            this.quadraticCurveTo(x0, y0, x3, y3, smoothness);
        }

        return this.closePath();
    }

    /**
     * Draw a Shape with rounded corners.
     * Supports custom radius for each point.
     * @param points - Corners of the shape to draw. Minimum length is 3.
     * @param radius - Corners default radius.
     * @param useQuadratic - If true, rounded corners will be drawn using quadraticCurve instead of arc.
     * @param smoothness - If using quadraticCurve, this is the smoothness of the curve.
     */
    public roundShape(points: RoundedPoint[], radius: number, useQuadratic = false, smoothness?: number): this
    {
        if (points.length < 3)
        {
            return this;
        }

        if (useQuadratic)
        {
            roundedShapeQuadraticCurve(this, points, radius, smoothness);
        }
        else
        {
            roundedShapeArc(this, points, radius);
        }

        return this.closePath();
    }

    /**
     * Draw Rectangle with fillet corners. This is much like rounded rectangle
     * however it support negative numbers as well for the corner radius.
     * @param x - Upper left corner of rect
     * @param y - Upper right corner of rect
     * @param width - Width of rect
     * @param height - Height of rect
     * @param fillet - accept negative or positive values
     */
    public filletRect(x: number, y: number, width: number, height: number, fillet: number): this
    {
        if (fillet === 0)
        {
            return this.rect(x, y, width, height);
        }

        const maxFillet = Math.min(width, height) / 2;
        const inset = Math.min(maxFillet, Math.max(-maxFillet, fillet));
        const right = x + width;
        const bottom = y + height;
        const dir = inset < 0 ? -inset : 0;
        const size = Math.abs(inset);

        return this
            .moveTo(x, y + size)
            .arcTo(x + dir, y + dir, x + size, y, size)
            .lineTo(right - size, y)
            .arcTo(right - dir, y + dir, right, y + size, size)
            .lineTo(right, bottom - size)
            .arcTo(right - dir, bottom - dir, x + width - size, bottom, size)
            .lineTo(x + size, bottom)
            .arcTo(x + dir, bottom - dir, x, bottom - size, size)
            .closePath();
    }

    /**
     * Draw Rectangle with chamfer corners. These are angled corners.
     * @param x - Upper left corner of rect
     * @param y - Upper right corner of rect
     * @param width - Width of rect
     * @param height - Height of rect
     * @param chamfer - non-zero real number, size of corner cutout
     * @param transform
     */
    public chamferRect(x: number, y: number, width: number, height: number, chamfer: number, transform?: Matrix): this
    {
        if (chamfer <= 0)
        {
            return this.rect(x, y, width, height);
        }

        const inset = Math.min(chamfer, Math.min(width, height) / 2);
        const right = x + width;
        const bottom = y + height;
        const points = [
            x + inset, y,
            right - inset, y,
            right, y + inset,
            right, bottom - inset,
            right - inset, bottom,
            x + inset, bottom,
            x, bottom - inset,
            x, y + inset,
        ];

        // Remove overlapping points
        for (let i = points.length - 1; i >= 2; i -= 2)
        {
            if (points[i] === points[i - 2] && points[i - 1] === points[i - 3])
            {
                points.splice(i - 1, 2);
            }
        }

        return this.poly(points, undefined, transform);
    }

    public ellipse(x: number, y: number, radiusX: number, radiusY: number, transform?: Matrix): this
    {
        // TODO apply rotation to transform...

        this.drawShape(new Ellipse(x, y, radiusX, radiusY), transform);

        return this;
    }

    public roundRect(x: number, y: number, w: number, h: number, radius?: number, transform?: Matrix): this
    {
        this.drawShape(new RoundedRectangle(x, y, w, h, radius), transform);

        return this;
    }

    public drawShape(shape: ShapePrimitive, matrix?: Matrix): this
    {
        this.endPoly();

        this.shapePrimitives.push({ shape, transform: matrix });

        return this;
    }

    public startPoly(x: number, y: number): this
    {
        let currentPoly = this._currentPoly;

        if (currentPoly)
        {
            this.endPoly();
        }

        currentPoly = new Polygon();

        currentPoly.points.push(x, y);

        this._currentPoly = currentPoly;

        return this;
    }

    public endPoly(closePath = false): this
    {
        const shape = this._currentPoly;

        if (shape && shape.points.length > 2)
        {
            shape.closePath = closePath;

            this.shapePrimitives.push({ shape });
        }

        this._currentPoly = null;

        return this;
    }

    private _ensurePoly(start = true): void
    {
        if (this._currentPoly) return;

        this._currentPoly = new Polygon();

        if (start)
        {
            // get last points..
            const lastShape = this.shapePrimitives[this.shapePrimitives.length - 1];

            if (lastShape)
            {
                // i KNOW its a rect..
                let lx = lastShape.shape.x;
                let ly = lastShape.shape.y;

                if (!lastShape.transform.isIdentity())
                {
                    const t = lastShape.transform;

                    const tempX = lx;

                    lx = (t.a * lx) + (t.c * ly) + t.tx;
                    ly = (t.b * tempX) + (t.d * ly) + t.ty;
                }

                this._currentPoly.points.push(lx, ly);
            }
            else
            {
                this._currentPoly.points.push(0, 0);
            }
        }
    }

    public buildPath()
    {
        const path = this._graphicsPath2D;

        this.shapePrimitives.length = 0;
        this._currentPoly = null;

        for (let i = 0; i < path.instructions.length; i++)
        {
            const instruction = path.instructions[i];

            // Sorry TS! this is the best we could do...
            this[instruction.action](...(instruction.data as [never, never, never, never, never, never, never]));
        }

        this.finish();
    }

    get bounds(): Bounds
    {
        const bounds = this._bounds;

        bounds.clear();

        const shapePrimitives = this.shapePrimitives;

        for (let i = 0; i < shapePrimitives.length; i++)
        {
            const shapePrimitive = shapePrimitives[i];

            const boundsRect = shapePrimitive.shape.getBounds(tempRectangle);

            if (shapePrimitive.transform)
            {
                bounds.pushMatrix(shapePrimitive.transform);
                bounds.addRect(boundsRect);
                bounds.popMatrix();
            }
            else
            {
                bounds.addRect(boundsRect);
            }
        }

        return bounds;
    }
}
