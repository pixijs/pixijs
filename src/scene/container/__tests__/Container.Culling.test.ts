/* eslint-disable jest/no-commented-out-tests */
// import { getRenderer } from '../utils/getRenderer';

// import type { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

// note: culling is not ported in v8 yet, keeping these tests for reference
describe('Container Culling', () =>
{
    it('should be tested when culling is added', () =>
    {
        // just a placeholder test for now
        expect(true).toBeTrue();
    });

    // let renderer: WebGLRenderer;
    // let filterPush: jest.SpyInstance;

    // beforeAll(async () =>
    // {
    //     renderer = await getRenderer({ width: 100, height: 100 }) as WebGLRenderer;
    //     filterPush = jest.spyOn(renderer.filter, 'push');
    // });

    // afterAll(() =>
    // {
    //     renderer.destroy();
    //     renderer = null;
    //     filterPush = null;
    // });

    // afterEach(() =>
    // {
    //     filterPush.mockClear();
    // });

    // it.skip('non-cullable container should always be rendered even if bounds do not intersect the frame', () =>
    // {
    //     const container = new Container();
    //     const graphics = container.addChild(
    //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
    //             .closePath()
    //     );

    //     container.cullable = false;
    //     graphics.x = -1000;
    //     graphics.y = -1000;

    //     const _renderContainer = jest.spyOn(container, '_render' as any);
    //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

    //     renderer.render(container);

    //     expect(_renderContainer).toBeCalled();
    //     expect(_renderGraphics).toBeCalled();
    // });

    // it.skip('cullable container should not be rendered if bounds do not intersect the frame', () =>
    // {
    //     const container = new Container();
    //     const graphics = container.addChild(
    //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
    //             .closePath()
    //     );

    //     container.cullable = true;
    //     graphics.x = 0;
    //     graphics.y = -10;

    //     const _renderContainer = jest.spyOn(container, '_render' as any);
    //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

    //     renderer.render(container);

    //     expect(_renderContainer).not.toBeCalled();
    //     expect(_renderGraphics).not.toBeCalled();
    // });

    // it.skip('cullable container should be rendered if bounds intersects the frame', () =>
    // {
    //     const container = new Container();
    //     const graphics = container.addChild(
    //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
    //             .closePath()
    //     );

    //     container.cullable = true;
    //     graphics.x = 0;
    //     graphics.y = -9;

    //     const _renderContainer = jest.spyOn(container, '_render' as any);
    //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

    //     renderer.render(container);

    //     expect(_renderContainer).toBeCalled();
    //     expect(_renderGraphics).toBeCalled();
    // });

    // it.skip('cullable container that contains a child with a padded filter (autoFit=true) '
    //     + 'such that the child in out of frame but the filter padding intersects the frame '
    //     + 'should render the filter padding but not the container or child', () =>
    // {
    //     const container = new Container();
    //     const graphics = container.addChild(
    //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
    //             .closePath()
    //     );
    //     const filter = new AlphaFilter();

    //     filter.padding = 30;
    //     filter.autoFit = true;

    //     container.cullable = true;
    //     graphics.filters = [filter];
    //     graphics.x = 0;
    //     graphics.y = -15;

    //     const _renderContainer = jest.spyOn(container, '_render' as any);
    //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

    //     renderer.render(container);

    //     expect(_renderContainer).not.toBeCalled();
    //     expect(_renderGraphics).not.toBeCalled();
    //     expect(filterPush).toBeCalled();
    // });

    // it.skip('cullable container that contains a child with a padded filter (autoFit=false) '
    //     + 'such that the child in out of frame but the filter padding intersects the frame '
    //     + 'should render the filtered child but not the container', () =>
    // {
    //     const container = new Container();
    //     const graphics = container.addChild(
    //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
    //             .closePath()
    //     );
    //     const filter = new AlphaFilter();

    //     filter.padding = 30;
    //     filter.autoFit = false;

    //     container.cullable = true;
    //     graphics.filters = [filter];
    //     graphics.x = 0;
    //     graphics.y = -15;

    //     const _renderContainer = jest.spyOn(container, '_render' as any);
    //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

    //     renderer.render(container);

    //     expect(_renderContainer).not.toBeCalled();
    //     expect(_renderGraphics).toBeCalled();
    //     expect(filterPush).toBeCalled();
    // });

    // it.skip('cullable container with a filter (autoFit=true) should not render the container or children '
    //     + 'if the bounds as well as the filter padding do no intersect the frame', () =>
    // {
    //     const container = new Container();
    //     const graphics = container.addChild(
    //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
    //             .closePath());
    //     const filter = new AlphaFilter();

    //     filter.padding = 5;
    //     filter.autoFit = true;

    //     container.cullable = true;
    //     container.filters = [filter];
    //     graphics.x = 0;
    //     graphics.y = -15;

    //     const _renderContainer = jest.spyOn(container, '_render' as any);
    //     const renderGraphics = jest.spyOn(graphics, 'render');

    //     renderer.render(container);

    //     expect(_renderContainer).not.toBeCalled();
    //     expect(renderGraphics).not.toBeCalled();
    //     expect(filterPush).toBeCalled();
    // });

    // it.skip('cullable container with cullArea should be rendered if the bounds intersect the frame', () =>
    // {
    //     const container = new Container();
    //     const graphics = container.addChild(
    //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
    //             .closePath()
    //     );

    //     container.cullable = true;
    //     container.cullArea = new Rectangle(-10, -10, 10, 10);
    //     container.x = container.y = 107.07;
    //     container.rotation = Math.PI / 4;

    //     const _renderGraphics = jest.spyOn(graphics, '_render' as any);

    //     renderer.render(container);

    //     expect(_renderGraphics).toBeCalled();
    // });

    // it.skip('cullable container with cullArea should not be rendered if the bounds do not intersect the frame', () =>
    // {
    //     const container = new Container();
    //     const graphics = container.addChild(
    //         new Graphics().beginPath().rect(0, 0, 10, 10).fill()
    //             .closePath()
    //     );

    //     container.cullable = true;
    //     container.cullArea = new Rectangle(-10, -10, 10, 10);
    //     container.x = container.y = 107.08;
    //     container.rotation = Math.PI / 4;

    //     const renderGraphics = jest.spyOn(graphics, 'render');

    //     renderer.render(container);

    //     expect(renderGraphics).not.toBeCalled();
    // });
});
