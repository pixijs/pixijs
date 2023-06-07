import { addMaskLocalBounds } from '../../src/rendering/mask/shared/addMaskLocalBounds';
import { Bounds } from '../../src/rendering/scene/bounds/Bounds';
import { getLocalBounds } from '../../src/rendering/scene/bounds/getLocalBounds';
import { Container } from '../../src/rendering/scene/Container';
import { DummyEffect } from './DummyEffect';
import { DummyView } from './DummyView';

describe('getLocalBounds', () =>
{
    it('should measure correctly', async () =>
    {
        const child = new Container({ label: 'child', view: new DummyView() });

        const bounds = getLocalBounds(child, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure with children correctly', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        container.x = 100;

        root.addChild(container);

        container.addChild(child);

        const bounds = getLocalBounds(root, new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 100 });

        const bounds2 = getLocalBounds(container, new Bounds());

        expect(bounds2).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure with multiple children correctly', async () =>
    {
        const root = new Container({ layer: true, label: 'root' });

        const container = new Container({ label: 'container', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });
        const child2 = new Container({ label: 'child2', view: new DummyView() });

        container.x = 100;
        child2.y = 100;

        root.addChild(container);

        container.addChild(child);
        container.addChild(child2);

        const bounds = getLocalBounds(root, new Bounds());

        expect(bounds).toMatchObject({ minX: 100, minY: 0, maxX: 200, maxY: 200 });

        const bounds2 = getLocalBounds(container, new Bounds());

        expect(bounds2).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 200 });
    });

    it('should measure with effects correctly', async () =>
    {
        const container = new Container({ label: 'container', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        child.effects = [new DummyEffect()];

        container.addChild(child);

        const bounds = getLocalBounds(container, new Bounds());

        expect(bounds).toMatchObject({ minX: -10, minY: -10, maxX: 110, maxY: 110 });
    });

    it('should measure correctly with visibility', async () =>
    {
        const container = new Container({ label: 'container', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        child.visible = false;

        container.addChild(child);

        const bounds = getLocalBounds(container, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });

    it('should measure correctly without child visibility', async () =>
    {
        const container = new Container({ label: 'container', layer: true });

        const child = new Container({ label: 'child', view: new DummyView() });

        child.visible = false;

        container.addChild(child);

        const bounds = getLocalBounds(container, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });

    it('should addMaskLocalBounds correctly', async () =>
    {
        const bounds = new Bounds();

        bounds.set(0, 0, 100, 100);
        bounds.pad(10);

        const root = new Container({ label: 'root', layer: true });

        const mask = new Container({ label: 'mask', view: new DummyView() });

        addMaskLocalBounds(mask, bounds, root);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should addMaskLocalBounds correctly if mask is not child of the masked element', async () =>
    {
        const bounds = new Bounds();

        bounds.set(0, 0, 100, 100);
        bounds.pad(10);

        const root = new Container({ label: 'root', layer: true });

        const maskedContent = new Container({ label: 'maskedContent' });
        const child = new Container({ label: 'child', view: new DummyView() });

        maskedContent.addChild(child);

        const mask = new Container({ label: 'mask', view: new DummyView() });

        mask.x = 50;
        // root.x = 50;

        //  //----------// -10 - 110 <-- masked item
        //       //----------// 50 - 150 <-- mask
        //       //------// 50 -  110 <-- output
        root.addChild(maskedContent);
        root.addChild(mask);

        addMaskLocalBounds(mask, bounds, maskedContent);

        expect(bounds).toMatchObject({ minX: 50, minY: 0, maxX: 110, maxY: 100 });
    });
});
