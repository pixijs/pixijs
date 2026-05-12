import { Circle } from '../../../../maths/shapes/Circle';
import { Ellipse } from '../../../../maths/shapes/Ellipse';
import { type Polygon } from '../../../../maths/shapes/Polygon';
import { type RoundedRectangle } from '../../../../maths/shapes/RoundedRectangle';
import { transformVertices } from '../../../../rendering/renderers/shared/geometry/utils/transformVertices';
import { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import { BigPool } from '../../../../utils/pool/PoolGroup';
import { closePointEps } from '../../../graphics/shared/const';
import { shapeBuilders } from '../../../graphics/shared/utils/buildContextBatches';
import { BatchableSmoothGraphics } from '../BatchableSmoothGraphics';
import { SmoothBuildData } from '../SmoothBuildData';
import { SmoothSegmentPacker } from '../SmoothSegmentPacker';
import { buildSmoothFill } from './buildSmoothFill';
import { buildSmoothLine } from './buildSmoothLine';
import { buildSmoothCircleFill, buildSmoothCircleLine, buildSmoothCirclePath } from './SmoothCircleBuilder';

import type { ConvertedFillStyle, ConvertedStrokeStyle } from '../../../graphics/shared/FillTypes';
import type { GraphicsContext } from '../../../graphics/shared/GraphicsContext';
import type { GpuSmoothGraphicsContext } from '../GpuSmoothGraphicsContext';

const packer = new SmoothSegmentPacker();
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
 * Builds smooth HHAA geometry data from a GraphicsContext's instructions.
 * Iterates fill/stroke instructions, generates SmoothBuildData, then packs
 * into 10-float-per-vertex geometry via SmoothSegmentPacker.
 *
 * Creates BatchableSmoothGraphics elements for each instruction.
 * @param context - The GraphicsContext with drawing instructions
 * @param gpuContext - Target GPU context to populate with batches
 * @category scene
 * @advanced
 */
export function buildSmoothContextData(
    context: GraphicsContext,
    gpuContext: GpuSmoothGraphicsContext,
): void
{
    const { batches } = gpuContext;

    batches.length = 0;

    const buildData = buildDataCache;

    buildData.clear();

    for (let i = 0; i < context.instructions.length; i++)
    {
        const instruction = context.instructions[i];

        if (instruction.action === 'texture')
        {
            continue;
        }

        if (instruction.action !== 'fill' && instruction.action !== 'stroke')
        {
            continue;
        }

        const isStroke = instruction.action === 'stroke';
        const shapePath = instruction.data.path.shapePath;
        const style = instruction.data.style;

        shapePath.shapePrimitives.forEach(({ shape, transform: matrix }) =>
        {
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

                    triangles = buildSmoothCircleFill(tcx, tcy, points, false, buildData);
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
                    triangles = buildSmoothFill(points, [], false, buildData);
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

            const jointStart = 0;
            const jointLen = buildData.joints.length;

            packer.updateBufferSize(jointStart, jointLen, triangles.length, buildData);

            if (buildData.vertexSize === 0)
            {
                return;
            }

            // Pack geometry
            const geomFloats = new Float32Array(buildData.vertexSize * 10);
            const geomIndices = buildData.indexSize > 65535
                ? new Uint32Array(buildData.indexSize)
                : new Uint16Array(buildData.indexSize);

            const [, finalIndexPos] = packer.packInterleavedGeometry(
                jointStart, jointLen, triangles,
                buildData, geomFloats, geomIndices, 0, 0,
            );

            // Create batchable element
            const batchable = BigPool.get(BatchableSmoothGraphics);

            batchable.geometryData = {
                vertices: geomFloats,
                indices: geomIndices,
            };

            batchable.indexOffset = 0;
            batchable.indexSize = finalIndexPos;
            batchable.attributeOffset = 0;
            batchable.attributeSize = buildData.vertexSize;

            if (isStroke)
            {
                const strokeStyle = style as ConvertedStrokeStyle;

                batchable.lineWidth = strokeStyle.width;
                batchable.alignment = strokeStyle.alignment;
                batchable.pixelLine = !!strokeStyle.pixelLine;
            }
            else
            {
                batchable.lineWidth = 0;
                batchable.alignment = 0.5;
                batchable.pixelLine = true;
            }

            batchable.baseColor = (style as ConvertedFillStyle).color;
            batchable.alpha = (style as ConvertedFillStyle).alpha;
            batchable.texture = (style as ConvertedFillStyle).texture ?? Texture.WHITE;

            batches.push(batchable);
        });
    }
}
