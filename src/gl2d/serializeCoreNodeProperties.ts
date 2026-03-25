import { CORE_NODE_DEFAULTS } from './defaults';
import { gl2dUtils } from './utils';

import type { Container } from '../scene/container/Container';
import type { Gl2dNodePropertiesBase, Gl2dTRSTransform } from './Gl2dSchema';
import type { Gl2dSerializeContext } from './serializeContext';

/**
 * Serializes the common properties shared by all node types.
 * The caller is responsible for setting `type` and `children`.
 * @param container - The container to serialize
 * @param ctx - The serialization context
 * @returns Core node properties (without type or children)
 * @category gl2d
 * @standard
 */
type Gl2dTRSNodeProperties = Omit<Gl2dNodePropertiesBase, 'type' | 'mask' | 'children' | 'extensions'> &
    Gl2dTRSTransform;

/**
 * Serializes the core node properties shared by all node types.
 * @param container - The container to serialize
 * @param _ctx - The serialization context
 * @returns Core node properties (without type or children)
 * @category gl2d
 * @internal
 */
export function serializeCoreNodeProperties(container: Container, _ctx: Gl2dSerializeContext): Gl2dTRSNodeProperties
{
    const node: Required<Gl2dTRSNodeProperties> = gl2dUtils.removeUndefinedOrNull(
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
            matrix: null as never,
        },
        1,
    );

    return node;
}
