// a shape lets you build out a shape with lines and curves and primitives..

import { Circle } from '../../../../maths/shapes/Circle';
import { Ellipse } from '../../../../maths/shapes/Ellipse';
import { Polygon } from '../../../../maths/shapes/Polygon';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { RoundedRectangle } from '../../../../maths/shapes/RoundedRectangle';
import { Bounds } from '../../../scene/bounds/Bounds';
import { buildAdaptiveBezier } from '../buildCommands/buildAdaptiveBezier';
import { buildAdaptiveQuadratic } from '../buildCommands/buildAdaptiveQuadratic';
import { buildArc } from '../buildCommands/buildArc';
import { buildArcTo } from '../buildCommands/buildArcTo';
import { buildArcToSvg } from '../buildCommands/buildArcToSvg';

import type { Matrix } from '../../../../maths/Matrix';
import type { ShapePrimitive } from '../../../../maths/shapes/ShapePrimitive';
import type { GraphicsPath } from './GraphicsPath';

const tempRectangle = new Rectangle();

export class ShapePath
{
    public shapePrimitives: {shape: ShapePrimitive, transform?: Matrix}[] = [];
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

    public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this
    {
        this._ensurePoly();

        const currentPoly = this._currentPoly;

        // ensure distance from last point to first control point is not too small

        // TODO - make this a plugin that people can override..
        buildAdaptiveBezier(
            this._currentPoly.points,
            currentPoly.lastX, currentPoly.lastY,
            cp1x, cp1y, cp2x, cp2y, x, y
        );

        return this;
    }

    public quadraticCurveTo(cp1x: number, cp1y: number, x: number, y: number): this
    {
        this._ensurePoly();

        const currentPoly = this._currentPoly;

        // ensure distance from last point to first control point is not too small

        // TODO - make this a plugin that people can override..
        buildAdaptiveQuadratic(
            this._currentPoly.points,
            currentPoly.lastX, currentPoly.lastY,
            cp1x, cp1y, x, y
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

    public poly(points: number[], close?: boolean, transform?: Matrix): void
    {
        const polygon = new Polygon(points);

        polygon.closePath = close;

        this.drawShape(polygon, transform);
    }

    public ellipse(x: number, y: number, radiusX: number, radiusY: number, transform?: Matrix): this
    {
        // TODO apply rotation to transform...

        this.drawShape(new Ellipse(x, y, radiusX, radiusY), transform);

        return this;
    }

    public roundRect(x: number, y: number, w: number, h: number, radii?: number, transform?: Matrix): this
    {
        this.drawShape(new RoundedRectangle(x, y, w, h, radii), transform);

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

                if (lastShape.transform.isIdentity())
                {
                    const t = lastShape.transform;

                    const tempX = lx;

                    lx = (t.a * lx) + (t.c * ly) + t.tx;
                    ly = (t.b * tempX) + (t.d * ly) + t.ty;
                }

                this._currentPoly.points.push(lx, lx);
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
