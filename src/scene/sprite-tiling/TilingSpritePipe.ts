/* eslint-disable @typescript-eslint/no-use-before-define */
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

interface RenderableData
{
    canBatch: boolean;
    renderable: TilingSprite
    batchableMesh?: BatchableMesh;
    geometry?: MeshGeometry;
    shader?: TilingSpriteShader;
}

const sharedQuad = new QuadGeometry();

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
    private readonly _tilingSpriteDataHash: Record<number, RenderableData> = Object.create(null);

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

            // we are batching.. check a texture change!
            if (batchableMesh && batchableMesh.texture._source !== renderable.texture._source)
            {
                return !batchableMesh.batcher.checkAndUpdateTexture(batchableMesh, renderable.texture);
            }
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

            if (tilingSprite._didTilingSpriteUpdate)
            {
                tilingSprite._didTilingSpriteUpdate = false;

                this._updateBatchableMesh(tilingSprite);

                batchableMesh.geometry = geometry;
                batchableMesh.mesh = tilingSprite;
                batchableMesh.texture = tilingSprite._texture;
            }

            batchableMesh.roundPixels = (this._renderer._roundPixels | tilingSprite._roundPixels) as 0 | 1;

            batcher.addToBatch(batchableMesh);
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
        const { shader } = this._tilingSpriteDataHash[tilingSprite.uid];

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

            if (tilingSprite._didTilingSpriteUpdate) this._updateBatchableMesh(tilingSprite);

            batchableMesh.batcher.updateElement(batchableMesh);
        }
        else if (tilingSprite._didTilingSpriteUpdate)
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

        tilingSprite._didTilingSpriteUpdate = false;
    }

    public destroyRenderable(tilingSprite: TilingSprite)
    {
        const tilingSpriteData = this._getTilingSpriteData(tilingSprite);

        tilingSpriteData.batchableMesh = null;

        tilingSpriteData.shader?.destroy();

        this._tilingSpriteDataHash[tilingSprite.uid] = null;
    }

    private _getTilingSpriteData(renderable: TilingSprite): RenderableData
    {
        return this._tilingSpriteDataHash[renderable.uid] || this._initTilingSpriteData(renderable);
    }

    private _initTilingSpriteData(tilingSprite: TilingSprite): RenderableData
    {
        const geometry = new MeshGeometry({
            indices: sharedQuad.indices,
            positions: sharedQuad.positions.slice(),
            uvs: sharedQuad.uvs.slice(),
        });

        this._tilingSpriteDataHash[tilingSprite.uid] = {
            canBatch: true,
            renderable: tilingSprite,
            geometry,
        };

        tilingSprite.on('destroyed', () =>
        {
            this.destroyRenderable(tilingSprite);
        });

        return this._tilingSpriteDataHash[tilingSprite.uid];
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
        for (const i in this._tilingSpriteDataHash)
        {
            this.destroyRenderable(this._tilingSpriteDataHash[i].renderable);
        }

        (this._tilingSpriteDataHash as null) = null;
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

