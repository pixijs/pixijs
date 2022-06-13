import { AnimatedSprite } from '@pixi/sprite-animated';
import { Texture } from '@pixi/core';
import { expect } from 'chai';

describe('AnimatedSprite', () =>
{
    describe('instance', () =>
    {
        let textures: Texture[];
        let sprite: AnimatedSprite;

        beforeEach(() =>
        {
            textures = [Texture.EMPTY];
        });

        afterEach(() =>
        {
            expect(sprite.animationSpeed).to.be.equal(1);
            expect(sprite.loop).to.be.true;
            expect(sprite.onComplete).to.be.null;
            expect(sprite.onFrameChange).to.be.null;
            expect(sprite.onLoop).to.be.null;
            expect(sprite.playing).to.be.false;

            sprite.destroy();
            sprite = null;
        });

        it('should be correct with default options', () =>
        {
            sprite = new AnimatedSprite(textures);
            expect(sprite['_autoUpdate']).to.be.true;
        });

        it('should be correct with autoUpdate=false', () =>
        {
            sprite = new AnimatedSprite(textures, false);
            expect(sprite['_autoUpdate']).to.be.false;
        });

        it('should be correct with autoUpdate=true but then turned off via setter', () =>
        {
            sprite = new AnimatedSprite(textures, true);
            expect(sprite['_autoUpdate']).to.be.true;
            sprite.autoUpdate = false;
            expect(sprite['_autoUpdate']).to.be.false;
        });
    });

    describe('.stop()', () =>
    {
        let sprite: AnimatedSprite;

        before(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY], false);
        });

        after(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        afterEach(() =>
        {
            sprite.stop();
            expect(sprite.playing).to.be.false;
        });

        it('should stop playing if it is playing', () =>
        {
            sprite['_playing'] = true;
        });

        it('should do nothing if it is not playing', () =>
        {
            sprite['_playing'] = false;
        });
    });

    describe('.play()', () =>
    {
        let sprite: AnimatedSprite;

        before(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY], false);
        });

        after(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        afterEach(() =>
        {
            sprite.play();
            expect(sprite.playing).to.be.true;
        });

        it('should start playing if it is not playing', () =>
        {
            sprite['_playing'] = false;
        });

        it('should do nothing if it is playing', () =>
        {
            sprite['_playing'] = true;
        });
    });

    describe('.onComplete()', () =>
    {
        let sprite: AnimatedSprite;

        before(() =>
        {
            sprite = new AnimatedSprite([Texture.WHITE, Texture.WHITE, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        after(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        // eslint-disable-next-line func-names
        it('should fire onComplete', function (done)
        {
            this.timeout((
                sprite.textures.length * 1000 / 60 / sprite.animationSpeed)
                + (1000 / 60 / sprite.animationSpeed * 0.9)
            );
            sprite.onComplete = () =>
            {
                sprite.onComplete = null;
                done();
            };
            sprite.play();
            expect(sprite.playing).to.be.true;
        });

        it('should the current texture be the last item in textures', (done) =>
        {
            sprite.play();
            sprite.onComplete = () =>
            {
                expect(sprite.texture === sprite.textures[sprite.currentFrame]).to.be.true;
                sprite.onComplete = null;
                done();
            };
        });
    });

    describe('.gotoAndPlay()', () =>
    {
        let sprite: AnimatedSprite;

        before(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        after(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        it('should fire frame after start frame during one play and fire onComplete', (done) =>
        {
            const frameIds = [] as number[];

            sprite.onComplete = () =>
            {
                expect(frameIds).to.deep.equal([1, 2]);
                expect(sprite.playing).to.be.false;
                sprite.onComplete = null;
                sprite.onFrameChange = null;
                done();
            };
            sprite.onFrameChange = (frame) =>
            {
                frameIds.push(frame);
            };
            sprite.gotoAndPlay(1);
            expect(sprite.playing).to.be.true;
        });
    });

    describe('.gotoAndStop()', () =>
    {
        let sprite: AnimatedSprite;

        before(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.EMPTY, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        after(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        beforeEach(() =>
        {
            sprite['_playing'] = false;
        });

        it('should fire onFrameChange on target frame', (done) =>
        {
            const targetFrame = 1;

            sprite.onFrameChange = (frame) =>
            {
                expect(frame).to.equal(targetFrame);
                expect(sprite.playing).to.be.false;
                sprite.onComplete = null;
                sprite.onFrameChange = null;
                done();
            };
            sprite.gotoAndStop(targetFrame);
            expect(sprite.playing).to.be.false;
        });

        it('should not fire onFrameChange on target frame if current is already target', () =>
        {
            let fired = false;
            const targetFrame = 1;

            sprite.gotoAndStop(targetFrame);

            sprite.onFrameChange = () =>
            {
                fired = true;
            };
            sprite.gotoAndStop(targetFrame);
            expect(sprite.playing).to.be.false;
            expect(fired).to.be.false;
        });
    });

    describe('.onFrameChange()', () =>
    {
        let sprite: AnimatedSprite;

        before(() =>
        {
            sprite = new AnimatedSprite([Texture.EMPTY, Texture.WHITE, Texture.EMPTY]);
            sprite.animationSpeed = 0.5;
            sprite.loop = false;
        });

        after(() =>
        {
            sprite.destroy();
            sprite = null;
        });

        beforeEach(() =>
        {
            sprite['_playing'] = false;
        });

        it('should fire every frame(except current) during one play', (done) =>
        {
            const frameIds = [] as number[];

            sprite.gotoAndStop(0);
            sprite.onComplete = () =>
            {
                expect(frameIds).to.deep.equal([1, 2]); // from 0 to 2, triggers onFrameChange at 1,2.
                expect(sprite.currentFrame).to.equal(2);
                sprite.onComplete = null;
                sprite.onFrameChange = null;
                done();
            };
            sprite.onFrameChange = (frame) =>
            {
                frameIds.push(frame);
            };
            sprite.play();
            expect(sprite.playing).to.be.true;
        });

        it('should fire every frame(except current) during one play - reverse', (done) =>
        {
            const frameIds = [] as number[];

            sprite.gotoAndStop(2);
            sprite.animationSpeed = -0.5;
            sprite.onComplete = () =>
            {
                expect(frameIds).to.deep.equal([1, 0]); // from 2 to 0, triggers onFrameChange at 1,0.
                expect(sprite.currentFrame).to.equal(0);
                sprite.onComplete = null;
                sprite.onFrameChange = null;
                done();
            };
            sprite.onFrameChange = (frame) =>
            {
                frameIds.push(frame);
            };
            sprite.play();
            expect(sprite.playing).to.be.true;
        });

        it('should fire every frame(except current) during one play - from not start/end', (done) =>
        {
            const frameIds = [] as number[];

            sprite.gotoAndStop(1);
            sprite.animationSpeed = -0.5;
            sprite.onComplete = () =>
            {
                expect(frameIds).to.deep.equal([0]); // from 1 to 0, triggers onFrameChange at 0.
                expect(sprite.currentFrame).to.equal(0);
                sprite.onComplete = null;
                sprite.onFrameChange = null;
                done();
            };
            sprite.onFrameChange = (frame) =>
            {
                frameIds.push(frame);
            };
            sprite.play();
            expect(sprite.playing).to.be.true;
        });
    });

    describe('.textures', () =>
    {
        it('should set the first frame when setting new textures', (done) =>
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
