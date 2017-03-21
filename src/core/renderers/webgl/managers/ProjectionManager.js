import WebGLManager from './WebGLManager';
import { Rectangle, Matrix } from '../../../math';

/**
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 */

export default class ProjectionManager extends WebGLManager
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this.projectionMatrix = new Matrix();
    }

    update(destinationFrame, sourceFrame, root)
    {
        this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
        this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;

        this.calculateProjection(this.destinationFrame, this.sourceFrame, root);

        this.renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix;
        this.renderer.globalUniforms.update();

        const gl = this.renderer.gl;

        // TODO this is bot needed here?
        const resolution = 1;

        // TODO add a check as them may be the same!
        if (this.destinationFrame !== this.sourceFrame)
        {
//            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(
                this.destinationFrame.x | 0,
                this.destinationFrame.y | 0,
                (this.destinationFrame.width * resolution) | 0,
                (this.destinationFrame.height * resolution) | 0
            );
        }
        else
        {
  //          gl.disable(gl.SCISSOR_TEST);
        }

        // TODO - does not need to be updated all the time??
        gl.viewport(
            this.destinationFrame.x | 0,
            this.destinationFrame.y | 0,
            (this.destinationFrame.width * resolution) | 0,
            (this.destinationFrame.height * resolution) | 0
        );
    }

    /**
     * Updates the projection matrix based on a projection frame (which is a rectangle)
     *
     * @param {Rectangle} destinationFrame - The destination frame.
     * @param {Rectangle} sourceFrame - The source frame.
     */
    calculateProjection(destinationFrame, sourceFrame, root)
    {
        const pm = this.projectionMatrix;

        pm.identity();

        // TODO: make dest scale source
        if (!root)
        {
            pm.a = 1 / destinationFrame.width * 2;
            pm.d = 1 / destinationFrame.height * 2;

            pm.tx = -1 - (sourceFrame.x * pm.a);
            pm.ty = -1 - (sourceFrame.y * pm.d);
        }
        else
        {
            pm.a = 1 / destinationFrame.width * 2;
            pm.d = -1 / destinationFrame.height * 2;

            pm.tx = -1 - (sourceFrame.x * pm.a);
            pm.ty = 1 - (sourceFrame.y * pm.d);
        }
    }
}
