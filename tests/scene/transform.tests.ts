import { Container } from '../../src/scene/container/Container';
import { updateLayerGroupTransforms } from '../../src/scene/container/utils/updateLayerGroupTransforms';
import { DummyView } from './DummyView';

describe('Transform updates', () =>
{
    it('should calculate local transform correctly', async () =>
    {
        const root = new Container();

        root.layer = true;

        const container = new Container({
            label: 'container',
        });
        const child = new Container({
            label: 'child',
        });

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(container.layerTransform.tx).toEqual(10);
        expect(child.layerTransform.tx).toEqual(30);

        root.x = 20;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(container.layerTransform.tx).toEqual(10);
        expect(child.layerTransform.tx).toEqual(30);
    });

    it('should calculate local transform correctly after re-parenting', async () =>
    {
        const root = new Container();

        root.layer = true;

        const container = new Container();
        const child = new Container();

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(container.layerTransform.tx).toEqual(10);
        expect(child.layerTransform.tx).toEqual(30);

        root.addChild(child);

        updateLayerGroupTransforms(root.layerGroup);

        expect(container.layerTransform.tx).toEqual(10);
        expect(child.layerTransform.tx).toEqual(20);
    });

    it('should not affect transform of removed container', async () =>
    {
        const root = new Container();

        root.layer = true;

        const container = new Container();
        const child = new Container();

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(container.layerTransform.tx).toEqual(10);
        expect(child.layerTransform.tx).toEqual(30);

        container.removeChild(child);

        container.x = 100;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(container.layerTransform.tx).toEqual(100);
        expect(child.layerTransform.tx).toEqual(30);
    });

    it('should give a correct layer transform', async () =>
    {
        const root = new Container({ label: 'root', layer: true });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child' });

        //  |- root // rendergroup
        //      |- container
        //          |- child

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(container.layerTransform.tx).toEqual(10);
        expect(child.layerTransform.tx).toEqual(30);

        container.layer = true;

        //  |- root // rendergroup
        //      |- container // rendergroup
        //          |- child

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(container.layerTransform.tx).toEqual(10);
        expect(child.layerTransform.tx).toEqual(20);
    });

    it('should give a correct world transform', async () =>
    {
        const root = new Container({ label: 'root', layer: true });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child' });

        //  |- root // rendergroup
        //      |- container
        //          |- child

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.worldTransform.tx).toEqual(30);

        container.layer = true;

        container.x = 20;
        //  |- root // rendergroup
        //      |- container // rendergroup
        //          |- child

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(child.worldTransform.tx).toEqual(40);
    });

    it('should give a correct layerGroup layer transform', async () =>
    {
        const root = new Container({ label: 'root', layer: true });

        const container = new Container({ label: 'container' });
        const container2 = new Container({ label: 'container2', layer: true });

        const child = new Container({ label: 'child', layer: true });

        //  |- root // rendergroup
        //      |- container
        //          |- container2 // rendergroup
        //              |- child // rendergroup

        root.addChild(container);
        container.addChild(container2);
        container2.addChild(child);

        container.x = 10;
        container2.x = 15;
        child.x = 10;

        updateLayerGroupTransforms(root.layerGroup, true);

        // expect(container.worldTransform.tx).toEqual(10);
        // expect(child.worldTransform.tx).toEqual(30);

        expect(container2.layerGroup.worldTransform.tx).toEqual(25);
        expect(child.layerGroup.worldTransform.tx).toEqual(35);

        // TODO this bit!
        expect(container2.layerGroup.layerTransform.tx).toEqual(25);
        expect(child.layerGroup.layerTransform.tx).toEqual(10);

        // expect(container.layerGroup.layerTransform.tx).toEqual(10);
        // expect(child.layerGroup.layerTransform.tx).toEqual(20);

        container.x = 0;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(container2.layerGroup.worldTransform.tx).toEqual(15);
        expect(child.layerGroup.worldTransform.tx).toEqual(25);
        // expect(child.worldTransform.tx).toEqual(40);
    });

    it('should not update a container with a view if it is not visible', async () =>
    {
        const root = new Container({ label: 'root', layer: true });

        const updateRenderable = jest.fn();

        root.layerGroup.instructionSet.renderPipes = {
            dummy: {
                addRenderable: () =>
                {
                    // thing
                },

                updateRenderable
            }
        };

        const container = new Container({ label: 'container' });
        const container2 = new Container({ label: 'container2' });

        const child = new Container({ label: 'child', view: new DummyView() });

        //  |- root // rendergroup
        //      |- container
        //          |- container2
        //              |- child

        root.addChild(container);
        container.addChild(container2);
        container2.addChild(child);

        container2.visible = false;
        child.x = 10;

        updateLayerGroupTransforms(root.layerGroup, true);
        expect(root.layerGroup.structureDidChange).toEqual(true);

        root.layerGroup.structureDidChange = false;

        child.x = 20;

        updateLayerGroupTransforms(root.layerGroup, true);

        child.x = 20;

        updateLayerGroupTransforms(root.layerGroup, true);

        expect(updateRenderable).toBeCalledTimes(0);
    });
});
