import { Container } from '@pixi/display';
import sinon from 'sinon';
import { expect } from 'chai';

import '@pixi/canvas-display';

describe('Container', () =>
{
    describe('render', () =>
    {
        it('should not render when object not visible', () =>
        {
            const container = new Container();
            const canvasSpy = sinon.spy(container._renderCanvas);

            container.visible = false;

            container.renderCanvas(undefined);
            expect(canvasSpy).to.not.have.been.called;
        });

        it('should not render when alpha is zero', () =>
        {
            const container = new Container();
            const canvasSpy = sinon.spy(container._renderCanvas);

            container.worldAlpha = 0;

            container.renderCanvas(undefined);
            expect(canvasSpy).to.not.have.been.called;
        });

        it('should not render when object not renderable', () =>
        {
            const container = new Container();
            const canvasSpy = sinon.spy(container._renderCanvas);

            container.renderable = false;

            container.renderCanvas(undefined);
            expect(canvasSpy).to.not.have.been.called;
        });

        it('should render children', () =>
        {
            const container = new Container();
            const child = new Container();
            const canvasSpy = sinon.spy(child, '_renderCanvas');

            container.addChild(child);

            container.renderCanvas(undefined);
            expect(canvasSpy).to.have.been.called;
        });
    });
});
