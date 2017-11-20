const { Container } = require('@pixi/display');
const { Graphics } = require('@pixi/graphics');

require('@pixi/canvas-display');

describe('PIXI.Container', function ()
{
    describe('addChild', function ()
    {
        it('should recalculate added child correctly', function ()
        {
            const parent = new Container();
            const container = new Container();
            const graphics = new Graphics();

            parent.addChild(container);

            graphics.drawRect(0, 0, 10, 10);
            container.position.set(100, 200);
            container.updateTransform();

            graphics.getBounds();
            // Oops, that can happen sometimes!
            graphics.transform._parentID = container.transform._worldID + 1;

            container.addChild(graphics);

            const bounds = graphics.getBounds();

            expect(bounds.x).to.be.equal(100);
            expect(bounds.y).to.be.equal(200);
            expect(bounds.width).to.be.equal(10);
            expect(bounds.height).to.be.equal(10);
        });
    });

    describe('removeChild', function ()
    {
        it('should recalculate removed child correctly', function ()
        {
            const parent = new Container();
            const container = new Container();
            const graphics = new Graphics();

            parent.addChild(container);

            graphics.drawRect(0, 0, 10, 10);
            container.position.set(100, 200);
            container.addChild(graphics);
            graphics.getBounds();

            container.removeChild(graphics);

            const bounds = graphics.getBounds();

            expect(bounds.x).to.be.equal(0);
            expect(bounds.y).to.be.equal(0);
        });
    });

    describe('width', function ()
    {
        it('should reflect scale', function ()
        {
            const container = new Container();
            const graphics = new Graphics();

            graphics.drawRect(0, 0, 10, 10);
            container.addChild(graphics);
            container.scale.x = 2;

            expect(container.width).to.be.equals(20);
        });

        it('should adjust scale', function ()
        {
            const container = new Container();
            const graphics = new Graphics();

            graphics.drawRect(0, 0, 10, 10);
            container.addChild(graphics);

            container.width = 20;

            expect(container.width).to.be.equals(20);
            expect(container.scale.x).to.be.equals(2);
        });
    });

    describe('height', function ()
    {
        it('should reflect scale', function ()
        {
            const container = new Container();
            const graphics = new Graphics();

            graphics.drawRect(0, 0, 10, 10);
            container.addChild(graphics);
            container.scale.y = 2;

            expect(container.height).to.be.equals(20);
        });

        it('should adjust scale', function ()
        {
            const container = new Container();
            const graphics = new Graphics();

            graphics.drawRect(0, 0, 10, 10);
            container.addChild(graphics);

            container.height = 20;

            expect(container.height).to.be.equals(20);
            expect(container.scale.y).to.be.equals(2);
        });
    });
});
