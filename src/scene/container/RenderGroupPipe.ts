import { ExtensionType } from '../../extensions/Extensions';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableSprite } from '../sprite/BatchableSprite';
import { executeInstructions } from './utils/executeInstructions';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { RenderGroup } from './RenderGroup';

export class RenderGroupPipe implements InstructionPipe<RenderGroup>
{
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'renderGroup',
    } as const;

    private _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public addRenderGroup(renderGroup: RenderGroup, instructionSet: InstructionSet): void
    {
        // TODO should we skip this if renderGroup is - render just in time?
        // here! we need to render to a texture if required...
        if (renderGroup.cacheAsTexture)
        {
            const batchableRenderGroup = renderGroup._batchableRenderGroup ??= BigPool.get(BatchableSprite);

            batchableRenderGroup.renderable = renderGroup.root;
            batchableRenderGroup.transform = renderGroup.root.relativeGroupTransform;
            batchableRenderGroup.texture = renderGroup.texture;
            batchableRenderGroup.bounds = renderGroup.textureBounds;

            instructionSet.add(renderGroup);
            this._renderer.renderPipes.batch.addToBatch(batchableRenderGroup, instructionSet);
        }
        else
        {
            this._renderer.renderPipes.batch.break(instructionSet);

            if (renderGroup._batchableRenderGroup)
            {
                BigPool.return(renderGroup._batchableRenderGroup);
                renderGroup._batchableRenderGroup = null;
            }

            instructionSet.add(renderGroup);
        }
    }

    public execute(renderGroup: RenderGroup)
    {
        if (!renderGroup.isRenderable) return;

        if (renderGroup.cacheAsTexture)
        {
            renderGroup._batchableRenderGroup._batcher.updateElement(renderGroup._batchableRenderGroup);
            renderGroup._batchableRenderGroup._batcher.geometry.buffers[0].update();
        }
        else
        {
            this._renderer.globalUniforms.push({
                worldTransformMatrix: renderGroup.worldTransform,
                worldColor: renderGroup.worldColorAlpha,
            });

            executeInstructions(renderGroup, this._renderer.renderPipes);

            this._renderer.globalUniforms.pop();
        }
    }

    public destroy(): void
    {
        this._renderer = null;
    }
}
