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
import BezierUtils from './utils/BezierUtils';
import QuadraticUtils from './utils/QuadraticUtils';
import ArcUtils from './utils/ArcUtils';
import Star from './utils/Star';

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * @class
 * @extends PIXI.Mesh
 * @memberof PIXI
 */
export default class Graphics extends RawMesh
{
    /**
     *
     * @param {PIXI.GraphicsGeometry} [geometry] - Geometry to use
     */
    constructor(geometry = null)
    {
        const ownsGeometry = geometry === null;

        geometry = geometry || new GraphicsGeometry();
        const shader = new PrimitiveShader();

        super(geometry, shader, null, 5); // DRAW_MODES.TRIANGLE_STRIP

        /**
         * The tint applied to the graphic shape. This is a hex value. Apply a value of 0xFFFFFF to
         * reset the tint.
         *
         * @member {number}
         * @default 0xFFFFFF
         */
        this.tint = 0xFFFFFF;

        /**
         * Current display blend mode.
         *
         * @member {PIXI.BLEND_MODES}
         * @default PIXI.BLEND_MODES.NORMAL
         */
        this.blendMode = BLEND_MODES.NORMAL;

        /**
         * If this Graphics object owns the GraphicsGeometry
         *
         * @member {boolean}
         * @private
         */
        this._ownsGeometry = ownsGeometry;

        /**
         * Current fill style
         *
         * @member {PIXI.FillStyle}
         * @private
         */
        this._fillStyle = new FillStyle();

        /**
         * Current line style
         *
         * @member {PIXI.LineStyle}
         * @private
         */
        this._lineStyle = new LineStyle();

        /**
         * Current shape transform matrix.
         *
         * @member {PIXI.Matrix}
         * @private
         */
        this._matrix = null;

        /**
         * Current hole mode is enabled.
         *
         * @member {boolean}
         * @default false
         * @private
         */
        this._holeMode = false;

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
     * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo()
     * method or the drawCircle() method.
     *
     * @param {number} [width=0] - width of the line to draw, will update the objects stored style
     * @param {number} [color=0] - color of the line to draw, will update the objects stored style
     * @param {number} [alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {number} [alignment=1] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @param {boolean} [native=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineStyle(width = 0, color = 0, alpha = 1, alignment = 0.5, native = false)
    {
        this.lineTextureStyle(width, Texture.WHITE, color, alpha, null, alignment, native);
    }

    /**
     * Like line style but support texture for line fill.
     *
     * @param {number} [width=0] - width of the line to draw, will update the objects stored style
     * @param {PIXI.Texture} [texture] - Texture to use
     * @param {number} [color=0] - color of the line to draw, will update the objects stored style
     * @param {number} [alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {PIXI.Matrix} [textureMatrix=null] Texture matrix to transform texture
     * @param {number} [alignment=1] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @param {boolean} [native=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineTextureStyle(width = 0, texture = Texture.WHITE, color = 0xFFFFFF, alpha = 1,
        matrix = null, alignment = 0.5, native = false)
    {
        const visible = width > 0 || alpha > 0;

        if (!visible)
        {
            this._lineStyle.reset();
        }
        else
        {
            this.finishPoly();

            Object.assign(this._lineStyle, {
                color,
                width,
                alpha,
                matrix,
                texture,
                alignment,
                native,
                visible,
            });
        }

        /* if (this.currentPath)
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
        }*/

        return this;
    }

    /**
     * Start a polygon object internally
     * @private
     */
    startPoly()
    {
        this.currentPoly = new Polygon();
        this.currentPoly.closed = false;
    }

    /**
     * Finish the polygon object.
     * @private
     */
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
     * Initialize the curve
     *
     * @private
     * @param {number} [x=0]
     * @param {number} [y=0]
     */
    _initCurve(x = 0, y = 0)
    {
        if (this.currentPoly)
        {
            if (this.currentPoly.points.length === 0)
            {
                this.currentPoly.points = [x, y];
            }
        }
        else
        {
            this.moveTo(x, y);
        }
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
        this._initCurve();

        const points = this.currentPoly.points;

        if (points.length === 0)
        {
            this.moveTo(0, 0);
        }

        QuadraticUtils.curveTo(cpX, cpY, toX, toY, points);

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
        this._initCurve();

        BezierUtils.curveTo(cpX, cpY, cpX2, cpY2, toX, toY, this.currentPoly.points);

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
        this._initCurve(x1, y1);

        const points = this.currentPoly.points;

        const result = ArcUtils.curveTo(x1, y1, x2, y2, radius, points);

        if (result)
        {
            const { cx, cy, radius, startAngle, endAngle, anticlockwise } = result;

            this.arc(cx, cy, radius, startAngle, endAngle, anticlockwise);
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

        ArcUtils.arc(startX, startY, cx, cy, radius, startAngle, endAngle, anticlockwise, points);

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
        return this.beginTextureFill(Texture.WHITE, color, alpha);
    }

    /**
     * Begin the texture fill
     *
     * @param {PIXI.Texture} texture - Texture to fill
     * @param {number} [color=0xffffff] - Background to fill behind texture
     * @param {number} [alpha=1] - Alpha of fill
     * @param {PIXI.Matrix} [textureMatrix=null] - Transform matrix
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    beginTextureFill(texture = Texture.WHITE, color = 0xFFFFFF, alpha = 1, matrix = null)
    {
        const visible = alpha > 0;

        if (!visible)
        {
            this._fillStyle.reset();
        }
        else
        {
            if (this.currentPoly)
            {
                this.finishPoly();
            }

            Object.assign(this._fillStyle, {
                color,
                alpha,
                texture,
                matrix,
                visible,
            });
        }

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

        this._fillStyle.reset();

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
        return this.drawShape(new Rectangle(x, y, width, height));
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
        return this.drawShape(new RoundedRectangle(x, y, width, height, radius));
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
        return this.drawShape(new Circle(x, y, radius));
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
        return this.drawShape(new Ellipse(x, y, width, height));
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

    /**
     * Draw any shape.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - Shape to draw
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    drawShape(shape)
    {
        if (!this._holeMode)
        {
            this.geometry.drawShape(
                shape,
                this._fillStyle.toJSON(),
                this._lineStyle.toJSON(),
                this._matrix
            );
        }
        else
        {
            this.geometry.drawHole(shape, this._matrix);
        }

        return this;
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
        return this.drawPolygon(new Star(x, y, points, radius, innerRadius, rotation));
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

        if (geometry.drawCalls.length)
        {
            // the first draw call, we can set the uniforms of the shader directly here.
            const firstCall = geometry.drawCalls[0];

            // this means that we can tack advantage of the sync function of pixi!
            this.shader.uniforms.uSampler = firstCall.texture;

            // bind and sync uniforms..
            // there is a way to optimise this..
            renderer.shader.bind(this.shader);

            // then render it
            renderer.geometry.bind(geometry, this.shader);

            // set state..
            renderer.state.setState(this.state);

            renderer.geometry.draw(firstCall.type, firstCall.size, firstCall.start);

            // then render the rest of them...
            for (let i = 1; i < geometry.drawCalls.length; i++)
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
        this.worldTransform.applyInverse(point, Graphics._TEMP_POINT);

        return this.geometry.containsPoint(Graphics._TEMP_POINT);
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

    /**
     * Apply a matrix
     *
     * @param {PIXI.Matrix} matrix - Matrix to use for transform current shape.
     * @return {PIXI.Graphics} Returns itself.
     */
    setMatrix(matrix)
    {
        this._matrix = matrix;

        return this;
    }

    /**
     * Begin adding holes to the last draw shape
     * IMPORTANT: holes must be fully inside a shape to work
     * Also weirdness ensues if holes overlap!
     * @return {PIXI.Graphics} Returns itself.
     */
    beginHole()
    {
        this._holeMode = true;

        return this;
    }

    /**
     * End adding holes to the last draw shape
     * @return {PIXI.Graphics} Returns itself.
     */
    endHole()
    {
        this._holeMode = false;

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
     * @param {boolean} [options.geometry=false] - if set to true, the geometry object will be
     *  be destroyed.
     */
    destroy(options)
    {
        super.destroy(options);

        const destroyGeometry = typeof options === 'boolean' ? options : options && options.geometry;

        if (destroyGeometry || this._ownsGeometry)
        {
            this.geometry.destroy();
        }

        this._matrix = null;
        this.currentPoly = null;
        this._lineStyle.destroy();
        this._lineStyle = null;
        this._fillStyle.destroy();
        this._fillStyle = null;
        this.geometry = null;
        this.shader = null;
    }
}

/**
 * Temporary point to use for containsPoint
 *
 * @static
 * @private
 * @member {PIXI.Point}
 */
Graphics._TEMP_POINT = new Point();
