import { ExtensionType } from '../../extensions/Extensions';
import { BatchableMesh } from '../mesh/shared/BatchableMesh';
import { NineSliceGeometry } from './NineSliceGeometry';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { NineSliceSprite } from './NineSliceSprite';

/**
 * GPU data for NineSliceSprite.
 * @internal
 */
export class NineSliceSpriteGpuData extends BatchableMesh
{
    constructor()
    {
        super();
        this.geometry = new NineSliceGeometry();
    }

    public destroy()
    {
        this.geometry.destroy();
    }
}

/**
 * The NineSliceSpritePipe is a render pipe for rendering NineSliceSprites.
 * @internal
 */
export class NineSliceSpritePipe implements RenderPipe<NineSliceSprite>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'nineSliceSprite',
    } as const;

    private readonly _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public addRenderable(sprite: NineSliceSprite, instructionSet: InstructionSet)
    {
        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite.didViewUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        this._renderer.renderPipes.batch.addToBatch(gpuSprite, instructionSet);
    }

    public updateRenderable(sprite: NineSliceSprite)
    {
        const gpuSprite = this._getGpuSprite(sprite);

        if (sprite.didViewUpdate) this._updateBatchableSprite(sprite, gpuSprite);

        gpuSprite._batcher.updateElement(gpuSprite);
    }

    public validateRenderable(sprite: NineSliceSprite): boolean
    {
        const gpuSprite = this._getGpuSprite(sprite);

        return !gpuSprite._batcher.checkAndUpdateTexture(
            gpuSprite,
            sprite._texture
        );
    }

    private _updateBatchableSprite(sprite: NineSliceSprite, batchableSprite: BatchableMesh)
    {
        (batchableSprite.geometry as NineSliceGeometry)
            .update(sprite);

        // = sprite.bounds;
        batchableSprite.setTexture(sprite._texture);
    }

    private _getGpuSprite(sprite: NineSliceSprite): NineSliceSpriteGpuData
    {
        return sprite._gpuData[this._renderer.uid] || this._initGPUSprite(sprite);
    }

    private _initGPUSprite(sprite: NineSliceSprite): NineSliceSpriteGpuData
    {
        const gpuData = sprite._gpuData[this._renderer.uid] = new NineSliceSpriteGpuData();

        const batchableMesh = gpuData;

        batchableMesh.renderable = sprite;
        batchableMesh.transform = sprite.groupTransform;
        batchableMesh.texture = sprite._texture;
        batchableMesh.roundPixels = (this._renderer._roundPixels | sprite._roundPixels) as 0 | 1;

        // if the sprite has not been updated by the view, we need to update the batchable mesh now.
        if (!sprite.didViewUpdate)
        {
            this._updateBatchableSprite(sprite, batchableMesh);
        }

        return gpuData;
    }

    public destroy()
    {
        (this._renderer as null) = null;
    }
}
