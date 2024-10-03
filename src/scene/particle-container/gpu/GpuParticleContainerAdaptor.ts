import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { ParticleContainer } from '../shared/ParticleContainer';
import type { ParticleContainerAdaptor, ParticleContainerPipe } from '../shared/ParticleContainerPipe';

export class GpuParticleContainerAdaptor implements ParticleContainerAdaptor
{
    public execute(particleContainerPop: ParticleContainerPipe, container: ParticleContainer)
    {
        const renderer = particleContainerPop.renderer as WebGPURenderer;

        const shader = container.shader || particleContainerPop.defaultShader;

        shader.groups[0] = renderer.renderPipes.uniformBatch.getUniformBindGroup(particleContainerPop.localUniforms, true);

        shader.groups[1] = renderer.texture.getTextureBindGroup(container.texture);

        const state = particleContainerPop.state;

        const buffer = particleContainerPop.getBuffers(container);

        renderer.encoder.draw({
            geometry: buffer.geometry,
            shader: container.shader || particleContainerPop.defaultShader,
            state,
            size: container.particleChildren.length * 6,
        });
    }
}
