import { extensions } from '../../extensions/Extensions';
import { CanvasParticleContainerPipe } from './canvas/CanvasParticleContainerPipe';
import { GlParticleContainerPipe } from './gl/GlParticleContainerPipe';
import { GpuParticleContainerPipe } from './gpu/GpuParticleContainerPipe';

// NOTE: this is the first occurrence of needing both gl and gpu pipes in the same file
// This could cause some issues with tree shaking in the future.
// Right now these two files do not import anything specific for a renderer, so is not an issue for now.
extensions.add(GlParticleContainerPipe);
extensions.add(GpuParticleContainerPipe);
extensions.add(CanvasParticleContainerPipe);
