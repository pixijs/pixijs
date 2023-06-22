import { Matrix } from '../../maths/Matrix';
import { InstructionSet } from '../renderers/shared/instructions/InstructionSet';
import { LayerRenderable } from '../renderers/shared/LayerRenderable';

import type { Instruction } from '../renderers/shared/instructions/Instruction';
import type { Renderable } from '../renderers/shared/Renderable';
import type { View } from '../renderers/shared/View';
import type { Container } from './Container';

export class LayerGroup implements Instruction
{
    type = 'layer';
    root: Container = null;
    rootRenderable: Renderable<View> = null;

    canBundle = false;

    layerGroupParent: LayerGroup = null;
    layerGroupChildren: LayerGroup[] = [];

    children: Container[] = [];

    //    layerTransform: Matrix = new Matrix();
    worldTransform: Matrix = new Matrix();
    worldColor = 0xffffffff;

    // these updates are transform changes..
    readonly childrenToUpdate: Record<number, { list: Container[]; index: number; }> = {};
    updateTick = 0;

    // these update are renderable changes..
    readonly childrenRenderablesToUpdate: { list: Renderable[]; index: number; } = { list: [], index: 0 };

    // other
    structureDidChange = true;

    instructionSet: InstructionSet = new InstructionSet();

    /**
     * proxy renderable is used to render the root containers view if it has one
     * this is used as we do not want to inherit the transform / color of the root container
     * it is only used by the parent root layer group
     */
    proxyRenderable: LayerRenderable<View>;

    constructor(root: Container)
    {
        this.root = root;

        const view = root.view;

        if (view)
        {
            this.proxyRenderable = new LayerRenderable({
                original: root,
                view,
            });
        }

        this.addChild(root);
    }

    get localTransform()
    {
        return this.root.localTransform;
    }

    get layerTransform()
    {
        return this.root.layerTransform;
    }

    addLayerGroupChild(layerGroupChild: LayerGroup)
    {
        if (layerGroupChild.layerGroupParent)
        {
            layerGroupChild.layerGroupParent.removeLayerGroupChild(layerGroupChild);
        }

        layerGroupChild.layerGroupParent = this;

        this.onChildUpdate(layerGroupChild.root);

        this.layerGroupChildren.push(layerGroupChild);
    }

    removeLayerGroupChild(layerGroupChild: LayerGroup)
    {
        if (layerGroupChild.root.didChange)
        {
            this.removeChildFromUpdate(layerGroupChild.root);
        }

        const index = this.layerGroupChildren.indexOf(layerGroupChild);

        if (index > -1)
        {
            this.layerGroupChildren.splice(index, 1);
        }

        layerGroupChild.layerGroupParent = null;
    }

    addChild(child: Container)
    {
        this.structureDidChange = true;

        // TODO this can be optimized..
        if (child !== this.root)
        {
            this.children.push(child);

            child.updateTick = -1;

            if (child.parent === this.root)
            {
                child.relativeLayerDepth = 1;
            }

            else
            {
                child.relativeLayerDepth = child.parent.relativeLayerDepth + 1;
            }

            if (child._onRender)
            {
                this.addOnRender(child);
            }
        }

        if (child.layerGroup)
        {
            if (child.layerGroup.root === child)
            {
                // its already its own layer group..
                this.addLayerGroupChild(child.layerGroup);

                return;
            }
        }
        else
        {
            child.layerGroup = this;
            child.didChange = true;
        }

        const children = child.children;

        if (!child.isLayerRoot)
        {
            this.onChildUpdate(child);
        }

        for (let i = 0; i < children.length; i++)
        {
            this.addChild(children[i]);
        }
    }

    removeChild(child: Container)
    {
        // remove all the children...
        this.structureDidChange = true;

        if (child._onRender)
        {
            this.removeOnRender(child);
        }

        if (child.layerGroup.root !== child)
        {
            const children = child.children;

            for (let i = 0; i < children.length; i++)
            {
                this.removeChild(children[i]);
            }

            if (child.didChange)
            {
                child.layerGroup.removeChildFromUpdate(child);
            }

            child.layerGroup = null;
        }

        else
        {
            this.removeLayerGroupChild(child.layerGroup);
        }

        const index = this.children.indexOf(child);

        if (index > -1)
        {
            this.children.splice(index, 1);
        }
    }

    onChildUpdate(child: Container)
    {
        let childrenToUpdate = this.childrenToUpdate[child.relativeLayerDepth];

        if (!childrenToUpdate)
        {
            childrenToUpdate = this.childrenToUpdate[child.relativeLayerDepth] = {
                index: 0,
                list: [],
            };
        }

        childrenToUpdate.list[childrenToUpdate.index++] = child;
    }

    // SHOULD THIS BE HERE?
    updateRenderable(container: Renderable)
    {
        // only update if its visible!
        if (container.layerVisibleRenderable < 0b11) return;

        container.didViewUpdate = false;
        // actually updates the renderable..
        this.instructionSet.renderPipes[container.view.type].updateRenderable(container);
    }

    onChildViewUpdate(child: Renderable)
    {
        this.childrenRenderablesToUpdate.list[this.childrenRenderablesToUpdate.index++] = child;
    }

    removeChildFromUpdate(child: Container)
    {
        const childrenToUpdate = this.childrenToUpdate[child.relativeLayerDepth];

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
        const worldAlpha = ((this.worldColor >> 24) & 0xFF);

        return (this.root.localVisibleRenderable === 0b11 && worldAlpha > 0);
    }

    onRenderContainers: Container[] = [];

    /**
     * adding a container to the onRender list will make sure the user function
     * passed in to the user defined 'onRender` callBack
     * @param container - the container to add to the onRender list
     */
    addOnRender(container: Container)
    {
        this.onRenderContainers.push(container);
    }

    removeOnRender(container: Container)
    {
        this.onRenderContainers.splice(this.onRenderContainers.indexOf(container), 1);
    }

    runOnRender()
    {
        this.onRenderContainers.forEach((container) =>
        {
            container._onRender();
        });
    }
}
