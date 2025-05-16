import { removeItems } from '../../../utils/data/removeItems';
import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';

import type { IRenderLayer } from '../../layers/RenderLayer';
import type { Container, ContainerChild } from '../Container';

/**
 * Mixin interface for containers that allows them to manage children.
 * It provides methods for adding, removing, and manipulating child containers.
 * @category scene
 */
export interface ChildrenHelperMixin<C = ContainerChild>
{
    /** @internal */
    allowChildren: boolean;
    addChild<U extends(C | IRenderLayer)[]>(...children: U): U[0];
    removeChild<U extends(C | IRenderLayer)[]>(...children: U): U[0];
    /**
     * Removes all children from this container that are within the begin and end indexes.
     * @param {number} beginIndex - The beginning position.
     * @param {number} endIndex - The ending position. Default value is size of the container.
     * @returns - List of removed children
     */
    removeChildren(beginIndex?: number, endIndex?: number): C[];
    /**
     * Removes a child from the specified index position.
     * @param {number} index - The index to get the child from
     * @returns The child that was removed.
     */
    removeChildAt<U extends(C | IRenderLayer)>(index: number): U;
    /**
     * Returns the child at the specified index
     * @param {number} index - The index to get the child at
     * @returns - The child at the given index, if any.
     */
    getChildAt<U extends(C | IRenderLayer)>(index: number): U;
    /**
     * Changes the position of an existing child in the container
     * @param {Container} child - The child Container instance for which you want to change the index number
     * @param {number} index - The resulting index number for the child container
     */
    setChildIndex(child: C | IRenderLayer, index: number): void;
    /**
     * Returns the index position of a child Container instance
     * @param {Container} child - The Container instance to identify
     * @returns - The index position of the child container to identify
     */
    getChildIndex(child: C | IRenderLayer): number;
    /**
     * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown.
     * If the child is already in this container, it will be moved to the specified index.
     * @param {Container} child - The child to add.
     * @param {number} index - The absolute index where the child will be positioned at the end of the operation.
     * @returns {Container} The child that was added.
     */
    addChildAt<U extends(C | IRenderLayer)>(child: U, index: number): U;
    /**
     * Swaps the position of 2 Containers within this container.
     * @param {Container} child - First container to swap
     * @param {Container} child2 - Second container to swap
     */
    swapChildren<U extends(C | IRenderLayer)>(child: U, child2: U): void;
    /** Remove the Container from its parent Container. If the Container has no parent, do nothing. */
    removeFromParent(): void;
    /**
     * Reparent the child to this container, keeping the same worldTransform.
     * @param {Container} child - The child to reparent
     * @returns The first child that was reparented.
     */
    reparentChild<U extends C[]>(...child: U): U[0];
    /**
     * Reparent the child to this container at the specified index, keeping the same worldTransform.
     * @param {Container} child - The child to reparent
     * @param {number} index - The index to reparent the child to
     */
    reparentChildAt<U extends C>(child: U, index: number): U;
}

/** @internal */
export const childrenHelperMixin: ChildrenHelperMixin<ContainerChild> = {

    allowChildren: true,

    removeChildren(beginIndex = 0, endIndex?: number): ContainerChild[]
    {
        const end = endIndex ?? this.children.length;
        const range = end - beginIndex;
        const removed: ContainerChild[] = [];

        if (range > 0 && range <= end)
        {
            for (let i = end - 1; i >= beginIndex; i--)
            {
                const child = this.children[i];

                if (!child) continue;
                removed.push(child);
                child.parent = null;
            }

            removeItems(this.children, beginIndex, end);

            const renderGroup = this.renderGroup || this.parentRenderGroup;

            if (renderGroup)
            {
                renderGroup.removeChildren(removed);
            }

            for (let i = 0; i < removed.length; ++i)
            {
                const child = removed[i];

                child.parentRenderLayer?.detach(child);

                this.emit('childRemoved', child, this, i);
                removed[i].emit('removed', this);
            }

            if (removed.length > 0)
            {
                this._didViewChangeTick++;
            }

            return removed;
        }
        else if (range === 0 && this.children.length === 0)
        {
            return removed;
        }

        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    },

    removeChildAt<U extends(ContainerChild | IRenderLayer)>(index: number): U
    {
        const child = this.getChildAt<U>(index);

        return this.removeChild(child);
    },

    getChildAt<U extends(ContainerChild | IRenderLayer)>(index: number): U
    {
        if (index < 0 || index >= this.children.length)
        {
            throw new Error(`getChildAt: Index (${index}) does not exist.`);
        }

        return this.children[index] as U;
    },

    setChildIndex(child: ContainerChild | IRenderLayer, index: number): void
    {
        if (index < 0 || index >= this.children.length)
        {
            throw new Error(`The index ${index} supplied is out of bounds ${this.children.length}`);
        }

        this.getChildIndex(child); // check if child exists
        this.addChildAt(child, index);
    },

    getChildIndex(child: ContainerChild | IRenderLayer): number
    {
        const index = this.children.indexOf(child as ContainerChild);

        if (index === -1)
        {
            throw new Error('The supplied Container must be a child of the caller');
        }

        return index;
    },

    addChildAt<U extends(ContainerChild | IRenderLayer)>(child: U, index: number): U
    {
        // #if _DEBUG
        if (!this.allowChildren)
        {
            deprecation(v8_0_0, 'addChildAt: Only Containers will be allowed to add children in v8.0.0');
        }
        // #endif

        const { children } = this;

        if (index < 0 || index > children.length)
        {
            throw new Error(`${child}addChildAt: The index ${index} supplied is out of bounds ${children.length}`);
        }

        // TODO - check if child is already in the list?
        // we should be able to optimise this!

        if (child.parent)
        {
            const currentIndex = child.parent.children.indexOf(child as ContainerChild);

            // If this child is in the container and in the same position, do nothing
            if (child.parent === this && currentIndex === index)
            {
                return child;
            }

            if (currentIndex !== -1)
            {
                child.parent.children.splice(currentIndex, 1);
            }
        }

        if (index === children.length)
        {
            children.push(child as ContainerChild);
        }
        else
        {
            children.splice(index, 0, child as ContainerChild);
        }

        child.parent = this;
        child.didChange = true;
        child._updateFlags = 0b1111;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.addChild(child as ContainerChild);
        }

        if (this.sortableChildren) this.sortDirty = true;

        this.emit('childAdded', child as ContainerChild, this, index);
        child.emit('added', this);

        return child;
    },

    swapChildren<U extends(ContainerChild | IRenderLayer)>(child: U, child2: U): void
    {
        if (child === child2)
        {
            return;
        }

        const index1 = this.getChildIndex(child);
        const index2 = this.getChildIndex(child2);

        this.children[index1] = child2 as ContainerChild;
        this.children[index2] = child as ContainerChild;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.structureDidChange = true;
        }

        this._didContainerChangeTick++;
    },

    removeFromParent()
    {
        this.parent?.removeChild(this);
    },

    reparentChild<U extends ContainerChild[]>(...child: U): U[0]
    {
        if (child.length === 1)
        {
            return this.reparentChildAt(child[0], this.children.length);
        }

        child.forEach((c) => this.reparentChildAt(c, this.children.length));

        return child[0];
    },

    reparentChildAt<U extends ContainerChild>(child: U, index: number): U
    {
        if (child.parent === this)
        {
            this.setChildIndex(child, index);

            return child;
        }

        const childMat = child.worldTransform.clone();

        child.removeFromParent();
        this.addChildAt(child, index);

        const newMatrix = this.worldTransform.clone();

        newMatrix.invert();
        childMat.prepend(newMatrix);

        child.setFromMatrix(childMat);

        return child;
    }
} as Container;
