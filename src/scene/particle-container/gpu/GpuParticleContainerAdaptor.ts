import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { ParticleContainer } from '../shared/ParticleContainer';
import type { ParticleContainerAdaptor, ParticleContainerPipe } from '../shared/ParticleContainerPipe';

export class GpuParticleContainerAdaptor implements ParticleContainerAdaptor
{
    public execute(particleContainerPipe: ParticleContainerPipe, container: ParticleContainer)
    {
        const renderer = particleContainerPipe.renderer as WebGPURenderer;

        const shader = container.shader || particleContainerPipe.defaultShader;

        shader.groups[0] = renderer.renderPipes.uniformBatch.getUniformBindGroup(particleContainerPipe.localUniforms, true);

        shader.groups[1] = renderer.texture.getTextureBindGroup(container.texture);

        const state = particleContainerPipe.state;

        const buffer = particleContainerPipe.getBuffers(container);

        renderer.encoder.draw({
            geometry: buffer.geometry,
            shader: container.shader || particleContainerPipe.defaultShader,
            state,
            size: container.particleChildren.length * 6,
        });
    }
}
