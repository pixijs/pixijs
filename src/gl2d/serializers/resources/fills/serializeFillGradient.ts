import { type FillGradient } from '../../../../scene/graphics/shared/fill/FillGradient';
import { PIXI_CANVAS_GRADIENT_DEFAULTS } from '../../../defaults';
import { type Gl2dRef } from '../../../types/Gl2dTypes';
import { gl2dUtils } from '../../../utils';

import type { Gl2dSerializeContext } from '../../../serializeContext';
import type {
    Gl2dPixiCanvasGradientExtension,
    Gl2dPixiCanvasGradientResource,
} from '../../../types/pixi/PixiGl2dResources';

/**
 * @param gradient
 * @param ctx
 * @internal
 */
export function serializeFillGradient(gradient: FillGradient, ctx: Gl2dSerializeContext): Gl2dRef
{
    const existing = ctx.resourceMap.get(gradient);

    if (existing !== undefined) return existing;

    const stops: (number | string)[] = [];

    for (const stop of gradient.colorStops)
    {
        stops.push(stop.offset, stop.color);
    }

    const resource: Gl2dPixiCanvasGradientResource = gl2dUtils.compact<Gl2dPixiCanvasGradientResource>({
        type: 'canvas_gradient',
        uid: `canvas_gradient_${String(gradient.uid)}`,
        name: `gradient_${String(gradient.uid)}`,
        gradientType: gradient.type,
        gradientUnits: gradient.textureSpace,
        stops,
        radial:
            gradient.type === 'radial'
                ? {
                    innerCircle: [gradient.center.x, gradient.center.y, gradient.innerRadius],
                    outerCircle: [gradient.outerCenter.x, gradient.outerCenter.y, gradient.outerRadius],
                }
                : null,
        linear:
            gradient.type === 'linear'
                ? {
                    start: [gradient.start.x, gradient.start.y],
                    end: [gradient.end.x, gradient.end.y],
                }
                : null,
    });

    // eslint-disable-next-line dot-notation
    const textureSize = gradient['_textureSize'];
    // eslint-disable-next-line dot-notation
    const wrapMode = gradient['_wrapMode'];

    const ext = gl2dUtils.compact<Gl2dPixiCanvasGradientExtension>({
        textureSize: gl2dUtils.checkValue(textureSize, PIXI_CANVAS_GRADIENT_DEFAULTS.textureSize),
        wrapMode: gl2dUtils.checkValue(wrapMode, PIXI_CANVAS_GRADIENT_DEFAULTS.wrapMode),
        scale:
            gradient.type === 'radial'
                ? gl2dUtils.checkValue(gradient.scale, PIXI_CANVAS_GRADIENT_DEFAULTS.scale)
                : undefined,
        rotation:
            gradient.type === 'radial'
                ? gl2dUtils.checkValue(gradient.rotation, PIXI_CANVAS_GRADIENT_DEFAULTS.rotation)
                : undefined,
    });

    if (Object.keys(ext).length > 0)
    {
        resource.extensions = { pixi_canvas_gradient: ext };
        ctx.gl2d.extensionsUsed.add('pixi_canvas_gradient');
    }

    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(resource);
    ctx.resourceMap.set(gradient, index);

    return index;
}
