import { STENCIL_MODES } from '../../shared/state/const';

export const GpuStencilModesToPixi: GPUDepthStencilState[] = [];

GpuStencilModesToPixi[STENCIL_MODES.NONE] = undefined;

GpuStencilModesToPixi[STENCIL_MODES.DISABLED] = {
    format: 'stencil8',
    depthCompare: 'always',
    depthWriteEnabled: false,
    stencilWriteMask: 0,
    stencilReadMask: 0,
    stencilBack: {
        compare: 'always',
        passOp: 'keep',
    },
};

GpuStencilModesToPixi[STENCIL_MODES.RENDERING_MASK_ADD] = {
    format: 'stencil8',
    depthCompare: 'always',
    depthWriteEnabled: false,
    stencilFront: {
        compare: 'always',
        passOp: 'increment-clamp',
    },
    stencilBack: {
        compare: 'always',
        passOp: 'increment-clamp',
    },
};

GpuStencilModesToPixi[STENCIL_MODES.RENDERING_MASK_REMOVE] = {
    format: 'stencil8',
    depthCompare: 'always',
    depthWriteEnabled: false,
    stencilFront: {
        compare: 'always',
        passOp: 'decrement-clamp',
    },
    stencilBack: {
        compare: 'always',
        passOp: 'decrement-clamp',
    },
};

GpuStencilModesToPixi[STENCIL_MODES.MASK_ACTIVE] = {
    format: 'stencil8',
    depthCompare: 'always',
    depthWriteEnabled: false,
    stencilWriteMask: 0,
    stencilFront: {
        compare: 'equal',
        passOp: 'keep',
    },
    stencilBack: {
        compare: 'equal',
        passOp: 'keep',
    },
};
