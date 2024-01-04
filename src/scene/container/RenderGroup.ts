import { Matrix } from '../../maths/matrix/Matrix';
import { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';

import type { Instruction } from '../../rendering/renderers/shared/instructions/Instruction';
import type { Container } from './Container';

/**
 * The render group is the base class for all render groups
 * It is used to render a group of containers together
 * @memberof rendering
 */
export class RenderGroup implements Instruction
{
    public renderPipeId = 'renderGroup';
    public root: Container = null;

    public canBundle = false;

    public renderGroupParent: RenderGroup = null;
    public renderGroupChildren: RenderGroup[] = [];

    private readonly _children: Container[] = [];

    public worldTransform: Matrix = new Matrix();
    public worldColorAlpha = 0xffffffff;
    public worldColor = 0xffffff;
    public worldAlpha = 1;

    // these updates are transform changes..
    public readonly childrenToUpdate: Record<number, { list: Container[]; index: number; }> = Object.create(null);
    public updateTick = 0;

    // these update are renderable changes..
    public readonly childrenRenderablesToUpdate: { list: Container[]; index: number; } = { list: [], index: 0 };

    // other
    public structureDidChange = true;

    public instructionSet: InstructionSet = new InstructionSet();

    private readonly _onRenderContainers: Container[] = [];

    constructor(root: Container)
    {
        this.root = root;

        this.addChild(root);
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

        this.onChildUpdate(renderGroupChild.root);

        this.renderGroupChildren.push(renderGroupChild);
    }

    private _removeRenderGroupChild(renderGroupChild: RenderGroup)
    {
        if (renderGroupChild.root.didChange)
        {
            this._removeChildFromUpdate(renderGroupChild.root);
        }

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

        // TODO this can be optimized..
        if (child !== this.root)
        {
            this._children.push(child);

            child.updateTick = -1;

            if (child.parent === this.root)
            {
                child.relativeRenderGroupDepth = 1;
            }

            else
            {
                child.relativeRenderGroupDepth = child.parent.relativeRenderGroupDepth + 1;
            }

            if (child._onRender)
            {
                this.addOnRender(child);
            }
        }

        if (child.renderGroup)
        {
            if (child.renderGroup.root === child)
            {
                // its already its own render group..
                this.addRenderGroupChild(child.renderGroup);

                return;
            }
        }
        else
        {
            child.renderGroup = this;
            child.didChange = true;
        }

        const children = child.children;

        if (!child.isRenderGroupRoot)
        {
            this.onChildUpdate(child);
        }

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
            this.removeOnRender(child);
        }

        if (child.renderGroup.root !== child)
        {
            const children = child.children;

            for (let i = 0; i < children.length; i++)
            {
                this.removeChild(children[i]);
            }

            if (child.didChange)
            {
                child.renderGroup._removeChildFromUpdate(child);
            }

            child.renderGroup = null;
        }

        else
        {
            this._removeRenderGroupChild(child.renderGroup);
        }

        const index = this._children.indexOf(child);

        if (index > -1)
        {
            this._children.splice(index, 1);
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

    // SHOULD THIS BE HERE?
    public updateRenderable(container: Container)
    {
        // only update if its visible!
        if (container.groupVisibleRenderable < 0b11) return;

        container.didViewUpdate = false;
        // actually updates the renderable..
        this.instructionSet.renderPipes[container.renderPipeId].updateRenderable(container);
    }

    public onChildViewUpdate(child: Container)
    {
        this.childrenRenderablesToUpdate.list[this.childrenRenderablesToUpdate.index++] = child;
    }

    private _removeChildFromUpdate(child: Container)
    {
        const childrenToUpdate = this.childrenToUpdate[child.relativeRenderGroupDepth];

        if (!childrenToUpdate)
        { return; }

        const index = childrenToUpdate.list.indexOf(child);

        // TODO this should be optimized - don't really want to change array size on the fly if we can avoid!
        if (index > -1)
        {
            childrenToUpdate.list.splice(index, 1);
        }

        childrenToUpdate.index--;
    }

    get isRenderable(): boolean
    {
        return (this.root.localVisibleRenderable === 0b11 && this.worldAlpha > 0);
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
        this._onRenderContainers.forEach((container) =>
        {
            container._onRender();
        });
    }
}
