import { ExtensionType } from '../../../extensions/Extensions';
import { groupD8 } from '../../../maths/matrix/groupD8';
import { Matrix } from '../../../maths/matrix/Matrix';
import { canvasUtils } from '../../../rendering/renderers/canvas/utils/canvasUtils';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { bgr2rgb } from '../../container/container-mixins/getGlobalMixin';
import { multiplyHexColors } from '../../container/utils/multiplyHexColors';
import { buildLine } from '../shared/buildCommands/buildLine';
import { FillGradient } from '../shared/fill/FillGradient';
import { FillPattern } from '../shared/fill/FillPattern';
import { shapeBuilders } from '../shared/utils/buildContextBatches';
import { generateTextureMatrix as generateTextureFillMatrix } from '../shared/utils/generateTextureFillMatrix';

import type { ShapePrimitive } from '../../../maths/shapes/ShapePrimitive';
import type { CrossPlatformCanvasRenderingContext2D } from '../../../rendering/renderers/canvas/CanvasContextSystem';
import type { CanvasRenderer } from '../../../rendering/renderers/canvas/CanvasRenderer';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Renderer } from '../../../rendering/renderers/types';
import type { ConvertedFillStyle, ConvertedStrokeStyle } from '../shared/FillTypes';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsAdaptor, GraphicsPipeLike } from '../shared/GraphicsPipe';
import type { ShapePrimitiveWithHoles } from '../shared/path/ShapePath';

const emptyCanvasStyle = '#808080';
const tempMatrix = new Matrix();
const tempTextureMatrix = new Matrix();
const tempGradientMatrix = new Matrix();
const tempPatternMatrix = new Matrix();

function fillTriangles(
    context: CrossPlatformCanvasRenderingContext2D,
    vertices: number[],
    indices: number[]
): void
{
    context.beginPath();

    for (let i = 0; i < indices.length; i += 3)
    {
        const i0 = indices[i] * 2;
        const i1 = indices[i + 1] * 2;
        const i2 = indices[i + 2] * 2;

        context.moveTo(vertices[i0], vertices[i0 + 1]);
        context.lineTo(vertices[i1], vertices[i1 + 1]);
        context.lineTo(vertices[i2], vertices[i2 + 1]);
        context.closePath();
    }

    context.fill();
}

function colorToHex(color: number): string
{
    const clamped = color & 0xFFFFFF;

    return `#${clamped.toString(16).padStart(6, '0')}`;
}

function buildRoundedRectPath(
    context: CrossPlatformCanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
): void
{
    radius = Math.max(0, Math.min(radius, Math.min(width, height) / 2));

    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
}

function buildShapePath(context: CrossPlatformCanvasRenderingContext2D, shape: ShapePrimitive): void
{
    switch (shape.type)
    {
        case 'rectangle':
        {
            const rect = shape as typeof shape & { width: number; height: number };

            context.rect(rect.x, rect.y, rect.width, rect.height);
            break;
        }
        case 'roundedRectangle':
        {
            const rect = shape as typeof shape & { width: number; height: number; radius: number };

            buildRoundedRectPath(context, rect.x, rect.y, rect.width, rect.height, rect.radius);
            break;
        }
        case 'circle':
        {
            const circle = shape as typeof shape & { radius: number };

            context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            break;
        }
        case 'ellipse':
        {
            const ellipse = shape as typeof shape & { halfWidth: number; halfHeight: number };

            if (context.ellipse)
            {
                context.ellipse(ellipse.x, ellipse.y, ellipse.halfWidth, ellipse.halfHeight, 0, 0, Math.PI * 2);
            }
            else
            {
                context.save();
                context.translate(ellipse.x, ellipse.y);
                context.scale(ellipse.halfWidth, ellipse.halfHeight);
                context.arc(0, 0, 1, 0, Math.PI * 2);
                context.restore();
            }
            break;
        }
        case 'triangle':
        {
            const tri = shape as typeof shape & { x2: number; y2: number; x3: number; y3: number };

            context.moveTo(tri.x, tri.y);
            context.lineTo(tri.x2, tri.y2);
            context.lineTo(tri.x3, tri.y3);
            context.closePath();
            break;
        }
        case 'polygon':
        default:
        {
            const poly = shape as typeof shape & { points: number[]; closePath: boolean };
            const points = poly.points;

            if (!points?.length) break;

            context.moveTo(points[0], points[1]);

            for (let i = 2; i < points.length; i += 2)
            {
                context.lineTo(points[i], points[i + 1]);
            }

            if (poly.closePath)
            {
                context.closePath();
            }
            break;
        }
    }
}

function addHolePaths(context: CrossPlatformCanvasRenderingContext2D, holes?: ShapePrimitiveWithHoles[]): boolean
{
    if (!holes?.length) return false;

    for (let i = 0; i < holes.length; i++)
    {
        const hole = holes[i];

        if (!hole?.shape) continue;

        const transform = hole.transform;
        const hasTransform = transform && !transform.isIdentity();

        if (hasTransform)
        {
            context.save();
            context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        }

        buildShapePath(context, hole.shape);

        if (hasTransform)
        {
            context.restore();
        }
    }

    return true;
}

function getCanvasStyle(
    style: ConvertedFillStyle,
    tint: number,
    textureMatrix?: Matrix,
    currentTransform?: Matrix
): string | CanvasPattern | CanvasGradient
{
    const fill = style.fill;

    if (fill instanceof FillGradient)
    {
        fill.buildGradient();

        const gradientTexture = fill.texture;

        if (gradientTexture)
        {
            const pattern = canvasUtils.getTintedPattern(gradientTexture, tint);
            const patternMatrix = textureMatrix
                ? tempPatternMatrix
                    .copyFrom(textureMatrix)
                    .scale(gradientTexture.source.pixelWidth, gradientTexture.source.pixelHeight)
                : tempPatternMatrix.copyFrom(fill.transform);

            if (currentTransform && !style.textureSpace)
            {
                patternMatrix.append(currentTransform);
            }

            canvasUtils.applyPatternTransform(pattern, patternMatrix);

            return pattern;
        }
    }

    if (fill instanceof FillPattern)
    {
        const pattern = canvasUtils.getTintedPattern(fill.texture, tint);

        canvasUtils.applyPatternTransform(pattern, fill.transform);

        return pattern;
    }

    const texture = style.texture;

    if (texture && texture !== Texture.WHITE)
    {
        if (!texture.source.resource)
        {
            return emptyCanvasStyle;
        }

        const pattern = canvasUtils.getTintedPattern(texture, tint);
        const patternMatrix = textureMatrix
            ? tempPatternMatrix
                .copyFrom(textureMatrix)
                .scale(texture.source.pixelWidth, texture.source.pixelHeight)
            : style.matrix;

        canvasUtils.applyPatternTransform(pattern, patternMatrix);

        return pattern;
    }

    return colorToHex(tint);
}

/**
 * A GraphicsAdaptor that uses Canvas2D to render graphics.
 * @category rendering
 * @ignore
 */
export class CanvasGraphicsAdaptor implements GraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasPipesAdaptor,
        ],
        name: 'graphics',
    } as const;

    public shader: Shader = null;

    public contextChange(renderer: Renderer): void
    {
        void renderer;
    }

    public execute(graphicsPipe: GraphicsPipeLike, renderable: Graphics): void
    {
        const renderer = graphicsPipe.renderer as CanvasRenderer;
        const contextSystem = renderer.canvasContext;
        const context = contextSystem.activeContext;
        const baseTransform = renderable.groupTransform;

        const globalColor = renderer.globalUniforms.globalUniformData?.worldColor ?? 0xFFFFFFFF;
        const groupColorAlpha = renderable.groupColorAlpha;

        const globalAlpha = ((globalColor >>> 24) & 0xFF) / 255;
        const groupAlphaValue = ((groupColorAlpha >>> 24) & 0xFF) / 255;

        const filterAlpha = (renderer.filter as { alphaMultiplier?: number } | null)?.alphaMultiplier ?? 1;
        const groupAlpha = globalAlpha * groupAlphaValue * filterAlpha;

        if (groupAlpha <= 0) return;

        const globalTint = globalColor & 0xFFFFFF;
        const groupTintBGR = groupColorAlpha & 0xFFFFFF;

        const groupTint = bgr2rgb(multiplyHexColors(groupTintBGR, globalTint));

        const roundPixels = (renderer._roundPixels | renderable._roundPixels) as 0 | 1;

        context.save();

        contextSystem.setContextTransform(baseTransform, roundPixels === 1);
        contextSystem.setBlendMode(renderable.groupBlendMode);

        const instructions = renderable.context.instructions;

        for (let i = 0; i < instructions.length; i++)
        {
            const instruction = instructions[i];

            if (instruction.action === 'texture')
            {
                const data = instruction.data;
                const texture = data.image;
                const source = texture ? canvasUtils.getCanvasSource(texture) : null;

                if (!source) continue;

                const alpha = data.alpha * groupAlpha;

                if (alpha <= 0) continue;

                const tint = multiplyHexColors(data.style, groupTint);

                context.globalAlpha = alpha;

                let drawSource: CanvasImageSource = source;

                if (tint !== 0xFFFFFF)
                {
                    drawSource = canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource;
                }

                const frame = texture.frame;
                const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;

                let sx = frame.x * resolution;
                let sy = frame.y * resolution;
                const sw = frame.width * resolution;
                const sh = frame.height * resolution;

                if (drawSource !== source)
                {
                    sx = 0;
                    sy = 0;
                }

                const transform = data.transform;
                const hasTransform = transform && !transform.isIdentity();
                const rotate = texture.rotate;

                if (hasTransform || rotate)
                {
                    tempMatrix.copyFrom(baseTransform);

                    if (hasTransform)
                    {
                        tempMatrix.append(transform);
                    }

                    if (rotate)
                    {
                        groupD8.matrixAppendRotationInv(tempMatrix, rotate, data.dx, data.dy, data.dw, data.dh);
                    }

                    contextSystem.setContextTransform(tempMatrix, roundPixels === 1);
                }
                else
                {
                    contextSystem.setContextTransform(baseTransform, roundPixels === 1);
                }

                context.drawImage(
                    drawSource,
                    sx,
                    sy,
                    drawSource === source ? sw : (drawSource as any).width,
                    drawSource === source ? sh : (drawSource as any).height,
                    rotate ? 0 : data.dx,
                    rotate ? 0 : data.dy,
                    data.dw,
                    data.dh
                );

                if (hasTransform || rotate)
                {
                    contextSystem.setContextTransform(baseTransform, roundPixels === 1);
                }

                continue;
            }

            const data = instruction.data;
            const shapePath = data?.path?.shapePath;

            if (!shapePath?.shapePrimitives?.length) continue;

            const style = data.style as ConvertedFillStyle | ConvertedStrokeStyle;
            const tint = multiplyHexColors(style.color, groupTint);
            const alpha = style.alpha * groupAlpha;

            if (alpha <= 0) continue;

            const isStroke = instruction.action === 'stroke';

            context.globalAlpha = alpha;

            if (isStroke)
            {
                const strokeStyle = style as ConvertedStrokeStyle;

                context.lineWidth = strokeStyle.width;
                context.lineCap = strokeStyle.cap;
                context.lineJoin = strokeStyle.join;
                context.miterLimit = strokeStyle.miterLimit;
            }

            const shapePrimitives = shapePath.shapePrimitives;

            if (!isStroke && data.hole?.shapePath?.shapePrimitives?.length)
            {
                const lastShape = shapePrimitives[shapePrimitives.length - 1];

                lastShape.holes = data.hole.shapePath.shapePrimitives;
            }

            for (let j = 0; j < shapePrimitives.length; j++)
            {
                const primitive = shapePrimitives[j];

                if (!primitive?.shape) continue;

                const transform = primitive.transform;
                const hasTransform = transform && !transform.isIdentity();
                const hasTexture = style.texture && style.texture !== Texture.WHITE;
                const textureTransform = style.textureSpace === 'global' ? transform : null;
                const textureMatrix = hasTexture
                    ? generateTextureFillMatrix(tempTextureMatrix, style, primitive.shape, textureTransform)
                    : null;
                const currentTransform = hasTransform
                    ? tempGradientMatrix.copyFrom(baseTransform).append(transform)
                    : baseTransform;
                const canvasStyle = getCanvasStyle(
                    style,
                    tint,
                    textureMatrix,
                    currentTransform
                );

                if (hasTransform)
                {
                    context.save();
                    context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
                }

                if (isStroke)
                {
                    const strokeStyle = style as ConvertedStrokeStyle;
                    const useStrokeGeometry = strokeStyle.alignment !== 0.5 && !strokeStyle.pixelLine;

                    if (useStrokeGeometry)
                    {
                        const points: number[] = [];
                        const vertices: number[] = [];
                        const indices: number[] = [];
                        const shapeBuilder = shapeBuilders[primitive.shape.type];

                        if (shapeBuilder?.build(primitive.shape, points))
                        {
                            const close = (primitive.shape as { closePath?: boolean }).closePath ?? true;

                            buildLine(points, strokeStyle, false, close, vertices, indices);
                            context.fillStyle = canvasStyle as string | CanvasPattern | CanvasGradient;
                            fillTriangles(context, vertices, indices);
                        }
                        else
                        {
                            context.strokeStyle = canvasStyle as string | CanvasPattern | CanvasGradient;
                            context.beginPath();
                            buildShapePath(context, primitive.shape);
                            context.stroke();
                        }
                    }
                    else
                    {
                        context.strokeStyle = canvasStyle as string | CanvasPattern | CanvasGradient;
                        context.beginPath();
                        buildShapePath(context, primitive.shape);
                        context.stroke();
                    }
                }
                else
                {
                    context.fillStyle = canvasStyle as string | CanvasPattern | CanvasGradient;
                    context.beginPath();
                    buildShapePath(context, primitive.shape);

                    const hasHoles = addHolePaths(context, primitive.holes);

                    if (hasHoles)
                    {
                        context.fill('evenodd');
                    }
                    else
                    {
                        context.fill();
                    }
                }

                if (hasTransform)
                {
                    context.restore();
                }
            }
        }

        context.restore();
    }

    public destroy(): void
    {
        this.shader = null;
    }
}
