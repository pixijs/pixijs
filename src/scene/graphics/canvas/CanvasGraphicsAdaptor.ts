import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { canvasUtils } from '../../../rendering/renderers/canvas/utils/canvasUtils';
import { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { bgr2rgb } from '../../container/container-mixins/getGlobalMixin';
import { multiplyHexColors } from '../../container/utils/multiplyHexColors';

import type { ShapePrimitive } from '../../../maths/shapes/ShapePrimitive';
import type { CrossPlatformCanvasRenderingContext2D } from '../../../rendering/renderers/canvas/CanvasContextSystem';
import type { CanvasRenderer } from '../../../rendering/renderers/canvas/CanvasRenderer';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Renderer } from '../../../rendering/renderers/types';
import type { ConvertedFillStyle, ConvertedStrokeStyle } from '../shared/FillTypes';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsAdaptor, GraphicsPipe } from '../shared/GraphicsPipe';
import type { ShapePrimitiveWithHoles } from '../shared/path/ShapePath';

const emptyCanvasStyle = '#808080';
const tempMatrix = new Matrix();

function colorToHex(color: number): string
{
    const clamped = color & 0xFFFFFF;

    return `#${clamped.toString(16).padStart(6, '0')}`;
}

function applyPatternTransform(pattern: CanvasPattern, matrix?: Matrix): void
{
    if (!matrix) return;

    const patternAny = pattern as unknown as { setTransform?: (value: DOMMatrix) => void };

    if (!patternAny.setTransform) return;

    const DOMMatrixCtor = (globalThis as { DOMMatrix?: typeof DOMMatrix }).DOMMatrix;

    if (!DOMMatrixCtor) return;

    const domMatrix = new DOMMatrixCtor([matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty]);

    patternAny.setTransform(domMatrix.inverse());
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
    tint: number
): string | CanvasPattern
{
    const texture = style.texture;

    if (texture && texture !== Texture.WHITE)
    {
        if (!texture.source.resource)
        {
            return emptyCanvasStyle;
        }

        const pattern = canvasUtils.getTintedPattern(texture, tint);

        applyPatternTransform(pattern, style.matrix);

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

    public execute(graphicsPipe: GraphicsPipe, renderable: Graphics): void
    {
        const renderer = graphicsPipe.renderer as CanvasRenderer;
        const contextSystem = renderer.canvasContext;
        const context = contextSystem.activeContext;
        const baseTransform = renderable.groupTransform;

        const groupColorAlpha = renderable.groupColorAlpha;
        const groupAlpha = ((groupColorAlpha >>> 24) & 0xFF) / 255;

        if (groupAlpha <= 0) return;

        const groupTint = bgr2rgb(groupColorAlpha & 0xFFFFFF);
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

                if (!texture?.source?.resource) continue;

                const alpha = data.alpha * groupAlpha;

                if (alpha <= 0) continue;

                const tint = multiplyHexColors(data.style, groupTint);
                const source = texture.source.resource as CanvasImageSource;

                if (!source) continue;

                context.globalAlpha = alpha;

                let drawSource: CanvasImageSource = source;

                if (tint !== 0xFFFFFF)
                {
                    drawSource = canvasUtils.getTintedCanvas({ texture }, tint) as CanvasImageSource;
                }

                const frame = texture.frame;
                const resolution = texture.source._resolution ?? texture.source.resolution ?? 1;

                const sx = frame.x * resolution;
                const sy = frame.y * resolution;
                const sw = frame.width * resolution;
                const sh = frame.height * resolution;

                const transform = data.transform;
                const hasTransform = transform && !transform.isIdentity();

                if (hasTransform)
                {
                    tempMatrix.copyFrom(baseTransform).append(transform);
                    contextSystem.setContextTransform(tempMatrix, roundPixels === 1);
                }
                else
                {
                    contextSystem.setContextTransform(baseTransform, roundPixels === 1);
                }

                context.drawImage(
                    drawSource,
                    Math.floor(sx),
                    Math.floor(sy),
                    Math.floor(sw),
                    Math.floor(sh),
                    data.dx,
                    data.dy,
                    data.dw,
                    data.dh
                );
                if (hasTransform)
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

            const canvasStyle = getCanvasStyle(style, tint);

            context.globalAlpha = alpha;

            if (isStroke)
            {
                const strokeStyle = style as ConvertedStrokeStyle;

                context.lineWidth = strokeStyle.width;
                context.lineCap = strokeStyle.cap;
                context.lineJoin = strokeStyle.join;
                context.miterLimit = strokeStyle.miterLimit;
                context.strokeStyle = canvasStyle as string | CanvasPattern;
            }
            else
            {
                context.fillStyle = canvasStyle as string | CanvasPattern;
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

                if (hasTransform)
                {
                    context.save();
                    context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
                }

                context.beginPath();
                buildShapePath(context, primitive.shape);

                const hasHoles = addHolePaths(context, primitive.holes);

                if (isStroke)
                {
                    context.stroke();
                }
                else if (hasHoles)
                {
                    context.fill('evenodd');
                }
                else
                {
                    context.fill();
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
