import { serializeCompressedSource } from '../serializers/resources/textures/serializeCompressedSource';
import { type Gl2dRef } from '../types/Gl2dTypes';

import type { CompressedSource } from '../../rendering/renderers/shared/texture/sources/CompressedSource';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeCompressedSourceMixin: Partial<CompressedSource> = {
    toGl2d(this: CompressedSource, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeCompressedSource(this, ctx);
    },
} as Partial<CompressedSource>;
