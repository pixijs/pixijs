import { RenderLayer } from '../../layers/RenderLayer';
import { Container } from '../Container';

describe('RenderLayer', () =>
{
    let layer: RenderLayer;
    let container1: Container;
    let container2: Container;

    beforeEach(() =>
    {
        layer = new RenderLayer();
        container1 = new Container();
        container2 = new Container();
    });

    describe('constructor', () =>
    {
        it('should initialize with default options', () =>
        {
            expect(layer.sortableChildren).toBe(false);
            expect(layer.renderLayerChildren).toHaveLength(0);
            expect(typeof layer.sortFunction).toBe('function');
        });

        it('should accept custom options', () =>
        {
            const customSort = (a: Container, b: Container) => b.zIndex - a.zIndex;
            const customLayer = new RenderLayer({
                sortableChildren: true,
                sortFunction: customSort,
            });

            expect(customLayer.sortableChildren).toBe(true);
            expect(customLayer.sortFunction).toBe(customSort);
        });
    });

    describe('add', () =>
    {
        it('should add container to renderLayerChildren', () =>
        {
            layer.add(container1);
            expect(layer.renderLayerChildren).toContain(container1);
            expect(container1.parentRenderLayer).toBe(layer);
        });

        it('should not add same container twice', () =>
        {
            layer.add(container1);
            layer.add(container1);
            expect(layer.renderLayerChildren).toHaveLength(1);
        });

        it('should remove container from previous layer when adding to new layer', () =>
        {
            const layer2 = new RenderLayer();

            layer.add(container1);
            layer2.add(container1);

            expect(layer.renderLayerChildren).not.toContain(container1);
            expect(layer2.renderLayerChildren).toContain(container1);
            expect(container1.parentRenderLayer).toBe(layer2);
        });
    });

    describe('remove', () =>
    {
        it('should remove container from renderLayerChildren', () =>
        {
            layer.add(container1);
            layer.remove(container1);

            expect(layer.renderLayerChildren).not.toContain(container1);
            expect(container1.parentRenderLayer).toBeNull();
        });

        it('should handle removing non-existent container', () =>
        {
            layer.remove(container1);
            expect(layer.renderLayerChildren).toHaveLength(0);
        });

        it('should remove container from a layer if the child is removed from a parent', () =>
        {
            layer.add(container2);
            container1.addChild(container2);

            expect(layer.renderLayerChildren).toContain(container2);

            container1.removeChild(container2);

            expect(layer.renderLayerChildren).not.toContain(container2);
        });
    });

    describe('removeAll', () =>
    {
        it('should remove all containers', () =>
        {
            layer.add(container1);
            layer.add(container2);
            layer.removeAll();

            expect(layer.renderLayerChildren).toHaveLength(0);
            expect(container1.parentRenderLayer).toBeNull();
            expect(container2.parentRenderLayer).toBeNull();
        });
    });

    describe('sortRenderLayerChildren', () =>
    {
        it('should sort children by zIndex', () =>
        {
            container1.zIndex = 2;
            container2.zIndex = 1;

            layer.add(container1);
            layer.add(container2);
            layer.sortRenderLayerChildren();

            expect(layer.renderLayerChildren[0]).toBe(container2);
            expect(layer.renderLayerChildren[1]).toBe(container1);
        });

        it('should use custom sort function when provided', () =>
        {
            const customLayer = new RenderLayer({
                sortFunction: (a, b) => b.zIndex - a.zIndex // Reverse sort
            });

            container1.zIndex = 1;
            container2.zIndex = 2;

            customLayer.add(container1);
            customLayer.add(container2);
            customLayer.sortRenderLayerChildren();

            expect(customLayer.renderLayerChildren[0]).toBe(container2);
            expect(customLayer.renderLayerChildren[1]).toBe(container1);
        });
    });
});
