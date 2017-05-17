var PixiTest;
(function (PixiTest) {
    var Game = (function () {
        function Game() {
            this.count = 0;
            this.stage = new PIXI.Stage(0x97c56e, true);

            this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

            document.body.appendChild(this.renderer.view);
            this.renderer.view.style.position = "absolute";
            this.renderer.view.style.top = "0px";
            this.renderer.view.style.left = "0px";

            requestAnimationFrame(this.animate.bind(this));

            var texture = PIXI.Texture.fromImage("../../examples/example 9 - Tiling Texture/p2.jpeg");

            this.tilingSprite = new PIXI.TilingSprite(texture, window.innerWidth, window.innerHeight);

            this.stage.addChild(this.tilingSprite);
        }
        Game.prototype.animate = function () {
            requestAnimationFrame(this.animate.bind(this));

            this.count += 0.005;
            this.tilingSprite.tileScale.x = 2 + Math.sin(this.count);
            this.tilingSprite.tileScale.y = 2 + Math.cos(this.count);

            this.tilingSprite.tilePosition.x += 1;
            this.tilingSprite.tilePosition.y += 1;

            this.renderer.render(this.stage);
        };
        return Game;
    })();
    PixiTest.Game = Game;
})(PixiTest || (PixiTest = {}));
