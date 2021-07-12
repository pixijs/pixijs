const { Container } = require('@pixi/display');

require('../');

describe('PIXI.Container', function ()
{
    describe('render', function ()
    {
        it('should not render when object not visible', function ()
        {
            const container = new Container();
            const canvasSpy = sinon.spy(container._renderCanvas);

            container.visible = false;

            container.renderCanvas();
            expect(canvasSpy).to.not.have.been.called;
        });

        it('should not render when alpha is zero', function ()
        {
            const container = new Container();
            const canvasSpy = sinon.spy(container._renderCanvas);

            container.worldAlpha = 0;

            container.renderCanvas();
            expect(canvasSpy).to.not.have.been.called;
        });

        it('should not render when object not renderable', function ()
        {
            const container = new Container();
            const canvasSpy = sinon.spy(container._renderCanvas);

            container.renderable = false;

            container.renderCanvas();
            expect(canvasSpy).to.not.have.been.called;
        });

        it('should render children', function ()
        {
            const container = new Container();
            const child = new Container();
            const canvasSpy = sinon.spy(child, '_renderCanvas');

            container.addChild(child);

            container.renderCanvas();
            expect(canvasSpy).to.have.been.called;
        });
    });
});
