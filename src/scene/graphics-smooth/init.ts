import { extensions } from '../../extensions/Extensions';
import { CanvasSmoothGraphicsPipe } from './canvas/CanvasSmoothGraphicsPipe';
import { GlSmoothGraphicsAdaptor } from './gl/GlSmoothGraphicsAdaptor';
import { GpuSmoothGraphicsAdaptor } from './gpu/GpuSmoothGraphicsAdaptor';
import { SmoothBatcher, SmoothTexturedBatcher } from './shared/batcher/SmoothBatcher';
import { SmoothGraphicsContextSystem } from './shared/SmoothGraphicsContextSystem';
import { SmoothGraphicsPipe } from './shared/SmoothGraphicsPipe';

extensions.add(
    SmoothGraphicsPipe,
    CanvasSmoothGraphicsPipe,
    SmoothGraphicsContextSystem,
    GlSmoothGraphicsAdaptor,
    GpuSmoothGraphicsAdaptor,
    SmoothBatcher,
    SmoothTexturedBatcher,
);
