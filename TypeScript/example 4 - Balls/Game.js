var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            var _this = this;
            this.w = 1024;
            this.h = 768;
            this.starCount = 2500;
            this.sx = 1.0 + (Math.random() / 20);
            this.sy = 1.0 + (Math.random() / 20);
            this.stars = [];
            this.slideX = this.w / 2;
            this.slideY = this.h / 2;

            var ballTexture = new PIXI.Texture.fromImage("../../examples/example 4 - Balls/assets/bubble_32x32.png");

            this.stage = new PIXI.Stage(0x000000);

            this.renderer = PIXI.autoDetectRenderer(this.w, this.h);

            document.body.appendChild(this.renderer.view);

            for (var i = 0; i < this.starCount; i++) {
                var tempBall = new PIXI.Sprite(ballTexture);

                tempBall.position.x = (Math.random() * this.w) - this.slideX;
                tempBall.position.y = (Math.random() * this.h) - this.slideY;
                tempBall.anchor.x = 0.5;
                tempBall.anchor.y = 0.5;

                this.stars.push({ sprite: tempBall, x: tempBall.position.x, y: tempBall.position.y });

                this.stage.addChild(tempBall);
            }

            document.getElementById('rnd').onclick = function () {
                _this.newWave(_this);
            };
            document.getElementById('sx').innerHTML = 'SX: ' + this.sx + '<br />SY: ' + this.sy;

            this.resize();

            requestAnimationFrame(this.update.bind(this));
        }
        Game.prototype.newWave = function (that) {
            that.sx = 1.0 + (Math.random() / 20);
            that.sy = 1.0 + (Math.random() / 20);
            document.getElementById('sx').innerHTML = 'SX: ' + that.sx + '<br />SY: ' + that.sy;
        };

        Game.prototype.resize = function () {
            this.w = $(window).width() - 16;
            this.h = $(window).height() - 16;

            this.slideX = this.w / 2;
            this.slideY = this.h / 2;

            console.log(typeof this.renderer.prototype.toString);

            if (this.renderer)
                (this.renderer).resize(this.w, this.h);
        };

        Game.prototype.update = function () {
            for (var i = 0; i < this.starCount; i++) {
                this.stars[i].sprite.position.x = this.stars[i].x + this.slideX;
                this.stars[i].sprite.position.y = this.stars[i].y + this.slideY;
                this.stars[i].x = this.stars[i].x * this.sx;
                this.stars[i].y = this.stars[i].y * this.sy;

                if (this.stars[i].x > this.w) {
                    this.stars[i].x = this.stars[i].x - this.w;
                } else if (this.stars[i].x < -this.w) {
                    this.stars[i].x = this.stars[i].x + this.w;
                }

                if (this.stars[i].y > this.h) {
                    this.stars[i].y = this.stars[i].y - this.h;
                } else if (this.stars[i].y < -this.h) {
                    this.stars[i].y = this.stars[i].y + this.h;
                }
            }

            requestAnimationFrame(this.update.bind(this));

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
