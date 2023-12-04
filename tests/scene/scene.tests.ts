import { Container } from '../../src/scene/container/Container';

describe('Scene', () =>
{
    it('should add a child', async () =>
    {
        const container = new Container();

        const child = new Container();

        container.addChild(child);

        expect(container.children).toHaveLength(1);
        expect(container.children[0]).toEqual(child);
    });

    it('should remove a child', async () =>
    {
        const container = new Container();

        const child = new Container();

        container.addChild(child);

        container.removeChild(child);

        expect(container.children).toHaveLength(0);
    });

    it('should re-parent a child', async () =>
    {
        const container = new Container();

        const child = new Container();
        const child2 = new Container();

        container.addChild(child);
        container.addChild(child2);

        child.addChild(child2);

        expect(container.children).toHaveLength(1);
        expect(child.children).toHaveLength(1);
    });

    it('should set correct render group a child', async () =>
    {
        const container = new Container();

        const childPre = new Container();

        container.addChild(childPre);

        container.isRenderGroup = true;

        const childPost = new Container();

        container.addChild(childPost);

        expect(container.children).toHaveLength(2);
        expect(container.renderGroup['_children']).toHaveLength(2);

        expect(childPre.renderGroup).toEqual(container.renderGroup);
        expect(childPost.renderGroup).toEqual(container.renderGroup);
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
        expect(container.renderGroup['_children']).toHaveLength(4);

        expect(child2.renderGroup).toEqual(container.renderGroup);
        expect(child3.renderGroup).toEqual(container.renderGroup);

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
        expect(container.renderGroup['_children']).toHaveLength(2);
        expect(container2.renderGroup['_children']).toHaveLength(2);

        expect(container.renderGroup).toEqual(container.renderGroup);
        expect(container2.renderGroup).toEqual(container2.renderGroup);
        expect(child.renderGroup).toEqual(container.renderGroup);

        expect(child2.renderGroup).toEqual(container2.renderGroup);
        expect(child3.renderGroup).toEqual(container2.renderGroup);

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
        expect(container.renderGroup['_children']).toHaveLength(1);
        expect(container2.renderGroup['_children']).toHaveLength(3);

        expect(container.renderGroup).toEqual(container.renderGroup);
        expect(container2.renderGroup).toEqual(container2.renderGroup);
        expect(child.renderGroup).toEqual(container2.renderGroup);

        expect(child2.renderGroup).toEqual(container2.renderGroup);
        expect(child3.renderGroup).toEqual(container2.renderGroup);

        expect(container.renderGroup.renderGroupChildren).toHaveLength(1);
        expect(container2.renderGroup.renderGroupChildren).toHaveLength(0);

        // |- contianer // renderGroup
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child
        // |- child3

        container.addChild(child3);

        expect(container.renderGroup['_children']).toHaveLength(2);
        expect(container2.renderGroup['_children']).toHaveLength(2);

        expect(container.renderGroup).toEqual(container.renderGroup);
        expect(container2.renderGroup).toEqual(container2.renderGroup);
        expect(child.renderGroup).toEqual(container2.renderGroup);

        expect(child2.renderGroup).toEqual(container2.renderGroup);
        expect(child3.renderGroup).toEqual(container.renderGroup);

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
        expect(child.renderGroup).toBe(container.renderGroup);
        expect(container2.renderGroup).toBe(container2.renderGroup);
        expect(child2.renderGroup).toBe(container2.renderGroup);
        expect(child3.renderGroup).toBe(container2.renderGroup);

        expect(container.renderGroup === container2.renderGroup).toBeFalse();
        expect(container.renderGroup['_children']).toHaveLength(2);
        expect(container2.renderGroup['_children']).toHaveLength(2);

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
        expect(child.renderGroup['_children']).toHaveLength(1);
        expect(container2.renderGroup['_children']).toHaveLength(2);

        container.addChild(container2);

        expect(container.renderGroup.renderGroupChildren).toHaveLength(2);
        expect(container.children).toHaveLength(2);
        expect(child.renderGroup.renderGroupChildren).toHaveLength(0);
        expect(container2.renderGroup.renderGroupChildren).toHaveLength(0);
        expect(child.renderGroup['_children']).toHaveLength(0);
        expect(container2.renderGroup['_children']).toHaveLength(2);

        expect(container.relativeRenderGroupDepth).toEqual(0);
        expect(child.relativeRenderGroupDepth).toEqual(1);
        expect(container2.relativeRenderGroupDepth).toEqual(1);
        expect(child3.relativeRenderGroupDepth).toEqual(1);
    });

    it('should register update in the update array..', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container();

        // container2.layer = true;

        const child = new Container();
        const child2 = new Container();
        const child3 = new Container();

        container.addChild(child);

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child],
            index: 1
        });

        container.addChild(container2);

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2],
            index: 2
        });

        container2.addChild(child2);
        container2.addChild(child3);

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2],
            index: 2
        });

        expect(container.renderGroup.childrenToUpdate[2]).toEqual({
            list: [child2, child3],
            index: 2
        });

        // |- contianer // renderGroup
        //    |- child
        //    |- container2
        //       |- child2
        //       |- child3
        //

        container.x = 100;

        // expect(container.layerGroup.childrenToUpdate[0]).toEqual({

        // });

        child.x = 100;

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2],
            index: 2
        });

        child.x = 110;

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2],
            index: 2
        });

        child3.x = 30;

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2],
            index: 2
        });

        expect(container.renderGroup.childrenToUpdate[2]).toEqual({
            list: [child2, child3],
            index: 2
        });

        // child2.x = 50;

        // expect(container.layerGroup.childrenToUpdate[2]).toEqual({
        //     list: [child3, child2],
        //     index: 2
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

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2],
            index: 2
        });

        expect(container.renderGroup.structureDidChange).toBeTrue();

        // |- contianer // renderGroup
        //    |- container2 // render group
        //       |- child2
        //          |- child
        //       |- child3
        child2.addChild(child);

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [container2],
            index: 1
        });

        expect(container2.renderGroup.childrenToUpdate[2]).toEqual({
            list: [child],
            index: 1
        });
    });

    it('should appear in update array correctly if it changes layer group parents', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        const container2 = new Container();

        container2.isRenderGroup = true;

        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // render group
        //       |- child2 // render group
        //       |- child3
        //

        const child = new Container();
        const child2 = new Container();

        child2.isRenderGroup = true;

        const child3 = new Container();

        container.addChild(child);
        container.addChild(container2);
        container2.addChild(child2);
        container2.addChild(child3);

        // child.x = 100;
        child2.x = 100;

        // expect(container.layerGroup.childrenToUpdate[1]).toEqual({
        //     list: [child],
        //     index: 1
        // });

        // |- contianer // renderGroup
        //    |- child
        //    |- child2 // render group
        //    |- container2 // render group
        //       |- child3
        //
        container.addChild(child2);

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2, child2],
            index: 3
        });

        expect(container2.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child3],
            index: 1
        });

        child2.x = 110;

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2, child2],
            index: 3
        });

        expect(container2.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child3],
            index: 1
        });
    });

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

        // child.x = 100;
        child2.x = 100;

        expect(container.renderGroup.childrenToUpdate[2]).toEqual({
            list: [child2, child3],
            index: 2
        });

        // console.log('---?', container.layerGroup.childrenToUpdate[1])
        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2],
            index: 2
        });

        container2.isRenderGroup = true;

        // |- contianer // renderGroup
        //    |- child
        //    |- container2 // renderGroup
        //       |- child2
        //       |- child3

        expect(container.renderGroup.childrenToUpdate[2]).toEqual({
            list: [],
            index: 0
        });

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child, container2],
            index: 2
        });

        container.removeChild(container2);

        expect(container.renderGroup.childrenToUpdate[1]).toEqual({
            list: [child],
            index: 1
        });

        // console.log(container2.layerGroup.childrenToUpdate[1])
        // expect(container2.layerGroup.childrenToUpdate[1]).toEqual({
        //     list: [child2, child3],
        //     index: 2
        // });
        // |- contianer // renderGroup
        //    |- child
        //    |- child2 // render group
        //    |- container2 // render group
        //       |- child3
        //
        // container.addChild(child2);

        // expect(container.layerGroup.childrenToUpdate[1]).toEqual({
        //     list: [child2],
        //     index: 1
        // });

        // expect(container2.layerGroup.childrenToUpdate[1]).toEqual({
        //     list: [],
        //     index: 0
        // });
    });

    it('should updateIs simple when enabling the layer', async () =>
    {
        const container = new Container();

        container.isRenderGroup = true;

        expect(container.isSimple).toEqual(false);
    });

    it('should add a child twice with no duplication', async () =>
    {
        const container = new Container();

        const child = new Container();

        container.addChild(child);
        container.addChild(child);
        expect(container.children).toHaveLength(1);

        container.removeChild(child);

        expect(container.children).toHaveLength(0);
        expect(child.parent).toEqual(null);
        // container.removeChild(child);
    });
});

