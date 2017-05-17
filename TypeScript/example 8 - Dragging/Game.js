var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            this.texture = PIXI.Texture.fromImage("../../examples/example 7 - Transparent Background/bunny.png");
            this.stage = new PIXI.Stage(0x97c56e, true);

            this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

            document.body.appendChild(this.renderer.view);

            this.renderer.view.style.position = "absolute";
            this.renderer.view.style.top = "0px";
            this.renderer.view.style.left = "0px";

            requestAnimationFrame(this.animate.bind(this));

            for (var i = 0; i < 10; i++) {
                this.createBunny(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
            }
        }
        Game.prototype.createBunny = function (x, y) {
            var bunny = new PIXI.Sprite(this.texture);

            bunny.setInteractive(true);

            bunny.buttonMode = true;

            bunny.anchor.x = 0.5;
            bunny.anchor.y = 0.5;

            bunny.scale.x = bunny.scale.y = 3;

            bunny.mousedown = bunny.touchstart = function (data) {
                this.data = data;
                this.alpha = 0.9;
                this.dragging = true;
            };

            bunny.mouseup = bunny.mouseupoutside = bunny.touchend = bunny.touchendoutside = function (data) {
                this.alpha = 1;
                this.dragging = false;

                this.data = null;
            };

            bunny.mousemove = bunny.touchmove = function (data) {
                if (this.dragging) {
                    var newPosition = this.data.getLocalPosition(this.parent);
                    this.position.x = newPosition.x;
                    this.position.y = newPosition.y;
                }
            };

            bunny.position.x = x;
            bunny.position.y = y;

            this.stage.addChild(bunny);
        };

        Game.prototype.animate = function () {
            requestAnimationFrame(this.animate.bind(this));

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
