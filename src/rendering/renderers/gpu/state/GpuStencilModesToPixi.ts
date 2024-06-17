import { STENCIL_MODES } from '../../shared/state/const';

export interface StencilState
{
    stencilWriteMask?: number
    stencilReadMask?: number;
    stencilFront?: {
        compare: 'always' | 'equal';
        passOp: 'increment-clamp' | 'decrement-clamp' | 'keep';
    },
    stencilBack?: {
        compare: 'always' | 'equal';
        passOp: 'increment-clamp' | 'decrement-clamp' | 'keep';
    }
}

export const GpuStencilModesToPixi: StencilState[] = [];

GpuStencilModesToPixi[STENCIL_MODES.NONE] = undefined;

GpuStencilModesToPixi[STENCIL_MODES.DISABLED] = {
    stencilWriteMask: 0,
    stencilReadMask: 0,
};

GpuStencilModesToPixi[STENCIL_MODES.RENDERING_MASK_ADD] = {
    stencilFront: {
        compare: 'equal',
        passOp: 'increment-clamp',
    },
    stencilBack: {
        compare: 'equal',
        passOp: 'increment-clamp',
    },
};

GpuStencilModesToPixi[STENCIL_MODES.RENDERING_MASK_REMOVE] = {
    stencilFront: {
        compare: 'equal',
        passOp: 'decrement-clamp',
    },
    stencilBack: {
        compare: 'equal',
        passOp: 'decrement-clamp',
    },
};

GpuStencilModesToPixi[STENCIL_MODES.MASK_ACTIVE] = {
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
