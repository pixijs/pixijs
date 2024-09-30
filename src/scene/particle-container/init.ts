import { extensions } from '../../extensions/Extensions';
import { GlParticleContainerPipe } from './shared/GlParticleContainerPipe';
import { GpuParticleContainerPipe } from './shared/GpuParticleContainerPipe';

// TODO @Zyie, will this tree shake out for the correct renderer?
extensions.add(GlParticleContainerPipe);
extensions.add(GpuParticleContainerPipe);
