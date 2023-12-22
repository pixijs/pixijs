/* eslint-disable @typescript-eslint/no-use-before-define */
import { ExtensionType } from '../../extensions/Extensions';
import { Matrix } from '../../maths/matrix/Matrix';
import { ProxyRenderable } from '../../rendering/renderers/shared/ProxyRenderable';
import { MeshView } from '../mesh/shared/MeshView';
import { QuadGeometry } from './QuadGeometry';
import { TilingSpriteShader } from './shader/TilingSpriteShader';

import type { TypedArray } from '../../rendering/renderers/shared/buffer/Buffer';
import type { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderable } from '../../rendering/renderers/shared/Renderable';
import type { Renderer } from '../../rendering/renderers/types';
import type { TilingSpriteView } from './TilingSpriteView';

interface RenderableData
{
    batched: boolean;
    renderable: Renderable<TilingSpriteView>
    batchedMesh?: Renderable<MeshView>;
    gpuTilingSprite?: {
        meshRenderable: Renderable<MeshView>
        textureMatrix: Matrix;
    };
}

const sharedQuad = new QuadGeometry();

export class TilingSpritePipe implements RenderPipe<TilingSpriteView>
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

    private _renderableHash: Record<number, RenderableData> = Object.create(null);

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    public validateRenderable(renderable: Renderable<TilingSpriteView>): boolean
    {
        const textureMatrix = renderable.view.texture.textureMatrix;

        let rebuild = false;

        const renderableData = this._getRenderableData(renderable);

        if (renderableData.batched !== textureMatrix.isSimple)
        {
            renderableData.batched = textureMatrix.isSimple;

            rebuild = true;
        }

        // TODO - only update if required?
        // only texture
        // only uvs
        // only positions?

        return rebuild;
    }

    public addRenderable(renderable: Renderable<TilingSpriteView>, instructionSet: InstructionSet)
    {
        if (renderable.view._didUpdate)
        {
            renderable.view._didUpdate = false;

            this._rebuild(renderable);
        }

        const { batched } = this._getRenderableData(renderable);

        if (batched)
        {
            const batchableTilingSprite = this._getBatchedTilingSprite(renderable);

            this._renderer.renderPipes.mesh.addRenderable(batchableTilingSprite, instructionSet);
        }
        else
        {
            const gpuTilingSprite = this._getGpuTilingSprite(renderable);

            this._renderer.renderPipes.mesh.addRenderable(gpuTilingSprite.meshRenderable, instructionSet);
        }
    }

    public updateRenderable(renderable: Renderable<TilingSpriteView>)
    {
        if (renderable.view._didUpdate)
        {
            renderable.view._didUpdate = false;

            this._rebuild(renderable);
        }

        const { batched } = this._getRenderableData(renderable);

        if (batched)
        {
            const batchableTilingSprite = this._getBatchedTilingSprite(renderable);

            this._renderer.renderPipes.mesh.updateRenderable(batchableTilingSprite);
        }
        else
        {
            const gpuTilingSprite = this._getGpuTilingSprite(renderable);

            this._renderer.renderPipes.mesh.updateRenderable(gpuTilingSprite.meshRenderable);
        }
    }

    public destroyRenderable(renderable: Renderable<TilingSpriteView>)
    {
        const data = this._renderableHash[renderable.uid];

        data.batchedMesh?.view.destroy();
        data.gpuTilingSprite?.meshRenderable.view.destroy();

        // TODO pooling for the items... not a biggie though!
        this._renderableHash[renderable.uid] = null;

        renderable.off('destroyed', this.destroyRenderable, this);
    }

    private _getRenderableData(renderable: Renderable<TilingSpriteView>): RenderableData
    {
        return this._renderableHash[renderable.uid] || this._initRenderableData(renderable);
    }

    private _initRenderableData(renderable: Renderable<TilingSpriteView>): RenderableData
    {
        const renderableData = {
            batched: true,
            renderable
        };

        this._renderableHash[renderable.uid] = renderableData;

        this.validateRenderable(renderable);

        renderable.on('destroyed', () =>
        {
            this.destroyRenderable(renderable);
        });

        return renderableData;
    }

    private _rebuild(renderable: Renderable<TilingSpriteView>)
    {
        const renderableData = this._getRenderableData(renderable);
        const view = renderable.view;
        const textureMatrix = view.texture.textureMatrix;

        if (renderableData.batched)
        {
            const batchedMesh = this._getBatchedTilingSprite(renderable);

            batchedMesh.view.texture = view.texture;

            const style = view.texture.source.style;

            if (style.addressMode !== 'repeat')
            {
                style.addressMode = 'repeat';
                style.update();
            }

            this._updateBatchPositions(renderable);
            this._updateBatchUvs(renderable);
        }
        else
        {
            const gpuTilingSprite = this._getGpuTilingSprite(renderable);
            const { meshRenderable } = gpuTilingSprite;

            const meshView = meshRenderable.view;

            meshView.shader.texture = view.texture;

            const tilingUniforms = meshView.shader.resources.tilingUniforms;

            const originalWidth = view.width;
            const originalHeight = view.height;

            const tilingSpriteWidth = view.texture.width;
            const tilingSpriteHeight = view.texture.height;

            const matrix = view._tileTransform.matrix;

            const uTextureTransform = tilingUniforms.uniforms.uTextureTransform;

            uTextureTransform.set(
                matrix.a * tilingSpriteWidth / originalWidth,
                matrix.b * tilingSpriteWidth / originalHeight,
                matrix.c * tilingSpriteHeight / originalWidth,
                matrix.d * tilingSpriteHeight / originalHeight,
                matrix.tx / originalWidth,
                matrix.ty / originalHeight);

            uTextureTransform.invert();

            tilingUniforms.uniforms.uMapCoord = textureMatrix.mapCoord;
            tilingUniforms.uniforms.uClampFrame = textureMatrix.uClampFrame;
            tilingUniforms.uniforms.uClampOffset = textureMatrix.uClampOffset;
            tilingUniforms.uniforms.uTextureTransform = uTextureTransform;
            tilingUniforms.uniforms.uSizeAnchor[0] = originalWidth;
            tilingUniforms.uniforms.uSizeAnchor[1] = originalHeight;
            tilingUniforms.uniforms.uSizeAnchor[2] = renderable.view.anchor.x;
            tilingUniforms.uniforms.uSizeAnchor[3] = renderable.view.anchor.y;

            tilingUniforms.update();
        }
    }

    private _getGpuTilingSprite(renderable: Renderable<TilingSpriteView>)
    {
        return this._renderableHash[renderable.uid].gpuTilingSprite || this._initGpuTilingSprite(renderable);
    }

    private _initGpuTilingSprite(renderable: Renderable<TilingSpriteView>)
    {
        const view = renderable.view;

        const style = view.texture.source.style;

        style.addressMode = 'repeat';
        style.update();

        const meshView = new MeshView({
            geometry: sharedQuad,
            shader: new TilingSpriteShader({
                texture: view.texture,
            }),
        });

        const meshRenderable = new ProxyRenderable({
            original: renderable,
            view: meshView,
        });

        const textureMatrix = new Matrix();

        const gpuTilingSpriteData = {
            meshRenderable,
            textureMatrix,
        };

        this._renderableHash[renderable.uid].gpuTilingSprite = gpuTilingSpriteData;

        return gpuTilingSpriteData;
    }

    private _getBatchedTilingSprite(renderable: Renderable<TilingSpriteView>): Renderable<MeshView>
    {
        return this._renderableHash[renderable.uid].batchedMesh || this._initBatchedTilingSprite(renderable);
    }

    private _initBatchedTilingSprite(renderable: Renderable<TilingSpriteView>)
    {
        const meshView = new MeshView({
            geometry: new QuadGeometry(),
            texture: renderable.view.texture,
        });

        meshView.roundPixels = (this._renderer._roundPixels | renderable.view.roundPixels) as 0 | 1;

        const batchableMeshRenderable = new ProxyRenderable({
            original: renderable,
            view: meshView,
        });

        this._renderableHash[renderable.uid].batchedMesh = batchableMeshRenderable;

        return batchableMeshRenderable;
    }

    private _updateBatchPositions(renderable: Renderable<TilingSpriteView>)
    {
        const meshRenderable = this._getBatchedTilingSprite(renderable);
        const view = renderable.view;

        const positionBuffer = meshRenderable.view.geometry.getBuffer('aPosition');

        const positions = positionBuffer.data;
        const anchorX = view.anchor.x;
        const anchorY = view.anchor.y;

        positions[0] = -anchorX * view.width;
        positions[1] = -anchorY * view.height;
        positions[2] = (1 - anchorX) * view.width;
        positions[3] = -anchorY * view.height;
        positions[4] = (1 - anchorX) * view.width;
        positions[5] = (1 - anchorY) * view.height;
        positions[6] = -anchorX * view.width;
        positions[7] = (1 - anchorY) * view.height;
    }

    private _updateBatchUvs(renderable: Renderable<TilingSpriteView>)
    {
        const view = renderable.view;
        const width = view.texture.frame.width;
        const height = view.texture.frame.height;

        const meshRenderable = this._getBatchedTilingSprite(renderable);

        const uvBuffer = meshRenderable.view.geometry.getBuffer('aUV');

        const uvs = uvBuffer.data;

        let anchorX = 0;
        let anchorY = 0;

        if (view._applyAnchorToTexture)
        {
            anchorX = view.anchor.x;
            anchorY = view.anchor.y;
        }

        uvs[0] = uvs[6] = -anchorX;
        uvs[2] = uvs[4] = 1 - anchorX;
        uvs[1] = uvs[3] = -anchorY;
        uvs[5] = uvs[7] = 1 - anchorY;

        const textureMatrix = Matrix.shared;

        textureMatrix.copyFrom(view._tileTransform.matrix);

        textureMatrix.tx /= view.width;
        textureMatrix.ty /= view.height;

        textureMatrix.invert();

        textureMatrix.scale(view.width / width, view.height / height);

        applyMatrix(uvs, 2, 0, textureMatrix);
    }

    public destroy()
    {
        for (const i in this._renderableHash)
        {
            this.destroyRenderable(this._renderableHash[i].renderable);
        }

        this._renderableHash = null;
        this._renderer = null;
    }
}

function applyMatrix(array: TypedArray, stride: number, offset: number, matrix: Matrix)
{
    let index = 0;
    const size = array.length / (stride || 2);

    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;
    const tx = matrix.tx;
    const ty = matrix.ty;

    offset *= stride;

    while (index < size)
    {
        const x = array[offset];
        const y = array[offset + 1];

        array[offset] = (a * x) + (c * y) + tx;
        array[offset + 1] = (b * x) + (d * y) + ty;

        offset += stride;

        index++;
    }
}
