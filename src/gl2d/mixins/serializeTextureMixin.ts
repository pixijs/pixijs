import { serializeTexture } from '../serializers/resources/textures/serializeTexture';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeTextureMixin: Partial<Texture> = {
    toGl2d(this: Texture, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeTexture(this, ctx);
    },
} as Partial<Texture>;
