import { Bounds } from './container/bounds/Bounds';
import { getGlobalBounds } from './container/bounds/getGlobalBounds';

import type { Container } from './container/Container';

const tempBounds = new Bounds();

type RectangleLike = {x: number, y: number, width: number, height: number};

export class Culler
{
    private readonly _list = new Set<Container>();

    public add(container: Container)
    {
        this._list.add(container);
    }

    public remove(container: Container)
    {
        this._list.delete(container);
    }

    public removeAll()
    {
        this._list.clear();
    }

    public cull(view: RectangleLike)
    {
        // TODO: right now if we set a parent to be culled, it will also check any children that
        // have been added to the list. This doesn't need to happen as they won't be rendered anyway
        for (const container of this._list)
        {
            this._cull(container, view);
        }
    }

    public cullContainer(container: Container, view: RectangleLike)
    {
        this._cullRecursive(container, view);
    }

    private _cull(container: Container, view: RectangleLike)
    {
        if (container.view)
        {
            const bounds = container.cullArea ?? getGlobalBounds(container, true, tempBounds);

            // check view intersection..
            container.visible = !(bounds.x > view.x + view.width
                || bounds.y > view.y + view.height
                || bounds.x + bounds.width < view.x
                || bounds.y + bounds.height < view.y);
        }
    }

    private _cullRecursive(container: Container, view: RectangleLike)
    {
        this._cull(container, view);

        for (let i = 0; i < container.children.length; i++)
        {
            this._cullRecursive(container.children[i], view);
        }
    }

    // default culler will be culled to the screen if culler plugin is used
    public static shared = new Culler();
}
