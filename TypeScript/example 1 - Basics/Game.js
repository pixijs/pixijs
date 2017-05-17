var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            this.stage = new PIXI.Stage(0x66FF99);

            this.renderer = PIXI.autoDetectRenderer(400, 300);

            document.body.appendChild(this.renderer.view);

            requestAnimationFrame(this.animate.bind(this));

            var texture = PIXI.Texture.fromImage("../../examples/example 1 - Basics/bunny.png");

            this.bunny = new PIXI.Sprite(texture);

            this.bunny.anchor.x = 0.5;
            this.bunny.anchor.y = 0.5;

            this.bunny.position.x = 200;
            this.bunny.position.y = 150;

            this.stage.addChild(this.bunny);
        }
        Game.prototype.animate = function () {
            requestAnimationFrame(this.animate.bind(this));
            this.bunny.rotation += 0.1;

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
