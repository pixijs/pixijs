import { Culler } from '../Culler';
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
});
