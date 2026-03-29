import { serializeNineSliceSprite } from '../serializers/nodes/serializeNineSliceSprite';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { NineSliceSprite } from '../../scene/sprite-nine-slice/NineSliceSprite';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeNineSliceSpriteMixin: Partial<NineSliceSprite> = {
    toGl2d(this: NineSliceSprite, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeNineSliceSprite(this, ctx);
    },
} as Partial<NineSliceSprite>;
