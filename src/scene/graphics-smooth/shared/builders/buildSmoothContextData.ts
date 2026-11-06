import { Matrix } from '../../../../maths/matrix/Matrix';
import { getOrientationOfPoints } from '../../../../maths/misc/getOrientationOfPoints';
import { Circle } from '../../../../maths/shapes/Circle';
import { Ellipse } from '../../../../maths/shapes/Ellipse';
import { transformVertices } from '../../../../rendering/renderers/shared/geometry/utils/transformVertices';
import { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { BigPool } from '../../../../utils/pool/PoolGroup';
import { closePointEps } from '../../../graphics/shared/const';
import { shapeBuilders } from '../../../graphics/shared/utils/buildContextBatches';
import { generateTextureMatrix } from '../../../graphics/shared/utils/generateTextureFillMatrix';
import { BatchableSmoothGraphics } from '../BatchableSmoothGraphics';
import { SmoothBuildData } from '../SmoothBuildData';
import { SmoothSegmentPacker } from '../SmoothSegmentPacker';
import { buildSmoothFill } from './buildSmoothFill';
import { buildSmoothLine } from './buildSmoothLine';
import { buildSmoothCircleFill, buildSmoothCircleLine, buildSmoothCirclePath } from './SmoothCircleBuilder';

import type { Polygon } from '../../../../maths/shapes/Polygon';
import type { RoundedRectangle } from '../../../../maths/shapes/RoundedRectangle';
import type { ConvertedFillStyle, ConvertedStrokeStyle } from '../../../graphics/shared/FillTypes';
import type { GraphicsContext, TextureInstruction } from '../../../graphics/shared/GraphicsContext';
import type { ShapePrimitiveWithHoles } from '../../../graphics/shared/path/ShapePath';

const packer = new SmoothSegmentPacker();
const tempMatrix = new Matrix();

const buildDataCache = new SmoothBuildData();

/**
 * Whether this shape type should use the custom smooth circle builder.
 * @param shapeType - The shape type string
 * @returns true if this shape needs the circle builder
 */
function usesCircleBuilder(shapeType: string): boolean
{
    return shapeType === 'circle' || shapeType === 'ellipse' || shapeType === 'roundedRectangle';
}

/**
 * Extract circle/ellipse/rrect parameters from a shape.
 * @param shape - The shape primitive
 * @returns [cx, cy, rx, ry, dx, dy]
 */
function getCircleParams(shape: Circle | Ellipse | RoundedRectangle): [number, number, number, number, number, number]
{
    if (shape instanceof Circle)
    {
        return [shape.x, shape.y, shape.radius, shape.radius, 0, 0];
    }

    if (shape instanceof Ellipse)
    {
        return [shape.x, shape.y, shape.halfWidth, shape.halfHeight, 0, 0];
    }

    // RoundedRectangle
    const rr = shape as RoundedRectangle;
    const halfWidth = rr.width / 2;
    const halfHeight = rr.height / 2;
    const r = Math.max(0, Math.min(rr.radius, Math.min(halfWidth, halfHeight)));

    return [rr.x + halfWidth, rr.y + halfHeight, r, r, halfWidth - r, halfHeight - r];
}

/**
 * Builds the smooth graphics batches of a context: one batchable element per shape of each
 * fill, stroke and texture instruction, with its geometry packed by {@link SmoothSegmentPacker}.
 * @param context - The GraphicsContext with drawing instructions
 * @param batches - Receives the batchable elements
 * @category scene
 * @internal
 */
export function buildSmoothContextData(
    context: GraphicsContext,
    batches: BatchableSmoothGraphics[],
): void
{
    batches.length = 0;

    for (let i = 0; i < context.instructions.length; i++)
    {
        const instruction = context.instructions[i];

        if (instruction.action === 'texture')
        {
            addTexture(instruction.data, batches);
            continue;
        }

        if (instruction.action !== 'fill' && instruction.action !== 'stroke')
        {
            continue;
        }

        const isStroke = instruction.action === 'stroke';
        const shapePath = instruction.data.path.shapePath;
        const style = instruction.data.style;
        const hole = instruction.data.hole;

        // same semantics as buildContextBatches: holes are cut from the last primitive,
        // and stroking a path with holes also strokes the outline of the holes
        if (isStroke && hole)
        {
            addShapePath(hole.shapePath.shapePrimitives, style, true, null, batches);
        }

        addShapePath(shapePath.shapePrimitives, style, isStroke, hole?.shapePath.shapePrimitives, batches);
    }
}

/**
 * Builds and packs the geometry of a list of shape primitives.
 * @param primitives - The shape primitives to build
 * @param style - Fill or stroke style
 * @param isStroke - Whether to build a stroke instead of a fill
 * @param holePrimitives - Holes to cut from the last primitive (fills only)
 * @param batches - Target array of batchable elements
 */
function addShapePath(
    primitives: ShapePrimitiveWithHoles[],
    style: ConvertedFillStyle | ConvertedStrokeStyle,
    isStroke: boolean,
    holePrimitives: ShapePrimitiveWithHoles[] | null | undefined,
    batches: BatchableSmoothGraphics[],
): void
{
    const buildData = buildDataCache;

    primitives.forEach(({ shape, transform: matrix }, index) =>
    {
        const holes = !isStroke && holePrimitives && index === primitives.length - 1
            ? getHoleArrays(holePrimitives)
            : null;
        const isCircleShape = usesCircleBuilder(shape.type);

        buildData.clear();

        let points: number[];
        let triangles: number[] = [];

        if (isCircleShape)
        {
            const [cx, cy, rx, ry, dx, dy] = getCircleParams(shape as Circle | Ellipse | RoundedRectangle);

            points = buildSmoothCirclePath(cx, cy, rx, ry, dx, dy);

            if (matrix)
            {
                transformVertices(points, matrix);
            }

            if (!isStroke)
            {
                const tcx = matrix ? (matrix.a * cx) + (matrix.c * cy) + matrix.tx : cx;
                const tcy = matrix ? (matrix.b * cx) + (matrix.d * cy) + matrix.ty : cy;

                triangles = holes
                    ? buildSmoothFill(points, holes, true, buildData)
                    : buildSmoothCircleFill(tcx, tcy, points, true, buildData);
            }
            else
            {
                buildSmoothCircleLine(points, buildData);
            }
        }
        else
        {
            points = [];

            const build = shapeBuilders[shape.type];

            if (!build || !build.build(shape, points))
            {
                return;
            }

            if (matrix)
            {
                transformVertices(points, matrix);
            }

            if (!isStroke)
            {
                triangles = buildSmoothFill(points, holes ?? [], true, buildData);
            }
            else
            {
                const strokeStyle = style as ConvertedStrokeStyle;
                const closed = (shape as Polygon).closePath ?? true;

                // Deduplicate and clean points for line building
                const eps = closePointEps;
                const cleanPoints: number[] = [points[0], points[1]];

                for (let k = 2; k < points.length; k += 2)
                {
                    const px = points[k - 2];
                    const py = points[k - 1];
                    const cx2 = points[k];
                    const cy2 = points[k + 1];

                    if (Math.abs(px - cx2) >= eps || Math.abs(py - cy2) >= eps)
                    {
                        cleanPoints.push(cx2, cy2);
                    }
                }

                if (cleanPoints.length <= 2)
                {
                    return;
                }

                // Remove collinear points
                const finalPoints: number[] = [cleanPoints[0], cleanPoints[1]];
                const eps2 = eps * eps;

                for (let k = 2; k + 2 < cleanPoints.length; k += 2)
                {
                    const dx1 = cleanPoints[k - 2] - cleanPoints[k];
                    const dy1 = cleanPoints[k - 1] - cleanPoints[k + 1];
                    const dx2 = cleanPoints[k + 2] - cleanPoints[k];
                    const dy2 = cleanPoints[k + 3] - cleanPoints[k + 1];

                    if (Math.abs((dx2 * dy1) - (dy2 * dx1)) < eps2)
                    {
                        if ((dx1 * dx2) + (dy1 * dy2) < -eps2)
                        {
                            continue;
                        }
                    }

                    finalPoints.push(cleanPoints[k], cleanPoints[k + 1]);
                }

                finalPoints.push(cleanPoints[cleanPoints.length - 2], cleanPoints[cleanPoints.length - 1]);

                if (finalPoints.length <= 2)
                {
                    return;
                }

                if (closed)
                {
                    const fx = finalPoints[0];
                    const fy = finalPoints[1];
                    const lx = finalPoints[finalPoints.length - 2];
                    const ly = finalPoints[finalPoints.length - 1];

                    if (Math.abs(fx - lx) < eps && Math.abs(fy - ly) < eps)
                    {
                        finalPoints.pop();
                        finalPoints.pop();
                    }
                }

                buildSmoothLine(finalPoints, closed, strokeStyle.join, strokeStyle.cap, buildData);
            }
        }

        const batchable = packBatchable(buildData, triangles);

        if (!batchable)
        {
            return;
        }

        if (isStroke)
        {
            const strokeStyle = style as ConvertedStrokeStyle;

            batchable.lineWidth = strokeStyle.width;
            let alignment = strokeStyle.alignment;

            // same as buildLine: make alignment independent of the winding direction (1 = inner, 0 = outer)
            if (alignment !== 0.5)
            {
                alignment = ((alignment - 0.5) * getOrientationOfPoints(points)) + 0.5;
            }

            batchable.alignment = alignment;
            batchable.pixelLine = !!strokeStyle.pixelLine;
        }
        else
        {
            batchable.lineWidth = 0;
            batchable.alignment = 0.5;
            batchable.pixelLine = true;
        }

        batchable.baseColor = style.color;
        batchable.alpha = style.alpha;
        setTexture(
            batchable,
            style.texture ?? Texture.WHITE,
            () => generateTextureMatrix(new Matrix(), style, shape, matrix),
        );

        batches.push(batchable);
    });
}

/**
 * Builds a textured rectangle for a `graphics.texture()` instruction.
 * @param data - The texture instruction data
 * @param batches - Target array of batchable elements
 */
function addTexture(data: TextureInstruction['data'], batches: BatchableSmoothGraphics[]): void
{
    const { image: texture, dx, dy, dw, dh, transform } = data;
    const buildData = buildDataCache;
    const points = [dx, dy, dx + dw, dy, dx + dw, dy + dh, dx, dy + dh];

    if (transform)
    {
        transformVertices(points, transform);
    }

    buildData.clear();

    const triangles = buildSmoothFill(points, [], true, buildData);
    const batchable = packBatchable(buildData, triangles);

    if (!batchable)
    {
        return;
    }

    batchable.lineWidth = 0;
    batchable.alignment = 0.5;
    batchable.pixelLine = true;
    batchable.baseColor = data.style;
    batchable.alpha = data.alpha;
    setTexture(batchable, texture, () =>
    {
        // maps the destination rectangle to the texture frame (texture.uvs also handles rotated frames)
        const { x0, y0, x1, y1, x3, y3 } = texture.uvs;
        const uvMatrix = new Matrix(
            (x1 - x0) / dw,
            (y1 - y0) / dw,
            (x3 - x0) / dh,
            (y3 - y0) / dh,
        );

        uvMatrix.tx = x0 - (dx * uvMatrix.a) - (dy * uvMatrix.c);
        uvMatrix.ty = y0 - (dx * uvMatrix.b) - (dy * uvMatrix.d);

        if (transform)
        {
            uvMatrix.append(tempMatrix.copyFrom(transform).invert());
        }

        return uvMatrix;
    });

    batches.push(batchable);
}

/**
 * Packs the build data into a new batchable element (style properties are left to the caller).
 * @param buildData - The build data with joints and vertices
 * @param triangles - Earcut triangle indices for FILL joints
 * @returns the batchable element, or null if there's nothing to draw
 */
function packBatchable(buildData: SmoothBuildData, triangles: number[]): BatchableSmoothGraphics | null
{
    const jointStart = 0;
    const jointLen = buildData.joints.length;

    packer.updateBufferSize(jointStart, jointLen, triangles.length, buildData);

    if (buildData.vertexSize === 0)
    {
        return null;
    }

    const geomFloats = new Float32Array(buildData.vertexSize * 10);
    const geomIndices = buildData.indexSize > 65535
        ? new Uint32Array(buildData.indexSize)
        : new Uint16Array(buildData.indexSize);

    const [, finalIndexPos] = packer.packInterleavedGeometry(
        jointStart, jointLen, triangles,
        buildData, geomFloats, geomIndices, 0, 0,
    );

    const batchable = BigPool.get(BatchableSmoothGraphics);

    batchable.geometryData = {
        vertices: geomFloats,
        indices: geomIndices,
    };

    batchable.indexOffset = 0;
    batchable.indexSize = finalIndexPos;
    batchable.attributeOffset = 0;
    batchable.attributeSize = buildData.vertexSize;

    return batchable;
}

/**
 * Sets the texture of a batchable element, routing textured elements to the 'smoothTextured' batcher.
 * @param batchable - The batchable element
 * @param texture - The texture, Texture.WHITE for plain colors
 * @param getUvMatrix - Creates the matrix that maps local coordinates to texture coordinates
 */
function setTexture(batchable: BatchableSmoothGraphics, texture: Texture, getUvMatrix: () => Matrix): void
{
    batchable.texture = texture;

    if (texture === Texture.WHITE)
    {
        batchable.batcherName = 'smooth';
        batchable.uvMatrix = null;
    }
    else
    {
        batchable.batcherName = 'smoothTextured';
        batchable.uvMatrix = getUvMatrix();
    }
}

/**
 * Builds the outline points of hole primitives, applying their transforms.
 * @param holePrimitives - The hole primitives
 * @returns flat [x,y,...] arrays, one per hole
 */
function getHoleArrays(holePrimitives: ShapePrimitiveWithHoles[]): number[][]
{
    const holeArrays: number[][] = [];

    for (let k = 0; k < holePrimitives.length; k++)
    {
        const { shape, transform } = holePrimitives[k];
        const holePoints: number[] = [];

        if (shapeBuilders[shape.type].build(shape, holePoints))
        {
            if (transform)
            {
                transformVertices(holePoints, transform);
            }
            holeArrays.push(holePoints);
        }
    }

    return holeArrays;
}
