import { SHAPES } from '@pixi/math';
import { Bounds } from '@pixi/display';
import { BatchGeometry, BatchDrawCall, BaseTexture } from '@pixi/core';
import { DRAW_MODES, WRAP_MODES } from '@pixi/constants';

import { GraphicsData } from './GraphicsData';
import { buildCircle } from './utils/buildCircle';
import { buildLine } from './utils/buildLine';
import { buildPoly } from './utils/buildPoly';
import { buildRectangle } from './utils/buildRectangle';
import { buildRoundedRectangle } from './utils/buildRoundedRectangle';
import { premultiplyTint } from '@pixi/utils';

const BATCH_POOL = [];
const DRAW_CALL_POOL = [];

/**
 * Map of fill commands for each shape type.
 *
 * @member {Object}
 * @private
 */
const fillCommands = {};

fillCommands[SHAPES.POLY] = buildPoly;
fillCommands[SHAPES.CIRC] = buildCircle;
fillCommands[SHAPES.ELIP] = buildCircle;
fillCommands[SHAPES.RECT] = buildRectangle;
fillCommands[SHAPES.RREC] = buildRoundedRectangle;

/**
 * A little internal structure to hold interim batch objects.
 *
 * @private
 */
class BatchPart
{
    constructor()
    {
        this.style = null;
        this.size = 0;
        this.start = 0;
        this.attribStart = 0;
        this.attribSize = 0;
    }
}

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * GraphicsGeometry is designed to not be continually updating the geometry since it's expensive
 * to re-tesselate using **earcut**. Consider using {@link PIXI.Mesh} for this use-case, it's much faster.
 *
 * @class
 * @extends PIXI.BatchGeometry
 * @memberof PIXI
 */
export class GraphicsGeometry extends BatchGeometry
{
    constructor()
    {
        super();

        /**
         * An array of points to draw, 2 numbers per point
         *
         * @member {number[]}
         * @protected
         */
        this.points = [];

        /**
         * The collection of colors
         *
         * @member {number[]}
         * @protected
         */
        this.colors = [];

        /**
         * The UVs collection
         *
         * @member {number[]}
         * @protected
         */
        this.uvs = [];

        /**
         * The indices of the vertices
         *
         * @member {number[]}
         * @protected
         */
        this.indices = [];

        /**
         * Reference to the texture IDs.
         *
         * @member {number[]}
         * @protected
         */
        this.textureIds = [];

        /**
         * The collection of drawn shapes.
         *
         * @member {PIXI.GraphicsData[]}
         * @protected
         */
        this.graphicsData = [];

        /**
         * Used to detect if the graphics object has changed.
         *
         * @member {number}
         * @protected
         */
        this.dirty = 0;

        /**
         * Batches need to regenerated if the geometry is updated.
         *
         * @member {number}
         * @protected
         */
        this.batchDirty = -1;

        /**
         * Used to check if the cache is dirty.
         *
         * @member {number}
         * @protected
         */
        this.cacheDirty = -1;

        /**
         * Used to detect if we cleared the graphicsData.
         *
         * @member {number}
         * @default 0
         * @protected
         */
        this.clearDirty = 0;

        /**
         * List of current draw calls drived from the batches.
         *
         * @member {object[]}
         * @protected
         */
        this.drawCalls = [];

        /**
         * Intermediate abstract format sent to batch system.
         * Can be converted to drawCalls or to batchable objects.
         *
         * @member {object[]}
         * @protected
         */
        this.batches = [];

        /**
         * Index of the last batched shape in the stack of calls.
         *
         * @member {number}
         * @protected
         */
        this.shapeIndex = 0;

        /**
         * Cached bounds.
         *
         * @member {PIXI.Bounds}
         * @protected
         */
        this._bounds = new Bounds();

        /**
         * The bounds dirty flag.
         *
         * @member {number}
         * @protected
         */
        this.boundsDirty = -1;

        /**
         * Padding to add to the bounds.
         *
         * @member {number}
         * @default 0
         */
        this.boundsPadding = 0;

        this.batchable = false;

        this.indicesUint16 = null;

        this.uvsFloat32 = null;
    }

    /**
     * Get the current bounds of the graphic geometry.
     *
     * @member {PIXI.Bounds}
     * @readonly
     */
    get bounds()
    {
        if (this.boundsDirty !== this.dirty)
        {
            this.boundsDirty = this.dirty;
            this.calculateBounds();
        }

        return this._bounds;
    }

    /**
     * Call if you changed graphicsData manually.
     * Empties all batch buffers.
     */
    invalidate()
    {
        this.boundsDirty = -1;
        this.dirty++;
        this.batchDirty++;
        this.shapeIndex = 0;

        this.points.length = 0;
        this.colors.length = 0;
        this.uvs.length = 0;
        this.indices.length = 0;
        this.textureIds.length = 0;

        for (let i = 0; i < this.drawCalls.length; i++)
        {
            this.drawCalls[i].textures.length = 0;
            DRAW_CALL_POOL.push(this.drawCalls[i]);
        }

        this.drawCalls.length = 0;

        for (let i = 0; i < this.batches.length; i++)
        {
            const batch =  this.batches[i];

            batch.start = 0;
            batch.attribStart = 0;
            batch.style = null;
            BATCH_POOL.push(batch);
        }

        this.batches.length = 0;
    }

    /**
     * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
     *
     * @return {PIXI.GraphicsGeometry} This GraphicsGeometry object. Good for chaining method calls
     */
    clear()
    {
        if (this.graphicsData.length > 0)
        {
            this.invalidate();
            this.clearDirty++;
            this.graphicsData.length = 0;
        }

        return this;
    }

    /**
     * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param {PIXI.FillStyle} fillStyle - Defines style of the fill.
     * @param {PIXI.LineStyle} lineStyle - Defines style of the lines.
     * @param {PIXI.Matrix} matrix - Transform applied to the points of the shape.
     * @return {PIXI.GraphicsGeometry} Returns geometry for chaining.
     */
    drawShape(shape, fillStyle, lineStyle, matrix)
    {
        const data = new GraphicsData(shape, fillStyle, lineStyle, matrix);

        this.graphicsData.push(data);
        this.dirty++;

        return this;
    }

    /**
     * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param {PIXI.Matrix} matrix - Transform applied to the points of the shape.
     * @return {PIXI.GraphicsGeometry} Returns geometry for chaining.
     */
    drawHole(shape, matrix)
    {
        if (!this.graphicsData.length)
        {
            return null;
        }

        const data = new GraphicsData(shape, null, null, matrix);

        const lastShape = this.graphicsData[this.graphicsData.length - 1];

        data.lineStyle = lastShape.lineStyle;

        lastShape.holes.push(data);

        this.dirty++;

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

        // destroy each of the GraphicsData objects
        for (let i = 0; i < this.graphicsData.length; ++i)
        {
            this.graphicsData[i].destroy();
        }

        this.points.length = 0;
        this.points = null;
        this.colors.length = 0;
        this.colors = null;
        this.uvs.length = 0;
        this.uvs = null;
        this.indices.length = 0;
        this.indices = null;
        this.indexBuffer.destroy();
        this.indexBuffer = null;
        this.graphicsData.length = 0;
        this.graphicsData = null;
        this.drawCalls.length = 0;
        this.drawCalls = null;
        this.batches.length = 0;
        this.batches = null;
        this._bounds = null;
    }

    /**
     * Check to see if a point is contained within this geometry.
     *
     * @param {PIXI.Point} point - Point to check if it's contained.
     * @return {Boolean} `true` if the point is contained within geometry.
     */
    containsPoint(point)
    {
        const graphicsData = this.graphicsData;

        for (let i = 0; i < graphicsData.length; ++i)
        {
            const data = graphicsData[i];

            if (!data.fillStyle.visible)
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
     * Generates intermediate batch data. Either gets converted to drawCalls
     * or used to convert to batch objects directly by the Graphics object.
     */
    updateBatches()
    {
        if (this.dirty === this.cacheDirty) return;
        if (this.graphicsData.length === 0)
        {
            this.batchable = true;

            return;
        }

        if (this.dirty !== this.cacheDirty)
        {
            for (let i = 0; i < this.graphicsData.length; i++)
            {
                const data = this.graphicsData[i];

                if (data.fillStyle && !data.fillStyle.texture.baseTexture.valid) return;
                if (data.lineStyle && !data.lineStyle.texture.baseTexture.valid) return;
            }
        }

        this.cacheDirty = this.dirty;

        const uvs = this.uvs;

        let batchPart = null;
        let currentTexture = null;
        let currentColor = 0;
        let currentNative = false;

        if (this.batches.length > 0)
        {
            batchPart = this.batches[this.batches.length - 1];

            const style = batchPart.style;

            currentTexture = style.texture.baseTexture;
            currentColor = style.color + style.alpha;
            currentNative = style.native;
        }

        for (let i = this.shapeIndex; i < this.graphicsData.length; i++)
        {
            this.shapeIndex++;

            const data = this.graphicsData[i];
            const command = fillCommands[data.type];

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

                if (!style.visible) continue;

                const nextTexture = style.texture.baseTexture;

                const index = this.indices.length;
                const attribIndex = this.points.length / 2;

                // close batch if style is different
                if (batchPart
                    && (currentTexture !== nextTexture
                    || currentColor !== (style.color + style.alpha)
                    || currentNative !== style.native))
                {
                    batchPart.size = index - batchPart.start;
                    batchPart.attribSize = attribIndex - batchPart.attribStart;

                    if (batchPart.size > 0)
                    {
                        batchPart = null;
                    }
                }
                // spawn new batch if its first batch or previous was closed
                if (!batchPart)
                {
                    batchPart = BATCH_POOL.pop() || new BatchPart();
                    this.batches.push(batchPart);
                    nextTexture.wrapMode = WRAP_MODES.REPEAT;
                    currentTexture = nextTexture;
                    currentColor = style.color + style.alpha;
                    currentNative = style.native;

                    batchPart.style = style;
                    batchPart.start = index;
                    batchPart.attribStart = attribIndex;
                }

                const start = this.points.length / 2;

                if (j === 0)
                {
                    if (data.holes.length)
                    {
                        this.processHoles(data.holes);

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

                    for (let i = 0; i < data.holes.length; i++)
                    {
                        buildLine(data.holes[i], this);
                    }
                }

                const size = (this.points.length / 2) - start;

                this.addUvs(this.points, uvs, style.texture, start, size, style.matrix);
            }
        }

        const index = this.indices.length;
        const attrib = this.points.length / 2;

        if (!batchPart)
        {
            // there are no visible styles in GraphicsData
            // its possible that someone wants Graphics just for the bounds
            this.batchable = true;

            return;
        }

        batchPart.size = index - batchPart.start;
        batchPart.attribSize = attrib - batchPart.attribStart;
        this.indicesUint16 = new Uint16Array(this.indices);

        // TODO make this a const..
        this.batchable = this.isBatchable();

        if (this.batchable)
        {
            this.batchDirty++;

            this.uvsFloat32 = new Float32Array(this.uvs);

            // offset the indices so that it works with the batcher...
            for (let i = 0; i < this.batches.length; i++)
            {
                const batch = this.batches[i];

                for (let j = 0; j < batch.size; j++)
                {
                    const index = batch.start + j;

                    this.indicesUint16[index] = this.indicesUint16[index] - batch.attribStart;
                }
            }
        }
        else
        {
            this.buildDrawCalls();
        }
    }

    /**
     * Checks to see if this graphics geometry can be batched.
     * Currently it needs to be small enough and not contain any native lines.
     * @protected
     */
    isBatchable()
    {
        const batches = this.batches;

        for (let i = 0; i < batches.length; i++)
        {
            if (batches[i].style.native)
            {
                return false;
            }
        }

        return (this.points.length < GraphicsGeometry.BATCHABLE_SIZE * 2);
    }

    /**
     * Converts intermediate batches data to drawCalls.
     * @protected
     */
    buildDrawCalls()
    {
        let TICK = ++BaseTexture._globalBatch;

        for (let i = 0; i < this.drawCalls.length; i++)
        {
            this.drawCalls[i].textures.length = 0;
            DRAW_CALL_POOL.push(this.drawCalls[i]);
        }

        this.drawCalls.length = 0;

        const uvs = this.uvs;
        const colors = this.colors;
        const textureIds = this.textureIds;

        let currentGroup =  DRAW_CALL_POOL.pop() || new BatchDrawCall();

        currentGroup.textureCount = 0;
        currentGroup.start = 0;
        currentGroup.size = 0;
        currentGroup.type = DRAW_MODES.TRIANGLES;

        let textureCount = 0;
        let currentTexture = null;
        let textureId = 0;
        let native = false;
        let drawMode = DRAW_MODES.TRIANGLES;

        let index = 0;

        this.drawCalls.push(currentGroup);

        // TODO - this can be simplified
        for (let i = 0; i < this.batches.length; i++)
        {
            const data = this.batches[i];

            // TODO add some full on MAX_TEXTURE CODE..
            const MAX_TEXTURES = 8;

            const style = data.style;

            const nextTexture = style.texture.baseTexture;

            if (native !== style.native)
            {
                native = style.native;
                drawMode = native ? DRAW_MODES.LINES : DRAW_MODES.TRIANGLES;

                // force the batch to break!
                currentTexture = null;
                textureCount = MAX_TEXTURES;
                TICK++;
            }

            if (currentTexture !== nextTexture)
            {
                currentTexture = nextTexture;

                if (nextTexture._batchEnabled !== TICK)
                {
                    if (textureCount === MAX_TEXTURES)
                    {
                        TICK++;

                        textureCount = 0;

                        if (currentGroup.size > 0)
                        {
                            currentGroup = DRAW_CALL_POOL.pop() || new BatchDrawCall();
                            this.drawCalls.push(currentGroup);
                        }

                        currentGroup.start = index;
                        currentGroup.size = 0;
                        currentGroup.textureCount = 0;
                        currentGroup.type = drawMode;
                    }

                    // TODO add this to the render part..
                    nextTexture.touched = 1;// touch;
                    nextTexture._batchEnabled = TICK;
                    nextTexture._id = textureCount;
                    nextTexture.wrapMode = 10497;

                    currentGroup.textures[currentGroup.textureCount++] = nextTexture;
                    textureCount++;
                }
            }

            currentGroup.size += data.size;
            index += data.size;

            textureId = nextTexture._id;

            this.addColors(colors, style.color, style.alpha, data.attribSize);
            this.addTextureIds(textureIds, textureId, data.attribSize);
        }

        BaseTexture._globalBatch = TICK;

        // upload..
        // merge for now!
        const verts = this.points;

        // verts are 2 positions.. so we * by 3 as there are 6 properties.. then 4 cos its bytes
        const glPoints = new ArrayBuffer(verts.length * 3 * 4);
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

            f32[p++] = textureIds[i];
        }

        this._buffer.update(glPoints);
        this._indexBuffer.update(this.indicesUint16);
    }

    /**
     * Process the holes data.
     *
     * @param {PIXI.GraphicsData[]} holes - Holes to render
     * @protected
     */
    processHoles(holes)
    {
        for (let i = 0; i < holes.length; i++)
        {
            const hole = holes[i];

            const command = fillCommands[hole.type];

            command.build(hole);

            if (hole.matrix)
            {
                this.transformPoints(hole.points, hole.matrix);
            }
        }
    }

    /**
     * Update the local bounds of the object. Expensive to use performance-wise.
     * @protected
     */
    calculateBounds()
    {
        let minX = Infinity;
        let maxX = -Infinity;

        let minY = Infinity;
        let maxY = -Infinity;

        if (this.graphicsData.length)
        {
            let shape = null;
            let x = 0;
            let y = 0;
            let w = 0;
            let h = 0;

            for (let i = 0; i < this.graphicsData.length; i++)
            {
                const data = this.graphicsData[i];

                const type = data.type;
                const lineWidth = data.lineStyle ? data.lineStyle.width : 0;

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

    /**
     * Transform points using matrix.
     *
     * @protected
     * @param {number[]} points - Points to transform
     * @param {PIXI.Matrix} matrix - Transform matrix
     */
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

    /**
     * Add colors.
     *
     * @protected
     * @param {number[]} colors - List of colors to add to
     * @param {number} color - Color to add
     * @param {number} alpha - Alpha to use
     * @param {number} size - Number of colors to add
     */
    addColors(colors, color, alpha, size)
    {
        // TODO use the premultiply bits Ivan added
        const rgb = (color >> 16) + (color & 0xff00) + ((color & 0xff) << 16);

        const rgba =  premultiplyTint(rgb, alpha);

        while (size-- > 0)
        {
            colors.push(rgba);
        }
    }

    /**
     * Add texture id that the shader/fragment wants to use.
     *
     * @protected
     * @param {number[]} textureIds
     * @param {number} id
     * @param {number} size
     */
    addTextureIds(textureIds, id, size)
    {
        while (size-- > 0)
        {
            textureIds.push(id);
        }
    }

    /**
     * Generates the UVs for a shape.
     *
     * @protected
     * @param {number[]} verts - Vertices
     * @param {number[]} uvs - UVs
     * @param {PIXI.Texture} texture - Reference to Texture
     * @param {number} start - Index buffer start index.
     * @param {number} size - The size/length for index buffer.
     * @param {PIXI.Matrix} [matrix] - Optional transform for all points.
     */
    addUvs(verts, uvs, texture, start, size, matrix)
    {
        let index = 0;
        const uvsStart = uvs.length;
        const frame = texture.frame;

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

            uvs.push(x / frame.width, y / frame.height);
        }

        const baseTexture = texture.baseTexture;

        if (frame.width < baseTexture.width
            || frame.height < baseTexture.height)
        {
            this.adjustUvs(uvs, texture, uvsStart, size);
        }
    }

    /**
     * Modify uvs array according to position of texture region
     * Does not work with rotated or trimmed textures
     * @param {number} uvs array
     * @param {PIXI.Texture} texture region
     * @param {number} start starting index for uvs
     * @param {number} size how many points to adjust
     */
    adjustUvs(uvs, texture, start, size)
    {
        const baseTexture = texture.baseTexture;
        const eps = 1e-6;
        const finish = start + (size * 2);
        const frame = texture.frame;
        const scaleX = frame.width / baseTexture.width;
        const scaleY = frame.height / baseTexture.height;
        let offsetX = frame.x / frame.width;
        let offsetY = frame.y / frame.height;
        let minX = Math.floor(uvs[start] + eps);
        let minY = Math.floor(uvs[start + 1] + eps);

        for (let i = start + 2; i < finish; i += 2)
        {
            minX = Math.min(minX, Math.floor(uvs[i] + eps));
            minY = Math.min(minY, Math.floor(uvs[i + 1] + eps));
        }
        offsetX -= minX;
        offsetY -= minY;
        for (let i = start; i < finish; i += 2)
        {
            uvs[i] = (uvs[i] + offsetX) * scaleX;
            uvs[i + 1] = (uvs[i + 1] + offsetY) * scaleY;
        }
    }
}

/**
 * The maximum number of points to consider an object "batchable",
 * able to be batched by the renderer's batch system.
 *
 * @memberof PIXI.GraphicsGeometry
 * @static
 * @member {number} BATCHABLE_SIZE
 * @default 100
 */
GraphicsGeometry.BATCHABLE_SIZE = 100;
