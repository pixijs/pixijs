import { removeItems } from '../../../utils/data/removeItems';
import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';

import type { IRenderLayer } from '../../layers/RenderLayer';
import type { Container, ContainerChild } from '../Container';

/**
 * Mixin interface for containers that allows them to manage children.
 * It provides methods for adding, removing, and manipulating child containers.
 * @category scene
 * @advanced
 */
export interface ChildrenHelperMixin<C = ContainerChild>
{
    /** @internal */
    allowChildren: boolean;
    addChild<U extends(C | IRenderLayer)[]>(...children: U): U[0];
    removeChild<U extends(C | IRenderLayer)[]>(...children: U): U[0];
    /**
     * Removes all children from this container that are within the begin and end indexes.
     * @example
     * ```ts
     * // Remove all children
     * container.removeChildren();
     *
     * // Remove first 3 children
     * const removed = container.removeChildren(0, 3);
     * console.log('Removed:', removed.length); // 3
     *
     * // Remove children from index 2 onwards
     * container.removeChildren(2);
     *
     * // Remove specific range
     * const middle = container.removeChildren(1, 4);
     * ```
     * @param {number} beginIndex - The beginning position
     * @param {number} endIndex - The ending position. Default is container size
     * @returns List of removed children
     * @throws {RangeError} If begin/end indexes are invalid
     * @see {@link Container#addChild} For adding children
     * @see {@link Container#removeChild} For removing specific children
     */
    removeChildren(beginIndex?: number, endIndex?: number): C[];
    /**
     * Removes a child from the specified index position.
     * @example
     * ```ts
     * // Remove first child
     * const removed = container.removeChildAt(0);
     *
     * // type safe access
     * const sprite = container.removeChildAt<Sprite>(1);
     *
     * // With error handling
     * try {
     *     const child = container.removeChildAt(10);
     * } catch (e) {
     *     console.warn('Index out of bounds');
     * }
     * ```
     * @param {number} index - The index to remove the child from
     * @returns The child that was removed
     * @throws {Error} If index is out of bounds
     * @see {@link Container#removeChild} For removing specific children
     * @see {@link Container#removeChildren} For removing multiple children
     */
    removeChildAt<U extends(C | IRenderLayer)>(index: number): U;
    /**
     * Returns the child at the specified index.
     * @example
     * ```ts
     * // Get first child
     * const first = container.getChildAt(0);
     *
     * // Type-safe access
     * const sprite = container.getChildAt<Sprite>(1);
     *
     * // With error handling
     * try {
     *     const child = container.getChildAt(10);
     * } catch (e) {
     *     console.warn('Index out of bounds');
     * }
     * ```
     * @param {number} index - The index to get the child from
     * @returns The child at the given index
     * @throws {Error} If index is out of bounds
     * @see {@link Container#children} For direct array access
     * @see {@link Container#getChildByLabel} For name-based lookup
     */
    getChildAt<U extends(C | IRenderLayer)>(index: number): U;
    /**
     * Changes the position of an existing child in the container.
     * @example
     * ```ts
     * // Basic index change
     * container.setChildIndex(sprite, 0); // Move to front
     * container.setChildIndex(sprite, container.children.length - 1); // Move to back
     *
     * // With error handling
     * try {
     *     container.setChildIndex(sprite, 5);
     * } catch (e) {
     *     console.warn('Invalid index or child not found');
     * }
     * ```
     * @param {Container}child - The child Container instance to reposition
     * @param {number}index - The resulting index number for the child
     * @throws {Error} If index is out of bounds
     * @throws {Error} If child is not in container
     * @see {@link Container#getChildIndex} For getting current index
     * @see {@link Container#swapChildren} For swapping positions
     */
    setChildIndex(child: C | IRenderLayer, index: number): void;
    /**
     * Returns the index position of a child Container instance.
     * @example
     * ```ts
     * // Basic index lookup
     * const index = container.getChildIndex(sprite);
     * console.log(`Sprite is at index ${index}`);
     *
     * // With error handling
     * try {
     *     const index = container.getChildIndex(sprite);
     * } catch (e) {
     *     console.warn('Child not found in container');
     * }
     * ```
     * @param {Container} child - The Container instance to identify
     * @returns The index position of the child container
     * @throws {Error} If child is not in this container
     * @see {@link Container#setChildIndex} For changing index
     * @see {@link Container#children} For direct array access
     */
    getChildIndex(child: C | IRenderLayer): number;
    /**
     * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown.
     * If the child is already in this container, it will be moved to the specified index.
     * @example
     * ```ts
     * // Add at specific index
     * container.addChildAt(sprite, 0); // Add to front
     *
     * // Move existing child
     * const index = container.children.length - 1;
     * container.addChildAt(existingChild, index); // Move to back
     *
     * // With error handling
     * try {
     *     container.addChildAt(sprite, 1000);
     * } catch (e) {
     *     console.warn('Index out of bounds');
     * }
     * ```
     * @param {Container} child - The child to add
     * @param {number} index - The index where the child will be placed
     * @returns The child that was added
     * @throws {Error} If index is out of bounds
     * @see {@link Container#addChild} For adding to the end
     * @see {@link Container#setChildIndex} For moving existing children
     */
    addChildAt<U extends(C | IRenderLayer)>(child: U, index: number): U;
    /**
     * Swaps the position of 2 Containers within this container.
     * @example
     * ```ts
     * // Basic swap
     * container.swapChildren(sprite1, sprite2);
     *
     * // With error handling
     * try {
     *     container.swapChildren(sprite1, sprite2);
     * } catch (e) {
     *     console.warn('One or both children not found in container');
     * }
     * ```
     * @remarks
     * - Updates render groups
     * - No effect if same child
     * - Triggers container changes
     * - Common in z-ordering
     * @param {Container} child - First container to swap
     * @param {Container} child2 - Second container to swap
     * @throws {Error} If either child is not in container
     * @see {@link Container#setChildIndex} For direct index placement
     * @see {@link Container#getChildIndex} For getting current positions
     */
    swapChildren<U extends(C | IRenderLayer)>(child: U, child2: U): void;
    /**
     * Remove the Container from its parent Container. If the Container has no parent, do nothing.
     * @example
     * ```ts
     * // Basic removal
     * sprite.removeFromParent();
     *
     * // With validation
     * if (sprite.parent) {
     *     sprite.removeFromParent();
     * }
     * ```
     * @see {@link Container#addChild} For adding to a new parent
     * @see {@link Container#removeChild} For parent removing children
     */
    removeFromParent(): void;
    /**
     * Reparent a child or multiple children to this container while preserving their world transform.
     * This ensures that the visual position and rotation of the children remain the same even when changing parents.
     * @example
     * ```ts
     * // Basic reparenting
     * const sprite = new Sprite(texture);
     * oldContainer.addChild(sprite);
     * // Move to new parent, keeping visual position
     * newContainer.reparentChild(sprite);
     *
     * // Reparent multiple children
     * const batch = [sprite1, sprite2, sprite3];
     * newContainer.reparentChild(...batch);
     * ```
     * @param {Container} child - The child or children to reparent
     * @returns The first child that was reparented
     * @see {@link Container#reparentChildAt} For index-specific reparenting
     * @see {@link Container#addChild} For simple parenting
     */
    reparentChild<U extends C[]>(...child: U): U[0];
    /**
     * Reparent the child to this container at the specified index while preserving its world transform.
     * This ensures that the visual position and rotation of the child remain the same even when changing parents.
     * @example
     * ```ts
     * // Basic index-specific reparenting
     * const sprite = new Sprite(texture);
     * oldContainer.addChild(sprite);
     * // Move to new parent at index 0 (front)
     * newContainer.reparentChildAt(sprite, 0);
     * ```
     * @param {Container} child - The child to reparent
     * @param {number} index - The index to reparent the child to
     * @returns The reparented child
     * @throws {Error} If index is out of bounds
     * @see {@link Container#reparentChild} For appending reparented children
     * @see {@link Container#addChildAt} For simple indexed parenting
     */
    reparentChildAt<U extends C>(child: U, index: number): U;
    /**
     * Replace a child in the container with a new child. Copying the local transform from the old child to the new one.
     * @param {Container} oldChild - The child to replace.
     * @param {Container} newChild - The new child to add.
     */
    replaceChild<U extends(C), T extends(C)>(oldChild: U, newChild: T): void;
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
    },

    replaceChild<U extends(ContainerChild), T extends(ContainerChild)>(oldChild: U, newChild: T)
    {
        oldChild.updateLocalTransform();
        this.addChildAt(newChild, this.getChildIndex(oldChild));

        newChild.setFromMatrix(oldChild.localTransform);
        newChild.updateLocalTransform();
        this.removeChild(oldChild);
    },
} as Container;
