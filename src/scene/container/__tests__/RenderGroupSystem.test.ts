import '~/events/init';
import '~/filters/init';
import { Container } from '../Container';
import '../../text/init';
import { describeLocalOnly, getWebGLRenderer, getWebGPURenderer } from '@test-utils';
import { EventBoundary } from '~/events';
import { AlphaFilter } from '~/filters';
import { Matrix, Rectangle } from '~/maths';
import { CanvasRenderer, CLEAR, RenderTexture, Texture } from '~/rendering';
import { Bounds, getGlobalRenderableBounds, RenderLayer, Sprite, Text, updateRenderGroupTransforms } from '~/scene';

import type { Renderer, RenderSurface, WebGLOptions } from '~/rendering';

function describeCachedContainerMove(createRenderer: () => Promise<Renderer>): void
{
    it('should draw a cached container at its new position after it moves', async () =>
    {
        const renderer = await createRenderer();
        const target = RenderTexture.create({ width: 32, height: 32 });
        const stage = new Container();

        // fillers so the cached container's vertices don't start at the beginning of the attribute buffer
        for (let i = 0; i < 5; i++)
        {
            stage.addChild(new Sprite({ texture: Texture.WHITE, width: 1, height: 1 }));
        }

        const cached = new Container({ x: 4, y: 4 });

        cached.addChild(new Sprite({ texture: Texture.WHITE, width: 8, height: 8, tint: 0xff0000 }));
        cached.cacheAsTexture(true);
        stage.addChild(cached);

        const render = () =>
        {
            renderer.render({ container: stage, target, clear: true });

            const { pixels, width } = renderer.extract.pixels(target);

            return (x: number, y: number) =>
            {
                const offset = ((y * width) + x) * 4;

                return Array.from(pixels.subarray(offset, offset + 4));
            };
        };

        expect(render()(8, 8)).toEqual([255, 0, 0, 255]);

        cached.position.set(20, 20);

        const pixelAt = render();

        expect(pixelAt(24, 24)).toEqual([255, 0, 0, 255]);
        expect(pixelAt(8, 8)).toEqual([0, 0, 0, 0]);

        stage.destroy({ children: true });
        target.destroy(true);
        renderer.destroy();
    });
}

describe('RenderGroupSystem', () =>
{
    it('should reset childrenRenderablesToUpdate index between renders', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: true });
        const text = new Text({ text: 'hello world' });

        container.addChild(text);

        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(0);

        renderer.render(container);

        text.text = 'hello world 2';
        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(1);

        renderer.render(container);

        expect(container.renderGroup.childrenRenderablesToUpdate.index).toEqual(0);
    });

    it('should only call on render once for a render group after conversion', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: false, label: 'root' });

        const child = new Container({ isRenderGroup: true, label: 'child' });

        container.addChild(child);

        child.onRender = jest.fn();

        renderer.render(container);

        expect(child.onRender).toHaveBeenCalledTimes(1);
    });

    it('should only call on render once for a render group before conversion', async () =>
    {
        const renderer = await getWebGLRenderer();

        const container = new Container({ isRenderGroup: true, label: 'root' });

        const child = new Container({ isRenderGroup: true, label: 'child' });

        container.addChild(child);

        child.onRender = jest.fn();

        renderer.render(container);

        expect(child.onRender).toHaveBeenCalledTimes(1);
    });

    it('should correctly set scaleMode for render group texture source during rendering', async () =>
    {
        const renderer = await getWebGLRenderer();
        const container = new Container();

        container.cacheAsTexture({ scaleMode: 'nearest' });
        renderer.render(container);

        expect(container.renderGroup.texture._source.scaleMode).toEqual('nearest');
    });
});

describe('RenderGroupSystem world transforms after rendering to a texture', () =>
{
    let renderer: Renderer;
    let target: RenderTexture;
    let stage: Container;
    let world: Container;
    let panel: Container;
    let button: Container;
    let middle: Container;

    const setup = async (options?: Partial<WebGLOptions>) =>
    {
        renderer = await getWebGLRenderer(options);
        target = RenderTexture.create({ width: 32, height: 32 });
        stage = new Container();
        world = new Container({ x: 100 });
        panel = new Container({ x: 200, y: 100 });
        button = new Container({ x: 50, y: 50, eventMode: 'static', hitArea: new Rectangle(0, 0, 20, 20) });

        // gives generateTexture and extract bounds that do not start at (0, 0)
        button.addChild(new Sprite({ texture: Texture.WHITE, width: 20, height: 20 }));
        panel.addChild(button);
        world.addChild(panel);
        stage.addChild(world);
    };

    // the button is drawn at (350, 150)
    // a boolean, as a failure would print the whole container
    const hit = (x = 360, y = 160) => new EventBoundary(renderer.lastObjectRendered).hitTest(x, y) === button;
    const move = (x: number, y: number) => new Matrix().translate(x, y);

    afterEach(() =>
    {
        stage.destroy({ children: true });
        target.destroy(true);
        renderer.destroy();
    });

    const bakes: [string, (container: Container) => void][] = [
        ['generateTexture', (container) => renderer.textureGenerator.generateTexture(container).destroy(true)],
        ['extract', (container) => { renderer.extract.pixels(container); }],
        ['render with a transform', (container) => renderer.render({ container, target, transform: move(-37, -39) })],
        ['render with no transform', (container) => renderer.render({ container, target })],
    ];

    describe.each(bakes)('%s', (_name, bake) =>
    {
        it.each([false, true])('should keep a staged container hit-testable (nested render group: %s)', async (nested) =>
        {
            await setup();
            button.isRenderGroup = nested;
            renderer.render(stage);
            expect(hit()).toBe(true);

            bake(panel);

            expect(hit()).toBe(true);
            expect(button.worldTransform.tx).toBe(350);
            expect(button.worldTransform.ty).toBe(150);
        });

        it.each([false, true])('should keep the stage hit-testable (nested render group: %s)', async (nested) =>
        {
            await setup();
            button.isRenderGroup = nested;
            renderer.render(stage);

            bake(stage);

            expect(hit()).toBe(true);
        });

        it('should keep a stage that was drawn with a transform where it was drawn', async () =>
        {
            await setup();
            renderer.render({ container: stage, transform: move(-300, -100) });
            expect(hit(60, 60)).toBe(true);

            bake(stage);
            expect(hit(60, 60)).toBe(true);

            bake(panel);
            expect(hit(60, 60)).toBe(true);
        });

        it('should keep a child that was drawn to the screen by itself where it was drawn', async () =>
        {
            await setup();
            renderer.render(stage);
            renderer.render(panel);
            expect(hit(260, 160)).toBe(true);

            bake(panel);

            expect(hit(260, 160)).toBe(true);
        });
    });

    it.each([
        ['the child', () => panel],
        ['the child\'s stage', () => stage],
    ])('should keep a child that was drawn to the screen by itself when %s is rendered', async (_name, container) =>
    {
        await setup();
        button.isRenderGroup = true;
        world.alpha = 0.5;
        renderer.render(stage);
        renderer.render({ container: panel, transform: move(0, 0) });
        expect(hit(60, 60)).toBe(true);

        const { worldColorAlpha } = button.renderGroup;

        renderer.textureGenerator.generateTexture(container()).destroy(true);

        expect(hit(60, 60)).toBe(true);
        expect(button.renderGroup.worldColorAlpha).toBe(worldColorAlpha);
    });

    it.each([false, true])('should move the stage with a render in prerender (useBackBuffer: %s)', async (useBackBuffer) =>
    {
        await setup({ useBackBuffer });

        const other = new Container();
        let nested = false;
        const hook = {
            prerender: () =>
            {
                if (nested) return;
                nested = true;
                renderer.render({ container: other, target });
                nested = false;
            }
        };

        renderer.runners.prerender.add(hook);
        renderer.render(stage);
        stage.x = 100;
        renderer.render(stage);

        expect(hit(460, 160)).toBe(true);
        expect(hit()).toBe(false);

        renderer.runners.prerender.remove(hook);
        other.destroy();
    });

    it('should keep the children of a container that becomes a render group hit-testable', async () =>
    {
        await setup();
        stage.x = 10;
        renderer.render(stage);

        // recycle a group that was somewhere else
        button.isRenderGroup = true;
        renderer.render(stage);
        button.isRenderGroup = false;
        renderer.render(stage);

        panel.isRenderGroup = true;
        expect(hit(370, 160)).toBe(true);

        renderer.render({ container: panel, target });
        expect(hit(370, 160)).toBe(true);
        expect(panel.worldTransform.tx).toBe(310);
    });

    it('should use the transform of the render for the bounds of its root', async () =>
    {
        await setup();
        renderer.render(stage);

        const { globalUniforms } = renderer;
        const start = globalUniforms.start.bind(globalUniforms);
        const seen: number[] = [];

        jest.spyOn(globalUniforms, 'start').mockImplementation((options) =>
        {
            seen.push(panel.getBounds().x, button.getBounds().x, panel.getGlobalTransform().tx);
            start(options);
        });

        renderer.render({ container: panel, target, transform: move(-37, -39) });

        expect(seen).toEqual([13, 13, -37]);
        expect(panel.getBounds().x).toBe(350);
    });

    it.each([false, true])('should hit a stage where a screen render drew it (useBackBuffer: %s)', async (useBackBuffer) =>
    {
        await setup({ useBackBuffer });
        renderer.render(stage);
        renderer.render({ container: stage, transform: move(-300, -100) });

        expect(hit(60, 60)).toBe(true);
        expect(hit()).toBe(false);
    });

    it.each([false, true])('should hit a child where a screen render drew it (useBackBuffer: %s)', async (useBackBuffer) =>
    {
        await setup({ useBackBuffer });
        renderer.render(stage);
        renderer.render({ container: panel, transform: move(0, 0) });

        expect(hit(60, 60)).toBe(true);
    });

    it('should restore the world alpha and color of a staged container', async () =>
    {
        await setup();
        world.alpha = 0.5;
        world.tint = 0xff0000;
        renderer.render(stage);
        panel.enableRenderGroup();
        renderer.render(stage);

        const { worldAlpha, worldColorAlpha } = panel.renderGroup;

        expect(worldAlpha).toBe(0.5);
        renderer.render({ container: panel, target });

        expect(panel.renderGroup.worldAlpha).toBe(worldAlpha);
        expect(panel.renderGroup.worldColorAlpha).toBe(worldColorAlpha);
    });

    it('should not leave a cached inverse of the transform it rendered with', async () =>
    {
        await setup();
        button.isRenderGroup = true;
        renderer.render(stage);

        const { globalUniforms } = renderer;
        const start = globalUniforms.start.bind(globalUniforms);
        let inverseDuringBake: number;

        // reading the inverse while rendering caches it
        jest.spyOn(globalUniforms, 'start').mockImplementation((options) =>
        {
            inverseDuringBake = panel.renderGroup.inverseWorldTransform.tx;
            button.renderGroup.inverseWorldTransform;
            start(options);
        });

        renderer.render({ container: panel, target, transform: move(-37, -39) });
        expect(inverseDuringBake).toBe(37);

        for (const { renderGroup } of [panel, button])
        {
            const { tx, ty } = renderGroup.worldTransform;

            expect(renderGroup.inverseWorldTransform.tx).toBe(-tx);
            expect(renderGroup.inverseWorldTransform.ty).toBe(-ty);
        }
    });

    it('should keep the local transform of the stage when a render nests in onRender', async () =>
    {
        await setup();

        const other = new Container({ x: 40 });

        // gives it a local transform that could leak into the stage
        renderer.render({ container: other, target });

        panel.onRender = () =>
        {
            panel.onRender = null;
            renderer.render({ container: other, target, transform: move(-7, -9) });
        };
        renderer.render(stage);

        expect(stage.localTransform.tx).toBe(0);
        expect(other.localTransform.tx).toBe(40);

        other.destroy();
    });

    it.each([false, true])('should move a render group in a cached container (rendered to a texture: %s)', async (bake) =>
    {
        await setup();
        panel.isRenderGroup = true;
        button.isRenderGroup = true;
        world.cacheAsTexture(true);
        renderer.render(stage);

        if (bake) renderer.render({ container: panel, target, transform: move(-37, -39) });

        world.x += 100;
        renderer.render(stage);

        expect(hit(460, 160)).toBe(true);
        expect(hit()).toBe(false);
    });

    it('should move a container in a cached container that a render made a render group', async () =>
    {
        await setup();
        world.cacheAsTexture(true);
        renderer.render(stage);
        renderer.textureGenerator.generateTexture(panel).destroy(true);
        world.x += 100;
        renderer.render(stage);

        expect(hit(460, 160)).toBe(true);
    });

    it.each([
        ['itself', () => button],
        ['a render group between it and the outer one', () => panel],
        ['a container that was not a render group', () => middle],
    ])('should update the outer cached texture from a nested one after rendering %s', async (_name, container) =>
    {
        await setup();
        middle = new Container();
        panel.isRenderGroup = true;
        world.addChild(middle);
        middle.addChild(panel);
        world.cacheAsTexture(true);
        button.cacheAsTexture(true);
        renderer.render(stage);
        renderer.render({ container: container(), target });
        renderer.render(stage);

        const centre = () =>
        {
            renderer.render({ container: stage, target, clear: true, transform: move(-344, -144) });

            const { pixels, width } = renderer.extract.pixels(target);
            const offset = ((16 * width) + 16) * 4;

            return Array.from(pixels.subarray(offset, offset + 4));
        };

        expect(centre()).toEqual([255, 255, 255, 255]);

        (button.children[0] as Sprite).tint = 0xff0000;
        button.updateCacheTexture();

        expect(world.renderGroup.textureNeedsUpdate).toBe(true);
        expect(centre()).toEqual([255, 0, 0, 255]);
    });

    it('should update every outer cached texture of one nested three deep', async () =>
    {
        await setup();
        world.cacheAsTexture(true);
        panel.cacheAsTexture(true);
        button.cacheAsTexture(true);
        renderer.render(stage);
        renderer.render({ container: panel, target });
        renderer.render(stage);
        button.updateCacheTexture();

        expect(panel.renderGroup.textureNeedsUpdate).toBe(true);
        expect(world.renderGroup.textureNeedsUpdate).toBe(true);
    });

    it('should draw a cached container that was updated and then rendered to a texture', async () =>
    {
        await setup();
        button.cacheAsTexture(true);

        const centre = () =>
        {
            renderer.render({ container: stage, target, clear: true, transform: move(-344, -144) });

            const { pixels, width } = renderer.extract.pixels(target);
            const offset = ((16 * width) + 16) * 4;

            return Array.from(pixels.subarray(offset, offset + 4));
        };

        expect(centre()).toEqual([255, 255, 255, 255]);

        const sprite = button.children[0] as Sprite;

        // big enough to need another texture
        sprite.setSize(200, 200);
        sprite.tint = 0xff0000;
        button.updateCacheTexture();
        renderer.textureGenerator.generateTexture(button).destroy(true);

        expect(centre()).toEqual([255, 0, 0, 255]);
    });

    it('should draw a container that was rendered to a texture as it became cached', async () =>
    {
        await setup();
        renderer.render(stage);
        renderer.textureGenerator.generateTexture(button).destroy(true);
        renderer.render(stage);
        button.cacheAsTexture(true);
        renderer.textureGenerator.generateTexture(button).destroy(true);

        expect(() => renderer.render(stage)).not.toThrow();
    });

    it('should keep a move made in onRender before a nested render of the same stage', async () =>
    {
        await setup();
        stage.onRender = () =>
        {
            stage.onRender = null;
            stage.x = -30;
            renderer.render({ container: stage, target });
        };
        renderer.render(stage);
        renderer.render(stage);

        expect(stage.localTransform.tx).toBe(-30);
        expect(hit(330, 160)).toBe(true);
    });

    it.each([
        ['canvas', () => renderer.canvas],
        ['texture', () => renderer.view.texture],
        ['texture source', () => renderer.view.texture.source],
    ])('should hit a stage where it was drawn to the %s of the view', async (_name, surface) =>
    {
        await setup();
        renderer.render(stage);
        renderer.render({ container: stage, target: surface() as RenderSurface, transform: move(-300, -100) });

        expect(hit(60, 60)).toBe(true);
    });

    it('should keep the stage hit-testable after it stops being a render group', async () =>
    {
        await setup();
        stage.x = 100;
        renderer.render(stage);
        stage.disableRenderGroup();

        expect(hit(460, 160)).toBe(true);
    });

    it('should leave a container that is not in a scene with the transform it was drawn with', async () =>
    {
        await setup();
        renderer.render(new Container());
        renderer.render({ container: panel, target, transform: move(7, 9) });

        expect(panel.worldTransform.tx).toBe(7);
        expect(panel.worldTransform.ty).toBe(9);
    });

    it('should leave a container whose parent was never drawn with the transform it was drawn with', async () =>
    {
        await setup();
        world.isRenderGroup = true;
        renderer.render({ container: panel, target, transform: move(7, 9) });

        expect(panel.worldTransform.tx).toBe(7);
    });

    it('should place a container in a scene that was taken off the view where it is in that', async () =>
    {
        await setup();
        world.isRenderGroup = true;
        renderer.render(stage);
        stage.removeChild(world);
        renderer.render(stage);
        renderer.render({ container: panel, target, transform: move(7, 9) });

        expect(panel.worldTransform.tx).toBe(300);

        world.destroy({ children: true });
    });

    it('should keep a container hit-testable in a new render group', async () =>
    {
        await setup();
        renderer.render({ container: stage, target });
        world.isRenderGroup = true;
        renderer.render({ container: panel, target, transform: move(7, 9) });

        expect(new EventBoundary(stage).hitTest(360, 160) === button).toBe(true);
    });

    it.each([
        ['generateTexture', () => renderer.textureGenerator.generateTexture(panel).destroy(true)],
        ['a render', () => renderer.render({ container: panel, target, transform: move(7, 9) })],
    ])('should keep a container hit-testable after %s when its scene is only drawn to a texture', async (_name, bake) =>
    {
        await setup();

        const picture = new Sprite(target);
        const hitStage = () => new EventBoundary(stage).hitTest(360, 160) === button;

        renderer.render({ container: stage, target });
        renderer.render(picture);
        expect(hitStage()).toBe(true);
        bake();
        expect(hitStage()).toBe(true);
        picture.destroy();
    });

    it.each([false, true])(
        'should follow a camera once the view stops showing a scene (shown with a transform: %s)',
        async (hasTransform) =>
        {
            await setup();

            const picture = new Sprite(target);

            renderer.render(hasTransform ? { container: stage, transform: move(1, 1) } : stage);

            for (let i = 1; i <= 2; i++)
            {
                renderer.render({ container: stage, target, transform: move(-50 * i, 0) });
                renderer.render(picture);
            }

            expect(button.worldTransform.tx).toBe(250);
            expect(new EventBoundary(stage).hitTest(260, 160) === button).toBe(true);

            const outer = new Container({ x: 10 });

            outer.addChild(stage);
            renderer.render({ container: outer, target });
            expect(button.worldTransform.tx).toBe(360);

            outer.removeChild(stage);
            outer.destroy();
            picture.destroy();
        });

    it.each([
        ['nothing', false, 350],
        ['only its depth', CLEAR.DEPTH, 350],
        ['its color', CLEAR.COLOR, 50],
        ['everything', true, 50],
    ])('should know what is on the view after a render that clears %s of it', async (_name, clear, expected) =>
    {
        await setup();
        renderer.render(stage);
        renderer.render({ container: new Container(), clear });
        renderer.render({ container: stage, target, transform: move(-300, 0) });

        expect(button.worldTransform.tx).toBe(expected);
    });

    it('should know that a destroyed renderer is not showing a scene', async () =>
    {
        await setup();
        renderer.render(stage);
        expect(stage.renderGroup._isOnView).toBe(true);
        renderer.destroy();
        expect(stage.renderGroup._isOnView).toBe(false);

        renderer = await getWebGLRenderer();
    });

    it('should know that a render to the canvas clears the view', async () =>
    {
        await setup();
        renderer.render(stage);
        renderer.render({ container: new Container(), target: renderer.canvas });
        renderer.render({ container: stage, target, transform: move(-300, 0) });

        expect(button.worldTransform.tx).toBe(50);
    });

    it('should keep a scene where the view shows it when it is drawn to another canvas', async () =>
    {
        await setup({ multiView: true });

        const canvas = document.createElement('canvas');

        canvas.width = canvas.height = 100;
        renderer.render(stage);
        renderer.render({ container: stage, target: canvas, transform: move(-300, -100) });

        expect(hit()).toBe(true);

        // the view still shows it where it was, and events come from the view
        renderer.render({ container: stage, target: canvas, transform: move(-300, -100) });

        expect(hit()).toBe(true);
        expect(button.worldTransform.tx).toBe(350);
    });

    it.each([
        ['its stage with a transform', () => stage, move(-300, -100)],
        ['a staged container', () => panel, undefined],
    ])('should keep a scene where the view shows it when another renderer draws %s to a texture', async (
        _name, container, transform) =>
    {
        await setup();

        const other = await getWebGLRenderer();
        const otherTarget = RenderTexture.create({ width: 32, height: 32 });

        renderer.render(stage);
        other.render({ container: container(), target: otherTarget, transform });

        expect(hit()).toBe(true);
        expect(button.worldTransform.tx).toBe(350);

        otherTarget.destroy(true);
        other.destroy();
    });

    it('should move a container that was on the view by itself into the stage drawn over it', async () =>
    {
        await setup();
        renderer.render({ container: panel, transform: move(7, 9) });
        renderer.render({ container: stage, clear: false });
        expect(panel.worldTransform.tx).toBe(300);
        renderer.render({ container: stage, target });
        expect(panel.worldTransform.tx).toBe(300);

        world.removeChild(panel);
        renderer.render({ container: panel, target, transform: move(7, 9) });
        expect(panel.worldTransform.tx).toBe(7);

        panel.destroy({ children: true });
    });

    it.each([
        ['was on the view', () => { renderer.render({ container: world, clear: false }); }, () => panel],
        ['was in a scene', () => { renderer.render(stage); }, () => world],
    ])('should not use the place of a recycled render group that %s', async (_name, draw, recycle) =>
    {
        await setup();
        world.removeChild(panel);
        world.isRenderGroup = true;
        draw();

        const recycled = world.renderGroup;

        world.isRenderGroup = false;
        recycle().isRenderGroup = true;
        expect(recycle().renderGroup).toBe(recycled);

        if (recycle() === world)
        {
            world.removeFromParent();
            world.isRenderGroup = false;
            world.isRenderGroup = true;
            world.addChild(panel);
        }
        renderer.render({ container: panel, target, transform: move(7, 9) });
        expect(panel.worldTransform.tx).toBe(7);

        panel.destroy({ children: true });
        world.destroy({ children: true });
    });

    it('should know the cached container a render group is in after an outer one is rendered', async () =>
    {
        await setup();
        world.cacheAsTexture(true);
        panel.cacheAsTexture(true);
        button.isRenderGroup = true;
        renderer.render(stage);
        renderer.textureGenerator.generateTexture(world).destroy(true);
        renderer.render(stage);

        expect(button.renderGroup._parentCacheAsTextureRenderGroup === panel.renderGroup).toBe(true);
        expect(panel.renderGroup._parentCacheAsTextureRenderGroup === world.renderGroup).toBe(true);
    });

    it('should put a scene back when its transforms are updated out of a render', async () =>
    {
        await setup();
        renderer.render({ container: stage, target, transform: move(-300, 0) });
        expect(button.worldTransform.tx).toBe(50);
        updateRenderGroupTransforms(stage.renderGroup, true);
        expect(button.worldTransform.tx).toBe(350);
    });

    it('should use the position of the root of a render while it renders', async () =>
    {
        await setup();
        renderer.render(stage);

        let x: number;

        panel.onRender = () => { x = panel.getGlobalPosition().x; };
        renderer.render({ container: panel, target, transform: move(7, 0) });
        expect(x).toBe(200);

        panel.onRender = null;
        expect(panel.getGlobalPosition().x).toBe(300);
    });

    it('should draw a layered render group in a cached container the same after rendering the container', async () =>
    {
        await setup();

        const layer = new RenderLayer();
        const cached = new Container({ x: 10, y: 10 });
        const layered = new Container({ isRenderGroup: true });

        layered.addChild(new Sprite({ texture: Texture.WHITE, width: 8, height: 8, tint: 0xff0000 }));
        cached.addChild(new Sprite({ texture: Texture.WHITE, width: 8, height: 8, x: 12, y: 12 }), layered);
        cached.cacheAsTexture(true);
        stage.addChild(cached, layer);
        layer.attach(layered);

        const draw = () =>
        {
            renderer.render({ container: stage, target, clear: true });

            return Array.from(renderer.extract.pixels(target).pixels);
        };

        draw();

        const before = draw();

        renderer.textureGenerator.generateTexture(cached).destroy(true);

        expect(draw()).toEqual(before);
    });

    it('should let go of the containers in a root that stops being a render group', async () =>
    {
        await setup();
        button.isRenderGroup = true;
        renderer.render(stage);
        stage.isRenderGroup = false;

        expect(world.parentRenderGroup).toBe(null);
        expect(panel.parentRenderGroup).toBe(null);
        expect(button.parentRenderGroup).toBe(null);
        expect(button.renderGroup.renderGroupParent).toBe(null);
        expect(hit()).toBe(true);

        // this is given the render group the stage had
        world.isRenderGroup = true;
        expect(world.renderGroup.renderGroupParent).toBe(null);
        panel.cacheAsTexture(true);
        panel.updateCacheTexture();
        renderer.textureGenerator.generateTexture(panel).destroy(true);

        renderer.render(stage);
        expect(hit()).toBe(true);
    });

    it('should draw what was in a root that stopped being a render group', async () =>
    {
        await setup();
        stage.removeChildren();

        const a = new Container();
        const b = new Container();

        a.addChild(new Sprite({ texture: Texture.WHITE, width: 8, height: 8, tint: 0x0000ff }));
        b.addChild(new Sprite({ texture: Texture.WHITE, width: 8, height: 8, tint: 0xff0000 }));
        stage.addChild(a, b);
        renderer.render({ container: stage, target });
        stage.isRenderGroup = false;
        a.isRenderGroup = true;
        renderer.render({ container: b, target, clear: true });

        expect(Array.from(renderer.extract.pixels(target).pixels.subarray(0, 3))).toEqual([255, 0, 0]);
        renderer.render({ container: a, target, clear: true });
        expect(Array.from(renderer.extract.pixels(target).pixels.subarray(0, 3))).toEqual([0, 0, 255]);

        world.destroy({ children: true });
    });

    it('should leave a container that was taken off the view with the transform it was drawn with', async () =>
    {
        await setup();
        renderer.render(panel);
        renderer.render(stage);
        world.removeChild(panel);
        renderer.render(stage);
        renderer.render({ container: panel, target, transform: move(7, 9) });

        expect(panel.worldTransform.tx).toBe(7);

        panel.destroy({ children: true });
    });

    it('should update the inverse of a render group in a cached container that moves', async () =>
    {
        await setup();
        panel.isRenderGroup = true;
        world.cacheAsTexture(true);
        renderer.render(stage);
        renderer.render(stage);
        expect(panel.renderGroup.inverseWorldTransform.tx).toBe(-300);

        world.x += 100;
        renderer.render(stage);

        expect(panel.renderGroup.inverseWorldTransform.tx).toBe(-400);
    });

    it('should keep the stage hit-testable when it becomes a new render group', async () =>
    {
        await setup();

        const other = new Container({ x: 500, isRenderGroup: true });

        stage.x = 100;
        stage.addChild(other);
        renderer.render(stage);
        stage.disableRenderGroup();
        // the stage gets this one's render group
        other.disableRenderGroup();
        stage.enableRenderGroup();

        expect(hit(460, 160)).toBe(true);
    });

    it('should draw where it was told to when onRender changes the matrix passed in', async () =>
    {
        await setup();
        renderer.render(stage);
        stage.onRender = () => { Matrix.shared.translate(500, 500); };
        renderer.render({ container: stage, transform: Matrix.shared.translate(-300, -100) });
        stage.onRender = null;

        expect(hit(60, 60)).toBe(true);
    });

    it('should draw the stage where onRender moves it', async () =>
    {
        await setup();
        renderer.render(stage);
        stage.onRender = () =>
        {
            stage.x = -30;
            // updates the local transform
            button.getBounds();
        };
        renderer.render(stage);
        stage.onRender = null;

        expect(hit(330, 160)).toBe(true);
    });

    it('should go back to the outer render when a render nests in onRender', async () =>
    {
        await setup();

        const other = new Container();

        renderer.render(stage);
        panel.enableRenderGroup();
        renderer.render(stage);

        const { globalUniforms } = renderer;
        const start = globalUniforms.start.bind(globalUniforms);
        let seen: number;

        jest.spyOn(globalUniforms, 'start').mockImplementation((options) =>
        {
            seen = panel.worldTransform.tx;
            start(options);
        });

        panel.onRender = () =>
        {
            panel.onRender = null;
            renderer.render({ container: other, target, transform: move(1, 1) });
        };
        renderer.render({ container: panel, target, transform: move(-37, -39) });

        expect(seen).toBe(-37);
        expect(hit()).toBe(true);

        stage.x = 100;
        stage.onRender = () =>
        {
            stage.onRender = null;
            renderer.render({ container: other, target, transform: move(1, 1) });
        };
        renderer.render(stage);

        expect(hit(460, 160)).toBe(true);

        other.destroy();
    });

    it.each([
        ['itself', () => { panel.onRender = () => panel.removeFromParent(); }],
        ['an ancestor', () => { button.onRender = () => world.removeChildren(); }],
    ])('should allow a render group to be taken off the stage in onRender by %s', async (_name, prepare) =>
    {
        await setup();
        panel.isRenderGroup = true;
        renderer.render(stage);
        prepare();

        expect(() => renderer.render(stage)).not.toThrow();
        expect(() => renderer.render(stage)).not.toThrow();

        panel.destroy({ children: true });
    });

    it('should move a scene that was on the view and is now only drawn to a texture', async () =>
    {
        await setup();

        const picture = new Sprite(target);

        panel.isRenderGroup = true;
        renderer.render(stage);

        for (let i = 0; i < 2; i++)
        {
            stage.x += 50;
            panel.x += 50;
            renderer.render({ container: stage, target });
            renderer.render(picture);
        }

        expect(button.worldTransform.tx).toBe(550);
        expect(new EventBoundary(stage).hitTest(560, 160) === button).toBe(true);
        picture.destroy();
    });

    it('should move a scene that was on the view and is now drawn to a texture inside another', async () =>
    {
        await setup();

        const outer = new Container({ x: 1000 });

        renderer.render(stage);
        renderer.render(new Container());
        outer.addChild(stage);
        renderer.render({ container: outer, target });

        expect(button.worldTransform.tx).toBe(1350);

        outer.removeChild(stage);
        outer.destroy();
    });

    it('should move render groups and other containers together when the stage is rendered to a texture', async () =>
    {
        await setup();

        const plain = new Container({ x: 10 });

        stage.addChild(plain);
        panel.isRenderGroup = true;
        renderer.render(stage);
        plain.x += 5;
        panel.x += 5;
        renderer.textureGenerator.generateTexture(stage).destroy(true);

        expect(plain.worldTransform.tx).toBe(15);
        expect(panel.worldTransform.tx).toBe(305);
    });

    it.each([
        ['a moved stage', () => stage],
        ['a container in it', () => button],
    ])('should have up to date global values in onRender for %s', async (_name, container) =>
    {
        await setup();
        renderer.render(stage);

        let x: number;

        stage.onRender = () =>
        {
            stage.onRender = null;
            stage.x = 100;
            x = container().getGlobalTransform().tx;
        };
        renderer.render(stage);

        expect(x).toBe(container() === stage ? 100 : 450);
    });

    it('should use the alpha and tint of the render while it renders', async () =>
    {
        await setup();
        world.alpha = 0.5;
        world.tint = 0xff0000;
        panel.alpha = 0.5;
        renderer.render(stage);

        const { globalUniforms } = renderer;
        const start = globalUniforms.start.bind(globalUniforms);
        let alpha: number[];
        let tint: number[];

        jest.spyOn(globalUniforms, 'start').mockImplementation((options) =>
        {
            alpha = [panel.getGlobalAlpha(), button.getGlobalAlpha()];
            tint = [panel.getGlobalTint(), button.getGlobalTint()];
            start(options);
        });

        renderer.render({ container: panel, target });

        expect(alpha).toEqual([0.5, 0.5]);
        expect(tint).toEqual([0xffffff, 0xffffff]);
        expect(button.getGlobalAlpha()).toBe(0.25);
    });

    it('should render with options that cannot change', async () =>
    {
        await setup();

        const options = Object.freeze({ container: stage, target, transform: move(0, 0) });

        expect(() => renderer.render(options)).not.toThrow();
    });

    const cachedRoot = [
        ['a filter', (child: Container) => { child.filters = [new AlphaFilter({ alpha: 0.5 })]; }, 128],
        ['a render group', (child: Container) => { child.isRenderGroup = true; }, 255],
    ] as const;

    describe.each(cachedRoot)('a cached container with %s', (_name, prepare, alpha) =>
    {
        it.each([0, 40])('should be drawn with the transform it is given (x: %s)', async (x) =>
        {
            await setup();

            const cached = new Container({ x });
            const child = new Sprite({ texture: Texture.WHITE, width: 8, height: 8 });

            prepare(child);
            cached.addChild(child);
            cached.cacheAsTexture(true);
            stage.addChild(cached);
            renderer.render(stage);
            renderer.render({ container: cached, target, clear: true, transform: move(16, 16) });

            const { pixels, width } = renderer.extract.pixels(target);
            const at = (px: number, py: number) => pixels[(((py * width) + px) * 4) + 3];

            expect(at(20, 20)).toBeGreaterThanOrEqual(alpha - 1);
            expect(at(20, 20)).toBeLessThanOrEqual(alpha);
            expect(at(4, 4)).toBe(0);
        });
    });

    it('should keep a child drawn to the screen by itself where it was when it moves and its stage is rendered', async () =>
    {
        await setup();
        renderer.render(stage);
        renderer.render(panel);
        expect(hit(260, 160)).toBe(true);

        panel.x += 50;
        renderer.textureGenerator.generateTexture(stage).destroy(true);

        expect(hit(260, 160)).toBe(true);
    });

    it('should place a render group whose onRender renders the one it is in', async () =>
    {
        await setup();
        panel.isRenderGroup = true;
        button.isRenderGroup = true;
        renderer.render(stage);
        stage.x = 10;
        button.onRender = () =>
        {
            button.onRender = null;
            renderer.render({ container: panel, target, transform: move(-37, -39) });
        };
        renderer.render(stage);

        expect(button.worldTransform.tx).toBe(360);
        expect(hit(370, 160)).toBe(true);
    });

    it('should not use the scene transform of a recycled render group', async () =>
    {
        await setup();

        const other = new Container();

        renderer.render({ container: other, transform: move(500, 500) });
        other.disableRenderGroup();
        stage.enableRenderGroup();
        updateRenderGroupTransforms(stage.renderGroup, true);

        expect(stage.worldTransform.tx).toBe(0);
        other.destroy();
    });

    it('should keep a stage where it was first drawn when a render nests in onRender', async () =>
    {
        await setup();

        const other = new Container();

        stage.onRender = () =>
        {
            stage.onRender = null;
            renderer.render({ container: other, target });
        };
        renderer.render({ container: stage, transform: move(-300, -100) });
        renderer.textureGenerator.generateTexture(stage).destroy(true);

        expect(hit(60, 60)).toBe(true);
        other.destroy();
    });

    it('should use the transform of the render for renderables in a cached container being rendered', async () =>
    {
        await setup();
        renderer.render(stage);
        button.cacheAsTexture(true);
        renderer.render(stage);

        const { globalUniforms } = renderer;
        const start = globalUniforms.start.bind(globalUniforms);
        let minX: number;

        jest.spyOn(globalUniforms, 'start').mockImplementation((options) =>
        {
            minX = getGlobalRenderableBounds([button.children[0] as Sprite], new Bounds()).minX;
            start(options);
        });

        renderer.render({ container: button, target, transform: move(7, 9) });

        expect(minX).toBe(7);
    });

    it('should draw what is now in a cached container being rendered', async () =>
    {
        await setup();

        const inner = new Container({ isRenderGroup: true });
        const white = new Sprite({ texture: Texture.WHITE, width: 8, height: 8 });

        inner.addChild(white);
        stage.removeChildren();
        stage.addChild(panel);
        panel.position.set(0);
        panel.removeChildren();
        panel.addChild(inner);
        panel.cacheAsTexture(true);
        renderer.render(stage);
        white.destroy();
        inner.addChild(new Sprite({ texture: Texture.WHITE, width: 8, height: 8, tint: 0xff0000 }));
        renderer.render({ container: panel, target, clear: true });

        expect(Array.from(renderer.extract.pixels(target).pixels.subarray(0, 4))).toEqual([255, 0, 0, 255]);
    });

    it('should allow the world values of a render group to be set', async () =>
    {
        await setup();
        renderer.render(stage);

        const { renderGroup } = stage;

        renderGroup.worldTransform = move(3, 4);
        renderGroup.worldAlpha = 0.5;
        renderGroup.worldColor = 0xff0000;
        renderGroup.worldColorAlpha = 0x80ff0000;

        expect(renderGroup.worldTransform.tx).toBe(3);
        expect(renderGroup.worldAlpha).toBe(0.5);
        expect(renderGroup.worldColor).toBe(0xff0000);
        expect(renderGroup.worldColorAlpha).toBe(0x80ff0000);

        renderer.render(stage);

        expect(renderGroup.worldTransform.tx).toBe(0);
        expect(renderGroup.worldAlpha).toBe(1);
    });

    it('should not keep the cached parent of a recycled render group', async () =>
    {
        await setup();
        world.cacheAsTexture(true);
        panel.cacheAsTexture(true);
        renderer.render(stage);

        const { renderGroup } = panel;

        expect(renderGroup._parentCacheAsTextureRenderGroup === world.renderGroup).toBe(true);
        panel.disableRenderGroup();

        expect(renderGroup._parentCacheAsTextureRenderGroup === null).toBe(true);
    });

    it('should leave a scene that is only drawn to a texture with the transform it was drawn with', async () =>
    {
        await setup();
        renderer.render({ container: stage, target, transform: move(-300, -100) });

        expect(button.worldTransform.tx).toBe(50);
        expect(button.worldTransform.ty).toBe(50);
    });

    it('should draw the same pixels on the next render', async () =>
    {
        await setup();
        panel.position.set(-146, -46);

        const draw = () =>
        {
            renderer.render({ container: stage, target, clear: true });

            return Array.from(renderer.extract.pixels(target).pixels);
        };

        renderer.render(stage);
        panel.enableRenderGroup();

        const before = draw();

        expect(before.some((value) => value > 0)).toBe(true);
        renderer.textureGenerator.generateTexture(panel).destroy(true);

        expect(draw()).toEqual(before);
    });
});

function describeHitTesting(createRenderer: () => Promise<Renderer>): void
{
    it('should keep the stage and a staged container hit-testable', async () =>
    {
        const renderer = await createRenderer();
        const stage = new Container();
        const panel = new Container({ x: 200, y: 100 });
        const button = new Container({ x: 50, y: 50, eventMode: 'static', hitArea: new Rectangle(0, 0, 20, 20) });

        button.addChild(new Sprite({ texture: Texture.WHITE, width: 20, height: 20 }));
        panel.addChild(button);
        stage.addChild(panel);
        renderer.render(stage);

        for (const container of [panel, stage])
        {
            renderer.textureGenerator.generateTexture(container).destroy(true);

            expect(new EventBoundary(stage).hitTest(260, 160) === button).toBe(true);
        }

        stage.destroy({ children: true });
        renderer.destroy();
    });
}

describeLocalOnly('RenderGroupSystem world transforms after rendering to a texture on WebGPU', () =>
{
    describeHitTesting(() => getWebGPURenderer());
});

describe('RenderGroupSystem world transforms after rendering to a texture on Canvas', () =>
{
    describeHitTesting(async () =>
    {
        const renderer = new CanvasRenderer();

        await renderer.init({ width: 100, height: 100 });

        return renderer;
    });
});

describe('RenderGroupSystem cacheAsTexture on WebGL', () =>
{
    describeCachedContainerMove(() => getWebGLRenderer());
});

// the cached container's vertices are a ranged update past offset 0, which WebGL1 uploads differently
describe('RenderGroupSystem cacheAsTexture on WebGL1', () =>
{
    describeCachedContainerMove(() => getWebGLRenderer({ preferWebGLVersion: 1 }));
});

describeLocalOnly('RenderGroupSystem cacheAsTexture on WebGPU', () =>
{
    describeCachedContainerMove(() => getWebGPURenderer());
});
