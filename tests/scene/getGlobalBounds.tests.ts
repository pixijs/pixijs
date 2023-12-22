import { Rectangle } from '../../src/maths/shapes/Rectangle';
import { addMaskBounds } from '../../src/rendering/mask/utils/addMaskBounds';
import { Bounds } from '../../src/scene/container/bounds/Bounds';
import { getGlobalBounds } from '../../src/scene/container/bounds/getGlobalBounds';
import { Container } from '../../src/scene/container/Container';
import { updateRenderGroupTransforms } from '../../src/scene/container/utils/updateRenderGroupTransforms';
import { DummyEffect } from './DummyEffect';
import { DummyView } from './DummyView';

describe('getGlobalBounds', () =>
{
    it('should measure correctly', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child', view: new DummyView() });

        root.addChild(container);

        container.addChild(child);

        const bounds = getGlobalBounds(root, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure correctly with transforms', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child', view: new DummyView() });

        container.x = 100;

        root.addChild(container);

        container.addChild(child);

        const bounds = getGlobalBounds(root, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 100 });

        child.x = -100;

        const bounds2 = getGlobalBounds(root, false, new Bounds());

        expect(bounds2).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure correctly with nested layer groups transforms', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        container.x = 100;

        root.addChild(container);

        container.addChild(child);

        const bounds = getGlobalBounds(root, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 100 });

        child.x = -100;

        const bounds2 = getGlobalBounds(child, false, new Bounds());

        expect(bounds2).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure correctly skip transforms', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        container.x = 100;
        child.x = 100;

        root.addChild(container);

        container.addChild(child);

        // this should measure incorrectly...
        const bounds = getGlobalBounds(child, true, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });

        updateRenderGroupTransforms(root.renderGroup, true);

        // this should be right..
        const bounds2 = getGlobalBounds(child, true, new Bounds());

        expect(bounds2).toMatchObject({ minX: 200, minY: 0, maxX: 300, maxY: 100 });
    });

    it('should measure correctly with child has a modified parent transforms', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        container.x = 100;

        root.addChild(container);

        container.addChild(child);

        const bounds = getGlobalBounds(child, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 100 });
    });

    it('should measure correctly multiple children', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new Container({ label: 'child', view: new DummyView() });
        const child2 = new Container({ label: 'child2', view: new DummyView() });

        child2.y = 100;

        container.x = 100;

        root.addChild(container);

        container.addChild(child);
        container.addChild(child2);

        const bounds = getGlobalBounds(container, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 200 });

        const child3 = new Container({ label: 'child2', view: new DummyView() });

        child3.x = -200;

        container.addChild(child3);

        const bounds2 = getGlobalBounds(root, false, new Bounds());

        expect(bounds2).toMatchObject({ minX: -100, minY: 0, maxX: 200, maxY: 200 });
    });

    it('should measure correctly with visibility', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        child.visible = false;

        container.addChild(child);

        const bounds = getGlobalBounds(container, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });

    it('should measure with effects correctly', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        child.effects = [new DummyEffect()];

        container.addChild(child);

        const bounds = getGlobalBounds(container, false, new Bounds());

        expect(bounds).toMatchObject({ minX: -10, minY: -10, maxX: 110, maxY: 110 });
    });

    it('should addMaskBounds correctly', async () =>
    {
        const bounds = new Bounds();

        bounds.set(0, 0, 100, 100);
        bounds.pad(10);

        const mask = new Container({ label: 'mask', view: new DummyView() });

        addMaskBounds(mask, bounds, false);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should addMaskBounds correctly with existing bounds', async () =>
    {
        const bounds = new Bounds();

        bounds.set(0, 0, 100, 100);
        bounds.pad(10);

        // | - container
        //     | - bg
        //     | - maskedContainer
        //     | - mask

        const container = new Container();

        const bg = new Container({ label: 'bg', view: new DummyView(0, 0, 500, 500) });

        const maskedContainer = new Container({ label: 'maskedContainer', view: new DummyView(50, 50, 200, 200) });

        const mask = new Container({ label: 'mask', view: new DummyView(100, 100, 100, 100) });

        container.addChild(bg, maskedContainer, mask);

        maskedContainer.mask = mask;

        getGlobalBounds(container, false, bounds);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500, maxY: 500 });
    });

    it('should get global bounds correctly with a render group', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child3 = new Container({ label: 'child3' });
        const child2 = new Container({ label: 'child2', isRenderGroup: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        child2.scale.set(2);
        child2.x = 50;
        child.x = 100;
        container.addChild(child3);
        child3.addChild(child2);
        child2.addChild(child);

        updateRenderGroupTransforms(container.renderGroup, true);

        expect(child.worldTransform.tx).toBe(250);

        const bounds = getGlobalBounds(container, true, new Bounds());

        expect(bounds).toMatchObject({ minX: 250, minY: 0, maxX: 450, maxY: 200 });
    });

    it('should get global bounds correctly if a container has boundsArea specified', async () =>
    {
        const container = new Container({ label: 'container', boundsArea: new Rectangle(0, 0, 500, 500) });

        const bounds = getGlobalBounds(container, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500, maxY: 500 });
    });

    it('should get global bounds correctly if a containers children has boundsArea specified', async () =>
    {
        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child', boundsArea: new Rectangle(0, 0, 500, 500) });

        container.addChild(child);

        child.scale.set(0.5);
        const bounds = getGlobalBounds(container, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500 / 2, maxY: 500 / 2 });
    });
});
