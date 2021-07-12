const { Application } = require('../');
const { autoDetectRenderer } = require('@pixi/canvas-renderer');
const { Container, DisplayObject } = require('@pixi/display');
const { skipHello } = require('@pixi/utils');

skipHello();

// Use fallback if no webgl
Application.prototype.createRenderer = autoDetectRenderer;

describe('PIXI.Application', function ()
{
    it('should generate application', function ()
    {
        expect(Application).to.be.a.function;
        const app = new Application();

        expect(app.stage).to.be.instanceof(Container);
        expect(app.renderer).to.be.ok;

        app.destroy();

        expect(app.stage).to.be.null;
        expect(app.renderer).to.be.null;
    });

    it('register a new plugin, then destroy it', function ()
    {
        const plugin = {
            init: sinon.spy(),
            destroy: sinon.spy(),
        };

        Application.registerPlugin(plugin);

        const app = new Application();

        app.destroy();

        expect(plugin.init).to.be.calledOnce;
        expect(plugin.destroy).to.be.calledOnce;

        Application._plugins.pop();
    });

    it('should remove canvas when destroyed', function ()
    {
        const app = new Application();
        const view = app.view;

        expect(view).to.be.instanceof(HTMLCanvasElement);
        document.body.appendChild(view);

        expect(document.body.contains(view)).to.be.true;
        app.destroy(true);
        expect(document.body.contains(view)).to.be.false;
    });

    it('should not destroy children by default', function ()
    {
        const app = new Application();
        const stage = app.stage;
        const child = new DisplayObject();

        stage.addChild(child);

        app.destroy(true);
        expect(child.transform).to.not.be.null;
    });

    it('should allow children destroy', function ()
    {
        const app = new Application();
        const stage = app.stage;
        const child = new DisplayObject();

        stage.addChild(child);

        app.destroy(true, true);
        expect(child.transform).to.be.null;
    });

    describe('resizeTo', function ()
    {
        before(function ()
        {
            const div = document.createElement('div');

            div.style.width = '100px';
            div.style.height = '200px';
            document.body.appendChild(div);
            this.div = div;
        });

        after(function ()
        {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        });

        it('should assign resizeTo', function ()
        {
            const app = new Application({
                resizeTo: this.div,
            });

            expect(app.resizeTo).to.equal(this.div);
            expect(app.view.width).to.equal(100);
            expect(app.view.height).to.equal(200);
            app.destroy();
        });

        it('should force multiple immediate resizes', function ()
        {
            const spy = sinon.spy();
            const app = new Application({
                resizeTo: this.div,
            });

            app.renderer.on('resize', spy);

            app.resize();
            app.resize();

            expect(spy.calledTwice).to.be.true;

            app.destroy();
        });

        it('should throttle multiple resizes', function (done)
        {
            const spy = sinon.spy();
            const app = new Application({
                resizeTo: this.div,
            });

            app.renderer.on('resize', spy);
            app.queueResize();
            app.queueResize();

            setTimeout(() =>
            {
                expect(spy.calledOnce).to.be.true;
                app.destroy();
                done();
            }, 50);
        });

        it('should cancel resize on destroy', function (done)
        {
            const spy = sinon.spy();
            const app = new Application({
                resizeTo: this.div,
            });

            app.renderer.on('resize', spy);
            app.queueResize();
            app.destroy();

            requestAnimationFrame(() =>
            {
                expect(spy.called).to.be.false;
                done();
            });
        });

        it('should resize cancel resize queue', function (done)
        {
            const spy = sinon.spy();
            const app = new Application({
                resizeTo: this.div,
            });

            app.renderer.on('resize', spy);
            app.queueResize();
            app.resize();
            app.destroy();

            requestAnimationFrame(() =>
            {
                expect(spy.calledOnce).to.be.true;
                done();
            });
        });

        it('should resizeTo with resolution', function ()
        {
            const app = new Application({
                resolution: 2,
                resizeTo: this.div,
            });

            expect(app.view.width).to.equal(200);
            expect(app.view.height).to.equal(400);
            app.destroy();
        });

        it('should resizeTo with resolution and autoDensity', function ()
        {
            const app = new Application({
                resolution: 2,
                resizeTo: this.div,
                autoDensity: true,
            });

            expect(app.view.width).to.equal(200);
            expect(app.view.height).to.equal(400);
            expect(app.view.style.width).to.equal(this.div.style.width);
            expect(app.view.style.height).to.equal(this.div.style.height);
            app.destroy();
        });
    });
});
