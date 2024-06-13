import { Rectangle } from '../../src/maths/shapes/Rectangle';
import { StencilMask } from '../../src/rendering/mask/stencil/StencilMask';
import { addMaskLocalBounds } from '../../src/rendering/mask/utils/addMaskLocalBounds';
import { RenderTexture } from '../../src/rendering/renderers/shared/texture/RenderTexture';
import { TextureSource } from '../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../../src/rendering/renderers/shared/texture/Texture';
import { Bounds } from '../../src/scene/container/bounds/Bounds';
import { getLocalBounds } from '../../src/scene/container/bounds/getLocalBounds';
import { Container } from '../../src/scene/container/Container';
import { Graphics } from '../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../src/scene/sprite/Sprite';
import { DummyEffect } from './DummyEffect';
import { DummyView } from './DummyView';

describe('getLocalBounds', () =>
{
    it('should measure correctly', async () =>
    {
        const child = new DummyView({ label: 'child' });
        const bounds = getLocalBounds(child, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should measure with children correctly', async () =>
    {
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });

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
        const root = new Container({ isRenderGroup: true, label: 'root' });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });
        const child2 = new DummyView({ label: 'child2' });

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
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });

        child.effects = [new DummyEffect()];

        container.addChild(child);

        const bounds = getLocalBounds(container, new Bounds());

        expect(bounds).toMatchObject({ minX: -10, minY: -10, maxX: 110, maxY: 110 });
    });

    it('should measure correctly with visibility', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });

        child.visible = false;

        container.addChild(child);

        const bounds = getLocalBounds(container, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });

    it('should measure correctly without child visibility', async () =>
    {
        const container = new Container({ label: 'container', isRenderGroup: true });

        const child = new DummyView({ label: 'child' });

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

        const root = new Container({ label: 'root', isRenderGroup: true });

        const mask = new DummyView({ label: 'mask' });

        addMaskLocalBounds(mask, bounds, root);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    });

    it('should addMaskLocalBounds correctly if mask is not child of the masked element', async () =>
    {
        const bounds = new Bounds();

        bounds.set(0, 0, 100, 100);
        bounds.pad(10);

        const root = new Container({ label: 'root', isRenderGroup: true });

        const maskedContent = new Container({ label: 'maskedContent' });
        const child = new DummyView({ label: 'child' });

        maskedContent.addChild(child);

        const mask = new DummyView({ label: 'mask' });

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

    it('should addMaskLocalBounds if there are multiple masks in the container', async () =>
    {
        const bounds = new Bounds();

        const root = new Container({ label: 'root', isRenderGroup: true });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const maskedContent = new Container({ label: 'maskedContent' });
        const mask = new DummyView({ label: 'mask', width: 50, height: 50 });
        const content = new DummyView({ label: 'content' });

        content.addEffect(new StencilMask({ mask }));

        maskedContent.addChild(content);
        maskedContent.addChild(mask);

        container.addChild(maskedContent);

        root.addChild(container);

        getLocalBounds(container, bounds);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 50, maxY: 50 });

        const maskedContent2 = new Container({ label: 'maskedContent2' });
        const mask2 = new DummyView({ label: 'mask2', width: 50, height: 50 });
        const content2 = new DummyView({ label: 'content2' });

        content2.addEffect(new StencilMask({ mask: mask2 }));

        maskedContent2.addChild(content2);
        maskedContent2.addChild(mask2);

        maskedContent2.x = 100;

        container.addChild(maskedContent2);

        getLocalBounds(container, bounds);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 150, maxY: 50 });
    });

    it('should addMaskLocalBounds if there are multiple nested masks in the container', async () =>
    {
        const bounds = new Bounds();

        const root = new Container({ label: 'root', isRenderGroup: true });

        const container = new Container({ label: 'container', isRenderGroup: true });

        const maskedContent = new Container({ label: 'maskedContent' });
        const mask = new DummyView({ label: 'mask', width: 50, height: 50 });
        const content = new DummyView({ label: 'content' });
        const bg = new DummyView({ label: 'content', width: 50, height: 50 });

        content.addEffect(new StencilMask({ mask }));

        maskedContent.addChild(bg);
        maskedContent.addChild(content);
        maskedContent.addChild(mask);

        container.addChild(maskedContent);

        root.addChild(container);

        getLocalBounds(container, bounds);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 50, maxY: 50 });

        const maskedContent2 = new Container({ label: 'maskedContent2' });
        const mask2 = new DummyView({ label: 'mask2', width: 50, height: 50 });
        const content2 = new DummyView({ label: 'content2' });

        content2.addEffect(new StencilMask({ mask: mask2 }));

        maskedContent2.addChild(content2);
        maskedContent2.addChild(mask2);

        maskedContent2.x = 100;

        container.addChild(maskedContent2);

        getLocalBounds(container, bounds);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 150, maxY: 50 });
    });

    it('should measure trimmed sprite correctly', async () =>
    {
        const textureSource = new TextureSource({
            width: 200,
            height: 200,
            resolution: 1,
        });

        const texture = new Texture({
            source: textureSource,
            trim: new Rectangle(0.1 * 200, 0.1 * 200, 0.8 * 200, 0.8 * 200),
            frame: new Rectangle(0, 0, 200, 200),
        });

        const sprite = new Sprite({ texture });

        expect(sprite.width).toBe(200);
        expect(sprite.height).toBe(200);
    });

    it('should get local bounds correctly if a container has boundsArea specified', async () =>
    {
        const container = new Container({ label: 'container', boundsArea: new Rectangle(0, 0, 500, 500) });

        container.x = 100;

        const bounds = getLocalBounds(container, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500, maxY: 500 });
    });

    it('should get local bounds correctly if a containers children has boundsArea specified', async () =>
    {
        const container = new Container({ label: 'container' });

        container.x = 100;

        const child = new Container({ label: 'child', boundsArea: new Rectangle(0, 0, 500, 500) });

        container.addChild(child);

        child.scale.set(0.5);
        const bounds = getLocalBounds(container, new Bounds());

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500 / 2, maxY: 500 / 2 });
    });

    it('should calculate correct bounds when target has a mask', async () =>
    {
        const root = new Container({ label: 'root' });

        const rect = new Graphics().rect(0, 0, 50, 50).fill('red');
        const mask = new Graphics().rect(10, 10, 10, 10).fill('red');

        root.addChild(rect);
        root.addChild(mask);

        root.effects.push(new StencilMask({
            mask
        }));

        const bounds = root.getLocalBounds();

        expect(bounds).toMatchObject({ minX: 10, minY: 10, maxX: 20, maxY: 20 });
    });

    it('should cache local bounds on a container', async () =>
    {
        const container = new Container({ label: 'container' });

        container.x = 100;

        const child = new DummyView({ label: 'child', width: 500, height: 500 });

        container.addChild(child);

        child.scale.set(0.5);

        let bounds = container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(true);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500 / 2, maxY: 500 / 2 });

        bounds = container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(false);

        child.scale.set(1);

        bounds = container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(true);

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 500, maxY: 500 });

        bounds = container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(false);
    });

    it('should invalidate local bounds cache on a container if a view changes', async () =>
    {
        const container = new Container({ label: 'container' });

        container.x = 100;

        const child = new Sprite(RenderTexture.create({ width: 10, height: 10 }));

        container.addChild(child);

        container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(true);

        container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(false);

        child.texture = Texture.EMPTY;

        container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(true);

        container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(false);
    });

    it('should not invalidate local bounds cache container if it changes its local transform', async () =>
    {
        const container = new Container({ label: 'container' });

        const child = new Sprite(RenderTexture.create({ width: 10, height: 10 }));

        container.addChild(child);

        container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(true);

        container.x = 100;

        container.getLocalBounds();

        expect(container._localBoundsCacheData.didChange).toEqual(false);
    });

    it('should invalidate local bounds cache container view changes', async () =>
    {
        const child = new Sprite(RenderTexture.create({ width: 10, height: 10 }));

        const bounds = child.getLocalBounds();

        expect(bounds).toMatchObject({ minX: 0, minY: 0, maxX: 10, maxY: 10 });

        expect(child._localBoundsCacheData.didChange).toEqual(true);

        child.getLocalBounds();

        expect(child._localBoundsCacheData.didChange).toEqual(false);

        child.texture = Texture.EMPTY;

        child.getLocalBounds();

        expect(child._localBoundsCacheData.didChange).toEqual(true);
    });

    it('should measure correctly if a child has been added and removed', async () =>
    {
        const container = new Container({ label: 'container' });

        const bounds1 = container.getLocalBounds();

        expect(bounds1).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });

        const child = new DummyView({ label: 'child' });

        container.addChild(child);

        const bounds2 = container.getLocalBounds();

        expect(bounds2).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });

        container.removeChild(child);

        const bounds3 = container.getLocalBounds();

        expect(bounds3).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });

    it('should measure correctly if a nested child has been added and removed', async () =>
    {
        const container = new Container({ label: 'container' });

        const container2 = new Container({ label: 'container2' });

        container.addChild(container2);

        const bounds1 = container.getLocalBounds();

        expect(bounds1).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });

        const child = new DummyView({ label: 'child' });

        container2.addChild(child);

        const bounds2 = container.getLocalBounds();

        expect(bounds2).toMatchObject({ minX: 0, minY: 0, maxX: 100, maxY: 100 });

        container2.removeChild(child);

        const bounds3 = container.getLocalBounds();

        expect(bounds3).toMatchObject({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    });
});
