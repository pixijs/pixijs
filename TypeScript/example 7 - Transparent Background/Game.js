var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            this.stage = new PIXI.Stage(0x66FF99);

            this.renderer = PIXI.autoDetectRenderer(400, 300, null, true);

            document.body.appendChild(this.renderer.view);

            this.renderer.view.style.position = "absolute";
            this.renderer.view.style.top = "0px";
            this.renderer.view.style.left = "0px";

            requestAnimationFrame(this.animate.bind(this));

            var texture = PIXI.Texture.fromImage("../../examples/example 7 - Transparent Background/bunny.png");

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
