'use strict';

const path = require('path');
const numTextures = 5;

function rand(max = numTextures)
{
    return Math.floor(Math.random() * max);
}

describe('PIXI.extras.AnimatedSprite', function ()
{
    before('load the textures', function ()
    {
        this.frameObjects = [];
        for (let i = 0; i < numTextures; i++)
        {
            let next = rand();

            while (next === i) { next = rand(); } // pick a random next frame that's not this one

            this.frameObjects.push({
                texture: new PIXI.Texture.from(path.resolve(__dirname, `resources/texture${i}.png`)),
                next,
                time: 0.2,
            });
        }
    });

    beforeEach('init the AnimatedSprite with 5 textures', function ()
    {
        this.sprite = new PIXI.extras.AnimatedSprite(this.frameObjects, true);
    });

    beforeEach('pick a random frame', function ()
    {
        this.randomFrame = rand();
    });

    afterEach('destroy the AnimatedSprite', function ()
    {
        this.sprite.destroy();
    });

    describe('play', function ()
    {
        it('should start animation', function ()
        {
            expect(this.sprite.playing).to.be.false;
            this.sprite.play();
            expect(this.sprite.playing).to.be.true;
        });
    });

    describe('gotoAndPlay', function ()
    {
        it('should navigate to the correct frame', function ()
        {
            this.sprite.gotoAndPlay(this.randomFrame);
            expect(this.sprite.currentFrame).to.equal(this.randomFrame);
        });

        it('should have the correct texture', function ()
        {
            this.sprite.gotoAndPlay(this.randomFrame);
            expect(this.sprite._texture).to.equal(this.frameObjects[this.randomFrame].texture);
        });

        it('should start animation', function ()
        {
            expect(this.sprite.playing).to.be.false;
            this.sprite.gotoAndPlay(this.randomFrame);
            expect(this.sprite.playing).to.be.true;
        });
    });

    describe('stop', function ()
    {
        it('should stop animation', function ()
        {
            this.sprite.play();
            expect(this.sprite.playing).to.be.true;
            this.sprite.stop();
            expect(this.sprite.playing).to.be.false;
        });
    });

    describe('gotoAndStop', function ()
    {
        it('should navigate to the correct frame', function ()
        {
            this.sprite.gotoAndStop(this.randomFrame);
            expect(this.sprite.currentFrame).to.equal(this.randomFrame);
        });

        it('should have the correct texture', function ()
        {
            this.sprite.gotoAndStop(this.randomFrame);
            expect(this.sprite._texture).to.equal(this.frameObjects[this.randomFrame].texture);
        });

        it('should stop animation', function ()
        {
            this.sprite.play();
            expect(this.sprite.playing).to.be.true;
            this.sprite.gotoAndStop(this.randomFrame);
            expect(this.sprite.playing).to.be.false;
        });
    });

    describe('totalFrames', function ()
    {
        it('should return the total number of frames', function ()
        {
            expect(this.sprite.totalFrames).to.equal(numTextures);
        });
    });

    describe('update', function ()
    {
        it('should navigate to the correct next frame', function (done)
        {
            this.sprite.onNext = (next) =>
            {
                expect(next).to.equal(this.frameObjects[this.randomFrame].next);
                done();
            };
            this.sprite.gotoAndPlay(this.randomFrame);
        });
    });
});
