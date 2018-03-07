'use strict';

describe('PIXI.extras.AnimatedSprite', function ()
{
    describe('instance', function ()
    {
        beforeEach(function ()
        {
            this.textures = [PIXI.Texture.EMPTY];
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
            this.sprite = new PIXI.extras.AnimatedSprite(this.textures);
            expect(this.sprite._autoUpdate).to.be.true;
        });

        it('should be correct with autoUpdate=false', function ()
        {
            this.sprite = new PIXI.extras.AnimatedSprite(this.textures, false);
            expect(this.sprite._autoUpdate).to.be.false;
        });
    });

    describe('.stop()', function ()
    {
        before(function ()
        {
            this.sprite = new PIXI.extras.AnimatedSprite([PIXI.Texture.EMPTY], false);
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
            this.sprite = new PIXI.extras.AnimatedSprite([PIXI.Texture.EMPTY], false);
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
});
