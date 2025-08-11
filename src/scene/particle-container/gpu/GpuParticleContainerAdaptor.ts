import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { ParticleContainer } from '../shared/ParticleContainer';
import type { ParticleContainerAdaptor, ParticleContainerPipe } from '../shared/ParticleContainerPipe';

const typeSymbol = Symbol.for('pixijs.GpuParticleContainerAdaptor');

/** @internal */
export class GpuParticleContainerAdaptor implements ParticleContainerAdaptor
{
    /**
     * Type symbol used to identify instances of GpuParticleContainerAdaptor.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GpuParticleContainerAdaptor.
     * @param obj - The object to check.
     * @returns True if the object is a GpuParticleContainerAdaptor, false otherwise.
     */
    public static isGpuParticleContainerAdaptor(obj: any): obj is GpuParticleContainerAdaptor
    {
        return !!obj && !!obj[typeSymbol];
    }

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
