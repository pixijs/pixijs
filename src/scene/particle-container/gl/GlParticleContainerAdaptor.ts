import type { WebGLRenderer } from '../../../rendering/renderers/gl/WebGLRenderer';
import type { ParticleContainer } from '../shared/ParticleContainer';
import type { ParticleContainerAdaptor, ParticleContainerPipe } from '../shared/ParticleContainerPipe';

const typeSymbol = Symbol.for('GlParticleContainerAdaptor');

/** @internal */
export class GlParticleContainerAdaptor implements ParticleContainerAdaptor
{
    /**
     * Type symbol used to identify instances of GlParticleContainerAdaptor.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GlParticleContainerAdaptor.
     * @param obj - The object to check.
     * @returns True if the object is a GlParticleContainerAdaptor, false otherwise.
     */
    public static isGlParticleContainerAdaptor(obj: any): obj is GlParticleContainerAdaptor
    {
        return !!obj && !!obj[typeSymbol];
    }

    public execute(particleContainerPipe: ParticleContainerPipe, container: ParticleContainer)
    {
        const state = particleContainerPipe.state;
        const renderer = particleContainerPipe.renderer as WebGLRenderer;
        const shader = container.shader || particleContainerPipe.defaultShader;

        shader.resources.uTexture = container.texture._source;
        shader.resources.uniforms = particleContainerPipe.localUniforms;

        const gl = renderer.gl;

        const buffer = particleContainerPipe.getBuffers(container);

        // now lets upload and render the buffers..
        renderer.shader.bind(shader);
        renderer.state.set(state);
        renderer.geometry.bind(buffer.geometry, shader.glProgram);

        const byteSize = buffer.geometry.indexBuffer.data.BYTES_PER_ELEMENT;
        const glType = byteSize === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;

        gl.drawElements(gl.TRIANGLES, container.particleChildren.length * 6, glType, 0);
    }
}
