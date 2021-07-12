const { Container } = require('@pixi/display');
const { Graphics } = require('@pixi/graphics');
const { Sprite } = require('@pixi/sprite');
const { CanvasRenderer } = require('../');

describe('PIXI.CanvasMaskManager', function ()
{
    it('should work on all graphics masks inside container', function ()
    {
        const renderer = new CanvasRenderer(1, 1);
        const shapeSpy = sinon.spy(renderer.maskManager, 'renderGraphicsShape');
        const contextPath = sinon.spy(renderer.context, 'closePath');
        const cont = new Container();

        cont.mask = new Sprite();
        expect(() => { renderer.render(cont); }).to.not.throw();
        expect(shapeSpy).to.not.called;

        const graphics1 = new Graphics();
        const graphics2 = new Graphics();

        graphics1.beginFill(0xffffff, 1.0);
        graphics1.drawRect(0, 0, 100, 100);
        graphics2.beginFill(0xffffff, 1.0);
        graphics2.drawRect(150, 150, 100, 100);

        cont.mask = new Container();
        cont.mask.addChild(graphics1, graphics2);
        cont.addChild(cont.mask);

        expect(() => { renderer.render(cont); }).to.not.throw();
        expect(shapeSpy).to.calledTwice;
        expect(contextPath).to.calledTwice;
        cont.mask.removeChildren();
        cont.mask = graphics1;
        expect(() => { renderer.render(cont); }).to.not.throw();
        expect(shapeSpy).to.calledThrice;
        expect(contextPath).to.calledThrice;
    });

    it('should set correct transform for graphics', function ()
    {
        const renderer = new CanvasRenderer(1, 1);
        const transformSpy = sinon.spy(renderer.context, 'setTransform');
        const cont = new Container();
        const graphics1 = new Graphics();
        const graphics2 = new Graphics();

        graphics1.beginFill(0xffffff, 1.0);
        graphics1.drawRect(0, 0, 100, 100);
        graphics2.beginFill(0xffffff, 1.0);
        graphics2.drawRect(0, 0, 100, 100);

        graphics1.scale.set(2.0);
        graphics2.scale.set(3.0);

        cont.mask = new Container();
        cont.mask.addChild(graphics1, graphics2);
        cont.addChild(cont.mask);

        expect(() => { renderer.render(cont); }).to.not.throw();
        expect(transformSpy).to.calledThrice;
        expect(transformSpy.args[1][0]).to.equal(2.0);
        expect(transformSpy.args[2][0]).to.equal(3.0);
    });
});
