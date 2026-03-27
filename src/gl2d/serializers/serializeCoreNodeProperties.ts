import { CORE_NODE_DEFAULTS } from '../defaults';
import { type Gl2dBaseNode } from '../types/Gl2dNodes';
import { type Gl2dPixiNode } from '../types/pixi/PixiGl2dNodes';
import { gl2dUtils } from '../utils';

import type { Container } from '../../scene/container/Container';
import type { Gl2dSerializeContext } from '../serializeContext';

/**
 * Serializes the core node properties shared by all node types.
 * @param container - The container to serialize
 * @param _ctx - The serialization context
 * @param type
 * @returns Core node properties (without type or children)
 * @category gl2d
 * @internal
 */
export function serializeCoreNodeProperties<T extends Gl2dPixiNode>(
    container: Container,
    _ctx: Gl2dSerializeContext,
    type: Gl2dPixiNode['type'],
): T
{
    const node = gl2dUtils.removeUndefinedOrNull(
        {
            uid: String(container.uid),
            name: container.label || undefined,
            translation: gl2dUtils.checkObservablePoint(container._position, CORE_NODE_DEFAULTS.translation),
            rotation: gl2dUtils.checkValue(container.rotation, CORE_NODE_DEFAULTS.rotation),
            scale: gl2dUtils.checkObservablePoint(container._scale, CORE_NODE_DEFAULTS.scale),
            alpha: gl2dUtils.checkValue(container.localAlpha, CORE_NODE_DEFAULTS.alpha),
            visible: gl2dUtils.checkValue(container.visible, CORE_NODE_DEFAULTS.visible),
            blendMode:
                container.localBlendMode === 'inherit'
                    ? null
                    : gl2dUtils.checkValue(container.localBlendMode, CORE_NODE_DEFAULTS.blendMode),
            type,
            children: undefined,
            mask: undefined,
        } satisfies Record<keyof Omit<Gl2dBaseNode, 'extensions'>, unknown>,
        1,
    );

    return node as T;
}
