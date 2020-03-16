const { AnimatedSprite } = require('../');
const { Texture } = require('@pixi/core');

describe('PIXI.AnimatedSprite', function ()
{
    describe('instance', function ()
    {
        beforeEach(function ()
        {
            this.textures = [Texture.EMPTY];
        });

        afterEach(function ()
        {
            expect(this.sprite.animationSpeed).to.be.equal(1);
            expect(this.sprite.loop).to.be.true;
            expect(this.sprite.onComplete).to.be.null;
            expect(this.sprite.onFrameChange).to.be.null;
            expect(this.sprite.onLoop).to.be.null;
            expect(this.sprite.playing).to.be.false;

            this.sprite.destroy();
            this.sprite = null;
        });

        it('should be correct with default options', function ()
        {
            this.sprite = new AnimatedSprite(this.textures);
            expect(this.sprite._autoUpdate).to.be.true;
        });

        it('should be correct with autoUpdate=false', function ()
        {
            this.sprite = new AnimatedSprite(this.textures, false);
            expect(this.sprite._autoUpdate).to.be.false;
        });

        it('should be correct with autoUpdate=true but then turned off via setter', function ()
        {
            this.sprite = new AnimatedSprite(this.textures, true);
            expect(this.sprite._autoUpdate).to.be.true;
            this.sprite.autoUpdate = false;
            expect(this.sprite._autoUpdate).to.be.false;
        });
    });

    describe('.stop()', function ()
    {
        before(function ()
        {
            this.sprite = new AnimatedSprite([Texture.EMPTY], false);
        });

        after(function ()
        {
            this.sprite.destroy();
            this.sprite = null;
        });

        afterEach(function ()
        {
            this.sprite.stop();
            expect(this.sprite.playing).to.be.false;
        });

        it('should stop playing if it is playing', function ()
        {
            this.sprite.playing = true;
        });

        it('should do nothing if it is not playing', function ()
        {
            this.sprite.playing = false;
        });
    });

    describe('.play()', function ()
    {
        before(function ()
        {
            this.sprite = new AnimatedSprite([Texture.EMPTY], false);
        });

        after(function ()
        {
            this.sprite.destroy();
            this.sprite = null;
        });

        afterEach(function ()
        {
            this.sprite.play();
            expect(this.sprite.playing).to.be.true;
        });

        it('should start playing if it is not playing', function ()
        {
            this.sprite.playing = false;
        });

        it('should do nothing if it is playing', function ()
        {
            this.sprite.playing = true;
        });
    });

    describe('.onComplete()', function ()
    {
        before(function ()
        {
            this.sprite = new AnimatedSprite([Texture.WHITE, Texture.WHITE, Texture.EMPTY]);
            this.sprite.animationSpeed = 0.5;
            this.sprite.loop = false;
        });

        after(function ()
        {
            this.sprite.destroy();
            this.sprite = null;
        });

        it('should fire onComplete', function (done)
        {
            this.timeout((
                this.sprite.textures.length * 1000 / 60 / this.sprite.animationSpeed)
                + (1000 / 60 / this.sprite.animationSpeed * 0.9)
            );
            this.sprite.onComplete = () =>
            {
                this.sprite.onComplete = null;
                done();
            };
            this.sprite.play();
            expect(this.sprite.playing).to.be.true;
        });

        it('should the current texture be the last item in textures', function (done)
        {
            this.sprite.play();
            this.sprite.onComplete = () =>
            {
                expect(this.sprite.texture === this.sprite.textures[this.sprite.currentFrame]).to.be.true;
                this.sprite.onComplete = null;
                done();
            };
        });
    });

    describe('.gotoAndPlay()', function ()
    {
        before(function ()
        {
            this.sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            this.sprite.animationSpeed = 1;
            this.sprite.loop = false;
        });

        after(function ()
        {
            this.sprite.destroy();
            this.sprite = null;
        });

        it('should fire frame after start frame during one play and fire onComplete', function (done)
        {
            const frameIds = [];

            this.sprite.animationSpeed = 1;
            this.sprite.onComplete = () =>
            {
                expect(frameIds).to.deep.equal([1, 2]);
                expect(this.sprite.playing).to.be.false;
                this.sprite.onComplete = null;
                this.sprite.onFrameChange = null;
                done();
            };
            this.sprite.onFrameChange = (frame) =>
            {
                frameIds.push(frame);
            };
            this.sprite.gotoAndPlay(1);
            expect(this.sprite.playing).to.be.true;
        });
    });

    describe('.gotoAndStop()', function ()
    {
        before(function ()
        {
            this.sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            this.sprite.animationSpeed = 1;
            this.sprite.loop = false;
        });

        after(function ()
        {
            this.sprite.destroy();
            this.sprite = null;
        });

        beforeEach(function ()
        {
            this.sprite.playing = false;
        });

        it('should fire onFrameChange on target frame', function (done)
        {
            const targetFrame = 1;

            this.sprite.animationSpeed = 1;
            this.sprite.onFrameChange = (frame) =>
            {
                expect(frame).to.equal(targetFrame);
                expect(this.sprite.playing).to.be.false;
                this.sprite.onComplete = null;
                this.sprite.onFrameChange = null;
                done();
            };
            this.sprite.gotoAndStop(targetFrame);
            expect(this.sprite.playing).to.be.false;
        });

        it('should not fire onFrameChange on target frame if current is already target', function ()
        {
            let fired = false;
            const targetFrame = 1;

            this.sprite.gotoAndStop(targetFrame);

            this.sprite.animationSpeed = 1;
            this.sprite.onFrameChange = () =>
            {
                fired = true;
            };
            this.sprite.gotoAndStop(targetFrame);
            expect(this.sprite.playing).to.be.false;
            expect(fired).to.be.false;
        });
    });

    describe('.onFrameChange()', function ()
    {
        before(function ()
        {
            this.sprite = new AnimatedSprite([Texture.EMPTY, Texture.WHITE, Texture.EMPTY]);
            this.sprite.animationSpeed = 1;
            this.sprite.loop = false;
        });

        after(function ()
        {
            this.sprite.destroy();
            this.sprite = null;
        });

        beforeEach(function ()
        {
            this.sprite.playing = false;
        });

        it('should fire every frame(except current) during one play', function (done)
        {
            const frameIds = [];

            this.sprite.gotoAndStop(0);
            this.sprite.animationSpeed = 1;
            this.sprite.onComplete = () =>
            {
                expect(frameIds).to.deep.equal([1, 2]); // from 0 to 2, triggers onFrameChange at 1,2.
                expect(this.sprite.currentFrame).to.equal(2);
                this.sprite.onComplete = null;
                this.sprite.onFrameChange = null;
                done();
            };
            this.sprite.onFrameChange = (frame) =>
            {
                frameIds.push(frame);
            };
            this.sprite.play();
            expect(this.sprite.playing).to.be.true;
        });

        it('should fire every frame(except current) during one play - reverse', function (done)
        {
            const frameIds = [];

            this.sprite.gotoAndStop(2);
            this.sprite.animationSpeed = -1;
            this.sprite.onComplete = () =>
            {
                expect(frameIds).to.deep.equal([1, 0]); // from 2 to 0, triggers onFrameChange at 1,0.
                expect(this.sprite.currentFrame).to.equal(0);
                this.sprite.onComplete = null;
                this.sprite.onFrameChange = null;
                done();
            };
            this.sprite.onFrameChange = (frame) =>
            {
                frameIds.push(frame);
            };
            this.sprite.play();
            expect(this.sprite.playing).to.be.true;
        });

        it('should fire every frame(except current) during one play - from not start/end', function (done)
        {
            const frameIds = [];

            this.sprite.gotoAndStop(1);
            this.sprite.animationSpeed = -1;
            this.sprite.onComplete = () =>
            {
                expect(frameIds).to.deep.equal([0]); // from 1 to 0, triggers onFrameChange at 0.
                expect(this.sprite.currentFrame).to.equal(0);
                this.sprite.onComplete = null;
                this.sprite.onFrameChange = null;
                done();
            };
            this.sprite.onFrameChange = (frame) =>
            {
                frameIds.push(frame);
            };
            this.sprite.play();
            expect(this.sprite.playing).to.be.true;
        });
    });

    describe('.textures', function ()
    {
        it('should set the first frame when setting new textures', function (done)
        {
            const orig1 = Texture.EMPTY.clone();
            const orig2 = Texture.EMPTY.clone();
            const orig3 = Texture.EMPTY.clone();
            const sprite = new AnimatedSprite([orig1, orig2, orig3]);

            sprite.gotoAndPlay(0);
            sprite.loop = false;

            sprite.onComplete = () =>
            {
                sprite.gotoAndStop(0);

                const frame1 = Texture.EMPTY.clone();
                const frame2 = Texture.EMPTY.clone();
                const frame3 = Texture.EMPTY.clone();

                sprite.textures = [frame1, frame2, frame3];

                expect(sprite.currentFrame).to.equal(0);
                expect(sprite._texture).to.equal(frame1);

                done();
            };
        });
    });
});
