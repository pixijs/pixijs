'use strict';

describe('PIXI.interaction.InteractionManager', function ()
{
    describe('onClick', function ()
    {
        function click(stage, x, y)
        {
            const renderer = new PIXI.CanvasRenderer(100, 100);

            renderer.sayHello = () => { /* empty */ };
            renderer.render(stage);

            renderer.plugins.interaction.mapPositionToPoint = (point) =>
            {
                point.x = x;
                point.y = y;
            };

            const downEvent = {
                pointerId: 1,
                type: 'pointerdown',
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse',
                clientX: x,
                clientY: y,
                preventDefault: sinon.stub(),
                isPrimary: true,
            };

            const upEvent = {
                pointerId: 1,
                type: 'pointerup',
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse',
                clientX: x,
                clientY: y,
                preventDefault: sinon.stub(),
                isPrimary: true,
            };

            renderer.plugins.interaction.onPointerDown(downEvent);
            renderer.plugins.interaction.onPointerUp(upEvent);
        }

        it('should call handler when inside', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
            const clickSpy = sinon.spy();

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('click', clickSpy);

            click(stage, 10, 10);

            expect(clickSpy).to.have.been.calledOnce;
        });

        it('should not call handler when outside', function ()
        {
            const stage = new PIXI.Container();
            const graphics = new PIXI.Graphics();
            const clickSpy = sinon.spy();

            stage.addChild(graphics);
            graphics.beginFill(0xFFFFFF);
            graphics.drawRect(0, 0, 50, 50);
            graphics.interactive = true;
            graphics.on('click', clickSpy);

            click(stage, 60, 60);

            expect(clickSpy).to.not.have.been.called;
        });
    });
});
