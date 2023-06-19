import { Runner } from '@pixi/runner';

import type { Buffer } from '../geometry/Buffer';

/**
 * A TransformFeedback object wrapping GLTransformFeedback object.
 *
 * For example you can use TransformFeedback object to feed-back buffer data from Shader having TransformFeedbackVaryings.
 * @memberof PIXI
 */
export class TransformFeedback
{
    _glTransformFeedbacks: {[key: number]: WebGLTransformFeedback};

    buffers: Buffer[];

    disposeRunner: Runner;

    constructor()
    {
        this._glTransformFeedbacks = {};
        this.buffers = [];
        this.disposeRunner = new Runner('disposeTransformFeedback');
    }

    /**
     * Bind buffer to TransformFeedback
     * @param index - index to bind
     * @param buffer - buffer to bind
     */
    bindBuffer(index: number, buffer: Buffer)
    {
        this.buffers[index] = buffer;
    }

    /** Destroy WebGL resources that are connected to this TransformFeedback. */
    destroy(): void
    {
        this.disposeRunner.emit(this, false);
    }
}
