import { Matrix } from '../../maths/matrix/Matrix';
import { InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';

import type { Instruction } from '../../rendering/renderers/shared/instructions/Instruction';
import type { Container } from './Container';

/**
 * A RenderGroup is a class that is responsible for I generating a set of instructions that are used to render the
 * root container and its children. It als watches for any changes in that container or its children,
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

    // these update are renderable changes..
    public readonly childrenRenderablesToUpdate: { list: Container[]; index: number; } = { list: [], index: 0 };

    // other
    public structureDidChange = true;

    public instructionSet: InstructionSet = new InstructionSet();

    private readonly _onRenderContainers: Container[] = [];

    public init(root: Container)
    {
        this.root = root;

        if (root._onRender) this.addOnRender(root);

        root.didChange = true;

        const children = root.children;

        for (let i = 0; i < children.length; i++)
        {
            this.addChild(children[i]);
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

    // SHOULD THIS BE HERE?
    public updateRenderable(container: Container)
    {
        // only update if its visible!
        if (container.globalDisplayStatus < 0b111) return;

        container.didViewUpdate = false;
        // actually updates the renderable..
        this.instructionSet.renderPipes[container.renderPipeId].updateRenderable(container);
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
}
