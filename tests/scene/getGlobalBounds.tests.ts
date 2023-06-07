import { addMaskBounds } from '../../src/rendering/mask/shared/addMaskBounds';
import { Bounds } from '../../src/rendering/scene/bounds/Bounds';
import { getGlobalBounds } from '../../src/rendering/scene/bounds/getGlobalBounds';
import { Container } from '../../src/rendering/scene/Container';
import { updateLayerGroupTransforms } from '../../src/rendering/scene/utils/updateLayerGroupTransforms';
import { DummyEffect } from './DummyEffect';
import { DummyView } from './DummyView';

describe('getGlobalBounds', () =>
{
    it('should measure correctly', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container' });

        const child = new Container({ label: 'child', view: new DummyView() });

        root.addChild(container);

        container.addChild(child);

        const bounds = getGlobalBounds(root, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure correctly with transforms', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

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
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container', layer: true });

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
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        container.x = 100;
        child.x = 100;

        root.addChild(container);

        container.addChild(child);

        // this should measure incorrectly...
        const bounds = getGlobalBounds(child, true, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });

        updateLayerGroupTransforms(root.layerGroup, true);

        // this should be right..
        const bounds2 = getGlobalBounds(child, true, new Bounds());

        expect(bounds2).toMatchObject({ minX: 200, minY: 0, maxX: 300, maxY: 100 });
    });

    it('should measure correctly with child has a modified parent transforms', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        container.x = 100;

        root.addChild(container);

        container.addChild(child);

        const bounds = getGlobalBounds(child, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 100 });
    });

    it('should measure correctly multiple children', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container', layer: true });

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
        const container = new Container({ label: 'container', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        child.visible = false;

        container.addChild(child);

        const bounds = getGlobalBounds(container, false, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });

    it('should measure with effects correctly', async () =>
    {
        const container = new Container({ label: 'container', layer: true });

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

    it('should get global bounds correctly with a layer', async () =>
    {
        const container = new Container({ label: 'container', layer: true });

        const child3 = new Container({ label: 'child3' });
        const child2 = new Container({ label: 'child2', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        child2.scale.set(2);
        child2.x = 50;
        child.x = 100;
        container.addChild(child3);
        child3.addChild(child2);
        child2.addChild(child);

        updateLayerGroupTransforms(container.layerGroup, true);

        expect(child.worldTransform.tx).toBe(250);

        const bounds = getGlobalBounds(container, true, new Bounds());

        expect(bounds).toMatchObject({ minX: 250, minY: 0, maxX: 450, maxY: 200 });
    });
});
