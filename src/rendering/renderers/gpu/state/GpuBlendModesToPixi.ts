import type { BLEND_MODES } from '../../shared/state/const';

export const GpuBlendModesToPixi: Partial<Record<BLEND_MODES, GPUBlendState>> = {};

GpuBlendModesToPixi.normal = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
};

GpuBlendModesToPixi.add = {
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

GpuBlendModesToPixi.multiply = {
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

GpuBlendModesToPixi.screen = {
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

GpuBlendModesToPixi.overlay = {
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

GpuBlendModesToPixi.none = {
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
GpuBlendModesToPixi['normal-npm'] = {
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

GpuBlendModesToPixi['add-npm'] = {
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

GpuBlendModesToPixi['screen-npm'] = {
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

GpuBlendModesToPixi.erase = {
    alpha: {
        srcFactor: 'zero',
        dstFactor: 'one-minus-src-alpha',
        operation: 'add',
    },
    color: {
        srcFactor: 'zero',
        dstFactor: 'one-minus-src',
        operation: 'add',
    },
};

GpuBlendModesToPixi.min = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one',
        operation: 'min',
    },
    color: {
        srcFactor: 'one',
        dstFactor: 'one',
        operation: 'min',
    },
};

GpuBlendModesToPixi.max = {
    alpha: {
        srcFactor: 'one',
        dstFactor: 'one',
        operation: 'max',
    },
    color: {
        srcFactor: 'one',
        dstFactor: 'one',
        operation: 'max',
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
