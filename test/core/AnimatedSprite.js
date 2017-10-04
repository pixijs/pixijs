'use strict';

const path = require('path');

describe('PIXI.extras.AnimatedSprite', function ()
{
    before('load the textures', function ()
    {
        this.frameObjects = [];
        for (let i = 0; i < 5; i++)
        {
            const texture = new PIXI.Texture.from(path.resolve(__dirname, `resources/texture${i}.png`));

            this[`texture${i}`] = texture;
            this.frameObjects.push({ texture, next: Math.floor(Math.random() * 5) });
        }
    });
    beforeEach('init the AnimatedSprite with 5 textures', function ()
    {
        this.sprite = new PIXI.extras.AnimatedSprite(this.frameObjects, true);
    });
    describe('gotoAndPlay', function ()
    {
        it('should play the correct frame', function ()
        {
            expect(this.sprite.playing).to.be.false;
            this.sprite.gotoAndPlay(2);
            expect(this.sprite.playing).to.be.true;
            expect(this.sprite.currentFrame).to.equal(2);
        });
    });
});
