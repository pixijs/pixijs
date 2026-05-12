import { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';

import type { Batcher } from '../../../rendering/batcher/shared/Batcher';

/**
 * Base class for per-context render data that pairs a Batcher with an InstructionSet.
 * Subclasses provide a concrete batcher type via `_createBatcher`.
 * @category rendering
 * @internal
 */
export abstract class AbstractGraphicsContextRenderData<TBatcher extends Batcher>
{
    public batcher: TBatcher;
    public instructions = new InstructionSet();

    public init(options: { maxTextures: number })
    {
        const maxTextures = options.maxTextures;

        this.batcher ? this._updateBatcher(maxTextures) : this.batcher = this._createBatcher(maxTextures);
        this.instructions.reset();
    }

    public destroy()
    {
        this.batcher.destroy();
        this.instructions.destroy();

        this.batcher = null;
        this.instructions = null;
    }

    protected abstract _createBatcher(maxTextures: number): TBatcher;
    protected abstract _updateBatcher(maxTextures: number): void;
}
