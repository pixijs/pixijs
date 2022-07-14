import { Runner } from '@pixi/runner';
import type { Buffer } from 'pixi.js';

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
