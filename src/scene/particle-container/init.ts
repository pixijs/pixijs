import { extensions } from '../../extensions/Extensions';
import { GlParticleContainerPipe } from './shared/GlParticleContainerPipe';
import { GpuParticleContainerPipe } from './shared/GpuParticleContainerPipe';

// NOTE: this is the first occurrence of needing both gl and gpu pipes in the same file
// This could cause some issues with tree shaking in the future.
// Right now these two files do not import anything specific for a renderer, so is not an issue for now.
extensions.add(GlParticleContainerPipe);
extensions.add(GpuParticleContainerPipe);
