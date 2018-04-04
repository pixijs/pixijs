const { Container, DisplayObject, Stage } = require('../');

describe('PIXI.Stage', function ()
{
    describe('flush', function ()
    {
        it('should flush all detached subtrees, fastDetach=true', function ()
        {
            const stage = new Stage();
            const container = new Container();
            const child = new DisplayObject();

            expect(stage.innerStage.isAttached(child)).to.be.false;
            expect(stage.innerStage.isAttached(container)).to.be.false;

            container.addChild(child);

            let counter = 0;
            const trigger = () => { counter++; };

            container.on('added', trigger);
            child.on('added', trigger);
            container.on('removed', trigger);
            child.on('removed', trigger);

            stage.addChild(container);
            expect(counter).to.be.equals(2);
            expect(container.parentStage).to.be.equals(stage);
            expect(child.parentStage).to.be.equals(stage);
            expect(stage.innerStage.isAttached(container)).to.be.true;
            expect(stage.innerStage.isAttached(child)).to.be.true;

            stage.innerStage.fastDetach = true;
            stage.detachChild(container);

            expect(container.parentStage).to.be.equals(stage);
            expect(child.parentStage).to.be.equals(stage);
            expect(stage.innerStage.isDetached(container)).to.be.true;
            expect(stage.innerStage.isAttached(child)).to.be.true;
            expect(counter).to.be.equals(2);

            stage.addChild(container);

            expect(container.parentStage).to.be.equals(stage);
            expect(child.parentStage).to.be.equals(stage);
            expect(stage.innerStage.isAttached(container)).to.be.true;
            expect(stage.innerStage.isAttached(child)).to.be.true;
            expect(counter).to.be.equals(2);

            stage.detachChild(container);
            stage.innerStage.flushDetached();
            expect(container.parentStage).to.be.null;
            expect(child.parentStage).to.be.null;
            expect(stage.innerStage.countDetached()).to.be.zero;
            expect(counter).to.be.equals(4);
        });

        it('should flush all detached subtrees, fastDetach=false', function ()
        {
            const stage = new Stage();
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);
            stage.addChild(container);

            let counter = 0;
            const trigger = () => { counter++; };

            child.on('removed', trigger);
            container.on('removed', trigger);

            stage.innerStage.fastDetach = false;
            stage.detachChild(container);
            expect(counter).to.be.equals(0);

            expect(stage.innerStage.isDetached(container)).to.be.true;
            expect(stage.innerStage.isDetached(child)).to.be.true;

            stage.innerStage.flushDetached();
            expect(counter).to.be.equals(2);
            expect(container.parentStage).to.be.null;
            expect(child.parentStage).to.be.null;
            expect(stage.innerStage.countDetached()).to.be.zero;
        });
    });

    describe('events', function ()
    {
        it('should trigger "added" and "removed" events on inner children', function ()
        {
            const stage = new Stage();
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            let triggeredAdded = false;
            let triggeredRemoved = false;

            child.on('added', (to) =>
            {
                triggeredAdded = true;
                expect(stage.children.length).to.be.equals(1);
                expect(container.parent).to.be.equals(stage);
                expect(child.parentStage).to.be.equals(to);
            });
            child.on('removed', (from) =>
            {
                triggeredRemoved = true;
                expect(stage.children.length).to.be.equals(0);
                expect(container.parent).to.be.null;
                expect(child.parentStage).to.be.null;
                expect(stage).to.be.equals(from);
            });

            stage.addChild(container);
            expect(triggeredAdded).to.be.true;
            expect(triggeredRemoved).to.be.false;

            stage.removeChild(container);
            expect(triggeredRemoved).to.be.true;
        });
    });

    describe('multistage', function ()
    {
        it('should work correctly with nested stages', function ()
        {
            const stage1 = new Stage();
            const container1 = new Container();
            const stage2 = new Stage();
            const container2 = new Container();

            stage1.addChild(container1);
            stage2.addChild(container2);

            container1.addChild(stage2);
            expect(stage2.parentStage).to.be.equals(stage1);
            expect(stage1.innerStage.isAttached(stage2)).to.be.true;
            expect(stage1.innerStage.isAttached(container2)).to.be.false;
            expect(stage2.innerStage.isAttached(container2)).to.be.true;

            container1.removeChild(stage2);
            expect(stage2.parentStage).to.be.null;
            expect(stage2.innerStage.isAttached(container2)).to.be.true;
        });

        it('should fire events when object changes the parent stage', function ()
        {
            const stage1 = new Stage();
            const container1 = new Container();
            const stage2 = new Stage();
            const container2 = new Container();

            let counter = 0;
            const trigger = () => { counter++; };

            container1.on('added', trigger);
            container1.on('removed', () =>
            {
                expect(container1.parentStage).to.be.null;
                counter++;
            });

            stage1.addChild(container1);
            stage2.addChild(container2);
            expect(counter).to.be.equals(1);

            container2.addChild(container1);
            expect(counter).to.be.equals(3);
            expect(container1.parentStage).to.be.equals(stage2);

            stage1.addChild(container2);
            expect(counter).to.be.equals(5);
            expect(container1.parentStage).to.be.equals(stage1);
        });
    });

    describe('animation', function ()
    {
        it('should fail if removeChild is used instead of detach inside animation', function ()
        {
            const stage1 = new Stage();
            const animated1 = new Container();
            const animated2 = new Container();
            const animated3 = new Container();
            const animated4 = new DisplayObject();

            let counter = 0;

            animated1.onAnimate = () => { counter++; };
            animated2.onAnimate = () =>
            {
                counter += 2;
                stage1.removeChild(animated2);
            };
            animated3.onAnimate = () => { counter += 4; };
            animated4.onAnimate = () => { counter += 8; };

            stage1.addChild(animated1, animated2, animated3);
            animated3.addChild(animated4);

            stage1.onAnimate(0);
            expect(counter).to.be.equals(11); // it should be 15, but mini-runner doesn't like to skip things
        });

        it('should animate everythine properly if only detachChild is used inside animation', function ()
        {
            const stage1 = new Stage();
            const animated1 = new Container();
            const animated2 = new Container();
            const animated3 = new Container();
            const animated4 = new DisplayObject();

            let counter = 0;

            animated1.onAnimate = () => { counter++; };
            animated2.onAnimate = () =>
            {
                counter += 2;
                stage1.detachChild(animated2);
            };
            animated3.onAnimate = () => { counter += 4; };
            animated4.onAnimate = () => { counter += 8; };

            stage1.addChild(animated1, animated2, animated3);
            animated3.addChild(animated4);

            stage1.onAnimate(0);
            expect(counter).to.be.equals(15);
            expect(animated2.parentStage).to.be.null;
        });

        it('should work with nested stages', function ()
        {
            const stage1 = new Stage();
            const container1 = new Container();
            const stage2 = new Stage();
            const animated1 = new Container();
            let counter = 0;

            animated1.onAnimate = (deltaTime) => { counter += deltaTime; };
            stage1.addChild(container1);
            container1.addChild(stage2);
            stage2.addChild(animated1);

            stage1.onAnimate(30);
            expect(counter).to.be.equals(30);
        });
    });
});
