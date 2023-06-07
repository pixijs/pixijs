import { BLEND_MODES } from '../../shared/state/const';

export const GpuBlendModesToPixi: GPUBlendState[] = [];

GpuBlendModesToPixi[BLEND_MODES.NORMAL] = {
    alpha: {
        srcFactor: 'src-alpha',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
};

GpuBlendModesToPixi[BLEND_MODES.ADD] = {
    alpha: {
        srcFactor: 'src-alpha',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'one',
        dstFactor: 'one',
        operation: 'add',
    },
};

GpuBlendModesToPixi[BLEND_MODES.MULTIPLY] = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'dst',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
};

GpuBlendModesToPixi[BLEND_MODES.SCREEN] = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src',
        operation: 'add',
    },
};

GpuBlendModesToPixi[BLEND_MODES.OVERLAY] = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src',
        operation: 'add',
    },
};

GpuBlendModesToPixi[BLEND_MODES.NONE] = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'zero',
        dstFactor: 'zero',
        operation: 'add',
    },
};

// not-premultiplied blend modes
GpuBlendModesToPixi[BLEND_MODES.NORMAL_NPM] = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'src-alpha',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
};

GpuBlendModesToPixi[BLEND_MODES.ADD_NPM] = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one',
        operation: 'add',
    },
    color: {
        srcFactor: 'src-alpha',
        dstFactor: 'one',
        operation: 'add',
    },
};

GpuBlendModesToPixi[BLEND_MODES.SCREEN_NPM] = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'src-alpha',
        dstFactor: 'one-minus-src',
        operation: 'add',
    },
};

// composite operations
// GpuBlendModesToPixi[BLEND_MODES.SRC_IN] = {
//     alpha: {
//         srcFactor: 'src-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'dst-alpha',
//         dstFactor: 'zero',
//         operation: 'add',
//     },
// };

// GpuBlendModesToPixi[BLEND_MODES.SRC_OUT] = {
//     alpha: {
//         srcFactor: 'src-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'one-minus-dst-alpha',
//         dstFactor: 'zero',
//         operation: 'add',
//     },
// };

// GpuBlendModesToPixi[BLEND_MODES.SRC_ATOP] = {
//     alpha: {
//         srcFactor: 'src-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'dst-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
// };

// GpuBlendModesToPixi[BLEND_MODES.DST_OVER] = {
//     alpha: {
//         srcFactor: 'src-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'one-minus-dst-alpha',
//         dstFactor: 'one',
//         operation: 'add',
//     },
// };

// GpuBlendModesToPixi[BLEND_MODES.DST_IN] = {
//     alpha: {
//         srcFactor: 'src-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'zero',
//         dstFactor: 'src-alpha',
//         operation: 'add',
//     },
// };

// GpuBlendModesToPixi[BLEND_MODES.DST_OUT] = {
//     alpha: {
//         srcFactor: 'src-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'zero',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
// };

// GpuBlendModesToPixi[BLEND_MODES.DST_ATOP] = {
//     alpha: {
//         srcFactor: 'src-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'one-minus-dst-alpha',
//         dstFactor: 'src-alpha',
//         operation: 'add',
//     },
// };

// GpuBlendModesToPixi[BLEND_MODES.XOR] = {
//     alpha: {
//         srcFactor: 'src-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'one-minus-dst-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
// };

// TODO - fix me
// GLBlendModesToPixi[BLEND_MODES.SUBTRACT] = {
//     alpha: {
//         srcFactor: 'one',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
//     color: {
//         srcFactor: 'one-minus-dst-alpha',
//         dstFactor: 'one-minus-src-alpha',
//         operation: 'add',
//     },
// };
