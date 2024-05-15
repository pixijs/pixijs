import { glUploadImageResource } from './glUploadImageResource';

import type { GLTextureUploader } from './GLTextureUploader';

export const glUploadBufferImageResource = {

    id: 'buffer',

    ...glUploadImageResource
} as GLTextureUploader;

