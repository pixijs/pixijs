import { type FillPattern } from '../../../../scene/graphics/shared/fill/FillPattern';
import { CANVAS_PATTERN_DEFAULTS } from '../../../defaults';
import { type Gl2dMatrix2d, type Gl2dRef } from '../../../types/Gl2dTypes';
import { gl2dUtils } from '../../../utils';

import type { Gl2dSerializeContext } from '../../../serializeContext';
import type { Gl2dCanvasPatternResource } from '../../../types/Gl2DResources';

/**
 * @param pattern
 * @param ctx
 * @internal
 */
export function serializeFillPattern(
    pattern: FillPattern,
    ctx: Gl2dSerializeContext,
): Gl2dRef
{
    const existing = ctx.resourceMap.get(pattern);

    if (existing !== undefined) return existing;

    const sourceRef = pattern.texture.toGl2d(ctx);

    const m = pattern.transform;
    let transform: Gl2dMatrix2d | undefined;

    if (m.a !== 1 || m.b !== 0 || m.c !== 0 || m.d !== 1 || m.tx !== 0 || m.ty !== 0)
    {
        transform = [m.a, m.b, m.c, m.d, m.tx, m.ty];
    }

    const resource = gl2dUtils.compact<Gl2dCanvasPatternResource>({
        type: 'canvas_pattern',
        uid: `canvas_pattern_${String(pattern.uid)}`,
        name: `pattern_${String(pattern.uid)}`,
        source: sourceRef,
        repeat: gl2dUtils.checkValue(pattern._repeat, CANVAS_PATTERN_DEFAULTS.repeat),
        transform: gl2dUtils.checkArrayEquals(transform, [1, 0, 0, 1, 0, 0]) as Gl2dMatrix2d,
    });

    const index = ctx.gl2d.resources.length;

    ctx.gl2d.resources.push(resource);
    ctx.resourceMap.set(pattern, index);

    return index;
}
