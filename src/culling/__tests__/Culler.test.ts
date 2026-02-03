import { Application } from '../../app/Application';
import { Culler } from '../Culler';
import { CullerPlugin } from '../CullerPlugin';
import { basePath } from '@test-utils';
import { Assets, loadTextures } from '~/assets';
import { extensions } from '~/extensions';
import { AlphaFilter } from '~/filters';
import { Rectangle } from '~/maths';
import { Container, Graphics, Sprite } from '~/scene';

import type { Texture } from '~/rendering';

describe('Culler', () =>
{
    extensions.add(loadTextures);
    let container: Container;
    let texture: Texture;
    const view = { x: 0, y: 0, width: 100, height: 100 };

    beforeAll(async () =>
    {
        await Assets.init({
            basePath,
        });
        texture = await Assets.load('textures/bunny.png');
    });

    afterAll(() =>
    {
        Assets.reset();
    });

    beforeEach(async () =>
    {
        Culler.shared = new Culler();
        container = new Container();
    });

    it('should cull from the list', () =>
    {
        const child = new Sprite(texture);

        child.x = 100;
        child.y = 100;
        child.width = 10;
        child.height = 10;
        child.cullable = true;
        container.addChild(child);

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(false);
        expect(child.culled).toBe(true);

        child.x = 0;
        child.y = 0;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(false);
        expect(child.culled).toBe(false);
    });

    it('should set culled to false if object becomes non-cullable', () =>
    {
        const child = new Sprite(texture);

        child.x = 100;
        child.y = 100;
        child.width = 10;
        child.height = 10;
        child.cullable = true;
        container.addChild(child);

        Culler.shared.cull(container, view, false);

        expect(child.culled).toBe(true);

        child.x = 0;
        child.y = 0;
        child.cullable = false;

        Culler.shared.cull(container, view, false);

        expect(child.culled).toBe(false);
    });

    it('noncullable container should always be rendered even if bounds do not intersect the frame', () =>
    {
        const graphics = container.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        container.cullable = false;
        graphics.x = -1000;
        graphics.y = -1000;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(false);
        expect(graphics.culled).toBe(false);
    });

    it('cullable container should not be rendered if bounds do not intersect the frame', () =>
    {
        const container = new Container();
        const graphics = container.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        container.cullable = true;
        graphics.x = 0;
        graphics.y = -10;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(true);
        expect(graphics.culled).toBe(false);

        graphics.x = 10;
        graphics.y = 10;
        Culler.shared.cull(container, view, false);
        expect(container.culled).toBe(false);
        expect(graphics.culled).toBe(false);
    });

    it('cullable container should be rendered if bounds intersects the frame', () =>
    {
        const container = new Container();
        const graphics = container.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        container.cullable = true;
        graphics.x = 0;
        graphics.y = -9;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(false);
        expect(graphics.culled).toBe(false);

        graphics.x = -30;
        graphics.y = -30;
        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(true);
        expect(graphics.culled).toBe(false);
    });

    it('cullable container that contains a child with a padded filter'
            + 'such that the child in out of frame but the filter padding intersects the frame '
            + 'should render the filter padding but not the container or child', () =>
    {
        const container = new Container();
        const graphics = container.addChild(new Graphics().rect(0, 0, 10, 10).fill());
        const filter = new AlphaFilter();

        filter.padding = 30;

        container.cullable = true;
        graphics.filters = [filter];
        graphics.x = 0;
        graphics.y = -15;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(true);
        expect(graphics.culled).toBe(false);
    });

    it('cullable container with a filter should not render the container or children '
            + 'if the bounds as well as the filter padding do no intersect the frame', () =>
    {
        const container = new Container();
        const graphics = container.addChild(new Graphics().rect(0, 0, 10, 10).fill());
        const filter = new AlphaFilter();

        filter.padding = 5;

        container.cullable = true;
        container.filters = [filter];
        graphics.x = 0;
        graphics.y = -15;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(true);
        expect(graphics.culled).toBe(false);
    });

    it('cullable container with cullArea should be rendered if the bounds intersect the frame', () =>
    {
        const container = new Container();
        const graphics = container.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        container.cullable = true;
        container.cullArea = new Rectangle(-10, -10, 11, 11);
        container.x = container.y = 107.07;
        container.rotation = Math.PI / 4;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(false);
        expect(graphics.culled).toBe(false);
    });

    it('cullable container with cullArea should not be rendered if the bounds do not intersect the frame', () =>
    {
        const container = new Container();
        const graphics = container.addChild(new Graphics().rect(0, 0, 10, 10).fill());

        container.cullable = true;
        container.cullArea = new Rectangle(-10, -10, 10, 10);
        container.x = container.y = 107.08;
        container.rotation = Math.PI / 4;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(true);
        expect(graphics.culled).toBe(false);
    });

    it('should not recurse into children when cullableChildren is false', () =>
    {
        const child = new Sprite(texture);

        child.x = 200;
        child.y = 200;
        child.cullable = true;
        container.addChild(child);
        container.cullableChildren = false;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(false);
        expect(child.culled).toBe(false);
    });

    it('should set culled to false when measurable is false', () =>
    {
        const child = new Sprite(texture);

        child.x = 200;
        child.y = 200;
        child.cullable = true;
        child.measurable = false;
        container.addChild(child);

        Culler.shared.cull(container, view, false);

        expect(child.culled).toBe(false);
    });

    it('should set culled to false when includeInBuild is false', () =>
    {
        const child = new Sprite(texture);

        child.x = 200;
        child.y = 200;
        child.cullable = true;
        child.includeInBuild = false;
        container.addChild(child);

        Culler.shared.cull(container, view, false);

        expect(child.culled).toBe(false);
    });

    it('should not recurse into children when container is not renderable', () =>
    {
        const child = new Sprite(texture);

        child.x = 200;
        child.y = 200;
        child.cullable = true;
        container.addChild(child);
        container.renderable = false;

        Culler.shared.cull(container, view, false);

        expect(container.culled).toBe(false);
        expect(child.culled).toBe(false);
    });

    it('should not recurse into children when parent is culled', () =>
    {
        const parent = new Container();
        const child = new Sprite(texture);

        parent.cullable = true;
        child.cullable = true;
        child.x = 200;
        child.y = 200;
        parent.addChild(child);
        container.addChild(parent);

        child.culled = true;

        Culler.shared.cull(container, view, false);

        expect(parent.culled).toBe(true);
        expect(child.culled).toBe(true);

        child.x = 50;
        child.y = 50;

        Culler.shared.cull(container, view, false);

        expect(parent.culled).toBe(false);
        expect(child.culled).toBe(false);
    });

    it('should use global transform for cullArea when skipUpdateTransform is false', () =>
    {
        const parent = new Container();
        const child = new Container();

        child.addChild(new Graphics().rect(0, 0, 10, 10).fill());
        parent.addChild(child);
        container.addChild(parent);

        parent.x = 500;
        child.cullable = true;
        child.cullArea = new Rectangle(0, 0, 10, 10);

        Culler.shared.cull(container, view, false);

        expect(child.culled).toBe(true);

        parent.x = 50;

        Culler.shared.cull(container, view, false);

        expect(child.culled).toBe(false);
    });

    it('should use local transform for cullArea positioning', () =>
    {
        const child = new Container();

        child.addChild(new Graphics().rect(0, 0, 10, 10).fill());
        container.addChild(child);

        child.x = 200;
        child.cullable = true;
        child.cullArea = new Rectangle(0, 0, 10, 10);

        Culler.shared.cull(container, view, false);

        expect(child.culled).toBe(true);

        child.x = 50;

        Culler.shared.cull(container, view, false);

        expect(child.culled).toBe(false);
    });

    it('should cull nested children correctly', () =>
    {
        const grandparent = new Container();
        const parent = new Container();
        const child = new Sprite(texture);

        grandparent.addChild(parent);
        parent.addChild(child);
        container.addChild(grandparent);

        grandparent.cullable = true;
        parent.cullable = true;
        child.cullable = true;
        child.x = 200;
        child.y = 200;

        Culler.shared.cull(container, view, false);

        expect(grandparent.culled).toBe(true);
        // culled not passed to children as we do not recurse into children if the parent is culled
        expect(parent.culled).toBe(false);
        expect(child.culled).toBe(false);
    });

    it('should handle multiple children with mixed culling states', () =>
    {
        const visible = new Sprite(texture);

        visible.x = 50;
        visible.y = 50;
        visible.cullable = true;

        const hidden = new Sprite(texture);

        hidden.x = 200;
        hidden.y = 200;
        hidden.cullable = true;

        const nonCullable = new Sprite(texture);

        nonCullable.x = 300;
        nonCullable.y = 300;

        container.addChild(visible, hidden, nonCullable);

        Culler.shared.cull(container, view, false);

        expect(visible.culled).toBe(false);
        expect(hidden.culled).toBe(true);
        expect(nonCullable.culled).toBe(false);
    });
});

describe('CullerPlugin', () =>
{
    it('should use the correct default options', async () =>
    {
        const spyCull = jest.spyOn(Culler.shared, 'cull');

        extensions.add(CullerPlugin);
        const app = new Application();

        await app.init();

        app.render();

        expect(spyCull).toHaveBeenCalledWith(app.stage, app.renderer.screen, true);
        app.destroy();
        extensions.remove(CullerPlugin);
    });

    it('should use the correct options: true', async () =>
    {
        const spyInit = jest.spyOn(CullerPlugin, 'init');
        const spyCull = jest.spyOn(Culler.shared, 'cull');

        extensions.add(CullerPlugin);
        const app = new Application();

        await app.init({
            culler: {
                updateTransform: true,
            },
        });

        expect(spyInit).toHaveBeenCalledWith({
            culler: {
                updateTransform: true,
            },
        });

        app.render();

        expect(spyCull).toHaveBeenCalledWith(app.stage, app.renderer.screen, false);
        app.destroy();
        extensions.remove(CullerPlugin);
    });

    it('should use the correct options: false', async () =>
    {
        const spyInit = jest.spyOn(CullerPlugin, 'init');
        const spyCull = jest.spyOn(Culler.shared, 'cull');

        extensions.add(CullerPlugin);
        const app = new Application();

        await app.init({
            culler: {
                updateTransform: false,
            },
        });

        expect(spyInit).toHaveBeenCalledWith({
            culler: {
                updateTransform: false,
            },
        });

        app.render();

        expect(spyCull).toHaveBeenCalledWith(app.stage, app.renderer.screen, true);
        app.destroy();
        extensions.remove(CullerPlugin);
    });
});
