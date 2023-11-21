import { ExtensionType } from '../../../extensions/Extensions';
import { FilterEffect } from '../../../filters/FilterEffect';
import { MaskFilter } from '../../../filters/mask/MaskFilter';
import { Bounds } from '../../../scene/container/bounds/Bounds';
import { getGlobalBounds } from '../../../scene/container/bounds/getGlobalBounds';
import { collectAllRenderables } from '../../../scene/container/utils/buildInstructions';
import { Sprite } from '../../../scene/sprite/Sprite';
import { BigPool } from '../../../utils/pool/PoolGroup';
import { Texture } from '../../renderers/shared/texture/Texture';
import { TexturePool } from '../../renderers/shared/texture/TexturePool';

import type { Container } from '../../../scene/container/Container';
import type { Effect } from '../../../scene/container/Effect';
import type { PoolItem } from '../../../utils/pool/Pool';
import type { Instruction } from '../../renderers/shared/instructions/Instruction';
import type { InstructionSet } from '../../renderers/shared/instructions/InstructionSet';
import type { InstructionPipe } from '../../renderers/shared/instructions/RenderPipe';
import type { RenderTarget } from '../../renderers/shared/renderTarget/RenderTarget';
import type { Renderer } from '../../renderers/types';
import type { AlphaMask } from './AlphaMask';

type MaskMode = 'pushMaskBegin' | 'pushMaskEnd' | 'popMaskBegin' | 'popMaskEnd';

const tempBounds = new Bounds();

class AlphaMaskEffect extends FilterEffect implements PoolItem
{
    constructor()
    {
        super({
            filters: [new MaskFilter({
                sprite: new Sprite(Texture.EMPTY)
            })]
        });
    }

    get sprite(): Sprite
    {
        return (this.filters[0] as MaskFilter).sprite;
    }

    set sprite(value: Sprite)
    {
        (this.filters[0] as MaskFilter).sprite = value;
    }

    public init: () => void;
}

export interface AlphaMaskInstruction extends Instruction
{
    renderPipeId: 'alphaMask',
    action: MaskMode,
    mask: AlphaMask,
    maskedContainer: Container,
    renderMask: boolean,
}

export interface AlphaMaskData
{
    filterEffect: AlphaMaskEffect,
    maskedContainer: Container,
    previousRenderTarget?: RenderTarget,
    filterTexture?: Texture,
}

export class AlphaMaskPipe implements InstructionPipe<AlphaMaskInstruction>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'alphaMask',
    } as const;

    private _renderer: Renderer;
    private _activeMaskStage: AlphaMaskData[] = [];

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public push(mask: Effect, maskedContainer: Container, instructionSet: InstructionSet): void
    {
        const renderer = this._renderer;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'alphaMask',
            action: 'pushMaskBegin',
            mask,
            canBundle: false,
            maskedContainer
        } as AlphaMaskInstruction);

        if ((mask as AlphaMask).renderMaskToTexture)
        {
            const maskContainer = (mask as AlphaMask).mask;

            maskContainer.includeInBuild = true;

            collectAllRenderables(
                maskContainer,
                instructionSet,
                renderer.renderPipes
            );

            maskContainer.includeInBuild = false;
        }

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'alphaMask',
            action: 'pushMaskEnd',
            mask,
            maskedContainer,
            canBundle: false,
        } as AlphaMaskInstruction);
    }

    public pop(mask: Effect, _maskedContainer: Container, instructionSet: InstructionSet): void
    {
        const renderer = this._renderer;

        renderer.renderPipes.batch.break(instructionSet);

        instructionSet.add({
            renderPipeId: 'alphaMask',
            action: 'popMaskEnd',
            mask,
            canBundle: false,
        } as AlphaMaskInstruction);
    }

    public execute(instruction: AlphaMaskInstruction)
    {
        const renderer = this._renderer;
        const renderMask = instruction.mask.renderMaskToTexture;

        if (instruction.action === 'pushMaskBegin')
        {
            const filterEffect = BigPool.get(AlphaMaskEffect);

            if (renderMask)
            {
                instruction.mask.mask.measurable = true;

                const bounds = getGlobalBounds(instruction.mask.mask, true, tempBounds);

                instruction.mask.mask.measurable = false;

                bounds.ceil();

                /// /////
                const filterTexture = TexturePool.getOptimalTexture(
                    bounds.width,
                    bounds.height,
                    1,
                    false
                );

                renderer.renderTarget.push(filterTexture, true);

                renderer.globalUniforms.push({
                    offset: bounds,
                    worldColor: 0xFFFFFFFF
                });

                const sprite = filterEffect.sprite;

                sprite.texture = filterTexture;

                sprite.worldTransform.tx = bounds.minX;
                sprite.worldTransform.ty = bounds.minY;

                this._activeMaskStage.push({

                    filterEffect,
                    maskedContainer: instruction.maskedContainer,
                    filterTexture,
                });
            }
            else
            {
                filterEffect.sprite = instruction.mask.mask as Sprite;

                this._activeMaskStage.push({
                    filterEffect,
                    maskedContainer: instruction.maskedContainer,
                });
            }
        }
        else if (instruction.action === 'pushMaskEnd')
        {
            const maskData = this._activeMaskStage[this._activeMaskStage.length - 1];

            if (renderMask)
            {
                renderer.renderTarget.pop();
                renderer.globalUniforms.pop();
            }

            renderer.filter.push({
                renderPipeId: 'filter',
                action: 'pushFilter',
                container: maskData.maskedContainer,
                filterEffect: maskData.filterEffect,
                canBundle: false,
            });
        }
        else if (instruction.action === 'popMaskEnd')
        {
            renderer.filter.pop();

            const maskData = this._activeMaskStage.pop();

            if (renderMask)
            {
                TexturePool.returnTexture(maskData.filterTexture);
            }

            BigPool.return(maskData.filterEffect);
        }
    }

    public destroy(): void
    {
        this._renderer = null;
        this._activeMaskStage = null;
    }
}
