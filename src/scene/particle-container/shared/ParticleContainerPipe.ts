import { Matrix } from '../../../maths/matrix/Matrix';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { getAdjustedBlendModeBlend } from '../../../rendering/renderers/shared/state/getAdjustedBlendModeBlend';
import { State } from '../../../rendering/renderers/shared/state/State';
import { color32BitToUniform } from '../../graphics/gpu/colorToUniform';
import { ParticleBuffer } from './ParticleBuffer';
import { ParticleShader } from './shader/ParticleShader';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Renderer } from '../../../rendering/renderers/types';
import type { ParticleContainer } from './ParticleContainer';

/** @internal */
export interface ParticleContainerAdaptor
{
    execute(particleContainerPop: ParticleContainerPipe, container: ParticleContainer): void;
}

/**
 * Renderer for Particles that is designer for speed over feature set.
 * @category scene
 * @internal
 */
export class ParticleContainerPipe implements RenderPipe<ParticleContainer>
{
    /** The default shader that is used if a sprite doesn't have a more specific one. */
    public defaultShader: Shader;

    /** @internal */
    public adaptor: ParticleContainerAdaptor;
    /** @internal */
    public readonly state = State.for2d();
    /** @internal */
    public readonly renderer: Renderer;

    /** Local uniforms that are used for rendering particles. */
    public readonly localUniforms = new UniformGroup({
        uTranslationMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
        uColor: { value: new Float32Array(4), type: 'vec4<f32>' },
        uRound: { value: 1, type: 'f32' },
        uResolution: { value: [0, 0], type: 'vec2<f32>' },
    });

    /**
     * @param renderer - The renderer this sprite batch works for.
     * @param adaptor
     */
    constructor(renderer: Renderer, adaptor: ParticleContainerAdaptor)
    {
        this.renderer = renderer;

        this.adaptor = adaptor;

        this.defaultShader = new ParticleShader();

        this.state = State.for2d();
    }

    public validateRenderable(_renderable: ParticleContainer): boolean
    {
        // always fine :D
        return false;
    }

    public addRenderable(renderable: ParticleContainer, instructionSet: InstructionSet)
    {
        this.renderer.renderPipes.batch.break(instructionSet);
        instructionSet.add(renderable);
    }

    public getBuffers(renderable: ParticleContainer): ParticleBuffer
    {
        return renderable._gpuData[this.renderer.uid] || this._initBuffer(renderable);
    }

    private _initBuffer(renderable: ParticleContainer): ParticleBuffer
    {
        renderable._gpuData[this.renderer.uid] = new ParticleBuffer({
            size: renderable.particleChildren.length,
            properties: renderable._properties,
        });

        return renderable._gpuData[this.renderer.uid];
    }

    public updateRenderable(_renderable: ParticleContainer)
    {
        // nothing to be done here!

    }

    public execute(container: ParticleContainer): void
    {
        const children = container.particleChildren;

        if (children.length === 0)
        {
            return;
        }

        const renderer = this.renderer;
        const buffer = this.getBuffers(container);

        container.texture ||= children[0].texture;

        const state = this.state;

        buffer.update(children, container._childrenDirty);
        container._childrenDirty = false;

        state.blendMode = getAdjustedBlendModeBlend(container.blendMode, container.texture._source);

        const uniforms = this.localUniforms.uniforms;

        const transformationMatrix = uniforms.uTranslationMatrix;

        container.worldTransform.copyTo(transformationMatrix);

        transformationMatrix.prepend(renderer.globalUniforms.globalUniformData.projectionMatrix);

        uniforms.uResolution = renderer.globalUniforms.globalUniformData.resolution;
        uniforms.uRound = renderer._roundPixels | container._roundPixels;

        color32BitToUniform(
            container.groupColorAlpha,
            uniforms.uColor,
            0
        );

        this.adaptor.execute(this, container);
    }

    /** Destroys the ParticleRenderer. */
    public destroy(): void
    {
        if (this.defaultShader)
        {
            this.defaultShader.destroy();
            this.defaultShader = null;
        }
    }
}
