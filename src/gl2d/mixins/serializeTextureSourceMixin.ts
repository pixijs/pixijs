import { serializeTextureSource } from '../serializers/resources/textures/serializeTextureSource';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { TextureSource } from '../../rendering/renderers/shared/texture/sources/TextureSource';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeTextureSourceMixin: Partial<TextureSource> = {
    toGl2d(this: TextureSource, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeTextureSource(this, ctx);
    },
} as Partial<TextureSource>;
