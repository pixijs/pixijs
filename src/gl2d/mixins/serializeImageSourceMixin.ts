import { serializeImageSource } from '../serializers/resources/textures/serializeImageSource';

import type { ImageSource } from '../../rendering/renderers/shared/texture/sources/ImageSource';
import type { Gl2dRef } from '../Gl2dSchema';
import type { Gl2dSerializeContext } from '../serializeContext';

/** @internal */
export const serializeImageSourceMixin: Partial<ImageSource> = {
    toGl2d(this: ImageSource, ctx: Gl2dSerializeContext): Gl2dRef
    {
        return serializeImageSource(this, ctx);
    },
} as Partial<ImageSource>;
