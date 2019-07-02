import { TYPES } from '@pixi/constants';

export default {
    aColor: {
        type: 'uint32',
        size: 1,
        glType: TYPES.UNSIGNED_BYTE,
        glSize: 4,
        _wordSize: 1,
    },
    aTextureId: {
        type: 'float32',
        size: 1,
        glType: TYPES.FLOAT,
        glSize: 1,
        _wordSize: 1,
    },
};
