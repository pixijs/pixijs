import { Matrix } from '../../src/maths/matrix/Matrix';
import { Container } from '../../src/scene/container/Container';
import { updateRenderGroupTransforms } from '../../src/scene/container/utils/updateRenderGroupTransforms';
import { DummyView } from './DummyView';

describe('Transform updates', () =>
{
    it('should calculate local transform correctly', async () =>
    {
        const root = new Container();

        root.isRenderGroup = true;

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

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container.groupTransform.tx).toEqual(10);
        expect(child.groupTransform.tx).toEqual(30);

        root.x = 20;

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container.groupTransform.tx).toEqual(10);
        expect(child.groupTransform.tx).toEqual(30);
    });

    it('should calculate local transform correctly after re-parenting', async () =>
    {
        const root = new Container();

        root.isRenderGroup = true;

        const container = new Container();
        const child = new Container();

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container.groupTransform.tx).toEqual(10);
        expect(child.groupTransform.tx).toEqual(30);

        root.addChild(child);

        updateRenderGroupTransforms(root.renderGroup);

        expect(container.groupTransform.tx).toEqual(10);
        expect(child.groupTransform.tx).toEqual(20);
    });

    it('should not affect transform of removed container', async () =>
    {
        const root = new Container();

        root.isRenderGroup = true;

        const container = new Container();
        const child = new Container();

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container.groupTransform.tx).toEqual(10);
        expect(child.groupTransform.tx).toEqual(30);

        container.removeChild(child);

        container.x = 100;

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container.groupTransform.tx).toEqual(100);
        expect(child.groupTransform.tx).toEqual(30);
    });

    it('should give a correct render group transform', async () =>
    {
        const root = new Container({ label: 'root', isRenderGroup: true });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child' });

        //  |- root // rendergroup
        //      |- container
        //          |- child

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container.relativeGroupTransform.tx).toEqual(10);
        expect(child.relativeGroupTransform.tx).toEqual(30);

        container.isRenderGroup = true;

        //  |- root // rendergroup
        //      |- container // rendergroup
        //          |- child

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container.relativeGroupTransform.tx).toEqual(10);
        expect(child.relativeGroupTransform.tx).toEqual(20);
    });

    it('should give a correct world transform', async () =>
    {
        const root = new Container({ label: 'root', isRenderGroup: true });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child' });

        //  |- root // rendergroup
        //      |- container
        //          |- child

        root.addChild(container);
        container.addChild(child);

        container.x = 10;
        child.x = 20;

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(child.worldTransform.tx).toEqual(30);

        container.isRenderGroup = true;

        container.x = 20;
        //  |- root // rendergroup
        //      |- container // rendergroup
        //          |- child

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(child.worldTransform.tx).toEqual(40);
    });

    it('should give a correct renderGroup transform', async () =>
    {
        const root = new Container({ label: 'root', isRenderGroup: true });

        const container = new Container({ label: 'container' });
        const container2 = new Container({ label: 'container2', isRenderGroup: true });

        const child = new Container({ label: 'child', isRenderGroup: true });

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

        updateRenderGroupTransforms(root.renderGroup, true);

        // expect(container.worldTransform.tx).toEqual(10);
        // expect(child.worldTransform.tx).toEqual(30);

        expect(container2.renderGroup.worldTransform.tx).toEqual(25);
        expect(child.renderGroup.worldTransform.tx).toEqual(35);

        // TODO this bit!
        expect(container2.renderGroup.root.relativeGroupTransform.tx).toEqual(25);
        expect(child.renderGroup.root.relativeGroupTransform.tx).toEqual(10);

        // expect(container.layerGroup.layerTransform.tx).toEqual(10);
        // expect(child.layerGroup.layerTransform.tx).toEqual(20);

        container.x = 0;

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container2.renderGroup.worldTransform.tx).toEqual(15);
        expect(child.renderGroup.worldTransform.tx).toEqual(25);
        // expect(child.worldTransform.tx).toEqual(40);
    });

    it('should not update a container with a view if it is not visible', async () =>
    {
        const root = new Container({ label: 'root', isRenderGroup: true });

        const updateRenderable = jest.fn();

        root.renderGroup.instructionSet.renderPipes = {
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

        const child = new DummyView({ label: 'child' });

        //  |- root // rendergroup
        //      |- container
        //          |- container2
        //              |- child

        root.addChild(container);
        container.addChild(container2);
        container2.addChild(child);

        container2.visible = false;
        child.x = 10;

        updateRenderGroupTransforms(root.renderGroup, true);
        expect(root.renderGroup.structureDidChange).toEqual(true);

        root.renderGroup.structureDidChange = false;

        child.x = 20;

        updateRenderGroupTransforms(root.renderGroup, true);

        child.x = 20;

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(updateRenderable).toHaveBeenCalledTimes(0);
    });

    it('should give the correct group transform for a renderGroup', async () =>
    {
        const root = new Container({ label: 'root', isRenderGroup: true });

        const container = new Container({ label: 'container', x: 10 });
        const container2 = new Container({ label: 'container2', x: 10 });

        root.addChild(container);
        container.addChild(container2);

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container2.groupTransform.tx).toEqual(20);
        expect(container2.groupTransform).toBe(container2.relativeGroupTransform);

        container2.isRenderGroup = true;

        expect(container2.groupTransform).not.toBe(container2.relativeGroupTransform);

        expect(container2.groupTransform).toBe(Matrix.IDENTITY);

        updateRenderGroupTransforms(root.renderGroup, true);

        expect(container2.groupTransform.tx).toEqual(0);

        expect(container2.relativeGroupTransform.tx).toEqual(20);
        expect(container2.worldTransform.tx).toEqual(20);
    });
});
