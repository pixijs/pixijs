import { Container } from '../../src/scene/container/Container';

import type { RenderGroup } from '../../src/scene/container/RenderGroup';

// now that we don't actually remove the items, but instead ensure that they are skipped
// in the update loop, this function will return the new list and index removing items that are intended to be skipped
// when the update function is called.
//
function _processUpdateList(toUpdateList: {list: Container[], index: number}, renderGroup: RenderGroup)
{
    const newP = toUpdateList.list.filter((c) =>
    {
        if (c.renderGroup) return false;

        const r = c.parentRenderGroup;

        return (r === renderGroup);
    });

    return {
        list: newP,
        index: newP.length
    };
}

function compareUpdateList(expected: Container[], renderGroup: RenderGroup, index: number, debug = false)
{
    const childrenToUpdate = _processUpdateList(renderGroup.childrenToUpdate[index], renderGroup);

    if (debug)
    {
        // eslint-disable-next-line no-console
        console.log(renderGroup.childrenToUpdate[index].list.map((c) => c.label));
        // eslint-disable-next-line no-console
        console.log(childrenToUpdate.list.map((c) => c.label));
    }

    expect(childrenToUpdate.list).toEqual(expected);
    expect(childrenToUpdate.index).toEqual(expected.length);
}

describe('RenderGroup', () =>
{
    it('should set correct render group a child', async () =>
    {
        const container = new Container();

        const childPre = new Container();

        container.addChild(childPre);

        container.isRenderGroup = true;

        const childPost = new Container();

        container.addChild(childPost);

        expect(container.children).toHaveLength(2);
        expect(container.renderGroup.getChildren()).toHaveLength(2);

        expect(childPre.parentRenderGroup).toEqual(container.renderGroup);
        expect(childPost.parentRenderGroup).toEqual(container.renderGroup);
    });

    it('should not enable a render group twice', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;
        const layerGroup = container.renderGroup;

        container.isRenderGroup = true;

        expect(layerGroup).toBe(container.renderGroup);
    });

    it('should set correct render groups a child with a more complex scene graph', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container();

        const child = new Container();
        const child2 = new Container();
        const child3 = new Container();

        // |- contianer
        //    |- child
        //    |- container2
        //       |- child2
        //       |- child3

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        expect(container.children).toHaveLength(2);
        expect(container.renderGroup.getChildren()).toHaveLength(4);

        expect(child2.parentRenderGroup).toEqual(container.renderGroup);
        expect(child3.parentRenderGroup).toEqual(container.renderGroup);

        expect(container.relativeRenderGroupDepth).toEqual(0);
        expect(container2.relativeRenderGroupDepth).toEqual(1);
        expect(child2.relativeRenderGroupDepth).toEqual(2);
        expect(child3.relativeRenderGroupDepth).toEqual(2);
    });

    it('should set multiple correct layer group a child with a more complex scene graph', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container();

        container2.isRenderGroup = true;

        const child = new Container();
        const child2 = new Container();
        const child3 = new Container();

        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child3

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        expect(container.renderGroup === container2.renderGroup).toBeFalse();
        expect(container.renderGroup.getChildren()).toHaveLength(2);
        expect(container2.renderGroup.getChildren()).toHaveLength(2);

        expect(container.renderGroup).toEqual(container.renderGroup);
        expect(container2.renderGroup).toEqual(container2.renderGroup);

        expect(container2.parentRenderGroup).toEqual(container.renderGroup);
        expect(child.parentRenderGroup).toEqual(container.renderGroup);

        expect(child2.parentRenderGroup).toEqual(container2.renderGroup);
        expect(child3.parentRenderGroup).toEqual(container2.renderGroup);

        expect(container.renderGroup.renderGroupChildren).toHaveLength(1);
        expect(container2.renderGroup.renderGroupChildren).toHaveLength(0);
    });

    it('should set reparent from one render group to another group', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container();

        container2.isRenderGroup = true;

        const child = new Container();
        const child2 = new Container();
        const child3 = new Container();

        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child3

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        // |- contianer // renderGroup
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child3
        //       |- child

        container2.addChild(child);

        expect(container.renderGroup === container2.renderGroup).toBeFalse();
        expect(container.renderGroup.getChildren()).toHaveLength(1);
        expect(container2.renderGroup.getChildren()).toHaveLength(3);

        expect(container.renderGroup).toEqual(container.renderGroup);
        expect(container2.parentRenderGroup).toEqual(container.renderGroup);
        // expect(child.renderGroup).toEqual(container2.renderGroup);

        expect(child2.renderGroup).toBeNull();
        expect(child3.renderGroup).toBeNull();

        expect(container.parentRenderGroup).toBeNull();

        expect(child2.parentRenderGroup).toEqual(container2.renderGroup);
        expect(child3.parentRenderGroup).toEqual(container2.renderGroup);

        expect(container.renderGroup.renderGroupChildren).toHaveLength(1);
        expect(container2.renderGroup.renderGroupChildren).toHaveLength(0);

        // |- contianer // renderGroup
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child
        // |- child3

        container.addChild(child3);

        expect(container.renderGroup.getChildren()).toHaveLength(2);
        expect(container2.renderGroup.getChildren()).toHaveLength(2);

        expect(container.renderGroup).toEqual(container.renderGroup);
        expect(container2.parentRenderGroup).toEqual(container.renderGroup);

        expect(child2.parentRenderGroup).toEqual(container2.renderGroup);
        expect(child3.parentRenderGroup).toEqual(container.renderGroup);

        expect(container.renderGroup.renderGroupChildren).toHaveLength(1);
        expect(container2.renderGroup.renderGroupChildren).toHaveLength(0);
    });

    // REparents a rendergroup..
    it('should set reparent on render group to another', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container();

        container2.isRenderGroup = true;

        const child = new Container();
        const child2 = new Container();
        const child3 = new Container();

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child3
        //

        child.addChild(container2);

        // |- contianer // renderGroup
        //    |- child
        //       |- container2 // renderGroup
        //           |- child2
        //           |- child3
        //
        expect(child.parentRenderGroup).toBe(container.renderGroup);
        expect(container2.parentRenderGroup).toBe(container.renderGroup);
        expect(container.parentRenderGroup).toBeNull();

        expect(child2.parentRenderGroup).toBe(container2.renderGroup);
        expect(child3.parentRenderGroup).toBe(container2.renderGroup);

        expect(container.renderGroup === container2.renderGroup).toBeFalse();
        expect(container.renderGroup.getChildren()).toHaveLength(2);
        expect(container2.renderGroup.getChildren()).toHaveLength(2);

        expect(container2.parent).toBe(child);

        expect(child.children).toHaveLength(1);

        expect(container.renderGroup.renderGroupChildren).toHaveLength(1);
        expect(container2.renderGroup.renderGroupChildren).toHaveLength(0);

        child.isRenderGroup = true;

        // |- contianer // renderGroup depth: 0
        //    |- child // renderGroup
        //       |- container2 // renderGroup
        //           |- child2
        //           |- child3

        expect(container.renderGroup.renderGroupChildren).toHaveLength(1);
        expect(child.renderGroup.renderGroupChildren).toHaveLength(1);
        expect(container2.renderGroup.renderGroupChildren).toHaveLength(0);
        expect(child.renderGroup.getChildren()).toHaveLength(1);
        expect(container2.renderGroup.getChildren()).toHaveLength(2);

        container.addChild(container2);

        expect(container.renderGroup.renderGroupChildren).toHaveLength(2);
        expect(container.children).toHaveLength(2);
        expect(child.renderGroup.renderGroupChildren).toHaveLength(0);
        expect(container2.renderGroup.renderGroupChildren).toHaveLength(0);
        expect(child.renderGroup.getChildren()).toHaveLength(0);
        expect(container2.renderGroup.getChildren()).toHaveLength(2);

        expect(container.relativeRenderGroupDepth).toEqual(0);
        expect(child.relativeRenderGroupDepth).toEqual(1);
        expect(container2.relativeRenderGroupDepth).toEqual(1);
        expect(child3.relativeRenderGroupDepth).toEqual(1);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should register update in the update array..', async () =>
    {
        const container = new Container({
            label: 'container'
        });

        container.isRenderGroup = true;

        const container2 = new Container({
            label: 'container2'
        });

        const child = new Container({
            label: 'child'
        });
        const child2 = new Container({
            label: 'child2'
        });
        const child3 = new Container({
            label: 'child3'
        });

        container.addChild(child);

        compareUpdateList([child], container.renderGroup, 1);

        container.addChild(container2);

        compareUpdateList([child, container2], container.renderGroup, 1);

        container2.addChild(child2);
        container2.addChild(child3);

        compareUpdateList([child, container2], container.renderGroup, 1);

        compareUpdateList([child2, child3], container.renderGroup, 2);

        //  return;
        // |- contianer // renderGroup
        //    |- child
        //    |- container2
        //       |- child2
        //       |- child3
        //

        container.x = 100;

        child.x = 100;

        compareUpdateList([child, container2], container.renderGroup, 1);

        child.x = 110;

        compareUpdateList([child, container2], container.renderGroup, 1);

        child3.x = 30;

        compareUpdateList([child, container2], container.renderGroup, 1);

        compareUpdateList([child2, child3], container.renderGroup, 2);
    });

    it('should appear in update array correctly if it changes layer group', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container();

        container2.isRenderGroup = true;
        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // render group
        //       |- child2
        //       |- child3
        //

        const child = new Container();
        const child2 = new Container();
        const child3 = new Container();

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        child.x = 100;

        compareUpdateList([child], container.renderGroup, 1);

        expect(container.renderGroup.structureDidChange).toBeTrue();

        // |- contianer // renderGroup
        //    |- container2 // render group
        //       |- child2
        //          |- child
        //       |- child3
        child2.addChild(child);

        compareUpdateList([], container.renderGroup, 1);

        compareUpdateList([child], container2.renderGroup, 2);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should appear in update array correctly if it changes layer group parents', async () =>
    {
        const container = new Container({
            label: 'container'
        });

        container.isRenderGroup = true;

        const container2 = new Container({
            label: 'container2'
        });

        container2.isRenderGroup = true;

        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // render group
        //       |- child2 // render group
        //       |- child3
        //

        const child = new Container({
            label: 'child'
        });
        const child2 = new Container({
            label: 'child2'
        });

        child2.isRenderGroup = true;

        const child3 = new Container({
            label: 'child3'
        });

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        child2.x = 100;

        // |- contianer // renderGroup
        //    |- child
        //    |- child2 // render group
        //    |- container2 // render group
        //       |- child3
        //
        container.addChild(child2);

        compareUpdateList([child], container.renderGroup, 1);

        compareUpdateList([child3], container2.renderGroup, 1);

        child2.x = 110;

        compareUpdateList([child], container.renderGroup, 1);

        compareUpdateList([child3], container2.renderGroup, 1);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should update layers correctly if you attach a render group and it has updated children..', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container({ label: 'container2' });

        // |- contianer // renderGroup
        //    |- child
        //    |- container2
        //       |- child2
        //       |- child3
        //

        const child = new Container({ label: 'child' });
        const child2 = new Container({ label: 'child2' });
        const child3 = new Container({ label: 'child3' });

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        child2.x = 100;

        compareUpdateList([child2, child3], container.renderGroup, 2);

        compareUpdateList([child, container2], container.renderGroup, 1);

        container2.isRenderGroup = true;

        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child3

        compareUpdateList([], container.renderGroup, 2);

        compareUpdateList([child], container.renderGroup, 1);

        container.removeChild(container2);

        compareUpdateList([child], container.renderGroup, 1);

        expect(true).toBeTrue();
    });

    it('should update isSimple when enabling the layer', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        expect(container.isSimple).toEqual(false);

        container.isRenderGroup = false;

        expect(container.isSimple).toEqual(true);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should add and then remove the render group correctly', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container({ label: 'container2' });

        // |- contianer // renderGroup
        //    |- child
        //    |- container2
        //       |- child2
        //       |- child3
        //

        const child = new Container({ label: 'child' });
        const child2 = new Container({ label: 'child2' });
        const child3 = new Container({ label: 'child3' });

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        // child2.x = 100;

        compareUpdateList([child, container2], container.renderGroup, 1, true);

        container2.isRenderGroup = true;

        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child3

        compareUpdateList([child], container.renderGroup, 1, true);

        container2.isRenderGroup = false;

        // |- contianer // renderGroup
        //    |- child
        //    |- container2
        //       |- child2
        //       |- child3

        expect(container2.parentRenderGroup).toBe(container.renderGroup);
        expect(container2.renderGroup).toBe(null);
        expect(child2.parentRenderGroup).toBe(container.renderGroup);
        expect(child3.parentRenderGroup).toBe(container.renderGroup);

        // the three updates here include the container being added / removed / added.
        // not really an issue as the loop will skip the container2 updates after the first.
        // this is faster to do this than splice the update instances every time something is added or removed
        compareUpdateList([child, container2, container2, container2], container.renderGroup, 1, true);
    });
});

