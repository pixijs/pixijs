import { BLEND_MODES } from '@pixi/constants';
import {
    Circle,
    Ellipse,
    PI_2,
    Point,
    Polygon,
    Rectangle,
    RoundedRectangle,
} from '@pixi/math';
import { RawMesh } from '@pixi/mesh';
import { Texture } from '@pixi/core';

import FillStyle from './styles/FillStyle';
import GraphicsGeometry from './GraphicsGeometry';
import LineStyle from './styles/LineStyle';
import PrimitiveShader from './shaders/PrimitiveShader';
import bezierCurveTo from './utils/bezierCurveTo';

const tempPoint = new Point();

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export default class Graphics extends RawMesh
{
    /**
     *
     * @param {boolean} [nativeLines=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     */
    constructor(geometry)
    {
        geometry = geometry || new GraphicsGeometry();
        const shader = new PrimitiveShader();

        super(geometry, shader, null, 5); // DRAW_MODES.TRIANGLE_STRIP

        /**
         * The tint applied to the graphic shape. This is a hex value. Apply a value of 0xFFFFFF to
         * reset the tint.s
         *
         * @member {number}
         * @default 0xFFFFFF
         */
        this.tint = 0xFFFFFF;

        this.blendMode = BLEND_MODES.NORMAL;

        this._fillStyle = null;
        this._lineStyle = null;

        this.matrix = null;

        /**
         * Current path
         *
         * @member {PIXI.Polygon}
         * @private
         */
        this.currentPoly = null;

        /**
         * When cacheAsBitmap is set to true the graphics object will be rendered as if it was a sprite.
         * This is useful if your graphics element does not change often, as it will speed up the rendering
         * of the object in exchange for taking up texture memory. It is also useful if you need the graphics
         * object to be anti-aliased, because it will be rendered using canvas. This is not recommended if
         * you are constantly redrawing the graphics element.
         *
         * @name cacheAsBitmap
         * @member {boolean}
         * @memberof PIXI.Graphics#
         * @default false
         */
    }

    /**
     * Creates a new Graphics object with the same values as this one.
     * Note that the only the properties of the object are cloned, not its transform (position,scale,etc)
     *
     * @return {PIXI.Graphics} A clone of the graphics object
     */
    clone()
    {
        return new Graphics(this.geometry);
    }

    /**
     * Calculate length of quadratic curve
     * @see {@link http://www.malczak.linuxpl.com/blog/quadratic-bezier-curve-length/}
     * for the detailed explanation of math behind this.
     *
     * @private
     * @param {number} fromX - x-coordinate of curve start point
     * @param {number} fromY - y-coordinate of curve start point
     * @param {number} cpX - x-coordinate of curve control point
     * @param {number} cpY - y-coordinate of curve control point
     * @param {number} toX - x-coordinate of curve end point
     * @param {number} toY - y-coordinate of curve end point
     * @return {number} Length of quadratic curve
     */
    _quadraticCurveLength(fromX, fromY, cpX, cpY, toX, toY)
    {
        const ax = fromX - ((2.0 * cpX) + toX);
        const ay = fromY - ((2.0 * cpY) + toY);
        const bx = 2.0 * ((cpX - 2.0) * fromX);
        const by = 2.0 * ((cpY - 2.0) * fromY);
        const a = 4.0 * ((ax * ax) + (ay * ay));
        const b = 4.0 * ((ax * bx) + (ay * by));
        const c = (bx * bx) + (by * by);

        const s = 2.0 * Math.sqrt(a + b + c);
        const a2 = Math.sqrt(a);
        const a32 = 2.0 * a * a2;
        const c2 = 2.0 * Math.sqrt(c);
        const ba = b / a2;

        return (
            (a32 * s)
                + (a2 * b * (s - c2))
                + (
                    ((4.0 * c * a) - (b * b))
                   * Math.log(((2.0 * a2) + ba + s) / (ba + c2))
                )
        ) / (4.0 * a32);
    }

    /**
     * Calculate length of bezier curve.
     * Analytical solution is impossible, since it involves an integral that does not integrate in general.
     * Therefore numerical solution is used.
     *
     * @private
     * @param {number} fromX - Starting point x
     * @param {number} fromY - Starting point y
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} cpX2 - Second Control point x
     * @param {number} cpY2 - Second Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @return {number} Length of bezier curve
     */
    _bezierCurveLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY)
    {
        const n = 10;
        let result = 0.0;
        let t = 0.0;
        let t2 = 0.0;
        let t3 = 0.0;
        let nt = 0.0;
        let nt2 = 0.0;
        let nt3 = 0.0;
        let x = 0.0;
        let y = 0.0;
        let dx = 0.0;
        let dy = 0.0;
        let prevX = fromX;
        let prevY = fromY;

        for (let i = 1; i <= n; ++i)
        {
            t = i / n;
            t2 = t * t;
            t3 = t2 * t;
            nt = (1.0 - t);
            nt2 = nt * nt;
            nt3 = nt2 * nt;

            x = (nt3 * fromX) + (3.0 * nt2 * t * cpX) + (3.0 * nt * t2 * cpX2) + (t3 * toX);
            y = (nt3 * fromY) + (3.0 * nt2 * t * cpY) + (3 * nt * t2 * cpY2) + (t3 * toY);
            dx = prevX - x;
            dy = prevY - y;
            prevX = x;
            prevY = y;

            result += Math.sqrt((dx * dx) + (dy * dy));
        }

        return result;
    }

    /**
     * Calculate number of segments for the curve based on its length to ensure its smoothness.
     *
     * @private
     * @param {number} length - length of curve
     * @return {number} Number of segments
     */
    _segmentsCount(length)
    {
        let result = Math.ceil(length / Graphics.CURVES.maxLength);

        if (result < Graphics.CURVES.minSegments)
        {
            result = Graphics.CURVES.minSegments;
        }
        else if (result > Graphics.CURVES.maxSegments)
        {
            result = Graphics.CURVES.maxSegments;
        }

        return result;
    }

    /**
     * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo()
     * method or the drawCircle() method.
     *
     * @param {number} [lineWidth=0] - width of the line to draw, will update the objects stored style
     * @param {number} [color=0] - color of the line to draw, will update the objects stored style
     * @param {number} [alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {number} [alignment=1] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineStyle(width = 0, color = 0, alpha = 1, alignment = 0.5, native = false)
    {
        this.lineTextureStyle(width, Texture.WHITE, color, alpha, null, alignment, native);
    }

    lineTextureStyle(width = 0, texture, color = 0xFFFFFF, alpha = 1, textureMatrix, alignment = 0.5, native)
    {
        if (width === 0 || alpha === 0)
        {
            this._lineStyle = null;

            return this;
        }

        const style = new LineStyle();

        style.color = color;
        style.width = width;
        style.alpha = alpha;
        style.matrix = textureMatrix;
        style.texture = texture || Texture.WHITE;
        style.alignment = alignment;
        style.native = native;

        /*    if (this.currentPath)
        {
            if (this.currentPath.shape.points.length)
            {
                // halfway through a line? start a new one!
                const shape = new Polygon(this.currentPath.shape.points.slice(-2));

                shape.closed = false;

                this.drawShape(shape);
            }
            else
            {
                // otherwise its empty so lets just set the line properties
                this.currentPath.lineStyle = style;
            }
        }
*/
        this.finishPoly();

        this._lineStyle = style;

        return this;
    }

    startPoly()
    {
        this.currentPoly = new Polygon();
        this.currentPoly.closed = false;
    }

    finishPoly()
    {
        if (this.currentPoly)
        {
            if (this.currentPoly.points.length > 2)
            {
                this.drawShape(this.currentPoly);
                this.currentPoly = null;
            }
            else
            {
                this.currentPoly.points.length = 0;
            }
        }
    }

    /**
     * Moves the current drawing position to x, y.
     *
     * @param {number} x - the X coordinate to move to
     * @param {number} y - the Y coordinate to move to
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    moveTo(x, y)
    {
        this.startPoly();
        this.currentPoly.points.push(x, y);

        return this;
    }

    /**
     * Draws a line using the current line style from the current drawing position to (x, y);
     * The current drawing position is then set to (x, y).
     *
     * @param {number} x - the X coordinate to draw to
     * @param {number} y - the Y coordinate to draw to
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineTo(x, y)
    {
        if (!this.currentPoly)
        {
            this.moveTo(0, 0);
        }

        this.currentPoly.points.push(x, y);

        return this;
    }

    /**
     * Calculate the points for a quadratic bezier curve and then draws it.
     * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
     *
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    quadraticCurveTo(cpX, cpY, toX, toY)
    {
        if (this.currentPoly)
        {
            if (this.currentPoly.points.length === 0)
            {
                this.currentPoly.points = [0, 0];
            }
        }
        else
        {
            this.moveTo(0, 0);
        }

        const points = this.currentPoly.points;

        let xa = 0;
        let ya = 0;

        if (points.length === 0)
        {
            this.moveTo(0, 0);
        }

        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];
        const n = Graphics.CURVES.adaptive
            ? this._segmentsCount(this._quadraticCurveLength(fromX, fromY, cpX, cpY, toX, toY))
            : 20;

        for (let i = 1; i <= n; ++i)
        {
            const j = i / n;

            xa = fromX + ((cpX - fromX) * j);
            ya = fromY + ((cpY - fromY) * j);

            points.push(xa + (((cpX + ((toX - cpX) * j)) - xa) * j),
                ya + (((cpY + ((toY - cpY) * j)) - ya) * j));
        }

        this.dirty++;

        return this;
    }

    /**
     * Calculate the points for a bezier curve and then draws it.
     *
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} cpX2 - Second Control point x
     * @param {number} cpY2 - Second Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY)
    {
        if (this.currentPoly)
        {
            if (this.currentPoly.points.length === 0)
            {
                this.currentPoly.points = [0, 0];
            }
        }
        else
        {
            this.moveTo(0, 0);
        }

        const points = this.currentPoly.points;

        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];

        points.length -= 2;

        const n = Graphics.CURVES.adaptive
            ? this._segmentsCount(this._bezierCurveLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY))
            : 20;

        bezierCurveTo(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY, n, points);

        this.dirty++;

        return this;
    }

    /**
     * The arcTo() method creates an arc/curve between two tangents on the canvas.
     *
     * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
     *
     * @param {number} x1 - The x-coordinate of the beginning of the arc
     * @param {number} y1 - The y-coordinate of the beginning of the arc
     * @param {number} x2 - The x-coordinate of the end of the arc
     * @param {number} y2 - The y-coordinate of the end of the arc
     * @param {number} radius - The radius of the arc
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    arcTo(x1, y1, x2, y2, radius)
    {
        if (this.currentPoly)
        {
            if (this.currentPoly.points.length === 0)
            {
                this.currentPoly.points = [x1, y1];
            }
        }
        else
        {
            this.moveTo(x1, y1);
        }

        const points = this.currentPath.points;
        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];
        const a1 = fromY - y1;
        const b1 = fromX - x1;
        const a2 = y2 - y1;
        const b2 = x2 - x1;
        const mm = Math.abs((a1 * b2) - (b1 * a2));

        if (mm < 1.0e-8 || radius === 0)
        {
            if (points[points.length - 2] !== x1 || points[points.length - 1] !== y1)
            {
                points.push(x1, y1);
            }
        }
        else
        {
            const dd = (a1 * a1) + (b1 * b1);
            const cc = (a2 * a2) + (b2 * b2);
            const tt = (a1 * a2) + (b1 * b2);
            const k1 = radius * Math.sqrt(dd) / mm;
            const k2 = radius * Math.sqrt(cc) / mm;
            const j1 = k1 * tt / dd;
            const j2 = k2 * tt / cc;
            const cx = (k1 * b2) + (k2 * b1);
            const cy = (k1 * a2) + (k2 * a1);
            const px = b1 * (k2 + j1);
            const py = a1 * (k2 + j1);
            const qx = b2 * (k1 + j2);
            const qy = a2 * (k1 + j2);
            const startAngle = Math.atan2(py - cy, px - cx);
            const endAngle = Math.atan2(qy - cy, qx - cx);

            this.arc(cx + x1, cy + y1, radius, startAngle, endAngle, b1 * a2 > b2 * a1);
        }

        this.dirty++;

        return this;
    }

    /**
     * The arc method creates an arc/curve (used to create circles, or parts of circles).
     *
     * @param {number} cx - The x-coordinate of the center of the circle
     * @param {number} cy - The y-coordinate of the center of the circle
     * @param {number} radius - The radius of the circle
     * @param {number} startAngle - The starting angle, in radians (0 is at the 3 o'clock position
     *  of the arc's circle)
     * @param {number} endAngle - The ending angle, in radians
     * @param {boolean} [anticlockwise=false] - Specifies whether the drawing should be
     *  counter-clockwise or clockwise. False is default, and indicates clockwise, while true
     *  indicates counter-clockwise.
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    arc(cx, cy, radius, startAngle, endAngle, anticlockwise = false)
    {
        if (startAngle === endAngle)
        {
            return this;
        }

        if (!anticlockwise && endAngle <= startAngle)
        {
            endAngle += PI_2;
        }
        else if (anticlockwise && startAngle <= endAngle)
        {
            startAngle += PI_2;
        }

        const sweep = endAngle - startAngle;
        const segs = Graphics.CURVES.adaptive
            ? this._segmentsCount(Math.abs(sweep) * radius)
            : Math.ceil(Math.abs(sweep) / PI_2) * 40;

        if (sweep === 0)
        {
            return this;
        }

        const startX = cx + (Math.cos(startAngle) * radius);
        const startY = cy + (Math.sin(startAngle) * radius);

        // If the currentPath exists, take its points. Otherwise call `moveTo` to start a path.
        let points = this.currentPoly ? this.currentPoly.points : null;

        if (points)
        {
            if (points[points.length - 2] !== startX || points[points.length - 1] !== startY)
            {
                points.push(startX, startY);
            }
        }
        else
        {
            this.moveTo(startX, startY);
            points = this.currentPoly.points;
        }

        const theta = sweep / (segs * 2);
        const theta2 = theta * 2;

        const cTheta = Math.cos(theta);
        const sTheta = Math.sin(theta);

        const segMinus = segs - 1;

        const remainder = (segMinus % 1) / segMinus;

        for (let i = 0; i <= segMinus; ++i)
        {
            const real = i + (remainder * i);

            const angle = ((theta) + startAngle + (theta2 * real));

            const c = Math.cos(angle);
            const s = -Math.sin(angle);

            points.push(
                (((cTheta * c) + (sTheta * s)) * radius) + cx,
                (((cTheta * -s) + (sTheta * c)) * radius) + cy
            );
        }

        this.dirty++;

        return this;
    }

    /**
     * Specifies a simple one-color fill that subsequent calls to other Graphics methods
     * (such as lineTo() or drawCircle()) use when drawing.
     *
     * @param {number} [color=0] - the color of the fill
     * @param {number} [alpha=1] - the alpha of the fill
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    beginFill(color = 0, alpha = 1)
    {
        this.beginTextureFill(null, color, alpha);

        return this;
    }

    beginTextureFill(texture, color = 0xFFFFFF, alpha = 1, textureMatrix)
    {
        if (alpha === 0)
        {
            this._fillStyle = null;

            return this;
        }

        const style = new FillStyle();

        style.color = color;
        style.alpha = alpha;
        style.texture = texture || Texture.WHITE;
        style.matrix = textureMatrix;

        if (this.currentPoly)
        {
            this.finishPoly();
        }

        this._fillStyle = style;

        return this;
    }

    /**
     * Applies a fill to the lines and shapes that were added since the last call to the beginFill() method.
     *
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    endFill()
    {
        this.finishPoly();

        this._fillStyle = null;

        return this;
    }

    /**
     *
     * @param {number} x - The X coord of the top-left of the rectangle
     * @param {number} y - The Y coord of the top-left of the rectangle
     * @param {number} width - The width of the rectangle
     * @param {number} height - The height of the rectangle
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawRect(x, y, width, height)
    {
        this.drawShape(new Rectangle(x, y, width, height));

        return this;
    }

    /**
     *
     * @param {number} x - The X coord of the top-left of the rectangle
     * @param {number} y - The Y coord of the top-left of the rectangle
     * @param {number} width - The width of the rectangle
     * @param {number} height - The height of the rectangle
     * @param {number} radius - Radius of the rectangle corners
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawRoundedRect(x, y, width, height, radius)
    {
        this.drawShape(new RoundedRectangle(x, y, width, height, radius));

        return this;
    }

    /**
     * Draws a circle.
     *
     * @param {number} x - The X coordinate of the center of the circle
     * @param {number} y - The Y coordinate of the center of the circle
     * @param {number} radius - The radius of the circle
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawCircle(x, y, radius)
    {
        this.drawShape(new Circle(x, y, radius));

        return this;
    }

    /**
     * Draws an ellipse.
     *
     * @param {number} x - The X coordinate of the center of the ellipse
     * @param {number} y - The Y coordinate of the center of the ellipse
     * @param {number} width - The half width of the ellipse
     * @param {number} height - The half height of the ellipse
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawEllipse(x, y, width, height)
    {
        this.drawShape(new Ellipse(x, y, width, height));

        return this;
    }

    /**
     * Draws a polygon using the given path.
     *
     * @param {number[]|PIXI.Point[]|PIXI.Polygon} path - The path data used to construct the polygon.
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawPolygon(path)
    {
        // prevents an argument assignment deopt
        // see section 3.1: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
        let points = path;

        let closed = true;// !!this._fillStyle;

        if (points instanceof Polygon)
        {
            closed = points.closed;
            points = points.points;
        }

        if (!Array.isArray(points))
        {
            // prevents an argument leak deopt
            // see section 3.2: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
            points = new Array(arguments.length);

            for (let i = 0; i < points.length; ++i)
            {
                points[i] = arguments[i]; // eslint-disable-line prefer-rest-params
            }
        }

        const shape = new Polygon(points);

        shape.closed = closed;

        this.drawShape(shape);

        return this;
    }

    drawShape(shape)
    {
        if (!this.holeMode)
        {
            this.geometry.drawShape(shape,
                this._fillStyle,
                this._lineStyle,
                this.matrix);
        }
        else
        {
            this.geometry.drawHole(shape,
                this.matrix);
        }
    }

    /**
     * Draw a star shape with an arbitrary number of points.
     *
     * @param {number} x - Center X position of the star
     * @param {number} y - Center Y position of the star
     * @param {number} points - The number of points of the star, must be > 1
     * @param {number} radius - The outer radius of the star
     * @param {number} [innerRadius] - The inner radius between points, default half `radius`
     * @param {number} [rotation=0] - The rotation of the star in radians, where 0 is vertical
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawStar(x, y, points, radius, innerRadius, rotation = 0)
    {
        innerRadius = innerRadius || radius / 2;

        const startAngle = (-1 * Math.PI / 2) + rotation;
        const len = points * 2;
        const delta = PI_2 / len;
        const polygon = [];

        for (let i = 0; i < len; i++)
        {
            const r = i % 2 ? innerRadius : radius;
            const angle = (i * delta) + startAngle;

            polygon.push(
                x + (r * Math.cos(angle)),
                y + (r * Math.sin(angle))
            );
        }

        this.drawPolygon(polygon);

        return this;
    }

    /**
     * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
     *
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    clear()
    {
        this.geometry.clear();

        return this;
    }

    /**
     * True if graphics consists of one rectangle, and thus, can be drawn like a Sprite and
     * masked with gl.scissor.
     *
     * @returns {boolean} True if only 1 rect.
     */
    isFastRect()
    {
        // will fix this!
        return false;
        // this.graphicsData.length === 1
        //  && this.graphicsData[0].shape.type === SHAPES.RECT
        // && !this.graphicsData[0].lineWidth;
    }

    /**
     * Renders the object using the WebGL renderer
     *
     * @private
     * @param {PIXI.Renderer} renderer - The renderer
     */
    _render(renderer)
    {
        renderer.batch.flush();

        this.finishPoly();

        const geometry = this.geometry;

        geometry.updateAttributes();

        this.shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);

        // bind and sync uniforms..
        // there is a way to optimise this..
        renderer.shader.bind(this.shader);

        // then render it
        renderer.geometry.bind(geometry, this.shader);

        // set state..
        renderer.state.setState(this.state);

        if (geometry.drawCalls)
        {
            for (let i = 0; i < geometry.drawCalls.length; i++)
            {
                const drawCall = geometry.drawCalls[i];

                renderer.texture.bind(drawCall.texture, 0);
                // bind the geometry...
                renderer.geometry.draw(drawCall.type, drawCall.size, drawCall.start);
            }
        }
        // console.log('---')
    }

    /**
     * Retrieves the bounds of the graphic shape as a rectangle object
     *
     * @private
     */
    _calculateBounds()
    {
        const lb = this.geometry.bounds;

        this._bounds.addFrame(this.transform, lb.minX, lb.minY, lb.maxX, lb.maxY);
    }

    /**
     * Tests if a point is inside this graphics object
     *
     * @param {PIXI.Point} point - the point to test
     * @return {boolean} the result of the test
     */
    containsPoint(point)
    {
        this.worldTransform.applyInverse(point, tempPoint);

        return this.geometry.containsPoint(tempPoint);
    }

    /**
     * Closes the current path.
     *
     * @return {PIXI.Graphics} Returns itself.
     */
    closePath()
    {
        // ok so close path assumes next one is a hole!
        const currentPath = this.currentPath;

        if (currentPath && currentPath.shape)
        {
            currentPath.shape.close();
        }

        return this;
    }

    /**
     * Adds a hole in the current path.
     *
     * @return {PIXI.Graphics} Returns itself.
     */
    addHole()
    {
        this.geometry.addHole();

        return this;
    }

    setMatrix(matrix)
    {
        this.matrix = matrix;

        return this;
    }

    /**
     * Begin adding holes to the last draw shape
     * IMPORTANT: holes must be fully inside a shape to work
     * Also weirdness ensues if holes overlap!
     */
    beginHole()
    {
        this.holeMode = true;

        return this;
    }

    /**
     * End adding holes to the last draw shape
     */
    endHole()
    {
        this.holeMode = false;

        return this;
    }

    /**
     * Destroys the Graphics object.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all
     *  options have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have
     *  their destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the base texture of the child sprite
     */
    destroy(options)
    {
        super.destroy(options);

        // TODO should this be an option
        this.geometry.destroy();
        this.shader = null;
    }
}

Graphics._SPRITE_TEXTURE = null;

/**
 * Graphics curves resolution settings. If `adaptive` flag is set to `true`,
 * the resolution is calculated based on the curve's length to ensure better visual quality.
 * Adaptive draw works with `bezierCurveTo` and `quadraticCurveTo`.
 *
 * @static
 * @constant
 * @memberof PIXI.Graphics
 * @name CURVES
 * @type {object}
 * @property {boolean} adaptive=false - flag indicating if the resolution should be adaptive
 * @property {number} maxLength=10 - maximal length of a single segment of the curve (if adaptive = false, ignored)
 * @property {number} minSegments=8 - minimal number of segments in the curve (if adaptive = false, ignored)
 * @property {number} maxSegments=2048 - maximal number of segments in the curve (if adaptive = false, ignored)
 */
Graphics.CURVES = {
    adaptive: false,
    maxLength: 10,
    minSegments: 8,
    maxSegments: 2048,
};
