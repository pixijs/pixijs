import { RenderLayer } from '../../layers/RenderLayer';
import { Bounds } from '../bounds/Bounds';
import { Container } from '../Container';
import { updateRenderGroupTransforms } from '../utils/updateRenderGroupTransforms';
import { DummyEffect } from './DummyEffect';
import { DummyView } from './DummyView';
import { Rectangle } from '~/maths';
import { logScene } from '~/utils';

describe('getGlobalFastBounds', () =>
{
    it('should measure correctly', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container' });

        const child = new DummyView({ label: 'child' });

        root.addChild(container);

        container.addChild(child);

        updateRenderGroupTransforms(container.parentRenderGroup, true);

        const bounds = root.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure correctly with transforms', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container' });

        const child = new DummyView({ label: 'child' });

        container.x = 100;

        root.addChild(container);

        container.addChild(child);

        updateRenderGroupTransforms(root.renderGroup, true);

        const bounds = root.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 100 });

        child.x = -100;

        updateRenderGroupTransforms(root.renderGroup, true);

        const bounds2 = root.getFastGlobalBounds(new Bounds());

        expect(bounds2).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure correctly with nested layer groups transforms', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });

        container.x = 100;

        root.addChild(container);

        container.addChild(child);

        updateRenderGroupTransforms(root.renderGroup, true);

        const bounds = root.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 100 });

        child.x = -100;

        updateRenderGroupTransforms(root.renderGroup, true);

        logScene(root);

        const bounds2 = child.getFastGlobalBounds(new Bounds());

        expect(bounds2).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure correctly multiple children', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });
        const child2 = new DummyView({ label: 'child2' });

        child2.y = 100;

        container.x = 100;

        root.addChild(container);

        container.addChild(child);
        container.addChild(child2);

        updateRenderGroupTransforms(root.renderGroup, true);

        const bounds = container.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: 200, minY: 0, maxX: 300, maxY: 200 });

        const child3 = new DummyView({ label: 'child2' });

        child3.x = -200;

        container.addChild(child3);

        updateRenderGroupTransforms(root.renderGroup, true);

        const bounds2 = root.getFastGlobalBounds(new Bounds());

        expect(bounds2).toMatchObject({ minX: -100, minY: 0, maxX: 200, maxY: 200 });
    });

    it('should measure correctly with visibility', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });

        child.visible = false;

        container.addChild(child);

        updateRenderGroupTransforms(container.renderGroup, true);

        const bounds = container.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });

    it('should measure with effects correctly', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });

        child.effects = [new DummyEffect()];

        container.addChild(child);

        updateRenderGroupTransforms(container.renderGroup, true);

        const bounds = container.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: -10, minY: -10, maxX: 110, maxY: 110 });
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

        const container = new Container({ isRenderGroup: true });

        const bg = new DummyView({ label: 'bg', width: 500, height: 500 });

        const maskedContainer = new Container({ label: 'maskedContainer', x: 50, y: 50, width: 200, height: 200 });

        const mask = new DummyView({ label: 'mask', x: 100, y: 100, width: 100, height: 100 });

        container.addChild(bg, maskedContainer, mask);

        maskedContainer.mask = mask;

        updateRenderGroupTransforms(container.renderGroup, true);

        container.getFastGlobalBounds(bounds);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500, maxY: 500 });
    });

    it('should get global bounds correctly with a render group', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child3 = new Container({ label: 'child3' });
        const child2 = new Container({ label: 'child2', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });

        child2.scale.set(2);
        child2.x = 50;
        child.x = 100;
        container.addChild(child3);
        child3.addChild(child2);
        child2.addChild(child);

        updateRenderGroupTransforms(container.renderGroup, true);

        expect(child.worldTransform.tx).toBe(250);

        const bounds = container.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: 250, minY: 0, maxX: 450, maxY: 200 });
    });

    it('should get global bounds correctly if a container has boundsArea specified', async () =>
    {
        const container = new Container({
            label: 'container',
            isRenderGroup: true,
            boundsArea: new Rectangle(0, 0, 500, 500)
        });

        updateRenderGroupTransforms(container.renderGroup, true);

        const bounds = container.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500, maxY: 500 });
    });

    it('should get global bounds correctly if a containers children has boundsArea specified', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new Container({ label: 'child', boundsArea: new Rectangle(0, 0, 500, 500) });

        container.addChild(child);

        child.scale.set(0.5);

        updateRenderGroupTransforms(container.renderGroup, true);

        const bounds = container.getFastGlobalBounds(new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500 / 2, maxY: 500 / 2 });
    });

    // ... existing tests ...

    it('should respect render layers when factorRenderLayers is true', () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });
        const layer1 = new RenderLayer();
        const layer2 = new RenderLayer();

        const child1 = new DummyView({ label: 'child1' });
        const child2 = new DummyView({ label: 'child2', x: 200 });

        const container = new Container({ label: 'container' });

        container.addChild(child1, child2);

        root.addChild(container, layer1, layer2);

        updateRenderGroupTransforms(root.renderGroup, true);

        // When factorRenderLayers is false, includes all children
        const globalBounds = container.getFastGlobalBounds(new Bounds(), false);

        expect(globalBounds).toMatchObject({ minX: 0, minY: 0, maxX: 300, maxY: 100 });

        // When factorRenderLayers is true, only includes children in the current layer
        const globalVisualBounds = container.getFastGlobalBounds(new Bounds(), true);

        expect(globalVisualBounds).toMatchObject({ minX: 0, minY: 0, maxX: 300, maxY: 100 });

        // now add the children to the layers
        layer1.add(child1);
        layer2.add(child2);

        const globalVisualBounds2 = container.getFastGlobalBounds(new Bounds(), true);

        expect(globalVisualBounds2).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });

    it('should handle nested render layers correctly', () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });
        const outerLayer = new RenderLayer();
        const innerLayer = new RenderLayer();
        const innerContainer = new Container({ label: 'innerContainer' });

        root.addChild(innerContainer);

        const child1 = new DummyView({ label: 'child1' });
        const child2 = new DummyView({ label: 'child2', x: 200 });

        root.addChild(child1, child2);
        root.addChild(outerLayer);

        innerContainer.addChild(innerLayer);

        innerLayer.add(child1);
        outerLayer.add(child2);

        updateRenderGroupTransforms(root.renderGroup, true);

        // Check bounds of outer layer
        const outerBounds = root.getFastGlobalBounds(new Bounds(), true);

        expect(outerBounds).toMatchObject({ minX: 0, minY: 0, maxX: 300, maxY: 100 });

        // // Check bounds of inner layer
        const innerBounds = innerLayer.getFastGlobalBounds(new Bounds(), true);

        expect(innerBounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should handle removing objects from render layers', () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });
        const layer = new RenderLayer();
        const child = new DummyView({ label: 'child' });

        root.addChild(layer);
        root.addChild(child);
        layer.add(child);

        updateRenderGroupTransforms(root.renderGroup, true);

        // Initial bounds with child in layer
        const initialBounds = layer.getFastGlobalBounds(new Bounds(), true);

        expect(initialBounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });

        // // Remove child from layer
        layer.remove(child);

        const boundsAfterRemoval = layer.getFastGlobalBounds(new Bounds(), true);

        expect(boundsAfterRemoval).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });

        // // Check root bounds still include the child
        const rootBounds = root.getFastGlobalBounds(new Bounds(), false);

        expect(rootBounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });
});
