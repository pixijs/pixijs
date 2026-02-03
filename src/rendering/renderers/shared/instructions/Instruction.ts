/**
 * An instruction that can be executed by the renderer
 * @category rendering
 * @advanced
 */
export interface Instruction
{
    /** a the id of the render pipe that can run this instruction */
    renderPipeId: string;
    /** the name of the instruction */
    action?: string;
    /** true if this instruction can be compiled into a WebGPU bundle */
    canBundle: boolean;
}
