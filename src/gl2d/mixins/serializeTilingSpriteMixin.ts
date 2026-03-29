import { serializeTilingSprite } from '../serializers/nodes/serializeTilingSprite';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { TilingSprite } from '../../scene/sprite-tiling/TilingSprite';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeTilingSpriteMixin: Partial<TilingSprite> = {
    toGl2d(this: TilingSprite, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeTilingSprite(this, ctx);
    },
} as Partial<TilingSprite>;
