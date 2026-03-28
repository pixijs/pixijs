import { CORE_NODE_DEFAULTS } from '../defaults';
import { type Gl2dBlendMode, type Gl2dPoint2d, type Gl2dRef } from '../types/Gl2dTypes';
import { type Gl2dPixiNode } from '../types/pixi/PixiGl2dNodes';
import { gl2dUtils } from '../utils';

import type { Container } from '../../scene/container/Container';
import type { Gl2dSerializeContext } from '../serializeContext';

type SerializedCoreNode<TType extends Gl2dPixiNode['type']> = {
    type: TType;
    uid: string;
    name?: string;
    translation?: Gl2dPoint2d;
    rotation?: number;
    scale?: Gl2dPoint2d;
    alpha?: number;
    visible?: boolean;
    blendMode?: Gl2dBlendMode;
    children?: Gl2dRef[];
};

/**
 * Serializes the core node properties shared by all node types.
 * @param container - The container to serialize
 * @param _ctx - The serialization context
 * @param type - The gl2d node discriminator
 * @returns Core node properties (without type-specific data or extensions)
 * @category gl2d
 * @internal
 */
export function serializeCoreNodeProperties<TType extends Gl2dPixiNode['type']>(
    container: Container,
    _ctx: Gl2dSerializeContext,
    type: TType,
): SerializedCoreNode<TType>
{
    return gl2dUtils.compact<SerializedCoreNode<TType>>({
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
                : gl2dUtils.checkValue(container.localBlendMode as Gl2dBlendMode, CORE_NODE_DEFAULTS.blendMode),
        type,
    });
}
