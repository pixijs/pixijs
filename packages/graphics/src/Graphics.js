import {
    Circle,
    Ellipse,
    PI_2,
    Point,
    Polygon,
    Rectangle,
    RoundedRectangle,
    Matrix,
} from '@pixi/math';
import { hex2rgb } from '@pixi/utils';
import {
    Texture,
    Shader,
    UniformGroup, State,
} from '@pixi/core';
import { FillStyle } from './styles/FillStyle';
import { GraphicsGeometry } from './GraphicsGeometry';
import { LineStyle } from './styles/LineStyle';
import { BezierUtils } from './utils/BezierUtils';
import { QuadraticUtils } from './utils/QuadraticUtils';
import { ArcUtils } from './utils/ArcUtils';
import { Star } from './utils/Star';
import { BLEND_MODES } from '@pixi/constants';
import { Container } from '@pixi/display';

const temp = new Float32Array(3);

// a default shader used by graphics..
let defaultShader = null;

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * Note that because Graphics can share a GraphicsGeometry with other instances,
 * it is necessary to call `destroy()` to properly dereference the underlying
 * GraphicsGeometry and avoid a memory leak. Alternatively, keep using the same
 * Graphics instance and call `clear()` between redraws.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export class Graphics extends Container
{
    /**
     * @param {PIXI.GraphicsGeometry} [geometry=null] - Geometry to use, if omitted
     *        will create a new GraphicsGeometry instance.
     */
    constructor(geometry = null)
    {
        super();
        /**
         * Includes vertex positions, face indices, normals, colors, UVs, and
         * custom attributes within buffers, reducing the cost of passing all
         * this data to the GPU. Can be shared between multiple Mesh or Graphics objects.
         * @member {PIXI.GraphicsGeometry}
         * @readonly
         */
        this.geometry = geometry || new GraphicsGeometry();

        this.geometry.refCount++;

        /**
         * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
         * Can be shared between multiple Graphics objects.
         * @member {PIXI.Shader}
         */
        this.shader = null;

        /**
         * Represents the WebGL state the Graphics required to render, excludes shader and geometry. E.g.,
         * blend mode, culling, depth testing, direction of rendering triangles, backface, etc.
         * @member {PIXI.State}
         */
        this.state = State.for2d();

        /**
         * Current fill style
         *
         * @member {PIXI.FillStyle}
         * @protected
         */
        this._fillStyle = new FillStyle();

        /**
         * Current line style
         *
         * @member {PIXI.LineStyle}
         * @protected
         */
        this._lineStyle = new LineStyle();

        /**
         * Current shape transform matrix.
         *
         * @member {PIXI.Matrix}
         * @protected
         */
        this._matrix = null;

        /**
         * Current hole mode is enabled.
         *
         * @member {boolean}
         * @default false
         * @protected
         */
        this._holeMode = false;

        /**
         * Current path
         *
         * @member {PIXI.Polygon}
         * @protected
         */
        this.currentPath = null;

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

        /**
         * A collections of batches! These can be drawn by the renderer batch system.
         *
         * @protected
         * @member {object[]}
         */
        this.batches = [];

        /**
         * Update dirty for limiting calculating tints for batches.
         *
         * @protected
         * @member {number}
         * @default -1
         */
        this.batchTint = -1;

        /**
         * Copy of the object vertex data.
         *
         * @protected
         * @member {Float32Array}
         */
        this.vertexData = null;

        this._transformID = -1;
        this.batchDirty = -1;

        /**
         * Renderer plugin for batching
         *
         * @member {string}
         * @default 'batch'
         */
        this.pluginName = 'batch';

        // Set default
        this.tint = 0xFFFFFF;
        this.blendMode = BLEND_MODES.NORMAL;
    }

    /**
     * Creates a new Graphics object with the same values as this one.
     * Note that the only the properties of the object are cloned, not its transform (position,scale,etc)
     *
     * @return {PIXI.Graphics} A clone of the graphics object
     */
    clone()
    {
        this.finishPoly();

        return new Graphics(this.geometry);
    }

    /**
     * The blend mode to be applied to the graphic shape. Apply a value of
     * `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL;
     * @see PIXI.BLEND_MODES
     */
    set blendMode(value)
    {
        this.state.blendMode = value;
    }

    get blendMode()
    {
        return this.state.blendMode;
    }

    /**
     * The tint applied to the graphic shape. This is a hex value. A value of
     * 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    get tint()
    {
        return this._tint;
    }
    set tint(value)
    {
        this._tint = value;
    }

    /**
     * The current fill style.
     *
     * @member {PIXI.FillStyle}
     * @readonly
     */
    get fill()
    {
        return this._fillStyle;
    }

    /**
     * The current line style.
     *
     * @member {PIXI.LineStyle}
     * @readonly
     */
    get line()
    {
        return this._lineStyle;
    }

    /**
     * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo()
     * method or the drawCircle() method.
     *
     * @param {number} [width=0] - width of the line to draw, will update the objects stored style
     * @param {number} [color=0] - color of the line to draw, will update the objects stored style
     * @param {number} [alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {number} [alignment=0.5] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @param {boolean} [native=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineStyle(width = 0, color = 0, alpha = 1, alignment = 0.5, native = false)
    {
        this.lineTextureStyle(width, Texture.WHITE, color, alpha, null, alignment, native);

        return this;
    }

    /**
     * Like line style but support texture for line fill.
     *
     * @param {number} [width=0] - width of the line to draw, will update the objects stored style
     * @param {PIXI.Texture} [texture=PIXI.Texture.WHITE] - Texture to use
     * @param {number} [color=0] - color of the line to draw, will update the objects stored style
     * @param {number} [alpha=1] - alpha of the line to draw, will update the objects stored style
     * @param {PIXI.Matrix} [matrix=null] Texture matrix to transform texture
     * @param {number} [alignment=0.5] - alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
     * @param {boolean} [native=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    lineTextureStyle(width = 0, texture = Texture.WHITE, color = 0xFFFFFF, alpha = 1,
        matrix = null, alignment = 0.5, native = false)
    {
        if (this.currentPath)
        {
            this.startPoly();
        }

        const visible = width > 0 && alpha > 0;

        if (!visible)
        {
            this._lineStyle.reset();
        }
        else
        {
            if (matrix)
            {
                matrix = matrix.clone();
                matrix.invert();
            }

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

        return this;
    }

    /**
     * Start a polygon object internally
     * @protected
     */
    startPoly()
    {
        if (this.currentPath)
        {
            const points = this.currentPath.points;
            const len = this.currentPath.points.length;

            if (len > 2)
            {
                this.drawShape(this.currentPath);
                this.currentPath = new Polygon();
                this.currentPath.closeStroke = false;
                this.currentPath.points.push(points[len - 2], points[len - 1]);
            }
        }
        else
        {
            this.currentPath = new Polygon();
            this.currentPath.closeStroke = false;
        }
    }

    /**
     * Finish the polygon object.
     * @protected
     */
    finishPoly()
    {
        if (this.currentPath)
        {
            if (this.currentPath.points.length > 2)
            {
                this.drawShape(this.currentPath);
                this.currentPath = null;
            }
            else
            {
                this.currentPath.points.length = 0;
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
        this.currentPath.points[0] = x;
        this.currentPath.points[1] = y;

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
        if (!this.currentPath)
        {
            this.moveTo(0, 0);
        }

        // remove duplicates..
        const points = this.currentPath.points;
        const fromX = points[points.length - 2];
        const fromY = points[points.length - 1];

        if (fromX !== x || fromY !== y)
        {
            points.push(x, y);
        }

        return this;
    }

    /**
     * Initialize the curve
     *
     * @protected
     * @param {number} [x=0]
     * @param {number} [y=0]
     */
    _initCurve(x = 0, y = 0)
    {
        if (this.currentPath)
        {
            if (this.currentPath.points.length === 0)
            {
                this.currentPath.points = [x, y];
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

        const points = this.currentPath.points;

        if (points.length === 0)
        {
            this.moveTo(0, 0);
        }

        QuadraticUtils.curveTo(cpX, cpY, toX, toY, points);

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

        BezierUtils.curveTo(cpX, cpY, cpX2, cpY2, toX, toY, this.currentPath.points);

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

        const points = this.currentPath.points;

        const result = ArcUtils.curveTo(x1, y1, x2, y2, radius, points);

        if (result)
        {
            const { cx, cy, radius, startAngle, endAngle, anticlockwise } = result;

            this.arc(cx, cy, radius, startAngle, endAngle, anticlockwise);
        }

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
        let points = this.currentPath ? this.currentPath.points : null;

        if (points)
        {
            // TODO: make a better fix.

            // We check how far our start is from the last existing point
            const xDiff = Math.abs(points[points.length - 2] - startX);
            const yDiff = Math.abs(points[points.length - 1] - startY);

            if (xDiff < 0.001 && yDiff < 0.001)
            {
                // If the point is very close, we don't add it, since this would lead to artifacts
                // during tessellation due to floating point imprecision.
            }
            else
            {
                points.push(startX, startY);
            }
        }
        else
        {
            this.moveTo(startX, startY);
            points = this.currentPath.points;
        }

        ArcUtils.arc(startX, startY, cx, cy, radius, startAngle, endAngle, anticlockwise, points);

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
     * @param {PIXI.Texture} [texture=PIXI.Texture.WHITE] - Texture to fill
     * @param {number} [color=0xffffff] - Background to fill behind texture
     * @param {number} [alpha=1] - Alpha of fill
     * @param {PIXI.Matrix} [matrix=null] - Transform matrix
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    beginTextureFill(texture = Texture.WHITE, color = 0xFFFFFF, alpha = 1, matrix = null)
    {
        if (this.currentPath)
        {
            this.startPoly();
        }

        const visible = alpha > 0;

        if (!visible)
        {
            this._fillStyle.reset();
        }
        else
        {
            if (matrix)
            {
                matrix = matrix.clone();
                matrix.invert();
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
     * Draws a rectangle shape.
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
     * Draw a rectangle shape with rounded/beveled corners.
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

        let closeStroke = true;// !!this._fillStyle;

        // check if data has points..
        if (points.points)
        {
            closeStroke = points.closeStroke;
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

        shape.closeStroke = closeStroke;

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
                this._fillStyle.clone(),
                this._lineStyle.clone(),
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
        this._lineStyle.reset();
        this._fillStyle.reset();

        this._matrix = null;
        this._holeMode = false;
        this.currentPath = null;

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
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    _render(renderer)
    {
        this.finishPoly();

        const geometry = this.geometry;

        // batch part..
        // batch it!
        geometry.updateBatches();

        if (geometry.batchable)
        {
            if (this.batchDirty !== geometry.batchDirty)
            {
                this.batches = [];
                this.batchTint = -1;
                this._transformID = -1;
                this.batchDirty = geometry.batchDirty;

                this.vertexData = new Float32Array(geometry.points);

                const blendMode = this.blendMode;

                for (let i = 0; i < geometry.batches.length; i++)
                {
                    const gI = geometry.batches[i];

                    const color = gI.style.color;

                    //        + (alpha * 255 << 24);

                    const vertexData = new Float32Array(this.vertexData.buffer,
                        gI.attribStart * 4 * 2,
                        gI.attribSize * 2);

                    const uvs = new Float32Array(geometry.uvsFloat32.buffer,
                        gI.attribStart * 4 * 2,
                        gI.attribSize * 2);

                    const indices = new Uint16Array(geometry.indicesUint16.buffer,
                        gI.start * 2,
                        gI.size);

                    const batch = {
                        vertexData,
                        blendMode,
                        indices,
                        uvs,
                        _batchRGB: hex2rgb(color),
                        _tintRGB: color,
                        _texture: gI.style.texture,
                        alpha: gI.style.alpha,
                        worldAlpha: 1 };

                    this.batches[i] = batch;
                }
            }

            if (this.batches.length)
            {
                renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);

                this.calculateVertices();
                this.calculateTints();

                for (let i = 0; i < this.batches.length; i++)
                {
                    const batch = this.batches[i];

                    batch.worldAlpha = this.worldAlpha * batch.alpha;

                    renderer.plugins[this.pluginName].render(batch);
                }
            }
        }
        else
        {
            // no batching...
            renderer.batch.flush();

            if (!this.shader)
            {
                // if there is no shader here, we can use the default shader.
                // and that only gets created if we actually need it..
                if (!defaultShader)
                {
                    const sampleValues = new Int32Array(16);

                    for (let i = 0; i < 16; i++)
                    {
                        sampleValues[i] = i;
                    }

                    const uniforms = {
                        tint: new Float32Array([1, 1, 1, 1]),
                        translationMatrix: new Matrix(),
                        default: UniformGroup.from({ uSamplers: sampleValues }, true),
                    };

                    // we can bbase default shader of the batch renderers program
                    const program =  renderer.plugins.batch._shader.program;

                    defaultShader = new Shader(program, uniforms);
                }

                this.shader = defaultShader;
            }

            const uniforms = this.shader.uniforms;

            // lets set the transfomr
            uniforms.translationMatrix = this.transform.worldTransform;

            const tint = this.tint;
            const wa = this.worldAlpha;

            // and then lets set the tint..
            uniforms.tint[0] = (((tint >> 16) & 0xFF) / 255) * wa;
            uniforms.tint[1] = (((tint >> 8) & 0xFF) / 255) * wa;
            uniforms.tint[2] = ((tint & 0xFF) / 255) * wa;
            uniforms.tint[3] = wa;

            // the first draw call, we can set the uniforms of the shader directly here.

            // this means that we can tack advantage of the sync function of pixi!
            // bind and sync uniforms..
            // there is a way to optimise this..
            renderer.shader.bind(this.shader);

            // then render it
            renderer.geometry.bind(geometry, this.shader);

            // set state..
            renderer.state.set(this.state);

            // then render the rest of them...
            for (let i = 0; i < geometry.drawCalls.length; i++)
            {
                const drawCall = geometry.drawCalls[i];

                const groupTextureCount = drawCall.textureCount;

                for (let j = 0; j < groupTextureCount; j++)
                {
                    renderer.texture.bind(drawCall.textures[j], j);
                }

                // bind the geometry...
                renderer.geometry.draw(drawCall.type, drawCall.size, drawCall.start);
            }
        }
    }

    /**
     * Retrieves the bounds of the graphic shape as a rectangle object
     *
     * @protected
     */
    _calculateBounds()
    {
        this.finishPoly();
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
     * Recalcuate the tint by applying tin to batches using Graphics tint.
     * @protected
     */
    calculateTints()
    {
        if (this.batchTint !== this.tint)
        {
            this.batchTint = this.tint;

            const tintRGB = hex2rgb(this.tint, temp);

            for (let i = 0; i < this.batches.length; i++)
            {
                const batch = this.batches[i];

                const batchTint = batch._batchRGB;

                const r = (tintRGB[0] * batchTint[0]) * 255;
                const g = (tintRGB[1] * batchTint[1]) * 255;
                const b = (tintRGB[2] * batchTint[2]) * 255;

                // TODO Ivan, can this be done in one go?
                const color = (r << 16) + (g << 8) + (b | 0);

                batch._tintRGB = (color >> 16)
                        + (color & 0xff00)
                        + ((color & 0xff) << 16);
            }
        }
    }

    /**
     * If there's a transform update or a change to the shape of the
     * geometry, recaculate the vertices.
     * @protected
     */
    calculateVertices()
    {
        if (this._transformID === this.transform._worldID)
        {
            return;
        }

        this._transformID = this.transform._worldID;

        const wt = this.transform.worldTransform;
        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        const data = this.geometry.points;// batch.vertexDataOriginal;
        const vertexData = this.vertexData;

        let count = 0;

        for (let i = 0; i < data.length; i += 2)
        {
            const x = data[i];
            const y = data[i + 1];

            vertexData[count++] = (a * x) + (c * y) + tx;
            vertexData[count++] = (d * y) + (b * x) + ty;
        }
    }

    /**
     * Closes the current path.
     *
     * @return {PIXI.Graphics} Returns itself.
     */
    closePath()
    {
        const currentPath = this.currentPath;

        if (currentPath)
        {
            // we don't need to add extra point in the end because buildLine will take care of that
            currentPath.closeStroke = true;
        }

        return this;
    }

    /**
     * Apply a matrix to the positional data.
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
     * Ellipses, Circles, Rectangles and Rounded Rectangles cannot be holes or host for holes in CanvasRenderer,
     * please use `moveTo` `lineTo`, `quadraticCurveTo` if you rely on pixi-legacy bundle.
     * @return {PIXI.Graphics} Returns itself.
     */
    beginHole()
    {
        this.finishPoly();
        this._holeMode = true;

        return this;
    }

    /**
     * End adding holes to the last draw shape
     * @return {PIXI.Graphics} Returns itself.
     */
    endHole()
    {
        this.finishPoly();
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
     */
    destroy(options)
    {
        super.destroy(options);

        this.geometry.refCount--;
        if (this.geometry.refCount === 0)
        {
            this.geometry.dispose();
        }

        this._matrix = null;
        this.currentPath = null;
        this._lineStyle.destroy();
        this._lineStyle = null;
        this._fillStyle.destroy();
        this._fillStyle = null;
        this.geometry = null;
        this.shader = null;
        this.vertexData = null;
        this.batches.length = 0;
        this.batches = null;

        super.destroy(options);
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
