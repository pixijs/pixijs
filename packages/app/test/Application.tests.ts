import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
import { skipHello } from '@pixi/utils';
import { expect } from 'chai';
import sinon from 'sinon';

skipHello();

describe('Application', () =>
{
    it('should generate application', () =>
    {
        expect(Application).to.be.a('function');
        const app = new Application();

        expect(app.stage).to.be.instanceof(Container);
        expect(app.renderer).to.be.ok;

        app.destroy();

        expect(app.stage).to.be.null;
        expect(app.renderer).to.be.null;
    });

    it('register a new plugin, then destroy it', () =>
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

        Application['_plugins'].pop();
    });

    it('should remove canvas when destroyed', () =>
    {
        const app = new Application();
        const view = app.view;

        expect(view).to.be.instanceof(HTMLCanvasElement);
        document.body.appendChild(view);

        expect(document.body.contains(view)).to.be.true;
        app.destroy(true);
        expect(document.body.contains(view)).to.be.false;
    });

    it('should not destroy children by default', () =>
    {
        const app = new Application();
        const stage = app.stage;
        const child = new Container();

        stage.addChild(child);

        app.destroy(true);
        expect(child.transform).to.not.be.null;
    });

    it('should allow children destroy', () =>
    {
        const app = new Application();
        const stage = app.stage;
        const child = new Container();

        stage.addChild(child);

        app.destroy(true, true);
        expect(child.transform).to.be.null;
    });

    describe('resizeTo', () =>
    {
        let div: HTMLDivElement;

        before(() =>
        {
            div = document.createElement('div');

            div.style.width = '100px';
            div.style.height = '200px';
            document.body.appendChild(div);
        });

        after(() =>
        {
            div.parentNode.removeChild(div);
            div = null;
        });

        it('should assign resizeTo', () =>
        {
            const app = new Application({
                resizeTo: div,
            });

            expect(app.resizeTo).to.equal(div);
            expect(app.view.width).to.equal(100);
            expect(app.view.height).to.equal(200);
            app.destroy();
        });

        it('should force multiple immediate resizes', () =>
        {
            const spy = sinon.spy();
            const app = new Application({
                resizeTo: div,
            });

            app.renderer.on('resize', spy);

            app.resize();
            app.resize();

            expect(spy.calledTwice).to.be.true;

            app.destroy();
        });

        it('should throttle multiple resizes', (done) =>
        {
            const spy = sinon.spy();
            const app = new Application({
                resizeTo: div,
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

        it('should cancel resize on destroy', (done) =>
        {
            const spy = sinon.spy();
            const app = new Application({
                resizeTo: div,
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

        it('should resize cancel resize queue', (done) =>
        {
            const spy = sinon.spy();
            const app = new Application({
                resizeTo: div,
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

        it('should resizeTo with resolution', () =>
        {
            const app = new Application({
                resolution: 2,
                resizeTo: div,
            });

            expect(app.view.width).to.equal(200);
            expect(app.view.height).to.equal(400);
            app.destroy();
        });

        it('should resizeTo with resolution and autoDensity', () =>
        {
            const app = new Application({
                resolution: 2,
                resizeTo: div,
                autoDensity: true,
            });

            expect(app.view.width).to.equal(200);
            expect(app.view.height).to.equal(400);
            expect(app.view.style.width).to.equal(div.style.width);
            expect(app.view.style.height).to.equal(div.style.height);
            app.destroy();
        });
    });
});
