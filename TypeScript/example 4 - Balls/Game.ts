///<reference path="../PIXI.d.ts"/>

module PixiTest {

    declare var PIXI:any;
    declare var $:any;

    export class Game {

        private stage:PIXI.Stage;
        private renderer:PIXI.IRenderer;

        private w:number = 1024;
        private h:number = 768;
        private starCount:number = 2500;
        private sx:number = 1.0 + (Math.random() / 20);
        private sy:number = 1.0 + (Math.random() / 20);
        private slideX:number;
        private slideY:number;
        private stars:any[] = [];

        constructor() {

            this.slideX = this.w / 2;
            this.slideY = this.h / 2;

           var ballTexture:PIXI.Texture = new PIXI.Texture.fromImage("../../examples/example 4 - Balls/assets/bubble_32x32.png");

            // create an new instance of a pixi stage
            this.stage = new PIXI.Stage(0x000000);

            // create a renderer instance
            this.renderer = PIXI.autoDetectRenderer(this.w, this.h);

            // add the renderer view element to the DOM
            document.body.appendChild(this.renderer.view);

            for (var i:number = 0; i < this.starCount; i++)
            {
                var tempBall:PIXI.Sprite = new PIXI.Sprite(ballTexture);

                tempBall.position.x = (Math.random() * this.w) - this.slideX;
                tempBall.position.y = (Math.random() * this.h) - this.slideY;
                tempBall.anchor.x = 0.5;
                tempBall.anchor.y = 0.5;

                this.stars.push({ sprite: tempBall, x: tempBall.position.x, y: tempBall.position.y });

                this.stage.addChild(tempBall);
            }

            document.getElementById('rnd').onclick = () => {
               this.newWave(this);
            };
            document.getElementById('sx').innerHTML = 'SX: ' + this.sx + '<br />SY: ' + this.sy;

            this.resize();

            requestAnimationFrame(this.update.bind(this));
        }

        private newWave(that:any) {

            that.sx = 1.0 + (Math.random() / 20);
            that.sy = 1.0 + (Math.random() / 20);
            document.getElementById('sx').innerHTML = 'SX: ' + that.sx + '<br />SY: ' + that.sy;
        }

        private resize()
        {
            this.w = $(window).width() - 16;
            this.h = $(window).height() - 16;
        
            this.slideX = this.w / 2;
            this.slideY = this.h / 2;

            //if (this.renderer is PIXI.WebGLRenderer)
            (<PIXI.WebGLRenderer> this.renderer).resize(this.w, this.h);
        }

        private update()
        {
            for (var i:number = 0; i < this.starCount; i++)
            {
                this.stars[i].sprite.position.x = this.stars[i].x + this.slideX;
                this.stars[i].sprite.position.y = this.stars[i].y + this.slideY;
                this.stars[i].x = this.stars[i].x * this.sx;
                this.stars[i].y = this.stars[i].y * this.sy;

                if (this.stars[i].x > this.w)
                {
                    this.stars[i].x = this.stars[i].x - this.w;
                }
                else if (this.stars[i].x < -this.w)
                {
                    this.stars[i].x = this.stars[i].x + this.w;
                }

                if (this.stars[i].y > this.h)
                {
                    this.stars[i].y = this.stars[i].y - this.h;
                }
                else if (this.stars[i].y < -this.h)
                {
                    this.stars[i].y = this.stars[i].y + this.h;
                }
            }

            requestAnimationFrame(this.update.bind(this));

            // render the stage   
            this.renderer.render(this.stage);
        }
    }
}