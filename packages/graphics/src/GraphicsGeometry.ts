import {
    buildLine,
    buildPoly,
    BatchPart,
    FILL_COMMANDS,
    BATCH_POOL,
    DRAW_CALL_POOL,
} from './utils';

import {
    BatchGeometry,
    BatchDrawCall,
    BatchTextureArray,
    BaseTexture,
    Texture,
} from '@pixi/core';

import { DRAW_MODES, WRAP_MODES } from '@pixi/constants';
import { SHAPES, Point, Matrix } from '@pixi/math';
import { GraphicsData } from './GraphicsData';
import { premultiplyTint } from '@pixi/utils';
import { Bounds } from '@pixi/display';

import type { Circle, Ellipse, Polygon, Rectangle, RoundedRectangle } from '@pixi/math';
import type { FillStyle } from './styles/FillStyle';
import type { LineStyle } from './styles/LineStyle';

/**
 * @description Complex shape type
 * @todo Move to Math shapes
 */
type IShape = Circle | Ellipse | Polygon | Rectangle | RoundedRectangle;

const tmpPoint = new Point();
const tmpBounds = new Bounds();

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
    /**
     * The maximum number of points to consider an object "batchable",
     * able to be batched by the renderer's batch system.
     *
     * @memberof PIXI.GraphicsGeometry
     * @static
     * @member {number} BATCHABLE_SIZE
     * @default 100
     */
    public static BATCHABLE_SIZE = 100;

    public closePointEps: number;
    public boundsPadding: number;

    uvsFloat32: Float32Array = null;
    indicesUint16: Uint16Array | Uint32Array = null;
    batchable: boolean;
    points: Array<number>;
    colors: Array<number>;
    uvs: Array<number>;
    indices: Array<number>;
    textureIds: Array<number>;
    graphicsData: Array<GraphicsData>;
    drawCalls: Array<BatchDrawCall>;
    batchDirty: number;
    batches: Array<BatchPart>;

    protected dirty: number;
    protected cacheDirty: number;
    protected clearDirty: number;
    protected shapeIndex: number;
    protected _bounds: Bounds;
    protected boundsDirty: number;

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
         * @member {PIXI.graphicsUtils.BatchPart[]}
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

        /**
         * Minimal distance between points that are considered different.
         * Affects line tesselation.
         *
         * @member {number}
         */
        this.closePointEps = 1e-4;
    }

    /**
     * Get the current bounds of the graphic geometry.
     *
     * @member {PIXI.Bounds}
     * @readonly
     */
    public get bounds(): Bounds
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
    protected invalidate(): void
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
            this.drawCalls[i].texArray.clear();
            DRAW_CALL_POOL.push(this.drawCalls[i]);
        }

        this.drawCalls.length = 0;

        for (let i = 0; i < this.batches.length; i++)
        {
            const batchPart = this.batches[i];

            batchPart.reset();
            BATCH_POOL.push(batchPart);
        }

        this.batches.length = 0;
    }

    /**
     * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
     *
     * @return {PIXI.GraphicsGeometry} This GraphicsGeometry object. Good for chaining method calls
     */
    public clear(): GraphicsGeometry
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
    public drawShape(
        shape: IShape,
        fillStyle: FillStyle = null,
        lineStyle: LineStyle = null,
        matrix: Matrix = null): GraphicsGeometry
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
    public drawHole(shape: IShape, matrix: Matrix = null): GraphicsGeometry
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
     * Destroys the GraphicsGeometry object.
     *
     */
    public destroy(): void
    {
        super.destroy();

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
    public containsPoint(point: Point): boolean
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
                if (data.matrix)
                {
                    data.matrix.applyInverse(point, tmpPoint);
                }
                else
                {
                    tmpPoint.copyFrom(point);
                }

                if (data.shape.contains(tmpPoint.x, tmpPoint.y))
                {
                    let hitHole = false;

                    if (data.holes)
                    {
                        for (let i = 0; i < data.holes.length; i++)
                        {
                            const hole = data.holes[i];

                            if (hole.shape.contains(tmpPoint.x, tmpPoint.y))
                            {
                                hitHole = true;
                                break;
                            }
                        }
                    }

                    if (!hitHole)
                    {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Generates intermediate batch data. Either gets converted to drawCalls
     * or used to convert to batch objects directly by the Graphics object.
     *
     * @param {boolean} [aloow32Indices] - Allow using 32-bit indices for preventings artefacts when more that 65535 vertices
     */
    updateBatches(allow32Indices?: boolean): void
    {
        if (!this.graphicsData.length)
        {
            this.batchable = true;

            return;
        }

        if (!this.validateBatching())
        {
            return;
        }

        this.cacheDirty = this.dirty;

        const uvs = this.uvs;
        const graphicsData = this.graphicsData;

        let batchPart: BatchPart = null;

        let currentStyle = null;

        if (this.batches.length > 0)
        {
            batchPart = this.batches[this.batches.length - 1];
            currentStyle = batchPart.style;
        }

        for (let i = this.shapeIndex; i < graphicsData.length; i++)
        {
            this.shapeIndex++;

            const data = graphicsData[i];
            const fillStyle = data.fillStyle;
            const lineStyle = data.lineStyle;
            const command = FILL_COMMANDS[data.type];

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

                nextTexture.wrapMode = WRAP_MODES.REPEAT;

                if (j === 0)
                {
                    this.processFill(data);
                }
                else
                {
                    this.processLine(data);
                }

                const size = (this.points.length / 2) - attribIndex;

                if (size === 0) continue;
                // close batch if style is different
                if (batchPart && !this._compareStyles(currentStyle, style))
                {
                    batchPart.end(index, attribIndex);
                    batchPart = null;
                }
                // spawn new batch if its first batch or previous was closed
                if (!batchPart)
                {
                    batchPart = BATCH_POOL.pop() || new BatchPart();
                    batchPart.begin(style, index, attribIndex);
                    this.batches.push(batchPart);
                    currentStyle = style;
                }

                this.addUvs(this.points, uvs, style.texture, attribIndex, size, style.matrix);
            }
        }

        const index = this.indices.length;
        const attrib = this.points.length / 2;

        if (batchPart)
        {
            batchPart.end(index, attrib);
        }

        if (this.batches.length === 0)
        {
            // there are no visible styles in GraphicsData
            // its possible that someone wants Graphics just for the bounds
            this.batchable = true;

            return;
        }

        // prevent allocation when length is same as buffer
        if (this.indicesUint16 && this.indices.length === this.indicesUint16.length)
        {
            this.indicesUint16.set(this.indices);
        }
        else
        {
            const need32
                = attrib > 0xffff && allow32Indices;

            this.indicesUint16 = need32 ? new Uint32Array(this.indices) : new Uint16Array(this.indices);
        }

        // TODO make this a const..
        this.batchable = this.isBatchable();

        if (this.batchable)
        {
            this.packBatches();
        }
        else
        {
            this.buildDrawCalls();
        }
    }

    /**
     * Affinity check
     *
     * @param {PIXI.FillStyle | PIXI.LineStyle} styleA
     * @param {PIXI.FillStyle | PIXI.LineStyle} styleB
     */
    protected _compareStyles(styleA: FillStyle | LineStyle, styleB: FillStyle | LineStyle): boolean
    {
        if (!styleA || !styleB)
        {
            return false;
        }

        if (styleA.texture.baseTexture !== styleB.texture.baseTexture)
        {
            return false;
        }

        if (styleA.color + styleA.alpha !== styleB.color + styleB.alpha)
        {
            return false;
        }

        if (!!(styleA as LineStyle).native !== !!(styleB as LineStyle).native)
        {
            return false;
        }

        return true;
    }

    /**
     * Test geometry for batching process.
     *
     * @protected
     */
    protected validateBatching(): boolean
    {
        if (this.dirty === this.cacheDirty || !this.graphicsData.length)
        {
            return false;
        }

        for (let i = 0, l = this.graphicsData.length; i < l; i++)
        {
            const data = this.graphicsData[i];
            const fill = data.fillStyle;
            const line = data.lineStyle;

            if (fill && !fill.texture.baseTexture.valid) return false;
            if (line && !line.texture.baseTexture.valid) return false;
        }

        return true;
    }

    /**
     * Offset the indices so that it works with the batcher.
     *
     * @protected
     */
    protected packBatches(): void
    {
        this.batchDirty++;
        this.uvsFloat32 = new Float32Array(this.uvs);

        const batches = this.batches;

        for (let i = 0, l = batches.length; i < l; i++)
        {
            const batch = batches[i];

            for (let j = 0; j < batch.size; j++)
            {
                const index = batch.start + j;

                this.indicesUint16[index] = this.indicesUint16[index] - batch.attribStart;
            }
        }
    }

    /**
     * Checks to see if this graphics geometry can be batched.
     * Currently it needs to be small enough and not contain any native lines.
     *
     * @protected
     */
    protected isBatchable(): boolean
    {
        // prevent heavy mesh batching
        if (this.points.length > 0xffff * 2)
        {
            return false;
        }

        const batches = this.batches;

        for (let i = 0; i < batches.length; i++)
        {
            if ((batches[i].style as LineStyle).native)
            {
                return false;
            }
        }

        return (this.points.length < GraphicsGeometry.BATCHABLE_SIZE * 2);
    }

    /**
     * Converts intermediate batches data to drawCalls.
     *
     * @protected
     */
    protected buildDrawCalls(): void
    {
        let TICK = ++BaseTexture._globalBatch;

        for (let i = 0; i < this.drawCalls.length; i++)
        {
            this.drawCalls[i].texArray.clear();
            DRAW_CALL_POOL.push(this.drawCalls[i]);
        }

        this.drawCalls.length = 0;

        const colors = this.colors;
        const textureIds = this.textureIds;

        let currentGroup: BatchDrawCall =  DRAW_CALL_POOL.pop();

        if (!currentGroup)
        {
            currentGroup = new BatchDrawCall();
            currentGroup.texArray = new BatchTextureArray();
        }
        currentGroup.texArray.count = 0;
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

            // Forced cast for checking `native` without errors
            const style = data.style as LineStyle;

            const nextTexture = style.texture.baseTexture;

            if (native !== !!style.native)
            {
                native = !!style.native;
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
                            currentGroup = DRAW_CALL_POOL.pop();
                            if (!currentGroup)
                            {
                                currentGroup = new BatchDrawCall();
                                currentGroup.texArray = new BatchTextureArray();
                            }
                            this.drawCalls.push(currentGroup);
                        }

                        currentGroup.start = index;
                        currentGroup.size = 0;
                        currentGroup.texArray.count = 0;
                        currentGroup.type = drawMode;
                    }

                    // TODO add this to the render part..
                    // Hack! Because texture has protected `touched`
                    nextTexture.touched = 1;// touch;

                    nextTexture._batchEnabled = TICK;
                    nextTexture._batchLocation = textureCount;
                    nextTexture.wrapMode = 10497;

                    currentGroup.texArray.elements[currentGroup.texArray.count++] = nextTexture;
                    textureCount++;
                }
            }

            currentGroup.size += data.size;
            index += data.size;

            textureId = nextTexture._batchLocation;

            this.addColors(colors, style.color, style.alpha, data.attribSize);
            this.addTextureIds(textureIds, textureId, data.attribSize);
        }

        BaseTexture._globalBatch = TICK;

        // upload..
        // merge for now!
        this.packAttributes();
    }

    /**
     * Packs attributes to single buffer.
     *
     * @protected
     */
    protected packAttributes(): void
    {
        const verts = this.points;
        const uvs = this.uvs;
        const colors = this.colors;
        const textureIds = this.textureIds;

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
     * Process fill part of Graphics.
     *
     * @param {PIXI.GraphicsData} data
     * @protected
     */
    protected processFill(data: GraphicsData): void
    {
        if (data.holes.length)
        {
            this.processHoles(data.holes);

            buildPoly.triangulate(data, this);
        }
        else
        {
            const command = FILL_COMMANDS[data.type];

            command.triangulate(data, this);
        }
    }

    /**
     * Process line part of Graphics.
     *
     * @param {PIXI.GraphicsData} data
     * @protected
     */
    protected processLine(data: GraphicsData): void
    {
        buildLine(data, this);

        for (let i = 0; i < data.holes.length; i++)
        {
            buildLine(data.holes[i], this);
        }
    }

    /**
     * Process the holes data.
     *
     * @param {PIXI.GraphicsData[]} holes - Holes to render
     * @protected
     */
    protected processHoles(holes: Array<GraphicsData>): void
    {
        for (let i = 0; i < holes.length; i++)
        {
            const hole = holes[i];
            const command = FILL_COMMANDS[hole.type];

            command.build(hole);

            if (hole.matrix)
            {
                this.transformPoints(hole.points, hole.matrix);
            }
        }
    }

    /**
     * Update the local bounds of the object. Expensive to use performance-wise.
     *
     * @protected
     */
    protected calculateBounds(): void
    {
        const bounds = this._bounds;
        const sequenceBounds = tmpBounds;
        let curMatrix = Matrix.IDENTITY;

        this._bounds.clear();
        sequenceBounds.clear();

        for (let i = 0; i < this.graphicsData.length; i++)
        {
            const data = this.graphicsData[i];
            const shape = data.shape;
            const type = data.type;
            const lineStyle = data.lineStyle;
            const nextMatrix = data.matrix || Matrix.IDENTITY;
            let lineWidth = 0.0;

            if (lineStyle && lineStyle.visible)
            {
                const alignment = lineStyle.alignment;

                lineWidth = lineStyle.width;

                if (type === SHAPES.POLY)
                {
                    lineWidth = lineWidth * (0.5 + Math.abs(0.5 - alignment));
                }
                else
                {
                    lineWidth = lineWidth * Math.max(0, alignment);
                }
            }

            if (curMatrix !== nextMatrix)
            {
                if (!sequenceBounds.isEmpty())
                {
                    bounds.addBoundsMatrix(sequenceBounds, curMatrix);
                    sequenceBounds.clear();
                }
                curMatrix = nextMatrix;
            }

            if (type === SHAPES.RECT || type === SHAPES.RREC)
            {
                const rect = shape as Rectangle | RoundedRectangle;

                sequenceBounds.addFramePad(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height,
                    lineWidth, lineWidth);
            }
            else if (type === SHAPES.CIRC)
            {
                const circle = shape as Circle;

                sequenceBounds.addFramePad(circle.x, circle.y, circle.x, circle.y,
                    circle.radius + lineWidth, circle.radius + lineWidth);
            }
            else if (type === SHAPES.ELIP)
            {
                const ellipse = shape as Ellipse;

                sequenceBounds.addFramePad(ellipse.x, ellipse.y, ellipse.x, ellipse.y,
                    ellipse.width + lineWidth, ellipse.height + lineWidth);
            }
            else
            {
                const poly = shape as Polygon;
                // adding directly to the bounds

                bounds.addVerticesMatrix(curMatrix, (poly.points as any), 0, poly.points.length, lineWidth, lineWidth);
            }
        }

        if (!sequenceBounds.isEmpty())
        {
            bounds.addBoundsMatrix(sequenceBounds, curMatrix);
        }

        bounds.pad(this.boundsPadding, this.boundsPadding);
    }

    /**
     * Transform points using matrix.
     *
     * @protected
     * @param {number[]} points - Points to transform
     * @param {PIXI.Matrix} matrix - Transform matrix
     */
    protected transformPoints(points: Array<number>, matrix: Matrix): void
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
    protected addColors(colors: Array<number>, color: number, alpha: number, size: number): void
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
    protected addTextureIds(textureIds: Array<number>, id: number, size: number): void
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
    protected addUvs(
        verts: Array<number>,
        uvs: Array<number>,
        texture: Texture,
        start: number, size:
        number, matrix:
        Matrix = null): void
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
     *
     * @param {number[]} uvs array
     * @param {PIXI.Texture} texture region
     * @param {number} start starting index for uvs
     * @param {number} size how many points to adjust
     */
    protected adjustUvs(uvs: Array<number>, texture: Texture, start: number, size: number): void
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
