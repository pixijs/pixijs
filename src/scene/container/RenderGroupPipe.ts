import { ExtensionType } from '../../extensions/Extensions';
import { Matrix } from '../../maths/matrix/Matrix';
import { BigPool } from '../../utils/pool/PoolGroup';
import { BatchableSprite } from '../sprite/BatchableSprite';
import { executeInstructions } from './utils/executeInstructions';

import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../rendering/renderers/types';
import type { RenderGroup } from './RenderGroup';

const tempMatrix = new Matrix();

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
        if (renderGroup.isCachedAsTexture)
        {
            this._addRenderableCacheAsTexture(renderGroup, instructionSet);
        }
        else
        {
            this._addRenderableDirect(renderGroup, instructionSet);
        }
    }

    public execute(renderGroup: RenderGroup)
    {
        if (!renderGroup.isRenderable) return;

        if (renderGroup.isCachedAsTexture)
        {
            this._executeCacheAsTexture(renderGroup);
        }
        else
        {
            this._executeDirect(renderGroup);
        }
    }

    public destroy(): void
    {
        this._renderer = null;
    }

    private _addRenderableDirect(renderGroup: RenderGroup, instructionSet: InstructionSet): void
    {
        this._renderer.renderPipes.batch.break(instructionSet);

        if (renderGroup._batchableRenderGroup)
        {
            BigPool.return(renderGroup._batchableRenderGroup);
            renderGroup._batchableRenderGroup = null;
        }

        instructionSet.add(renderGroup);
    }

    private _addRenderableCacheAsTexture(renderGroup: RenderGroup, instructionSet: InstructionSet): void
    {
        const batchableRenderGroup = renderGroup._batchableRenderGroup ??= BigPool.get(BatchableSprite);

        batchableRenderGroup.renderable = renderGroup.root;
        batchableRenderGroup.transform = renderGroup.root.relativeGroupTransform;
        batchableRenderGroup.texture = renderGroup.texture;
        batchableRenderGroup.bounds = renderGroup._textureBounds;

        instructionSet.add(renderGroup);
        this._renderer.renderPipes.batch.addToBatch(batchableRenderGroup, instructionSet);
    }

    private _executeCacheAsTexture(renderGroup: RenderGroup): void
    {
        if (renderGroup.textureNeedsUpdate)
        {
            renderGroup.textureNeedsUpdate = false;

            const worldTransformMatrix = tempMatrix
                .identity()
                .translate(
                    -renderGroup._textureBounds.x,
                    -renderGroup._textureBounds.y
                );

            this._renderer.renderTarget.push(renderGroup.texture, true, null, renderGroup.texture.frame);

            this._renderer.globalUniforms.push({
                worldTransformMatrix,
                worldColor: 0xFFFFFFFF,
            });

            executeInstructions(renderGroup, this._renderer.renderPipes);

            this._renderer.renderTarget.finishRenderPass();

            this._renderer.renderTarget.pop();
            this._renderer.globalUniforms.pop();
        }

        renderGroup._batchableRenderGroup._batcher.updateElement(renderGroup._batchableRenderGroup);
        renderGroup._batchableRenderGroup._batcher.geometry.buffers[0].update();
    }

    private _executeDirect(renderGroup: RenderGroup): void
    {
        this._renderer.globalUniforms.push({
            worldTransformMatrix: renderGroup.inverseParentTextureTransform,
            worldColor: renderGroup.worldColorAlpha,
        });

        executeInstructions(renderGroup, this._renderer.renderPipes);

        this._renderer.globalUniforms.pop();
    }
}
