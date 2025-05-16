import { ExtensionType } from '../../extensions/Extensions';
import { getAdjustedBlendModeBlend } from '../../rendering/renderers/shared/state/getAdjustedBlendModeBlend';
import { State } from '../../rendering/renderers/shared/state/State';
import { type Renderer, RendererType } from '../../rendering/renderers/types';
import { color32BitToUniform } from '../graphics/gpu/colorToUniform';
import { BatchableMesh } from '../mesh/shared/BatchableMesh';
import { MeshGeometry } from '../mesh/shared/MeshGeometry';
import { TilingSpriteShader } from './shader/TilingSpriteShader';
import { QuadGeometry } from './utils/QuadGeometry';
import { setPositions } from './utils/setPositions';
import { setUvs } from './utils/setUvs';

import type { WebGLRenderer } from '../../rendering/renderers/gl/WebGLRenderer';
import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { TilingSprite } from './TilingSprite';

const sharedQuad = new QuadGeometry();

/** @internal */
export class TilingSpriteGpuData
{
    public canBatch: boolean = true;
    public renderable: TilingSprite;
    public batchableMesh?: BatchableMesh;
    public geometry?: MeshGeometry;
    public shader?: TilingSpriteShader;

    constructor()
    {
        this.geometry = new MeshGeometry({
            indices: sharedQuad.indices.slice(),
            positions: sharedQuad.positions.slice(),
            uvs: sharedQuad.uvs.slice(),
        });
    }

    public destroy()
    {
        this.geometry.destroy();
        this.shader?.destroy();
    }
}

/**
 * The TilingSpritePipe is a render pipe for rendering TilingSprites.
 * It handles the batching and rendering of TilingSprites using a shader.
 * @internal
 */
export class TilingSpritePipe implements RenderPipe<TilingSprite>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipes,
            ExtensionType.WebGPUPipes,
            ExtensionType.CanvasPipes,
        ],
        name: 'tilingSprite',
    } as const;

    private _renderer: Renderer;
    private readonly _state: State = State.default2d;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public validateRenderable(renderable: TilingSprite): boolean
    {
        const tilingSpriteData = this._getTilingSpriteData(renderable);

        const couldBatch = tilingSpriteData.canBatch;

        this._updateCanBatch(renderable);

        const canBatch = tilingSpriteData.canBatch;

        if (canBatch && canBatch === couldBatch)
        {
            const { batchableMesh } = tilingSpriteData;

            return !batchableMesh._batcher.checkAndUpdateTexture(
                batchableMesh,
                renderable.texture
            );
        }

        return (couldBatch !== canBatch);

        // // TODO - only update if required?
        // // only texture
        // // only uvs
        // // only positions?
    }

    public addRenderable(tilingSprite: TilingSprite, instructionSet: InstructionSet)
    {
        const batcher = this._renderer.renderPipes.batch;

        // init
        this._updateCanBatch(tilingSprite);

        const tilingSpriteData = this._getTilingSpriteData(tilingSprite);

        const { geometry, canBatch } = tilingSpriteData;

        if (canBatch)
        {
            tilingSpriteData.batchableMesh ||= new BatchableMesh();

            const batchableMesh = tilingSpriteData.batchableMesh;

            if (tilingSprite.didViewUpdate)
            {
                this._updateBatchableMesh(tilingSprite);

                batchableMesh.geometry = geometry;
                batchableMesh.renderable = tilingSprite;
                batchableMesh.transform = tilingSprite.groupTransform;
                batchableMesh.setTexture(tilingSprite._texture);
            }

            batchableMesh.roundPixels = (this._renderer._roundPixels | tilingSprite._roundPixels) as 0 | 1;

            batcher.addToBatch(batchableMesh, instructionSet);
        }
        else
        {
            batcher.break(instructionSet);

            tilingSpriteData.shader ||= new TilingSpriteShader();

            this.updateRenderable(tilingSprite);

            instructionSet.add(tilingSprite);
        }
    }

    public execute(tilingSprite: TilingSprite)
    {
        const { shader } = this._getTilingSpriteData(tilingSprite);

        shader.groups[0] = this._renderer.globalUniforms.bindGroup;

        // deal with local uniforms...
        const localUniforms = shader.resources.localUniforms.uniforms;

        localUniforms.uTransformMatrix = tilingSprite.groupTransform;
        localUniforms.uRound = this._renderer._roundPixels | tilingSprite._roundPixels;

        color32BitToUniform(
            tilingSprite.groupColorAlpha,
            localUniforms.uColor,
            0
        );

        this._state.blendMode = getAdjustedBlendModeBlend(tilingSprite.groupBlendMode, tilingSprite.texture._source);

        this._renderer.encoder.draw({
            geometry: sharedQuad,
            shader,
            state: this._state,
        });
    }

    public updateRenderable(tilingSprite: TilingSprite)
    {
        const tilingSpriteData = this._getTilingSpriteData(tilingSprite);

        const { canBatch } = tilingSpriteData;

        if (canBatch)
        {
            const { batchableMesh } = tilingSpriteData;

            if (tilingSprite.didViewUpdate) this._updateBatchableMesh(tilingSprite);

            batchableMesh._batcher.updateElement(batchableMesh);
        }
        else if (tilingSprite.didViewUpdate)
        {
            const { shader } = tilingSpriteData;
            // now update uniforms...

            shader.updateUniforms(
                tilingSprite.width,
                tilingSprite.height,
                tilingSprite._tileTransform.matrix,
                tilingSprite.anchor.x,
                tilingSprite.anchor.y,
                tilingSprite.texture,
            );
        }
    }

    private _getTilingSpriteData(renderable: TilingSprite): TilingSpriteGpuData
    {
        return renderable._gpuData[this._renderer.uid] || this._initTilingSpriteData(renderable);
    }

    private _initTilingSpriteData(tilingSprite: TilingSprite): TilingSpriteGpuData
    {
        const gpuData = new TilingSpriteGpuData();

        gpuData.renderable = tilingSprite;
        tilingSprite._gpuData[this._renderer.uid] = gpuData;

        return gpuData;
    }

    private _updateBatchableMesh(tilingSprite: TilingSprite)
    {
        const renderableData = this._getTilingSpriteData(tilingSprite);

        const { geometry } = renderableData;

        const style = tilingSprite.texture.source.style;

        if (style.addressMode !== 'repeat')
        {
            style.addressMode = 'repeat';
            style.update();
        }

        setUvs(tilingSprite, geometry.uvs);
        setPositions(tilingSprite, geometry.positions);
    }

    public destroy()
    {
        this._renderer = null;
    }

    private _updateCanBatch(tilingSprite: TilingSprite)
    {
        const renderableData = this._getTilingSpriteData(tilingSprite);
        const texture = tilingSprite.texture;

        let _nonPowOf2wrapping = true;

        if (this._renderer.type === RendererType.WEBGL)
        {
            _nonPowOf2wrapping = (this._renderer as WebGLRenderer).context.supports.nonPowOf2wrapping;
        }

        renderableData.canBatch = texture.textureMatrix.isSimple && (_nonPowOf2wrapping || texture.source.isPowerOfTwo);

        return renderableData.canBatch;
    }
}

