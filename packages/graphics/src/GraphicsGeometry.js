import { Buffer, Geometry } from '@pixi/core';
import { Rectangle, SHAPES } from '@pixi/math';
import { TYPES } from '@pixi/constants';

import GraphicsData from './GraphicsData';
import buildCircle from './utils/buildCircle';
import buildLine from './utils/buildLine';
import buildPoly from './utils/buildPoly';
import buildRectangle from './utils/buildRectangle';
import buildRoundedRectangle from './utils/buildRoundedRectangle';

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export default class GraphicsGeometry extends Geometry
{
    /**
     *
     * @param {boolean} [nativeLines=false] - If true the lines will be draw using LINES instead of TRIANGLE_STRIP
     */
    constructor(multiTexture = false)
    {
        super();

        /**
         * The main buffer
         * @member {WebGLBuffer}
         */
        this.buffer = new Buffer();

        /**
         * The main buffer
         * @member {WebGLBuffer}
         */
        this.indexBuffer = new Buffer();

        /**
         * An array of points to draw
         * @member {PIXI.Point[]}
         */
        this.points = [];
        this.colors = [];
        this.uvs = [];

        /**
         * The indices of the vertices
         * @member {number[]}
         */
        this.indices = [];

        this
            .addAttribute('aVertexPosition', this.buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aTextureCoord', this.buffer, 2, true, TYPES.FLOAT)
            .addAttribute('aColor', this.buffer, 4, true, TYPES.UNSIGNED_BYTE)
            .addIndex(this.indexBuffer);

        if (multiTexture)
        {
            // then add the extra attribute!
        }

        /**
         * Graphics data
         *
         * @member {PIXI.GraphicsData[]}
         * @private
         */
        this.graphicsData = [];
        this.graphicsDataHoles = [];

        /**
         * Used to detect if the graphics object has changed. If this is set to true then the graphics
         * object will be recalculated.
         *
         * @member {boolean}
         * @private
         */
        this.dirty = 0;

        this.cacheDirty = -1;
        /**
         * Used to detect if we clear the graphics webGL data
         * @type {Number}
         */
        this.clearDirty = 0;

        this.drawCalls = [];

        this.shapeIndex = 0;

        this.fillCommands = {};

        this.fillCommands[SHAPES.POLY] = buildPoly;
        this.fillCommands[SHAPES.CIRC] = buildCircle;
        this.fillCommands[SHAPES.ELIP] = buildCircle;
        this.fillCommands[SHAPES.RECT] = buildRectangle;
        this.fillCommands[SHAPES.RREC] = buildRoundedRectangle;

        this._bounds = new Rectangle();
        this.boundsDirty = -1;
        this.boundsPadding = 0;
        this.dirty = 0;
    }

    get bounds()
    {
        if (this.boundsDirty !== this.dirty)
        {
            this.boundsDirty = this.dirty;
            this.calculateBounds();
        }

        return this._bounds;
    }

    addDrawCall(type, size, start, texture)
    {
        this.drawCalls.push({ type, size, start, texture });
    }

    /**
     * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
     *
     * @return {PIXI.Graphics} This Graphics object. Good for chaining method calls
     */
    clear()
    {
        if (this.graphicsData.length > 0)
        {
            this.boundsDirty = -1;
            this.dirty++;
            this.clearDirty++;
            this.graphicsData.length = 0;

            this.drawCalls.length = 0;

            this.points.length = 0;
            this.colors.length = 0;
            this.uvs.length = 0;

            /**
             * The indices of the vertices
             * @member {number[]}
             */
            this.indices.length = 0;
        }

        return this;
    }

    /**
     * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @return {PIXI.GraphicsData} The generated GraphicsData object.
     */
    drawShape(shape, fillStyle, lineStyle, matrix)
    {
        /*
        if (this.currentPath)
        {
            // check current path!
            if (this.currentPath.shape.points.length <= 2)
            {
                this.graphicsData.pop();
            }
        }
        */

        //        this.currentPath = null;

        const data = new GraphicsData(
            shape,
            fillStyle,
            lineStyle,
            matrix
        );

        this.graphicsData.push(data);
        /*
        if (data.type === SHAPES.POLY)
        {
            data.shape.closed = data.shape.closed || this.filling;
            this.currentPath = data;
        }
*/

        this.dirty++;

        return this;
    }

    /**
     * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @return {PIXI.GraphicsData} The generated GraphicsData object.
     */
    drawHole(shape, matrix)
    {
        if (!this.graphicsData.length) return;

        const data = new GraphicsData(
            shape,
            null,
            null,
            matrix
        );

        const lastShape = this.graphicsData[this.graphicsData.length - 1];

        lastShape.holes.push(data);

        this.dirty++;
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

        // destroy each of the GraphicsData objects
        for (let i = 0; i < this.graphicsData.length; ++i)
        {
            this.graphicsData[i].destroy();
        }

        // for each webgl data entry, destroy the WebGLGraphicsData
        for (const id in this._webGL)
        {
            for (let j = 0; j < this._webGL[id].data.length; ++j)
            {
                this._webGL[id].data[j].destroy();
            }
        }

        this.graphicsData = null;

        this.currentPath = null;
        this._webGL = null;
        this._localBounds = null;
    }

    containsPoint(point)
    {
        const graphicsData = this.graphicsData;

        for (let i = 0; i < graphicsData.length; ++i)
        {
            const data = graphicsData[i];

            if (!data.fill)
            {
                continue;
            }

            // only deal with fills..
            if (data.shape)
            {
                if (data.shape.contains(point.x, point.y))
                {
                    if (data.holes)
                    {
                        for (let i = 0; i < data.holes.length; i++)
                        {
                            const hole = data.holes[i];

                            if (hole.shape.contains(point.x, point.y))
                            {
                                return false;
                            }
                        }
                    }

                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Updates the graphics object
     *
     * @private
     * @param {PIXI.Graphics} graphics - The graphics object to update
     */
    updateAttributes()
    {
        if (this.dirty === this.cacheDirty) return;
        if (this.graphicsData.length === 0) return;

        for (let i = 0; i < this.graphicsData.length; i++)
        {
            const data = this.graphicsData[i];

            if (data.fillStyle && !data.fillStyle.texture.baseTexture.valid) return;
            if (data.lineStyle && !data.lineStyle.texture.baseTexture.valid) return;
        }

        this.dirty = this.cacheDirty;

        let lastTexture = null;
        let lastIndex = this.indices.length;

        const uvs = this.uvs;
        const colors = this.colors;

        const lastDrawCall = this.drawCalls.pop();

        // this is so we can batch the new call if possible..
        if (lastDrawCall)
        {
            lastTexture = lastDrawCall.texture;
            lastIndex = lastDrawCall.start;
        }

        // TODO - this can be simplified
        for (let i = this.shapeIndex; i < this.graphicsData.length; i++)
        {
            this.shapeIndex++;

            const data = this.graphicsData[i];
            const command = this.fillCommands[data.type];

            const fillStyle = data.fillStyle;
            const lineStyle = data.lineStyle;

            // build out the shapes points..
            command.build(data);

            if (data.matrix)
            {
                this.transformPoints(data.points, data.matrix);
            }

            for (let j = 0; j < 2; j++)
            {
                const style = (j === 0) ? fillStyle : lineStyle;

                if (!style) continue;

                const nextTexture = style.texture.baseTexture;

                // last texture is null at the start..
                lastTexture = lastTexture || nextTexture;

                nextTexture.wrapMode = 10497;

                if (lastTexture !== nextTexture)
                {
                    const index = this.indices.length;

                    if (lastIndex - index)
                    {
                        // add a draw call..
                        this.addDrawCall(5, index - lastIndex, lastIndex, lastTexture);
                        lastTexture = nextTexture;
                        lastIndex = index;
                    }
                }

                const start = this.points.length / 2;

                if (j === 0)
                {
                    if (data.holes)
                    {
                        this.proccessHoles(data.holes);

                        buildPoly.triangulate(data, this);
                    }
                    else
                    {
                        command.triangulate(data, this);
                    }
                }
                else
                {
                    buildLine(data, this);
                }

                const size = (this.points.length / 2) - start;

                this.addUvs(this.points, uvs, style.texture, start, size, style.matrix);
                this.addColors(colors, style.color, style.alpha, size);
            }
        }

        const index = this.indices.length;

        this.addDrawCall(5, index - lastIndex, lastIndex, lastTexture);

        // upload..
        // merge for now!
        const verts = this.points;

        const glPoints = new ArrayBuffer(verts.length * 8 * 4);
        const f32 = new Float32Array(glPoints);
        const u32 = new Uint32Array(glPoints);

        let p = 0;

        for (let i = 0; i < verts.length / 2; i++)
        {
            f32[p++] = verts[i * 2];
            f32[p++] = verts[(i * 2) + 1];

            f32[p++] = uvs[i * 2];
            f32[p++] = uvs[(i * 2) + 1];

            u32[p++] = colors[i];
        }

        this.buffer.update(glPoints);

        const glIndices = new Uint16Array(this.indices);

        this.indexBuffer.update(glIndices);
    }

    proccessHoles(holes)
    {
        for (let i = 0; i < holes.length; i++)
        {
            const hole = holes[i];

            const command = this.fillCommands[hole.type];

            command.build(hole);

            if (hole.matrix)
            {
                this.transformPoints(hole.points, hole.matrix);
            }
        }
    }

    /**
     * Update the bounds of the object
     *
     */
    calculateBounds()
    {
        let minX = Infinity;
        let maxX = -Infinity;

        let minY = Infinity;
        let maxY = -Infinity;

        if (this.graphicsData.length)
        {
            let shape = 0;
            let x = 0;
            let y = 0;
            let w = 0;
            let h = 0;

            for (let i = 0; i < this.graphicsData.length; i++)
            {
                const data = this.graphicsData[i];
                const type = data.type;
                const lineWidth = data.lineWidth;

                shape = data.shape;

                if (type === SHAPES.RECT || type === SHAPES.RREC)
                {
                    x = shape.x - (lineWidth / 2);
                    y = shape.y - (lineWidth / 2);
                    w = shape.width + lineWidth;
                    h = shape.height + lineWidth;

                    minX = x < minX ? x : minX;
                    maxX = x + w > maxX ? x + w : maxX;

                    minY = y < minY ? y : minY;
                    maxY = y + h > maxY ? y + h : maxY;
                }
                else if (type === SHAPES.CIRC)
                {
                    x = shape.x;
                    y = shape.y;
                    w = shape.radius + (lineWidth / 2);
                    h = shape.radius + (lineWidth / 2);

                    minX = x - w < minX ? x - w : minX;
                    maxX = x + w > maxX ? x + w : maxX;

                    minY = y - h < minY ? y - h : minY;
                    maxY = y + h > maxY ? y + h : maxY;
                }
                else if (type === SHAPES.ELIP)
                {
                    x = shape.x;
                    y = shape.y;
                    w = shape.width + (lineWidth / 2);
                    h = shape.height + (lineWidth / 2);

                    minX = x - w < minX ? x - w : minX;
                    maxX = x + w > maxX ? x + w : maxX;

                    minY = y - h < minY ? y - h : minY;
                    maxY = y + h > maxY ? y + h : maxY;
                }
                else
                {
                    // POLY
                    const points = shape.points;
                    let x2 = 0;
                    let y2 = 0;
                    let dx = 0;
                    let dy = 0;
                    let rw = 0;
                    let rh = 0;
                    let cx = 0;
                    let cy = 0;

                    for (let j = 0; j + 2 < points.length; j += 2)
                    {
                        x = points[j];
                        y = points[j + 1];
                        x2 = points[j + 2];
                        y2 = points[j + 3];
                        dx = Math.abs(x2 - x);
                        dy = Math.abs(y2 - y);
                        h = lineWidth;
                        w = Math.sqrt((dx * dx) + (dy * dy));

                        if (w < 1e-9)
                        {
                            continue;
                        }

                        rw = ((h / w * dy) + dx) / 2;
                        rh = ((h / w * dx) + dy) / 2;
                        cx = (x2 + x) / 2;
                        cy = (y2 + y) / 2;

                        minX = cx - rw < minX ? cx - rw : minX;
                        maxX = cx + rw > maxX ? cx + rw : maxX;

                        minY = cy - rh < minY ? cy - rh : minY;
                        maxY = cy + rh > maxY ? cy + rh : maxY;
                    }
                }
            }
        }
        else
        {
            minX = 0;
            maxX = 0;
            minY = 0;
            maxY = 0;
        }

        const padding = this.boundsPadding;

        this._bounds.minX = minX - padding;
        this._bounds.maxX = maxX + padding;

        this._bounds.minY = minY - padding;
        this._bounds.maxY = maxY + padding;
    }

    transformPoints(points, matrix)
    {
        for (let i = 0; i < points.length / 2; i++)
        {
            const x = points[(i * 2)];
            const y = points[(i * 2) + 1];

            points[(i * 2)] = (matrix.a * x) + (matrix.c * y) + matrix.tx;
            points[(i * 2) + 1] = (matrix.b * x) + (matrix.d * y) + matrix.ty;
        }
    }

    addColors(colors, color, alpha, size)
    {
        const tRGB = (color >> 16)
        + (color & 0xff00)
        + ((color & 0xff) << 16)
        + (alpha * 255 << 24);

        while (size-- > 0)
        {
            colors.push(tRGB);
        }
    }

    addUvs(verts, uvs, texture, start, size, matrix)
    {
        let index = 0;

        while (index < size)
        {
            let x = verts[(start + index) * 2];
            let y = verts[((start + index) * 2) + 1];

            if (matrix)
            {
                const nx = (matrix.a * x) + (matrix.c * y) + matrix.tx;

                y = (matrix.b * x) + (matrix.d * y) + matrix.ty;
                x = nx;
            }

            index++;

            const frame = texture.frame;

            uvs.push(x / frame.width, y / frame.height);
        }
    }
}
