import { Matrix } from '../../maths/matrix/Matrix';
import { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import { type SCALE_MODE } from '../../rendering/renderers/shared/texture/const';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';
import { type Renderer } from '../../rendering/renderers/types';
import { RenderGroupState } from './RenderGroupState';
import { renderPass } from './renderPass';

import type { Instruction } from '../../rendering/renderers/shared/instructions/Instruction';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BatchableSprite } from '../sprite/BatchableSprite';
import type { ViewContainer } from '../view/ViewContainer';
import type { Bounds } from './bounds/Bounds';
import type { Container } from './Container';
import type { RenderView } from './renderPass';

/**
 * Options for caching a container as a texture.
 * @category rendering
 * @advanced
 */
export interface CacheAsTextureOptions
{
    /**
     * If true, the texture will be antialiased. This smooths out the edges of the texture.
     * @default false
     */
    antialias?: boolean;
    /**
     * The resolution of the texture. A higher resolution means a sharper texture but uses more memory.
     * By default the resolution is 1 which is the same as the rendererers resolution.
     */
    resolution?: number;
    /**
     * Scale Mode to use for the cached texture
     * @type {SCALE_MODE}
     * @default 'linear'
     * @example
     * ```ts
     * const container = new Container();
     * container.cacheAsTexture({ scaleMode: 'nearest' });
     * ```
     * @see {@link SCALE_MODE}
     */
    scaleMode?: SCALE_MODE;
}

/**
 * A RenderGroup is a class that is responsible for I generating a set of instructions that are used to render the
 * root container and its children. It also watches for any changes in that container or its children,
 * these changes are analysed and either the instruction set is rebuild or the instructions data is updated.
 * @category rendering
 * @advanced
 */
export class RenderGroup implements Instruction
{
    public renderPipeId = 'renderGroup';
    public root: Container = null;

    public canBundle = false;

    public renderGroupParent: RenderGroup = null;
    public renderGroupChildren: RenderGroup[] = [];

    /**
     * Where this is in its scene. Rendering the scene to a texture does not change it.
     * @internal
     */
    public readonly _sceneState = new RenderGroupState();
    /**
     * Where this is in the last render it was part of, for use while that render runs.
     * @internal
     */
    public readonly _passState = new RenderGroupState();
    /**
     * The id of the last render this was part of.
     * @internal
     */
    public _passId = -1;
    /**
     * Whether the scene state is known, as this has been rendered, or added to one that has.
     * @internal
     */
    public _isPlaced = false;
    /**
     * Where its scene is, if it was drawn as the root of a render with a transform other than its own.
     * @internal
     */
    public _sceneTransform: Matrix | null = null;
    /**
     * The view this was last drawn to as the root of a render.
     * @internal
     */
    public _view: RenderView | null = null;
    /**
     * The frame of the view it was drawn in.
     * @internal
     */
    public _viewFrame = 0;

    // these updates are transform changes..
    public readonly childrenToUpdate: Record<number, { list: Container[]; index: number; }> = Object.create(null);
    public updateTick = 0;
    public gcTick = 0;

    // these update are renderable changes..
    public readonly childrenRenderablesToUpdate: { list: Container[]; index: number; } = { list: [], index: 0 };

    // other
    public structureDidChange = true;

    public instructionSet: InstructionSet = new InstructionSet();

    private readonly _onRenderContainers: Container[] = [];

    /**
     * Indicates if the cached texture needs to be updated.
     * @default true
     */
    public textureNeedsUpdate = true;

    /**
     * Indicates if the container should be cached as a texture.
     * @default false
     */
    public isCachedAsTexture = false;

    /**
     * The texture used for caching the container. this is only set if isCachedAsTexture is true.
     * It can only be accessed after a render pass.
     * @type {Texture | undefined}
     */
    public texture?: Texture;

    /**
     * The bounds of the cached texture.
     * @type {Bounds | undefined}
     * @ignore
     */
    public _textureBounds?: Bounds;

    /**
     * The options for caching the container as a texture.
     * @type {CacheAsTextureOptions}
     */
    public textureOptions: CacheAsTextureOptions;

    /**
     *  holds a reference to the batchable render sprite
     *  @ignore
     */
    public _batchableRenderGroup: BatchableSprite;

    /**
     * Holds a reference to the closest parent RenderGroup that has isCachedAsTexture enabled,
     * in the last render this was part of.
     * This is used to properly transform coordinates when rendering into cached textures.
     * @type {RenderGroup | null}
     * @ignore
     */
    public _parentCacheAsTextureRenderGroup: RenderGroup;

    private _inverseWorldTransform: Matrix;
    private _textureOffsetInverseTransform: Matrix;
    private _inverseParentTextureTransform: Matrix;

    private _matrixDirty = 0b111;
    private _matrixPassId = 0;

    public init(root: Container)
    {
        this.root = root;
        this._sceneState.set(root.localTransform, root.localColor, root.localAlpha);
        this.invalidateMatrices();

        if (root._onRender) this.addOnRender(root);

        root.didChange = true;

        const children = root.children;

        for (let i = 0; i < children.length; i++)
        {
            const child = children[i];

            // make sure the children are all updated on the first pass..
            child._updateFlags = 0b1111;

            this.addChild(child);
        }
    }

    public enableCacheAsTexture(options: CacheAsTextureOptions = {}): void
    {
        this.textureOptions = options;
        this.isCachedAsTexture = true;
        this.textureNeedsUpdate = true;
    }

    public disableCacheAsTexture(): void
    {
        this.isCachedAsTexture = false;
        if (this.texture)
        {
            TexturePool.returnTexture(this.texture);
            this.texture = null;
        }
    }

    public updateCacheTexture(): void
    {
        this.textureNeedsUpdate = true;

        let cachedParent = this.renderGroupParent;

        while (cachedParent && !cachedParent.isCachedAsTexture)
        {
            cachedParent = cachedParent.renderGroupParent;
        }

        // It's worth going bottom-up and notify all parents cached as texture
        // that cached child was updated.
        if (cachedParent && !cachedParent.textureNeedsUpdate)
        {
            cachedParent.updateCacheTexture();
        }
    }

    public reset()
    {
        this.renderGroupChildren.length = 0;

        for (const i in this.childrenToUpdate)
        {
            const childrenAtDepth = this.childrenToUpdate[i];

            childrenAtDepth.list.fill(null);
            childrenAtDepth.index = 0;
        }

        this.childrenRenderablesToUpdate.index = 0;
        this.childrenRenderablesToUpdate.list.fill(null);

        this.root = null;
        this.updateTick = 0;
        this.structureDidChange = true;

        this._onRenderContainers.length = 0;
        this.renderGroupParent = null;
        this._parentCacheAsTextureRenderGroup = null;

        this._passId = -1;
        this._isPlaced = false;
        this._sceneTransform = null;
        this._view = null;

        this.disableCacheAsTexture();
    }

    get localTransform()
    {
        return this.root.localTransform;
    }

    public addRenderGroupChild(renderGroupChild: RenderGroup)
    {
        if (renderGroupChild.renderGroupParent)
        {
            renderGroupChild.renderGroupParent._removeRenderGroupChild(renderGroupChild);
        }

        renderGroupChild.renderGroupParent = this;

        // until a new render group is first rendered, the containers in it are still relative to this one
        if (renderGroupChild._passId === -1)
        {
            renderGroupChild._sceneState.copyFrom(this._sceneState);
            renderGroupChild._isPlaced = this._isPlaced;
        }

        this.renderGroupChildren.push(renderGroupChild);
    }

    private _removeRenderGroupChild(renderGroupChild: RenderGroup)
    {
        const index = this.renderGroupChildren.indexOf(renderGroupChild);

        if (index > -1)
        {
            this.renderGroupChildren.splice(index, 1);
        }

        renderGroupChild.renderGroupParent = null;
    }

    public addChild(child: Container)
    {
        this.structureDidChange = true;

        child.parentRenderGroup = this;

        child.updateTick = -1;

        if (child.parent === this.root)
        {
            child.relativeRenderGroupDepth = 1;
        }
        else
        {
            child.relativeRenderGroupDepth = child.parent.relativeRenderGroupDepth + 1;
        }

        child.didChange = true;
        this.onChildUpdate(child);

        if (child.renderGroup)
        {
            this.addRenderGroupChild(child.renderGroup);

            return;
        }

        if (child._onRender) this.addOnRender(child);

        const children = child.children;

        for (let i = 0; i < children.length; i++)
        {
            this.addChild(children[i]);
        }
    }

    public removeChild(child: Container)
    {
        // remove all the children...
        this.structureDidChange = true;

        if (child._onRender)
        {
            // Remove the child to the onRender list under the following conditions:
            // 1. If the child is not a render group.
            // 2. If the child is a render group root of this render group - which it can't be removed from in this case.
            if (!child.renderGroup)
            {
                this.removeOnRender(child);
            }
        }

        child.parentRenderGroup = null;

        if (child.renderGroup)
        {
            this._removeRenderGroupChild(child.renderGroup);

            return;
        }

        const children = child.children;

        for (let i = 0; i < children.length; i++)
        {
            this.removeChild(children[i]);
        }
    }

    public removeChildren(children: Container[])
    {
        for (let i = 0; i < children.length; i++)
        {
            this.removeChild(children[i]);
        }
    }

    /**
     * Lets go of the containers in this, when there is no render group to take them.
     * @internal
     */
    public _releaseChildren()
    {
        const containers = this.getChildren();

        for (let i = 0; i < containers.length; i++)
        {
            // reading it keeps it, so they stay where they were until they are in a render group again
            void containers[i].worldTransform;
        }

        this.removeChildren(this.root.children);
    }

    public onChildUpdate(child: Container)
    {
        let childrenToUpdate = this.childrenToUpdate[child.relativeRenderGroupDepth];

        if (!childrenToUpdate)
        {
            childrenToUpdate = this.childrenToUpdate[child.relativeRenderGroupDepth] = {
                index: 0,
                list: [],
            };
        }

        childrenToUpdate.list[childrenToUpdate.index++] = child;
    }

    public updateRenderable(renderable: ViewContainer)
    {
        if (renderable.globalDisplayStatus < 0b111) return;
        this.instructionSet.renderPipes[renderable.renderPipeId].updateRenderable(renderable);
        renderable.didViewUpdate = false;
    }

    public onChildViewUpdate(child: Container)
    {
        this.childrenRenderablesToUpdate.list[this.childrenRenderablesToUpdate.index++] = child;
    }

    /**
     * Whether a view is showing this, drawn as the root of a render.
     * @internal
     */
    get _isOnView(): boolean
    {
        return this._view !== null && this._view.frame === this._viewFrame;
    }

    /**
     * Whether this is drawn as its cached texture. The root of a render is not, it is drawn directly.
     * @internal
     */
    get _isDrawnAsTexture(): boolean
    {
        return this.isCachedAsTexture && renderPass.root !== this;
    }

    /** The state in the render that is running if this is part of it, otherwise in the scene. */
    private get _state(): RenderGroupState
    {
        return this._passId === renderPass.id ? this._passState : this._sceneState;
    }

    get worldTransform(): Matrix
    {
        return this._state.transform;
    }

    set worldTransform(value: Matrix)
    {
        this._state.transform.copyFrom(value);
    }

    get worldColor(): number
    {
        return this._state.color;
    }

    set worldColor(value: number)
    {
        this._state.color = value;
    }

    get worldAlpha(): number
    {
        return this._state.alpha;
    }

    set worldAlpha(value: number)
    {
        this._state.alpha = value;
    }

    get worldColorAlpha(): number
    {
        return this._state.colorAlpha;
    }

    set worldColorAlpha(value: number)
    {
        this._state.colorAlpha = value;
    }

    get isRenderable(): boolean
    {
        return (this.root.localDisplayStatus === 0b111 && this.worldAlpha > 0);
    }

    /**
     * adding a container to the onRender list will make sure the user function
     * passed in to the user defined 'onRender` callBack
     * @param container - the container to add to the onRender list
     */
    public addOnRender(container: Container)
    {
        if (this._onRenderContainers.indexOf(container) === -1)
        {
            this._onRenderContainers.push(container);
        }
    }

    public removeOnRender(container: Container)
    {
        const idx = this._onRenderContainers.indexOf(container);

        if (idx !== -1) this._onRenderContainers.splice(idx, 1);
    }

    public runOnRender(renderer: Renderer)
    {
        for (let i = 0; i < this._onRenderContainers.length; i++)
        {
            this._onRenderContainers[i]._onRender(renderer);
        }
    }

    public destroy()
    {
        this.disableCacheAsTexture();

        this.renderGroupParent = null;
        this.root = null;
        (this.childrenRenderablesToUpdate as any) = null;
        (this.childrenToUpdate as any) = null;
        (this.renderGroupChildren as any) = null;
        (this._onRenderContainers as any) = null;
        this.instructionSet?.destroy();
        this.instructionSet = null;
    }

    public getChildren(out: Container[] = []): Container[]
    {
        const children = this.root.children;

        for (let i = 0; i < children.length; i++)
        {
            this._getChildren(children[i], out);
        }

        return out;
    }

    private _getChildren(container: Container, out: Container[] = []): Container[]
    {
        out.push(container);

        if (container.renderGroup) return out;

        const children = container.children;

        for (let i = 0; i < children.length; i++)
        {
            this._getChildren(children[i], out);
        }

        return out;
    }

    public invalidateMatrices()
    {
        this._matrixDirty = 0b111;
    }

    /** The matrices are of the world transform, which is not the same in a render and out of it. */
    private _validateMatrices()
    {
        const passId = this._passId === renderPass.id ? renderPass.id : 0;

        if (this._matrixPassId === passId) return;

        this._matrixPassId = passId;
        this.invalidateMatrices();
    }

    /**
     * Returns the inverse of the world transform matrix.
     * @returns {Matrix} The inverse of the world transform matrix.
     */
    public get inverseWorldTransform()
    {
        this._validateMatrices();
        if ((this._matrixDirty & 0b001) === 0) return this._inverseWorldTransform;

        this._matrixDirty &= ~0b001;

        // TODO - add dirty flag
        this._inverseWorldTransform ||= new Matrix();

        return this._inverseWorldTransform
            .copyFrom(this.worldTransform)
            .invert();
    }

    /**
     * Returns the inverse of the texture offset transform matrix.
     * @returns {Matrix} The inverse of the texture offset transform matrix.
     */
    public get textureOffsetInverseTransform()
    {
        this._validateMatrices();
        if ((this._matrixDirty & 0b010) === 0) return this._textureOffsetInverseTransform;

        this._matrixDirty &= ~0b010;

        this._textureOffsetInverseTransform ||= new Matrix();

        // TODO shared.. bad!
        return this._textureOffsetInverseTransform
            .copyFrom(this.inverseWorldTransform)
            .translate(
                -this._textureBounds.x,
                -this._textureBounds.y
            );
    }

    /**
     * Returns the inverse of the parent texture transform matrix.
     * This is used to properly transform coordinates when rendering into cached textures.
     * @returns {Matrix} The inverse of the parent texture transform matrix.
     */
    public get inverseParentTextureTransform()
    {
        this._validateMatrices();
        if ((this._matrixDirty & 0b100) === 0) return this._inverseParentTextureTransform;

        this._matrixDirty &= ~0b100;

        const parentCacheAsTexture = this._parentCacheAsTextureRenderGroup;

        if (parentCacheAsTexture)
        {
            this._inverseParentTextureTransform ||= new Matrix();

            // Get relative transform by removing parent's world transform
            return this._inverseParentTextureTransform
                .copyFrom(this.worldTransform)
                .prepend(parentCacheAsTexture.inverseWorldTransform)
                // Offset by texture bounds
                .translate(
                    -parentCacheAsTexture._textureBounds.x,
                    -parentCacheAsTexture._textureBounds.y
                );
        }

        return this.worldTransform;
    }

    /**
     * Returns a matrix that transforms coordinates to the correct coordinate space of the texture being rendered to.
     * This is the texture offset inverse transform of the closest parent RenderGroup that is cached as a texture.
     * @returns {Matrix | null} The transform matrix for the cached texture coordinate space,
     * or null if no parent is cached as texture.
     */
    public get cacheToLocalTransform()
    {
        if (this._isDrawnAsTexture)
        {
            return this.textureOffsetInverseTransform;
        }

        if (!this._parentCacheAsTextureRenderGroup) return null;

        return this._parentCacheAsTextureRenderGroup.textureOffsetInverseTransform;
    }
}
