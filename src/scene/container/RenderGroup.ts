import { Matrix } from '../../maths/matrix/Matrix';
import { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import { TexturePool } from '../../rendering/renderers/shared/texture/TexturePool';

import type { Instruction } from '../../rendering/renderers/shared/instructions/Instruction';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { BatchableSprite } from '../sprite/BatchableSprite';
import type { ViewContainer } from '../view/ViewContainer';
import type { Bounds } from './bounds/Bounds';
import type { Container } from './Container';

/**
 * Options for caching a container as a texture.
 * @memberof rendering
 * @see {@link RenderGroup#textureOptions}
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
}

/**
 * A RenderGroup is a class that is responsible for I generating a set of instructions that are used to render the
 * root container and its children. It also watches for any changes in that container or its children,
 * these changes are analysed and either the instruction set is rebuild or the instructions data is updated.
 * @memberof rendering
 */
export class RenderGroup implements Instruction
{
    public renderPipeId = 'renderGroup';
    public root: Container = null;

    public canBundle = false;

    public renderGroupParent: RenderGroup = null;
    public renderGroupChildren: RenderGroup[] = [];

    public worldTransform: Matrix = new Matrix();
    public worldColorAlpha = 0xffffffff;
    public worldColor = 0xffffff;
    public worldAlpha = 1;

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
     * Holds a reference to the closest parent RenderGroup that has isCachedAsTexture enabled.
     * This is used to properly transform coordinates when rendering into cached textures.
     * @type {RenderGroup | null}
     * @ignore
     */
    public _parentCacheAsTextureRenderGroup: RenderGroup;

    private _inverseWorldTransform: Matrix;
    private _textureOffsetInverseTransform: Matrix;
    private _inverseParentTextureTransform: Matrix;

    private _matrixDirty = 0b111;

    public init(root: Container)
    {
        this.root = root;

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
        this._onRenderContainers.push(container);
    }

    public removeOnRender(container: Container)
    {
        this._onRenderContainers.splice(this._onRenderContainers.indexOf(container), 1);
    }

    public runOnRender()
    {
        for (let i = 0; i < this._onRenderContainers.length; i++)
        {
            this._onRenderContainers[i]._onRender();
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

    /**
     * Returns the inverse of the world transform matrix.
     * @returns {Matrix} The inverse of the world transform matrix.
     */
    public get inverseWorldTransform()
    {
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
        if (!this._parentCacheAsTextureRenderGroup) return null;

        return this._parentCacheAsTextureRenderGroup.textureOffsetInverseTransform;
    }
}
