import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';

import type { Container } from '../Container';

export interface FindMixinConstructor
{
    /**
     * The instance label of the object.
     * @default null
     */
    label?: string;
}
export interface FindMixin extends Required<FindMixinConstructor>
{
    /**
     * The instance name of the object.
     * @deprecated since 8.0.0
     * @see Container#label
     * @default null
     */
    name: string;
    /**
     * @deprecated since 8.0.0
     * @param {string} label - Instance name.
     * @param {boolean}[deep=false] - Whether to search recursively
     * @returns {Container} The child with the specified name.
     * @see Container#getChildByLabel
     */
    getChildByName(label: RegExp | string, deep?: boolean): Container | null;
    /**
     * Returns the first child in the container with the specified label.
     *
     * Recursive searches are done in a pre-order traversal.
     * @param {string|RegExp} label - Instance label.
     * @param {boolean}[deep=false] - Whether to search recursively
     * @returns {Container} The child with the specified label.
     */
    getChildByLabel(label: RegExp | string, deep?: boolean): Container | null;
    /**
     * Returns all children in the container with the specified label.
     * @param {string|RegExp} label - Instance label.
     * @param {boolean}[deep=false] - Whether to search recursively
     * @param {Container[]} [out=[]] - The array to store matching children in.
     * @returns {Container[]} An array of children with the specified label.
     */
    getChildrenByLabel(label: RegExp | string, deep?: boolean, out?: Container[]): Container[];
}

export const findMixin: Partial<Container> = {
    label: null,

    get name(): string
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Container.name property has been removed, use Container.label instead');
        // #endif

        return this.label;
    },
    set name(value: string)
    {
        // #if _DEBUG
        deprecation(v8_0_0, 'Container.name property has been removed, use Container.label instead');
        // #endif

        this.label = value;
    },

    getChildByName(name: string, deep = false): Container | null
    {
        return this.getChildByLabel(name, deep);
    },

    getChildByLabel(label: string | RegExp, deep = false): Container | null
    {
        const children = this.children;

        for (let i = 0; i < children.length; i++)
        {
            const child = children[i];

            if (child.label === label || (label instanceof RegExp && label.test(child.label))) return child;
        }

        if (deep)
        {
            for (let i = 0; i < children.length; i++)
            {
                const child = children[i];
                const found = child.getChildByLabel(label, true);

                if (found)
                {
                    return found;
                }
            }
        }

        return null;
    },

    getChildrenByLabel(label: string | RegExp, deep = false, out = []): Container[]
    {
        const children = this.children;

        for (let i = 0; i < children.length; i++)
        {
            const child = children[i];

            if (child.label === label || (label instanceof RegExp && label.test(child.label)))
            {
                out.push(child);
            }
        }

        if (deep)
        {
            for (let i = 0; i < children.length; i++)
            {
                children[i].getChildrenByLabel(label, true, out);
            }
        }

        return out;
    },
} as Container;
