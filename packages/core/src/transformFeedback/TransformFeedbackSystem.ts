import { extensions, ExtensionType } from '@pixi/extensions';

import type { DRAW_MODES } from '@pixi/constants';
import type { ExtensionMetadata } from '@pixi/extensions';
import type { IRenderingContext } from '../IRenderer';
import type { Renderer } from '../Renderer';
import type { Shader } from '../shader/Shader';
import type { ISystem } from '../system/ISystem';
import type { TransformFeedback } from './TransformFeedback';

/**
 * TransformFeedbackSystem provides TransformFeedback of WebGL2
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLTransformFeedback
 *
 * For example, you can use TransformFeedbackSystem to implement GPU Particle or
 * general purpose computing on GPU (aka GPGPU).
 *
 * It also manages a lifetime of GLTransformFeedback object
 * @memberof PIXI
 */
export class TransformFeedbackSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type:  ExtensionType.RendererSystem,
        name: 'transformFeedback',
    };

    CONTEXT_UID: number;
    gl: IRenderingContext;

    private renderer: Renderer;

    /**
     * @param renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;
    }

    /** Sets up the renderer context and necessary buffers. */
    protected contextChange(): void
    {
        this.gl = this.renderer.gl;

        // TODO fill out...
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    }

    /**
     * Bind TransformFeedback and buffers
     * @param transformFeedback - TransformFeedback to bind
     */
    bind(transformFeedback: TransformFeedback)
    {
        const { gl, CONTEXT_UID } = this;

        const glTransformFeedback = transformFeedback._glTransformFeedbacks[CONTEXT_UID]
          || this.createGLTransformFeedback(transformFeedback);

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, glTransformFeedback);
    }

    /** Unbind TransformFeedback */
    unbind()
    {
        const { gl } = this;

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    }

    /**
     * Begin TransformFeedback
     * @param drawMode - DrawMode for TransformFeedback
     * @param shader - A Shader used by TransformFeedback. Current bound shader will be used if not provided.
     */
    beginTransformFeedback(drawMode: DRAW_MODES, shader?: Shader)
    {
        const { gl, renderer } = this;

        if (shader)
        {
            renderer.shader.bind(shader);
        }

        gl.beginTransformFeedback(drawMode);
    }

    /** End TransformFeedback */
    endTransformFeedback()
    {
        const { gl } = this;

        gl.endTransformFeedback();
    }

    /**
     * Create TransformFeedback and bind buffers
     * @param tf - TransformFeedback
     * @returns WebGLTransformFeedback
     */
    protected createGLTransformFeedback(tf: TransformFeedback)
    {
        const { gl, renderer, CONTEXT_UID } = this;

        const glTransformFeedback = gl.createTransformFeedback();

        tf._glTransformFeedbacks[CONTEXT_UID] = glTransformFeedback;
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, glTransformFeedback);
        for (let i = 0; i < tf.buffers.length; i++)
        {
            const buffer = tf.buffers[i];

            if (!buffer) continue;

            renderer.buffer.update(buffer);
            buffer._glBuffers[CONTEXT_UID].refCount++;

            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, buffer._glBuffers[CONTEXT_UID].buffer || null);
        }
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

        tf.disposeRunner.add(this);

        return glTransformFeedback;
    }

    /**
     * Disposes TransfromFeedback
     * @param {PIXI.TransformFeedback} tf - TransformFeedback
     * @param {boolean} [contextLost=false] - If context was lost, we suppress delete TransformFeedback
     */
    disposeTransformFeedback(tf: TransformFeedback, contextLost?: boolean): void
    {
        const glTF = tf._glTransformFeedbacks[this.CONTEXT_UID];
        const gl = this.gl;

        tf.disposeRunner.remove(this);

        const bufferSystem = this.renderer.buffer;

        // bufferSystem may have already been destroyed..
        // if this is the case, there is no need to destroy the geometry buffers...
        // they already have been!
        if (bufferSystem)
        {
            for (let i = 0; i < tf.buffers.length; i++)
            {
                const buffer = tf.buffers[i];

                if (!buffer) continue;

                const buf = buffer._glBuffers[this.CONTEXT_UID];

                // my be null as context may have changed right before the dispose is called
                if (buf)
                {
                    buf.refCount--;
                    if (buf.refCount === 0 && !contextLost)
                    {
                        bufferSystem.dispose(buffer, contextLost);
                    }
                }
            }
        }

        if (!glTF)
        {
            return;
        }

        if (!contextLost)
        {
            gl.deleteTransformFeedback(glTF);
        }

        delete tf._glTransformFeedbacks[this.CONTEXT_UID];
    }

    destroy(): void
    {
        // @TODO: Destroy managed TransformFeedbacks
        this.renderer = null;
    }
}

extensions.add(TransformFeedbackSystem);
