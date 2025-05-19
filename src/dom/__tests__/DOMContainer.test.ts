import { DOMContainer } from '../DOMContainer';
import { getApp } from '@test-utils';
import { Point } from '~/maths/point/Point';

describe('DOMContainer', () =>
{
    let domContainer: DOMContainer;

    beforeEach(() =>
    {
        domContainer = new DOMContainer();
    });

    afterEach(() =>
    {
        domContainer.destroy();
    });

    describe('constructor', () =>
    {
        it('should create container with default values', () =>
        {
            expect(domContainer.element).toBeInstanceOf(HTMLDivElement);
            expect(domContainer.anchor.x).toBe(0);
            expect(domContainer.anchor.y).toBe(0);
            expect(domContainer.renderPipeId).toBe('dom');
            expect(domContainer.batched).toBe(false);
        });

        it('should create container with custom element', () =>
        {
            const element = document.createElement('span');
            const container = new DOMContainer({ element });

            expect(container.element).toBe(element);
        });

        it('should create container with custom anchor', () =>
        {
            const container = new DOMContainer({ anchor: 0.5 });

            expect(container.anchor.x).toBe(0.5);
            expect(container.anchor.y).toBe(0.5);
        });
    });

    describe('anchor', () =>
    {
        it('should set anchor with number', () =>
        {
            domContainer.anchor = 0.5;
            expect(domContainer.anchor.x).toBe(0.5);
            expect(domContainer.anchor.y).toBe(0.5);
        });

        it('should set anchor with Point', () =>
        {
            domContainer.anchor = new Point(0.3, 0.7);
            expect(domContainer.anchor.x).toBe(0.3);
            expect(domContainer.anchor.y).toBe(0.7);
        });

        it('should set anchor with PointData', () =>
        {
            domContainer.anchor = { x: 0.2, y: 0.8 };
            expect(domContainer.anchor.x).toBe(0.2);
            expect(domContainer.anchor.y).toBe(0.8);
        });
    });

    describe('element', () =>
    {
        it('should set and get element', () =>
        {
            const newElement = document.createElement('span');

            domContainer.element = newElement;
            expect(domContainer.element).toBe(newElement);
        });

        it('should not update if setting same element', () =>
        {
            const element = domContainer.element;
            const spy = jest.spyOn(domContainer as any, 'onViewUpdate');

            domContainer.element = element;
            expect(spy).not.toHaveBeenCalled();
        });

        it('should trigger onViewUpdate when element changes', () =>
        {
            const spy = jest.spyOn(domContainer as any, 'onViewUpdate');

            domContainer.element = document.createElement('span');
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateBounds', () =>
    {
        it('should set zero bounds when element is null', () =>
        {
            domContainer['_element'] = null;
            domContainer['updateBounds']();
            const bounds = domContainer['_bounds'];

            expect(bounds.minX).toBe(0);
            expect(bounds.minY).toBe(0);
            expect(bounds.maxX).toBe(0);
            expect(bounds.maxY).toBe(0);
        });

        it('should set bounds based on element dimensions', () =>
        {
            const element = document.createElement('div');

            Object.defineProperties(element, {
                offsetWidth: { value: 100 },
                offsetHeight: { value: 200 }
            });
            domContainer.element = element;
            domContainer['updateBounds']();
            const bounds = domContainer['_bounds'];

            expect(bounds.maxX).toBe(100);
            expect(bounds.maxY).toBe(200);
        });
    });

    describe('destroy', () =>
    {
        it('should remove element from parent', () =>
        {
            const parent = document.createElement('div');
            const element = document.createElement('div');

            parent.appendChild(element);
            domContainer.element = element;

            domContainer.destroy();
            expect(element.parentNode).toBeNull();
        });

        it('should nullify properties', () =>
        {
            domContainer.destroy();
            expect(domContainer.element).toBeNull();
            expect((domContainer as any)._anchor).toBeNull();
        });
    });

    describe('render', () =>
    {
        it('should render the element with the correct transform', async () =>
        {
            const app = await getApp();
            const element = document.createElement('div');

            Object.defineProperties(element, {
                offsetWidth: { value: 100 },
                offsetHeight: { value: 100 }
            });

            domContainer.element = element;
            domContainer.position.set(100, 100);
            domContainer.anchor.set(0.5, 0.5);
            domContainer.alpha = 0.5;

            app.stage.addChild(domContainer);
            app.renderer.render(app.stage);

            expect(element.style.opacity).toBe('0.5');
            expect(element.style.transform).toBe('matrix(1, 0, 0, 1, 50, 50)');
            expect(element.style.transformOrigin).toBe('50px 50px');
        });

        it('should render the element with the correct transform when canvas is scaled', async () =>
        {
            const app = await getApp({
                width: 100,
                height: 100,
            });
            const element = document.createElement('div');

            Object.defineProperties(element, {
                offsetWidth: { value: 100 },
                offsetHeight: { value: 100 }
            });

            const canvas = app.renderer.canvas as HTMLCanvasElement;

            canvas.style.width = '200px';
            canvas.style.height = '200px';

            app.stage.addChild(domContainer);
            app.renderer.render(app.stage);

            expect(app.renderer.renderPipes.dom['_domElement'].style.transform).toBe('translate(0px, 0px) scale(2, 2)');
        });
    });
});
