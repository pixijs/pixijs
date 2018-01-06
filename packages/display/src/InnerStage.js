/**
 * Inner stage component, handles all operations with sets of DisplayObjects
 *
 * @class
 * @memberof PIXI
 */
export default class InnerStage
{
    /**
     *
     */
    constructor(stage)
    {
        /**
         * stage this faced belongs to
         * @member {PIXI.Stage}
         */
        this.stage = stage;

        /**
         * set of all objects
         * @member {{}}
         * @readonly
         */
        this.allSet = {};

        /**
         * set of detached objects
         * @member {{}}
         * @readonly
         */
        this.detachedSet = {};

        /**
         * Temporary stack for BFS
         *
         * @type {Array}
         * @private
         */
        this.tempQueueStack = [];

        /**
         * Optimization flag
         *
         * When elements are detached - someone has to do the real work
         *
         * With this flag set, `detach` and `add` will be faster, but `flush` will go slower.
         * In that case, you can move element inside the stage for O(1)
         *
         * If the flag is set, only roots of detached subtrees appear in `detachedSet`
         *
         * Please set it before you do any detach operations
         *
         * @member {boolean}
         */
        this.fastDetach = true;
    }

    /**
     * shortcut function, checks if displayObject is in stage but was detached
     * in case of `fastDetach` it will return true only for detached roots
     *
     * @param displayObject target
     * @returns {boolean} true if detached
     */
    isDetached(displayObject)
    {
        return displayObject.parentStage === this.stage && this.detachedSet[displayObject.uid] === displayObject;
    }

    /**
     * shortcut function, checks if displayObject is in stage and was not detached
     * in case of `fastDetach` it will return true only for detached roots
     *
     * @param displayObject target
     * @returns {boolean} true if detached
     */
    isAttached(displayObject)
    {
        return displayObject.parentStage === this.stage && this.detachedSet[displayObject.uid] === undefined;
    }

    /**
     * Debug function
     *
     * @returns {Number} number of objects in detached set
     */
    countDetached()
    {
        return Object.keys(this.detachedSet).length;
    }

    /**
     * detaches subtree
     *
     * If `fastDetach` flag is set to false, it will add elements to detached state recursively
     *
     * @param subtree
     */
    detachSubtree(subtree)
    {
        const stage = this.stage;
        const dSet = this.detachedSet;

        if (subtree.parentStage !== stage)
        {
            throw new Error(`detachSubtree: ${subtree.uid} does not belong to the stage`);
        }

        if (this.fastDetach)
        {
            dSet[subtree.uid] = subtree;

            return;
        }

        const q = this.tempQueueStack.pop() || [];

        q.length = 0;
        q.push(subtree);
        for (let i = 0; i < q.length; i++)
        {
            const x = q[i];

            if (x.parentStage !== stage)
            {
                continue;
            }
            dSet[x.uid] = x;
            if (x.innerStage || !x.passParentStageToChildren)
            {
                continue;
            }
            for (let j = 0; j < x.children.length; j++)
            {
                q.push(x.children[j]);
            }
        }
        q.length = 0;
        this.tempQueueStack.push(q);
    }

    /**
     * Adds subtree, recursively fires events and sets stage
     *
     * @param subtree
     */
    addSubtree(subtree)
    {
        const stage = this.stage;
        const aSet = this.allSet;
        const dSet = this.detachedSet;
        const q = this.tempQueueStack.pop() || [];
        const fastDetach = this.fastDetach;

        q.length = 0;
        q.push(subtree);
        for (let i = 0; i < q.length; i++)
        {
            const x = q[i];

            if (x.parentStage === stage)
            {
                // x was in detached state
                delete dSet[x.uid];
                if (fastDetach)
                {
                    continue;
                }
            }
            else if (x.parentStage)
            {
                x.parentStage.innerStage.removeSubtree(x);
            }
            x.parentStage = stage;
            aSet[x.uid] = x;
            stage.onAdd(x);

            if (!x.passParentStageToChildren)
            {
                continue;
            }
            for (let j = 0; j < x.children.length; j++)
            {
                q.push(x.children[j]);
            }
        }
        q.length = 0;
        this.tempQueueStack.push(q);
    }

    /**
     * Removes subtree, recursively fires events and sets stage to null
     *
     * @param subtree
     */
    removeSubtree(subtree)
    {
        const stage = this.stage;
        const aSet = this.allSet;
        const dSet = this.detachedSet;
        const q = this.tempQueueStack.pop() || [];

        if (subtree.parentStage !== stage)
        {
            throw new Error(`removeSubtree: ${subtree.uid} does not belong to the stage`);
        }

        q.length = 0;
        q.push(subtree);
        for (let i = 0; i < q.length; i++)
        {
            const x = q[i];

            if (x.parentStage !== stage)
            {
                continue;
            }
            x.parentStage = null;
            stage.onRemove(x);

            delete aSet[x.uid];
            delete dSet[x.uid];

            if (x.passParentStageToChildren)
            {
                for (let j = 0; j < x.children.length; j++)
                {
                    q.push(x.children[j]);
                }
            }
        }
        q.length = 0;
        this.tempQueueStack.push(q);
    }

    /**
     * Fires events on all detached subtrees
     *
     * If `fastDetach` flag is set, flush goes slower, because it goes recursively
     */
    flushDetached()
    {
        const stage = this.stage;
        const q = this.detachedSet;

        for (const key in q)
        {
            const x = q[key];

            if (x.parentStage === stage)
            {
                if (this.fastDetach)
                {
                    this.removeSubtree(x);
                }
                else
                {
                    x.parentStage = null;
                    stage.onRemove(x);
                    delete q[x];
                }
            }
        }
    }
}
